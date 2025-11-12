/* ============================================
   WORDLE GAME LOGIC
   Core game functionality and mechanics
   ============================================ */

let targetWord = WORDS[Math.floor(Math.random() * WORDS.length)];
let currentRow = 0;
let currentTile = 0;
let gameOver = false;
let stats =
  JSON.parse(localStorage.getItem(STORAGE_KEYS.STATS)) || DEFAULT_STATS;

// ============================================
// INPUT STATE MANAGEMENT (Prevents spam/race conditions)
// ============================================
let isValidating = false; // Prevents concurrent validation requests
let inputEnabled = true; // Global input lock

// ============================================
// SESSION & REFRESH PROTECTION
// ============================================
const SESSION_ID =
  "sessionId_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
const SESSION_KEY = "currentGameSession";
const GAME_STATE_KEY = "gameState";
const ACTIVE_GAME_KEY = "activeGame";
let gameStarted = false; // Track if game has been played

/**
 * Save complete game state to localStorage (persists across page reload)
 * This allows us to restore the exact game state after refresh
 */
function saveCompleteGameState() {
  if (gameStarted && !gameOver) {
    // Save ALL game data
    const boardState = [];
    for (let i = 0; i < GAME_CONFIG.MAX_ATTEMPTS; i++) {
      for (let j = 0; j < GAME_CONFIG.WORD_LENGTH; j++) {
        const tile = document.getElementById(`tile-${i}-${j}`);
        boardState.push({
          row: i,
          col: j,
          content: tile.textContent,
          className: tile.className,
        });
      }
    }

    const gameState = {
      timestamp: Date.now(),
      active: true,
      targetWord,
      currentRow,
      currentTile,
      gameOver,
      boardState,
      guesses: [], // Store guessed words
    };

    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
    localStorage.setItem(ACTIVE_GAME_KEY, "true");
  }
}

/**
 * Restore game state from localStorage after refresh
 * This makes it appear as if the refresh never happened
 */
function restoreGameState() {
  const savedGameState = localStorage.getItem(GAME_STATE_KEY);
  const activeGame = localStorage.getItem(ACTIVE_GAME_KEY);

  if (activeGame === "true" && savedGameState) {
    try {
      const state = JSON.parse(savedGameState);

      // Restore game variables
      targetWord = state.targetWord;
      currentRow = state.currentRow;
      currentTile = state.currentTile;
      gameOver = state.gameOver;
      gameStarted = true;

      // Restore board state
      state.boardState.forEach((tile) => {
        const tileEl = document.getElementById(`tile-${tile.row}-${tile.col}`);
        if (tileEl) {
          tileEl.textContent = tile.content;
          tileEl.className = tile.className;
        }
      });

      console.log("✅ Game state restored after refresh!");
      showMessage("⚠️ Game refreshed but restored");
      return true;
    } catch (e) {
      console.error("Error restoring game state:", e);
      return false;
    }
  }

  return false;
}

/**
 * Initialize session protection to prevent refresh abuse
 * Detects refreshes and restores game state
 */
function initSessionProtection() {
  const currentSession = sessionStorage.getItem(SESSION_KEY);

  // First time visiting this page (or after closing tab/browser)
  if (!currentSession) {
    sessionStorage.setItem(SESSION_KEY, SESSION_ID);

    // Try to restore any saved game from localStorage
    const restored = restoreGameState();

    if (!restored) {
      gameStarted = false;
      localStorage.removeItem(GAME_STATE_KEY);
      localStorage.removeItem(ACTIVE_GAME_KEY);
    }
  }
}

/**
 * Setup prevention for ALL refresh methods
 * For keyboard shortcuts: block the action
 * For browser button: save state and restore after refresh
 */
function setupRefreshProtection() {
  // Save game state before ANY page unload/refresh
  window.addEventListener("beforeunload", () => {
    saveCompleteGameState();
  });

  // Block keyboard shortcuts completely
  document.addEventListener("keydown", (e) => {
    if (gameStarted && !gameOver) {
      // F5 or Ctrl+R or Cmd+R or Ctrl+Shift+R
      if (
        e.key === "F5" ||
        (e.ctrlKey && e.key === "r") ||
        (e.metaKey && e.key === "r") ||
        (e.ctrlKey && e.shiftKey && e.key === "R")
      ) {
        e.preventDefault();
        showMessage("🚫 Cannot refresh during game");
        return false;
      }
    }
  });

  // Save when switching tabs
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && gameStarted && !gameOver) {
      saveCompleteGameState();
    }
  });

  // Monitor page unload - last chance to save
  window.addEventListener("unload", () => {
    saveCompleteGameState();
  });
}

/* ============================================
   Initialize Game
   ============================================ */
async function initGame() {
  // Try to load stats from Supabase (cloud database)
  if (typeof loadStatsFromSupabase !== "undefined") {
    const supabaseStats = await loadStatsFromSupabase();
    if (supabaseStats) {
      stats = supabaseStats;
      console.log("✅ Stats loaded from cloud database");
    } else {
      // Fallback to localStorage
      stats =
        JSON.parse(localStorage.getItem(STORAGE_KEYS.STATS)) || DEFAULT_STATS;
      console.log("ℹ️ Using localStorage stats");
    }
  } else {
    // Supabase not available, use localStorage
    stats =
      JSON.parse(localStorage.getItem(STORAGE_KEYS.STATS)) || DEFAULT_STATS;
  }

  initSessionProtection(); // Setup refresh protection
  setupRefreshProtection(); // Prevent F5/Ctrl+R during game
  createBoard();
  createKeyboard();
  updateStats();
  checkAndShowReleaseNotes();

  // Update profile button state
  await updateProfileButton();
}

/* ============================================
   Board & Tile Management
   ============================================ */
function createBoard() {
  const board = document.getElementById("gameBoard");
  for (let i = 0; i < GAME_CONFIG.MAX_ATTEMPTS; i++) {
    const row = document.createElement("div");
    row.className = "row";
    for (let j = 0; j < GAME_CONFIG.WORD_LENGTH; j++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.id = `tile-${i}-${j}`;
      row.appendChild(tile);
    }
    board.appendChild(row);
  }
}

function addLetter(letter) {
  if (currentTile >= GAME_CONFIG.WORD_LENGTH) return;

  // Mark game as started on first letter
  if (currentTile === 0 && currentRow === 0) {
    gameStarted = true;
  }

  const tile = document.getElementById(`tile-${currentRow}-${currentTile}`);
  tile.textContent = letter;
  tile.classList.add("filled");
  currentTile++;
}

function deleteLetter() {
  if (currentTile > 0) {
    currentTile--;
    const tile = document.getElementById(`tile-${currentRow}-${currentTile}`);
    tile.textContent = "";
    tile.classList.remove("filled");
  }
}

/* ============================================
   Keyboard Management
   ============================================ */
function createKeyboard() {
  const keyboard = document.getElementById("keyboard");
  KEYBOARD_LAYOUT.forEach((row) => {
    const keyboardRow = document.createElement("div");
    keyboardRow.className = "keyboard-row";
    row.forEach((key) => {
      const button = document.createElement("button");
      button.className = key.length > 1 ? "key large" : "key";
      button.textContent = key;
      button.id = `key-${key}`;
      button.onclick = () => handleKeyPress(key);
      keyboardRow.appendChild(button);
    });
    keyboard.appendChild(keyboardRow);
  });
}

function handleKeyPress(key) {
  if (gameOver) return;
  if (!inputEnabled) return; // Ignore input while processing
  if (isValidating && key === "ENTER") return; // Prevent Enter spam during validation
  if (isValidating && key === "⌫") return; // Prevent backspace during validation (BUG FIX)

  if (key === "ENTER") {
    submitGuess();
  } else if (key === "⌫") {
    deleteLetter();
  } else if (currentTile < GAME_CONFIG.WORD_LENGTH) {
    addLetter(key);
  }
}

function updateKeyColor(letter, status) {
  const key = document.getElementById(`key-${letter}`);
  if (!key) return;

  const currentStatus = key.className.split(" ")[1];
  if (currentStatus === "correct") return;
  if (currentStatus === "present" && status === "absent") return;

  key.classList.remove("correct", "present", "absent");
  key.classList.add(status);
}

/* ============================================
   Guess Submission & Validation
   ============================================ */
function submitGuess() {
  // Prevent concurrent submissions
  if (isValidating) return;

  if (currentTile < GAME_CONFIG.WORD_LENGTH) {
    showMessage("Not enough letters");
    return;
  }

  let guess = "";
  for (let i = 0; i < GAME_CONFIG.WORD_LENGTH; i++) {
    const tile = document.getElementById(`tile-${currentRow}-${i}`);
    guess += tile.textContent;
  }

  // Guard: Validate guess is complete and not empty
  if (guess.length !== GAME_CONFIG.WORD_LENGTH || guess.trim() === "") {
    showMessage("Invalid input");
    return;
  }

  // Lock input during async validation
  isValidating = true;

  // Validate word using dictionary service (API + cache + fallback)
  dictionaryService
    .isValidWord(guess)
    .then((isValid) => {
      if (!isValid) {
        showMessage("Not in word list");
        isValidating = false; // Unlock immediately on invalid word
        return;
      }

      // Valid word - process it
      processGuess(guess);
    })
    .catch((error) => {
      console.error("Validation error:", error);
      showMessage("Error validating word");
      isValidating = false; // Unlock on error
    });
}

function processGuess(guess) {
  const targetArray = targetWord.split("");
  const guessArray = guess.split("");
  const letterStatus = new Array(GAME_CONFIG.WORD_LENGTH).fill("absent");

  // First pass: mark correct positions
  for (let i = 0; i < GAME_CONFIG.WORD_LENGTH; i++) {
    if (guessArray[i] === targetArray[i]) {
      letterStatus[i] = "correct";
      targetArray[i] = null;
    }
  }

  // Second pass: mark present letters (yellow)
  for (let i = 0; i < GAME_CONFIG.WORD_LENGTH; i++) {
    if (letterStatus[i] === "correct") continue;
    const index = targetArray.indexOf(guessArray[i]);
    if (index !== -1) {
      letterStatus[i] = "present";
      targetArray[index] = null;
    }
  }

  // Apply animations
  for (let i = 0; i < GAME_CONFIG.WORD_LENGTH; i++) {
    setTimeout(() => {
      const tile = document.getElementById(`tile-${currentRow}-${i}`);
      tile.classList.add(letterStatus[i]);
      updateKeyColor(guessArray[i], letterStatus[i]);
    }, i * GAME_CONFIG.ANIMATION_DELAY);
  }

  // Check result after animation - then unlock input
  setTimeout(() => {
    checkGameResult(guess);
    isValidating = false; // Unlock input after guess is fully processed
  }, GAME_CONFIG.FLIP_ANIMATION_DURATION);
}

async function checkGameResult(guess) {
  if (guess === targetWord) {
    await endGameWon();
  } else if (currentRow === GAME_CONFIG.MAX_ATTEMPTS - 1) {
    await endGameLost();
  } else {
    currentRow++;
    currentTile = 0;
  }
}

/* ============================================
   Game End States
   ============================================ */
async function endGameWon() {
  gameOver = true;
  stats.gamesPlayed++;
  stats.gamesWon++;
  stats.currentStreak++;
  stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);

  // Save to cloud database with game details
  if (typeof saveStatsToSupabase !== "undefined") {
    await saveStatsToSupabase(stats, targetWord, true, currentRow);
  }

  // Save to localStorage as backup
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));

  updateStats();

  // Clear game state protection on game end
  gameStarted = false;
  localStorage.removeItem(GAME_STATE_KEY);
  localStorage.removeItem(ACTIVE_GAME_KEY);

  showModal("🎉 You Won!", `Great job! The word was ${targetWord}`);
}

async function endGameLost() {
  gameOver = true;
  stats.gamesPlayed++;
  stats.currentStreak = 0;

  // Save to cloud database with game details
  if (typeof saveStatsToSupabase !== "undefined") {
    await saveStatsToSupabase(stats, targetWord, false, currentRow);
  }

  // Save to localStorage as backup
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));

  updateStats();

  // Clear game state protection on game end
  gameStarted = false;
  localStorage.removeItem(GAME_STATE_KEY);
  localStorage.removeItem(ACTIVE_GAME_KEY);

  showModal("😔 Game Over", `The word was ${targetWord}`);
}

/* ============================================
   User Interface Feedback
   ============================================ */
function showMessage(text) {
  const message = document.getElementById("message");
  message.textContent = text;
  message.style.display = "block";
  setTimeout(() => {
    message.style.display = "none";
  }, GAME_CONFIG.MESSAGE_DISPLAY_TIME);
}

function showModal(title, message) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalMessage").textContent = message;
  document.getElementById("modal").style.display = "flex";
}

/**
 * Internal game reset (after game ends)
 * Allows starting a new game
 */
function resetToNewGame(skipBoardClear = false) {
  if (!skipBoardClear) {
    document.getElementById("modal").style.display = "none";
  }

  // Clear saved game state when starting new game
  localStorage.removeItem(GAME_STATE_KEY);
  localStorage.removeItem(ACTIVE_GAME_KEY);

  targetWord = WORDS[Math.floor(Math.random() * WORDS.length)];
  currentRow = 0;
  currentTile = 0;
  gameOver = false;
  gameStarted = false; // Reset game started flag for new game
  isValidating = false;
  inputEnabled = true;

  if (!skipBoardClear) {
    // Clear board tiles
    for (let i = 0; i < GAME_CONFIG.MAX_ATTEMPTS; i++) {
      for (let j = 0; j < GAME_CONFIG.WORD_LENGTH; j++) {
        const tile = document.getElementById(`tile-${i}-${j}`);
        tile.textContent = "";
        tile.className = "tile";
      }
    }

    // Clear keyboard colors
    KEYBOARD_LAYOUT.flat().forEach((key) => {
      const keyEl = document.getElementById(`key-${key}`);
      if (keyEl) {
        keyEl.className = key.length > 1 ? "key large" : "key";
      }
    });
  }
}

function resetGame() {
  resetToNewGame();
}

/* ============================================
   Statistics Management
   ============================================ */
function updateStats() {
  document.getElementById("gamesPlayed").textContent = stats.gamesPlayed;
  const winRate =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;
  document.getElementById("winRate").textContent = winRate + "%";
  document.getElementById("currentStreak").textContent = stats.currentStreak;
}

async function saveStats() {
  // Try to save to Supabase first (cloud database)
  if (typeof saveStatsToSupabase !== "undefined") {
    await saveStatsToSupabase(stats);
  }

  // Always save to localStorage as backup
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
}

/* ============================================
   Release Notes Management
   ============================================ */
function showReleaseNotes() {
  const modal = document.getElementById("releaseNotesModal");
  const titleEl = document.getElementById("releaseNotesTitle");
  const contentEl = document.getElementById("releaseNotesContent");

  titleEl.textContent = RELEASE_NOTES.title;

  // Render version history as collapsible sections
  contentEl.innerHTML = RELEASE_NOTES.versionHistory
    .map(
      (versionInfo, index) => `
    <div class="version-section">
      <div class="version-header ${
        versionInfo.expanded ? "expanded" : ""
      }" onclick="toggleVersionSection(this, ${index})">
        <button class="version-toggle" data-expanded="${versionInfo.expanded}">
          ${versionInfo.expanded ? "−" : "+"}
        </button>
        <div class="version-info">
          <div class="version-number">v${versionInfo.version}</div>
          <div class="version-title">${versionInfo.title}</div>
          <div class="version-date">${versionInfo.date}</div>
        </div>
      </div>
      <div class="version-features ${!versionInfo.expanded ? "collapsed" : ""}">
        ${versionInfo.features
          .map((feature) => `<div class="version-feature">${feature}</div>`)
          .join("")}
      </div>
    </div>
  `
    )
    .join("");

  modal.style.display = "flex";
}

function toggleVersionSection(headerEl, versionIndex) {
  const versionInfo = RELEASE_NOTES.versionHistory[versionIndex];
  const featuresEl = headerEl.nextElementSibling;
  const toggleBtn = headerEl.querySelector(".version-toggle");

  // Toggle state
  versionInfo.expanded = !versionInfo.expanded;

  // Update UI
  headerEl.classList.toggle("expanded");
  featuresEl.classList.toggle("collapsed");
  toggleBtn.textContent = versionInfo.expanded ? "−" : "+";
  toggleBtn.dataset.expanded = versionInfo.expanded;
}

function closeReleaseNotes() {
  const modal = document.getElementById("releaseNotesModal");
  const dontShowAgain = document.getElementById("dontShowAgain");

  if (dontShowAgain.checked) {
    localStorage.setItem(
      STORAGE_KEYS.RELEASE_NOTES_VERSION,
      RELEASE_NOTES.currentVersion
    );
  }

  modal.style.display = "none";
}

function checkAndShowReleaseNotes() {
  const lastSeenVersion = localStorage.getItem(
    STORAGE_KEYS.RELEASE_NOTES_VERSION
  );

  // Show release notes only if new version or first time
  if (lastSeenVersion !== RELEASE_NOTES.currentVersion) {
    setTimeout(() => {
      showReleaseNotes();
    }, GAME_CONFIG.RELEASE_NOTES_DELAY);
  }
}

/* ============================================
   Physical Keyboard Support
   ============================================ */
document.addEventListener("keydown", (e) => {
  // Allow normal keyboard behavior in input fields and textareas
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
    return;
  }

  if (gameOver) return;
  if (!inputEnabled) return; // Ignore input while processing
  if (isValidating && e.key === "Enter") return; // Prevent Enter spam

  if (e.key === "Enter") {
    e.preventDefault(); // Prevent default browser behavior
    handleKeyPress("ENTER");
  } else if (e.key === "Backspace") {
    e.preventDefault();
    handleKeyPress("⌫");
  } else if (/^[a-zA-Z]$/.test(e.key)) {
    handleKeyPress(e.key.toUpperCase());
  }
});

/* ============================================
   Profile Management
   ============================================ */
async function showProfileModal() {
  // Check if user already has a profile
  if (typeof checkUserProfile !== "undefined") {
    const hasProfile = await checkUserProfile();
    if (hasProfile) {
      showMessage("✅ You already have a profile!");
      return;
    }
  }

  // Populate current stats in modal
  document.getElementById("profileGamesPlayed").textContent = stats.gamesPlayed;
  const winRate =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;
  document.getElementById("profileWinRate").textContent = winRate + "%";
  document.getElementById("profileMaxStreak").textContent = stats.maxStreak;

  // Show modal
  const modal = document.getElementById("profileModal");
  modal.style.display = "flex";
}

function closeProfileModal() {
  const modal = document.getElementById("profileModal");
  modal.style.display = "none";
  document.getElementById("profileForm").reset();
  // Reset avatar selection
  document
    .querySelectorAll(".avatar-option")
    .forEach((opt) => opt.classList.remove("selected"));
  document
    .querySelector('.avatar-option[data-avatar="🎮"]')
    .classList.add("selected");
  document.getElementById("avatarSelection").value = "🎮";
}

// Avatar selection function
function selectAvatar(element) {
  // Remove selected from all
  document.querySelectorAll(".avatar-option").forEach((opt) => {
    opt.classList.remove("selected");
  });
  // Add selected to clicked
  element.classList.add("selected");
  // Update hidden input
  const emoji = element.getAttribute("data-avatar");
  document.getElementById("avatarSelection").value = emoji;
  // Clear URL input if emoji selected
  document.getElementById("avatarUrl").value = "";
}

// Handle profile form submission
document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const displayName = document.getElementById("displayName").value.trim();
  const email = document.getElementById("email").value.trim();
  const avatarUrl = document.getElementById("avatarUrl").value.trim();
  const avatarEmoji = document.getElementById("avatarSelection").value;

  // Use URL if provided, otherwise use selected emoji
  const finalAvatar = avatarUrl || avatarEmoji;

  if (!displayName || !email) {
    showMessage("❌ Please fill in all required fields");
    return;
  }

  // Show loading
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "⏳ Creating Profile...";
  submitBtn.disabled = true;

  try {
    // Call supabase service to create profile
    if (typeof createUserProfile !== "undefined") {
      const success = await createUserProfile(displayName, email, finalAvatar);

      if (success) {
        showMessage("✅ Profile created! Your stats are now saved forever!");
        closeProfileModal();

        // Update profile button to show username
        await updateProfileButton();
      } else {
        showMessage("❌ Failed to create profile. Try again.");
      }
    } else {
      showMessage("❌ Profile service not available");
    }
  } catch (error) {
    console.error("Error creating profile:", error);
    showMessage("❌ Error creating profile: " + error.message);
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

/* ============================================
   Leaderboard Management
   ============================================ */
let currentLeaderboardTab = "streak";

async function showLeaderboard() {
  const modal = document.getElementById("leaderboardModal");
  modal.style.display = "flex";
  await loadLeaderboard(currentLeaderboardTab);
}

function closeLeaderboardModal() {
  const modal = document.getElementById("leaderboardModal");
  modal.style.display = "none";
}

async function switchLeaderboardTab(tab) {
  currentLeaderboardTab = tab;

  // Update active tab
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");

  await loadLeaderboard(tab);
}

async function loadLeaderboard(sortBy = "streak") {
  const contentEl = document.getElementById("leaderboardContent");
  contentEl.innerHTML = '<div class="loading">Loading leaderboard...</div>';

  try {
    // Get current user ID
    const currentUserId = localStorage.getItem("WORDLE_USER_ID");

    // Call supabase service to get leaderboard
    if (typeof getLeaderboardWithSort !== "undefined") {
      const leaders = await getLeaderboardWithSort(100, sortBy);

      if (!leaders || leaders.length === 0) {
        contentEl.innerHTML =
          '<div class="no-data">No players with profiles yet. Be the first!</div>';
        return;
      }

      // Build leaderboard table
      let html = `
        <table class="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Games</th>
              <th>Win Rate</th>
              <th>${sortBy === "streak" ? "Max Streak" : "Current Streak"}</th>
            </tr>
          </thead>
          <tbody>
      `;

      leaders.forEach((leader, index) => {
        const rank = index + 1;
        const isCurrentUser = leader.user_id === currentUserId;
        const rankClass = rank <= 3 ? `rank-${rank}` : "";
        const rowClass = isCurrentUser ? "player-you" : "";

        // Avatar: Check if it's a URL or emoji
        const isUrl =
          leader.users.avatar_url &&
          (leader.users.avatar_url.startsWith("http://") ||
            leader.users.avatar_url.startsWith("https://"));
        const avatarHtml = isUrl
          ? `<img src="${leader.users.avatar_url}" alt="${leader.users.display_name}" class="player-avatar" />`
          : `<div class="player-avatar-emoji">${
              leader.users.avatar_url || "🎮"
            }</div>`;

        html += `
          <tr class="${rowClass}">
            <td class="rank-cell ${rankClass}">${rank}</td>
            <td>
              <div class="player-info">
                ${avatarHtml}
                <span class="player-name">
                  ${leader.users.display_name}
                  ${isCurrentUser ? " (You)" : ""}
                </span>
              </div>
            </td>
            <td>${leader.games_played}</td>
            <td>${leader.win_rate}%</td>
            <td>${
              sortBy === "streak" ? leader.max_streak : leader.current_streak
            }</td>
          </tr>
        `;
      });

      html += `
          </tbody>
        </table>
      `;

      contentEl.innerHTML = html;
    } else {
      contentEl.innerHTML =
        '<div class="no-data">Leaderboard service not available</div>';
    }
  } catch (error) {
    console.error("Error loading leaderboard:", error);
    contentEl.innerHTML = '<div class="error">Error loading leaderboard</div>';
  }
}

/* ============================================
   Profile View & Management
   ============================================ */

// Show profile view modal
async function showProfileViewModal() {
  if (typeof getUserProfile !== "undefined") {
    const profile = await getUserProfile();
    if (!profile) {
      showMessage("❌ Could not load profile");
      return;
    }

    // Update profile info
    document.getElementById("viewDisplayName").textContent =
      profile.display_name;
    document.getElementById("viewEmail").textContent = profile.email;
    document.getElementById("viewAvatar").textContent =
      profile.avatar_url || "🎮";

    // Update stats
    document.getElementById("viewGamesPlayed").textContent = stats.gamesPlayed;
    document.getElementById("viewGamesWon").textContent = stats.gamesWon;
    const winRate =
      stats.gamesPlayed > 0
        ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
        : 0;
    document.getElementById("viewWinRate").textContent = winRate + "%";
    document.getElementById("viewMaxStreak").textContent = stats.maxStreak;
    document.getElementById("viewCurrentStreak").textContent =
      stats.currentStreak;

    // Show modal
    const modal = document.getElementById("profileViewModal");
    modal.style.display = "flex";
  }
}

function closeProfileViewModal() {
  const modal = document.getElementById("profileViewModal");
  modal.style.display = "none";
}

// Confirm and delete profile
async function confirmDeleteProfile() {
  const confirmed = confirm(
    "⚠️ Are you sure you want to delete your profile?\n\n" +
      "This will:\n" +
      "• Remove your name, email, and avatar\n" +
      "• Remove you from the leaderboard\n" +
      "• Return you to anonymous mode\n" +
      "• Keep your stats (but they won't be public)\n\n" +
      "You can create a new profile later if you change your mind."
  );

  if (!confirmed) return;

  try {
    if (typeof deleteUserProfile !== "undefined") {
      const success = await deleteUserProfile();

      if (success) {
        showMessage("✅ Profile deleted. You're now in anonymous mode.");
        closeProfileViewModal();

        // Reset profile button to "Create Profile"
        await updateProfileButton();
      } else {
        showMessage("❌ Failed to delete profile. Try again.");
      }
    }
  } catch (error) {
    console.error("Error deleting profile:", error);
    showMessage("❌ Error: " + error.message);
  }
}

// Update profile button based on user state
async function updateProfileButton() {
  const profileBtn = document.querySelector(".profile-btn");
  if (!profileBtn) return;

  if (typeof getUserProfile !== "undefined") {
    const profile = await getUserProfile();

    if (profile && profile.is_claimed) {
      // User has profile - show username
      const avatar = profile.avatar_url || "👤";
      profileBtn.innerHTML = `<span class="btn-icon">${avatar}</span><span class="btn-text">${profile.display_name}</span>`;
      profileBtn.setAttribute("data-icon", avatar);
      profileBtn.onclick = showProfileViewModal;
      profileBtn.title = "View Profile";
    } else {
      // No profile - show create button
      profileBtn.innerHTML =
        '<span class="btn-icon">👤</span><span class="btn-text">Create Profile</span>';
      profileBtn.setAttribute("data-icon", "👤");
      profileBtn.onclick = showProfileModal;
      profileBtn.title = "Create Profile";
    }
  }
}

/* ============================================
   Bootstrap Application
   ============================================ */
initGame();

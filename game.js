/* ============================================
   WORDLE GAME LOGIC
   Core game functionality and mechanics
   ============================================ */

let targetWord = WORDS[Math.floor(Math.random() * WORDS.length)];
let currentRow = 0;
let currentTile = 0;
let gameOver = false;
let stats = JSON.parse(localStorage.getItem(STORAGE_KEYS.STATS)) || DEFAULT_STATS;

/* ============================================
   Initialize Game
   ============================================ */
function initGame() {
  createBoard();
  createKeyboard();
  updateStats();
  checkAndShowReleaseNotes();
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
  if (currentTile < GAME_CONFIG.WORD_LENGTH) {
    showMessage("Not enough letters");
    return;
  }

  let guess = "";
  for (let i = 0; i < GAME_CONFIG.WORD_LENGTH; i++) {
    const tile = document.getElementById(`tile-${currentRow}-${i}`);
    guess += tile.textContent;
  }

  // Validate word is in dictionary
  if (!VALID_WORDS.has(guess)) {
    showMessage("Not in word list");
    return;
  }

  processGuess(guess);
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

  // Check result after animation
  setTimeout(() => {
    checkGameResult(guess);
  }, GAME_CONFIG.FLIP_ANIMATION_DURATION);
}

function checkGameResult(guess) {
  if (guess === targetWord) {
    endGameWon();
  } else if (currentRow === GAME_CONFIG.MAX_ATTEMPTS - 1) {
    endGameLost();
  } else {
    currentRow++;
    currentTile = 0;
  }
}

/* ============================================
   Game End States
   ============================================ */
function endGameWon() {
  gameOver = true;
  stats.gamesPlayed++;
  stats.gamesWon++;
  stats.currentStreak++;
  stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
  saveStats();
  updateStats();
  showModal("🎉 You Won!", `Great job! The word was ${targetWord}`);
}

function endGameLost() {
  gameOver = true;
  stats.gamesPlayed++;
  stats.currentStreak = 0;
  saveStats();
  updateStats();
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

function resetGame() {
  document.getElementById("modal").style.display = "none";
  targetWord = WORDS[Math.floor(Math.random() * WORDS.length)];
  currentRow = 0;
  currentTile = 0;
  gameOver = false;

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

function saveStats() {
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
  contentEl.innerHTML = RELEASE_NOTES.notes
    .map((note) => `<div style="margin-bottom: 12px;">• ${note}</div>`)
    .join("");

  modal.style.display = "flex";
}

function closeReleaseNotes() {
  const modal = document.getElementById("releaseNotesModal");
  const dontShowAgain = document.getElementById("dontShowAgain");

  if (dontShowAgain.checked) {
    localStorage.setItem(STORAGE_KEYS.RELEASE_NOTES_VERSION, RELEASE_NOTES.version);
  }

  modal.style.display = "none";
}

function checkAndShowReleaseNotes() {
  const lastSeenVersion = localStorage.getItem(STORAGE_KEYS.RELEASE_NOTES_VERSION);

  // Show release notes only if new version or first time
  if (lastSeenVersion !== RELEASE_NOTES.version) {
    setTimeout(() => {
      showReleaseNotes();
    }, GAME_CONFIG.RELEASE_NOTES_DELAY);
  }
}

/* ============================================
   Physical Keyboard Support
   ============================================ */
document.addEventListener("keydown", (e) => {
  if (gameOver) return;

  if (e.key === "Enter") {
    handleKeyPress("ENTER");
  } else if (e.key === "Backspace") {
    handleKeyPress("⌫");
  } else if (/^[a-zA-Z]$/.test(e.key)) {
    handleKeyPress(e.key.toUpperCase());
  }
});

/* ============================================
   Bootstrap Application
   ============================================ */
initGame();

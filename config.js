/* ============================================
   WORDLE GAME CONFIGURATION
   Centralized config for easy maintenance
   ============================================ */

/* ============================================
   Target Words (Daily Rotation)
   ============================================ */
const WORDS = [
  "CRANE",
  "SLATE",
  "AUDIO",
  "SPORT",
  "BREAK",
  "PLANT",
  "STORM",
  "DANCE",
  "TEACH",
  "ROUND",
  "PARTY",
  "SHARK",
  "BEACH",
  "TRAIN",
  "FRUIT",
  "BLANK",
  "DREAM",
  "SMART",
  "CLIMB",
  "QUIET",
  "BRAIN",
  "HEART",
  "MONEY",
  "POWER",
  "WORLD",
  "PIZZA",
  "SOLAR",
  "ROBOT",
  "CLOUD",
  "PIXEL",
  "MAGIC",
  "QUEEN",
  "THINK",
  "TIGER",
  "OCEAN",
  "MOUNT",
  "RIVER",
  "LIGHT",
  "MOUSE",
  "PHONE",
];

/* ============================================
   Release Notes Configuration
   Update version when you make changes to show users what's new
   ============================================ */
/* ============================================
   Version History - Expandable Sections
   Each version can be expanded/collapsed
   ============================================ */
const VERSION_HISTORY = [
  {
    version: "1.1.5",
    date: "November 13, 2025",
    title: "☁️ Cloud Profiles & Global Leaderboard",
    expanded: true, // Show by default on first load
    features: [
      "👤 Profile System - Create your gaming identity with name, email & custom avatar",
      "🏆 Global Leaderboard - Compete with players worldwide (Max Streak & Win Rate tabs)",
      "🥇 Rank Badges - Gold/Silver/Bronze medals for top 3 players",
      "🔄 Smart Stats Sync - Auto-merges localStorage + cloud stats (takes highest values)",
    ],
  },
  {
    version: "1.1.0",
    date: "November 12, 2025",
    title: "Bulletproof Input & Smart Validation",
    expanded: false,
    features: [
      "🔒 Smart Word Validation - 170,000+ words via API with intelligent caching",
      "🛡️ Bulletproof Input Handling - Fixed Enter spam bug with multi-layer protection",
      "⚡ Lightning-Fast Performance - 0-5ms cached lookups, API fallback",
      "📋 Release Notes - Stay updated on new features and improvements",
      "🎯 Better UX - Smoother animations and error handling",
      "🔧 Clean Code - Modular architecture for easier maintenance",
    ],
  },
  {
    version: "1.0.5",
    date: "November 9, 2025",
    title: "Performance & Stability Updates",
    expanded: false,
    features: [
      "⚡ Optimized game board rendering",
      "🐛 Fixed keyboard event handling",
      "💾 Improved stats persistence",
      "🎨 Refined color schemes",
    ],
  },
  {
    version: "1.0.0",
    date: "November 8, 2025",
    title: "Let there be light!",
    expanded: false,
    features: [
      "🎮 Full Wordle gameplay with 6 attempts",
      "⌨️ Virtual and physical keyboard support",
      "📊 Game statistics tracking",
      "💾 Local storage persistence",
      "🎨 Beautiful UI with animations",
    ],
  },
];

const RELEASE_NOTES = {
  currentVersion: "1.2.0",
  title: "🎉 What's New",
  versionHistory: VERSION_HISTORY,
};

/* ============================================
   Keyboard Layout Configuration
   Define the physical keyboard layout for the game
   ============================================ */
const KEYBOARD_LAYOUT = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

/* ============================================
   Game Constants
   ============================================ */
const GAME_CONFIG = {
  MAX_ATTEMPTS: 6,
  WORD_LENGTH: 5,
  ANIMATION_DELAY: 300,
  FLIP_ANIMATION_DURATION: 1500,
  RELEASE_NOTES_DELAY: 500,
  MESSAGE_DISPLAY_TIME: 2000,
};

/* ============================================
   Color Scheme Configuration
   ============================================ */
const COLORS = {
  CORRECT: "#6aaa64",
  PRESENT: "#c9b458",
  ABSENT: "#787c7e",
  PRIMARY_GRADIENT_START: "#667eea",
  PRIMARY_GRADIENT_END: "#764ba2",
};

/* ============================================
   Storage Keys for LocalStorage
   ============================================ */
const STORAGE_KEYS = {
  STATS: "wordleStats",
  RELEASE_NOTES_VERSION: "releaseNotesVersion",
};

/* ============================================
   Default Stats Object
   ============================================ */
const DEFAULT_STATS = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
};

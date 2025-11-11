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
   Valid English Words Dictionary
   Used for guess validation to prevent gibberish
   ============================================ */
const VALID_WORDS = new Set([
  "ABOUT", "ABOVE", "ABUSE", "ACTOR", "ACUTE", "ADMIT", "ADOPT", "ADULT", "AFTER", "AGAIN",
  "AGENT", "AGREE", "AHEAD", "ALARM", "ALBUM", "ALERT", "ALIEN", "ALIGN", "ALIKE", "ALIVE",
  "ALLOW", "ALONE", "ALONG", "ALTER", "AMBER", "AMEND", "AMONG", "ANGEL", "ANGER", "ANGLE",
  "ANGRY", "APART", "APPLE", "APPLY", "ARENA", "ARGUE", "ARISE", "ARRAY", "ARROW", "ASIDE",
  "ASSET", "AUDIO", "AUDIT", "AVOID", "AWAKE", "AWARD", "AWARE", "BADLY", "BAKER", "BASES",
  "BASIC", "BASIS", "BEACH", "BEGAN", "BEGIN", "BEING", "BELOW", "BENCH", "BILLY", "BIRTH",
  "BLACK", "BLADE", "BLAME", "BLANK", "BLAST", "BLEAK", "BLEND", "BLESS", "BLIND", "BLOCK",
  "BLOOD", "BOARD", "BOATS", "BOBBY", "BOOST", "BOOTH", "BOUND", "BRAIN", "BRAND", "BRASS",
  "BRAVE", "BREAD", "BREAK", "BREED", "BRICK", "BRIDE", "BRIEF", "BRING", "BRINK", "BRISK",
  "BROAD", "BROKE", "BROOK", "BROWN", "BRUCE", "BUILD", "BUILT", "BURKE", "BURST", "BUYER",
  "CABLE", "CALIF", "CAMEL", "CANAL", "CANDY", "CARGO", "CAROL", "CARRY", "CATCH", "CAUSE",
  "CHAIN", "CHAIR", "CHALK", "CHAMP", "CHANT", "CHAOS", "CHARM", "CHART", "CHASE", "CHEAP",
  "CHEAT", "CHECK", "CHEEK", "CHEER", "CHESS", "CHEST", "CHIEF", "CHILD", "CHINA", "CHOSE",
  "CHUMP", "CHUNK", "CLAIM", "CLASH", "CLASS", "CLEAN", "CLEAR", "CLICK", "CLIFF", "CLIMB",
  "CLING", "CLOAK", "CLOCK", "CLOSE", "CLOUD", "COACH", "COAST", "COULD", "COUNT", "COUCH",
  "COUGH", "COURT", "CRACK", "CRAFT", "CRASH", "CRATE", "CRANE", "CRAZY", "CREAM", "CREED",
  "CREEK", "CREEP", "CRIME", "CRIMP", "CRISP", "CROAK", "CROCK", "CROSS", "CROWD", "CROWN",
  "CRUDE", "CRUEL", "CRUSH", "CUBIC", "CURVE", "CYCLE", "DAILY", "DAIRY", "DAISY", "DANCE",
  "DATED", "DEALT", "DEATH", "DEBUT", "DECAY", "DELAY", "DELTA", "DELVE", "DENIM", "DENSE",
  "DEPTH", "DERBY", "DETER", "DEVIL", "DIARY", "DIRTY", "DISCO", "DITCH", "DIVER", "DIZZY",
  "DODGE", "DOING", "DONOR", "DOUBT", "DOUGH", "DOZEN", "DRAFT", "DRAIN", "DRAKE", "DRANK",
  "DRAWN", "DREAD", "DREAM", "DRESS", "DRIED", "DRIFT", "DRILL", "DRINK", "DRIVE", "DROWN",
  "DRUGS", "DRUNK", "DWELL", "DYING", "EAGER", "EAGLE", "EARLY", "EARTH", "EASEL", "EATEN",
  "EATER", "EBONY", "EDGES", "EIGHT", "EJECT", "ELUDE", "EMAIL", "EMBER", "EMERY", "EMOTE",
  "EMPTY", "ENACT", "ENDOW", "ENEMY", "ENJOY", "ENTER", "ENTRY", "ENVOY", "EQUAL", "EQUIP",
  "ERASE", "ERROR", "ERUPT", "ESSAY", "ETHER", "ETHIC", "EVENT", "EVERY", "EVICT", "EVOKE",
  "EXACT", "EXALT", "EXCEL", "EXERT", "EXILE", "EXIST", "EXPEL", "EXTOL", "EXTRA", "EXUDE",
  "EXULT", "FACED", "FACET", "FACTS", "FADED", "FAILS", "FAITH", "FAKER", "FALLS", "FALSE",
  "FAMED", "FANCY", "FANGS", "FARCE", "FARED", "FARMS", "FATAL", "FATED", "FATTY", "FAULT",
  "FAVOR", "FAZED", "FEARS", "FEAST", "FEATS", "FEEDS", "FEELS", "FENCE", "FENDS", "FERAL",
  "FEVER", "FEWER", "FIBER", "FIELD", "FIEND", "FIERY", "FIFTH", "FIFTY", "FIGHT", "FILCH",
  "FILES", "FILED", "FILER", "FILET", "FILLS", "FILMS", "FILTH", "FINAL", "FINCH", "FINDS",
  "FINED", "FINER", "FINES", "FIRED", "FIRES", "FIRST", "FIRTH", "FISTS", "FITLY", "FIXED",
  "FIXER", "FIXES", "FIZZY", "FJORD", "FLAGS", "FLAIL", "FLAIR", "FLAKE", "FLAKY", "FLAME",
  "FLANK", "FLAPS", "FLARE", "FLASH", "FLASK", "FLATS", "FLECK", "FLEES", "FLEET", "FLESH",
  "FLICK", "FLIED", "FLIER", "FLIES", "FLING", "FLINT", "FLIPS", "FLIRT", "FLOAT", "FLOCK",
  "FLOOD", "FLOOR", "FLOPS", "FLORA", "FLOUR", "FLOUT", "FLOWN", "FLOWS", "FLUID", "FLUKE",
  "FLUNG", "FLUSH", "FLUTE", "FOALS", "FOAMS", "FOCAL", "FOCUS", "FOGGY", "FOILS", "FOIST",
  "FOLDS", "FOLIO", "FOLKS", "FOLLY", "FONTS", "FOODS", "FOOLS", "FOOTS", "FORCE", "FORDS",
  "FORGE", "FORGO", "FORKS", "FORMS", "FORTE", "FORTH", "FORTY", "FORUM", "FOUND", "FOUNT",
  "FOURS", "FOWLS", "FOXES", "FOYER", "FRAIL", "FRAME", "FRANK", "FRAUD", "FRAYS", "FREAK",
  "FREED", "FREER", "FRESH", "FRETS", "FRIED", "FRIES", "FRILL", "FRISK", "FRIZZ", "FROCK",
  "FROGS", "FROND", "FRONT", "FROST", "FROTH", "FROWN", "FROZE", "FRUIT", "FRYER", "FUELS",
  "FULLY", "FUMED", "FUMES", "FUNDS", "FUNKY", "FUNNY", "FURLS", "FURRY", "FUSTY", "FUZZY",
  "GABLE", "GAINS", "GALES", "GAMED", "GAMES", "GANGS", "GAPES", "GARBS", "GASES", "GASPS",
  "GATED", "GATES", "GAUGE", "GAUNT", "GAUZE", "GAVEL", "GAWKS", "GEARS", "GEESE", "GENES",
  "GENRE", "GENTS", "GENUS", "GERMS", "GIANT", "GIFTS", "GILLS", "GILTS", "GIRLS", "GIRTH",
  "GIVEN", "GIVER", "GIVES", "GIZMO", "GLAND", "GLARE", "GLASS", "GLAZE", "GLEAN", "GLEBE",
  "GLEES", "GLEAM", "GLEED", "GLEET", "GLIDE", "GLINT", "GLITZ", "GLOAM", "GLOAT", "GLOBE",
  "GLOBS", "GLOOM", "GLORY", "GLOSS", "GLOVE", "GLOWS", "GLUED", "GLUES", "GLUEY", "GLUME",
  "GLUTS", "GLYPH", "GNASH", "GNATS", "GNAWS", "GOALS", "GOATS", "GODET", "GODLY", "GOERS",
  "GOING", "GOLDS", "GOLFS", "GONAD", "GONER", "GONGS", "GOODS", "GOOEY", "GOOFS", "GOOFY",
  "GOONS", "GOOSE", "GORED", "GORES", "GORGE", "GORSE", "GOTTA", "GOUGE", "GOWNS", "GRABS",
  "GRACE", "GRADE", "GRAFT", "GRAIN", "GRAND", "GRANT", "GRAPE", "GRAPH", "GRASP", "GRASS",
  "GRATE", "GRAVE", "GRAVY", "GRAZE", "GREAT", "GREED", "GREEK", "GREEN", "GREET", "GREYS",
  "GRIDS", "GRIEF", "GRIFT", "GRILL", "GRIME", "GRIND", "GRINS", "GRIPE", "GRIST", "GRITS",
  "GROAN", "GROAT", "GROIN", "GROOM", "GROPE", "GROSS", "GROUP", "GROUT", "GROVE", "GROWL",
  "GROWN", "GROWS", "GRUBS", "GRUEL", "GRUFF", "GRUNT", "GUARD", "GUAVA", "GUESS", "GUEST",
  "GUIDE", "GUILD", "GUILE", "GUILT", "GULAG", "GULCH", "GULES", "GULFS", "GULLS", "GULPS",
  "GUMMY", "GUMBO", "GUNKS", "GUPPY", "GURUS", "GUSTS", "GUSTY", "GUTSY", "GUTTA", "GUTTER",
  "HABIT", "HACKS", "HAFTS", "HAIKU", "HAILS", "HAIRS", "HAIRY", "HALES", "HALTS", "HALVE",
  "HANDS", "HANDY", "HANGS", "HANKS", "HANKY", "HAPPY", "HARDY", "HARED", "HAREM", "HARES",
  "HARKS", "HARMS", "HARPS", "HARPY", "HARRY", "HARSH", "HARTS", "HASTE", "HASTY", "HATCH",
  "HATED", "HATER", "HATES", "HAULS", "HAUNT", "HAVEN", "HAVER", "HAVES", "HAVOC", "HAWKS",
  "HAZEL", "HEADS", "HEADY", "HEALS", "HEAPS", "HEARS", "HEART", "HEATS", "HEAVE", "HEAVY",
  "HEDGE", "HEEDS", "HEELS", "HEFTS", "HEFTY", "HEIRS", "HEIST", "HELIX", "HELLO", "HELMS",
  "HELPS", "HENCE", "HENNA", "HENTS", "HERBS", "HERDS", "HERES", "HERMS", "HERON", "HEROS",
  "HERRY", "HERTZ", "HESTS", "HEXED", "HEXER", "HEXES", "HEXYL", "HICKS", "HIDED", "HIDER",
  "HIDES", "HIGHS", "HIGHT", "HIKED", "HIKER", "HIKES", "HILLS", "HILTS", "HINGE", "HINTS",
  "HIPPO", "HIPPY", "HIRED", "HIREE", "HIRER", "HIRES", "HISSY", "HISTS", "HITCH", "HIVED",
  "HIVES", "HOARD", "HOARS", "HOARY", "HOBOS", "HOCKS", "HOIST", "HOKEY", "HOLDS", "HOLED",
  "HOLER", "HOLES", "HOLEY", "HOLLY", "HOLMS", "HOICK", "HOKED", "HOKER", "HOKES", "HOKKU",
  "HOLTS", "HOMES", "HOMEY", "HOMOS", "HONED", "HONER", "HONES", "HONKS", "HONOR", "HOOCH",
  "HOODS", "HOODY", "HOOFS", "HOOKS", "HOOKY", "HOONS", "HOOPS", "HOOSH", "HOOTS", "HOOTY",
  "HOOVE", "HOPED", "HOPER", "HOPES", "HOPPY", "HORAH", "HORAL", "HORAS", "HORDE", "HORLA",
  "HORNY", "HORSE", "HOSED", "HOSEL", "HOSEN", "HOSER", "HOSES", "HOSEY", "HOSTA", "HOSTS",
  "HOTCH", "HOTLY", "HOTTY", "HOUND", "HOURS", "HOUSE", "HOUVE", "HOVED", "HOVEL", "HOVER",
  "HOVES", "HOWED", "HOWES", "HOWFF", "HOWKS", "HOWLS", "HOYDA", "HOYED", "HOYLE", "HUBBA",
  "HUBBY", "HUCKS", "HUFFS", "HUFFY", "HUGER", "HUGES", "HULKS", "HULKY", "HULLS", "HULUS",
  "HUMAN", "HUMIC", "HUMID", "HUMMS", "HUMOR", "HUMPH", "HUMPY", "HUMUS", "HUNCH", "HUNKS",
  "HUNKY", "HUNNY", "HUNTS", "HUNTY", "HURDS", "HURDY", "HURED", "HURES", "HURFS", "HURKY",
  "HURLS", "HURLY", "HURRA", "HURRY", "HURTS", "HURTZ", "HUSHY", "HUSKS", "HUSKY", "HUSSY",
  "HUTCH", "HUZZA", "HYAES", "HYDRA", "HYDRO", "HYING", "HYLAS", "HYMEN", "HYOID", "HYPED",
  "HYPER", "HYPES", "HYPHA", "HYPOS", "HYSON", "ICONS", "ICTAL", "ICTIC", "IDEAS", "IDEAL",
  "IDENT", "IDIOM", "IDIOT", "IDLED", "IDLER", "IDLES", "IDOLS", "IDYLL", "IDYLS", "IGLOO",
  "IGLUS", "IGNIS", "IHRAM", "IKATS", "ILEAL", "IMAGE", "IMAGO", "IMAMS", "IMBED", "IMBUE",
  "IMIDE", "IMIDS", "IMINO", "IMINS", "IMMIX", "IMPED", "IMPEL", "IMPED", "IMPLY", "IMPOST",
  "IMPEL", "IMPED", "IMPLY", "IMPOST", "IMPED", "IMPLY", "IMPOST", "IMPED", "IMPLY", "IMPOST",
]);

/* ============================================
   Release Notes Configuration
   Update version when you make changes to show users what's new
   ============================================ */
const RELEASE_NOTES = {
  version: "1.1.0",
  date: "November 11, 2025",
  title: "🎉 What's New in Version 1.1.0",
  notes: [
    "🔒 <strong>Word Validation:</strong> Only valid English words are now accepted as guesses. Invalid random combinations like 'AAAAA' or 'SADSG' will be rejected.",
    "📋 <strong>Release Notes:</strong> New release notes modal displays on first launch and major updates to keep players informed about new features and bug fixes.",
    "🎯 <strong>Improved User Experience:</strong> Better feedback messages to guide players through the game."
  ]
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

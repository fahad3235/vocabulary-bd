# Vocabulary BD - generator for js/data.js and js/i18n.js
# Bengali is written here in UTF-8 and emitted as \uXXXX escapes so the
# shipped sources stay pure ASCII (push argv transport corrupts raw UTF-8).
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
JS = os.path.join(HERE, 'js')

# (en, pos, bn meaning, example EN, example BN, level)
WORDS = [
    # ---- Beginner (30) ----
    ("abandon", "verb", "পরিত্যাগ করা", "Don't abandon your dream.", "তোমার স্বপ্ন পরিত্যাগ করো না।", "beginner"),
    ("able", "adjective", "সক্ষম", "She is able to swim.", "সে সাঁতার কাটতে সক্ষম।", "beginner"),
    ("absent", "adjective", "অনুপস্থিত", "Rahim was absent yesterday.", "রহিম গতকাল অনুপস্থিত ছিল।", "beginner"),
    ("accept", "verb", "গ্রহণ করা", "Please accept my gift.", "দয়া করে আমার উপহারটি গ্রহণ করুন।", "beginner"),
    ("achieve", "verb", "অর্জন করা", "Hard work helps you achieve success.", "কঠোর পরিশ্রম সাফল্য অর্জনে সাহায্য করে।", "beginner"),
    ("active", "adjective", "সক্রিয়", "He is an active student.", "সে একজন সক্রিয় ছাত্র।", "beginner"),
    ("advice", "noun", "উপদেশ", "Listen to your teacher's advice.", "তোমার শিক্ষকের উপদেশ শোনো।", "beginner"),
    ("afraid", "adjective", "ভীত", "The child is afraid of the dark.", "শিশুটি অন্ধকারে ভীত।", "beginner"),
    ("agree", "verb", "সম্মত হওয়া", "I agree with you.", "আমি তোমার সঙ্গে সম্মত।", "beginner"),
    ("allow", "verb", "অনুমতি দেওয়া", "Parents allow children to play.", "বাবা-মা শিশুদের খেলতে অনুমতি দেন।", "beginner"),
    ("almost", "adverb", "প্রায়", "It is almost time for class.", "ক্লাসের সময় প্রায় হয়ে গেছে।", "beginner"),
    ("alone", "adjective", "একা", "She lives alone.", "সে একা থাকে।", "beginner"),
    ("amount", "noun", "পরিমাণ", "What is the amount of rice?", "চালের পরিমাণ কত?", "beginner"),
    ("ancient", "adjective", "প্রাচীন", "Dhaka has many ancient buildings.", "ঢাকায় অনেক প্রাচীন ভবন আছে।", "beginner"),
    ("angry", "adjective", "রাগান্বিত", "He was angry with me.", "সে আমার উপর রাগান্বিত ছিল।", "beginner"),
    ("animal", "noun", "প্রাণী", "The cow is a useful animal.", "গরু একটি উপকারী প্রাণী।", "beginner"),
    ("answer", "noun", "উত্তর", "Give the correct answer.", "সঠিক উত্তর দাও।", "beginner"),
    ("appear", "verb", "দেখা দেওয়া", "The sun appears in the morning.", "সকালে সূর্য দেখা দেয়।", "beginner"),
    ("arrive", "verb", "পৌঁছানো", "The train arrives at 8 o'clock.", "ট্রেনটি ৮টায় পৌঁছায়।", "beginner"),
    ("ask", "verb", "জিজ্ঞাসা করা", "Ask the teacher if you do not understand.", "না বুঝলে শিক্ষককে জিজ্ঞাসা করো।", "beginner"),
    ("asleep", "adjective", "ঘুমন্ত", "The baby is asleep.", "শিশুটি ঘুমন্ত।", "beginner"),
    ("attend", "verb", "উপস্থিত থাকা", "Attend your classes regularly.", "নিয়মিত ক্লাসে উপস্থিত থাকো।", "beginner"),
    ("available", "adjective", "উপলব্ধ", "Books are available in the library.", "বই লাইব্রেরিতে উপলব্ধ।", "beginner"),
    ("avoid", "verb", "এড়িয়ে চলা", "Avoid bad company.", "খারাপ সঙ্গ এড়িয়ে চলো।", "beginner"),
    ("awake", "adjective", "জাগ্রত", "He is awake now.", "সে এখন জাগ্রত।", "beginner"),
    ("balance", "noun", "ভারসাম্য", "Keep a balance between study and play.", "পড়াশোনা ও খেলার মধ্যে ভারসাম্য রাখো।", "beginner"),
    ("basic", "adjective", "মৌলিক", "Learn the basic rules first.", "আগে মৌলিক নিয়মগুলো শেখো।", "beginner"),
    ("battle", "noun", "যুদ্ধ", "The battle lasted three days.", "যুদ্ধটি তিন দিন স্থায়ী হয়েছিল।", "beginner"),
    ("beach", "noun", "সমুদ্র সৈকত", "Cox's Bazar has the longest beach.", "কক্সবাজারে সবচেয়ে দীর্ঘ সমুদ্র সৈকত আছে।", "beginner"),
    ("beautiful", "adjective", "সুন্দর", "Sundarbans is a beautiful forest.", "সুন্দরবন একটি সুন্দর বন।", "beginner"),
    # ---- Intermediate (30) ----
    ("ability", "noun", "সামর্থ্য", "She has the ability to lead.", "তার নেতৃত্ব দেওয়ার সামর্থ্য আছে।", "intermediate"),
    ("accurate", "adjective", "নির্ভুল", "Your answer is accurate.", "তোমার উত্তর নির্ভুল।", "intermediate"),
    ("admire", "verb", "প্রশংসা করা", "We admire honest people.", "আমরা সৎ মানুষের প্রশংসা করি।", "intermediate"),
    ("admit", "verb", "স্বীকার করা", "He admitted his mistake.", "সে তার ভুল স্বীকার করেছে।", "intermediate"),
    ("adopt", "verb", "অবলম্বন করা", "We should adopt good habits.", "আমাদের ভালো অভ্যাস অবলম্বন করা উচিত।", "intermediate"),
    ("advance", "verb", "এগিয়ে যাওয়া", "Science advances every day.", "বিজ্ঞান প্রতিদিন এগিয়ে যাচ্ছে।", "intermediate"),
    ("advantage", "noun", "সুবিধা", "Education gives you an advantage.", "শিক্ষা তোমাকে সুবিধা দেয়।", "intermediate"),
    ("adventure", "noun", "অভিযান", "The journey was a great adventure.", "যাত্রাটি ছিল এক দারুণ অভিযান।", "intermediate"),
    ("affect", "verb", "প্রভাব ফেলা", "Smoking affects your health.", "ধূমপান তোমার স্বাস্থ্যের উপর প্রভাব ফেলে।", "intermediate"),
    ("afford", "verb", "সামর্থ্য থাকা", "I cannot afford a new phone.", "আমি নতুন ফোন কেনার সামর্থ্য রাখি না।", "intermediate"),
    ("agency", "noun", "সংস্থা", "He works in a travel agency.", "সে একটি ভ্রমণ সংস্থায় কাজ করে।", "intermediate"),
    ("aim", "verb", "লক্ষ্য করা", "Aim high in life.", "জীবনে বড় লক্ষ্য রাখো।", "intermediate"),
    ("announce", "verb", "ঘোষণা করা", "The school announced the result.", "বিদ্যালয় ফলাফল ঘোষণা করেছে।", "intermediate"),
    ("annual", "adjective", "বার্ষিক", "The annual exam starts in June.", "বার্ষিক পরীক্ষা জুনে শুরু হয়।", "intermediate"),
    ("anxious", "adjective", "উদ্বিগ্ন", "She was anxious about the result.", "সে ফলাফল নিয়ে উদ্বিগ্ন ছিল।", "intermediate"),
    ("apology", "noun", "ক্ষমা প্রার্থনা", "He offered an apology.", "সে ক্ষমা প্রার্থনা করেছে।", "intermediate"),
    ("apparent", "adjective", "সুস্পষ্ট", "It is apparent that he is tired.", "এটা সুস্পষ্ট যে সে ক্লান্ত।", "intermediate"),
    ("appreciate", "verb", "কৃতজ্ঞ হওয়া", "I appreciate your help.", "আমি তোমার সাহায্যের জন্য কৃতজ্ঞ।", "intermediate"),
    ("approach", "verb", "কাছে আসা", "Winter is approaching.", "শীত আসছে।", "intermediate"),
    ("argue", "verb", "তর্ক করা", "Do not argue with your elders.", "বড়দের সঙ্গে তর্ক করো না।", "intermediate"),
    ("arrange", "verb", "ব্যবস্থা করা", "Arrange the books on the shelf.", "বইগুলো তাকে সাজিয়ে রাখো।", "intermediate"),
    ("article", "noun", "প্রবন্ধ", "I read an article about health.", "আমি স্বাস্থ্য নিয়ে একটি প্রবন্ধ পড়েছি।", "intermediate"),
    ("ashamed", "adjective", "লজ্জিত", "He felt ashamed of his lie.", "সে তার মিথ্যার জন্য লজ্জিত বোধ করেছে।", "intermediate"),
    ("assist", "verb", "সাহায্য করা", "Please assist the old man.", "দয়া করে বৃদ্ধ লোকটিকে সাহায্য করুন।", "intermediate"),
    ("assume", "verb", "ধরে নেওয়া", "Do not assume the worst.", "সবচেয়ে খারাপটা ধরে নিয়ো না।", "intermediate"),
    ("atmosphere", "noun", "পরিবেশ", "The atmosphere of the village is calm.", "গ্রামের পরিবেশ শান্ত।", "intermediate"),
    ("attempt", "verb", "চেষ্টা করা", "Attempt all the questions.", "সব প্রশ্নের উত্তর দেওয়ার চেষ্টা করো।", "intermediate"),
    ("attention", "noun", "মনোযোগ", "Pay attention in class.", "ক্লাসে মনোযোগ দাও।", "intermediate"),
    ("attitude", "noun", "মনোভাব", "A positive attitude helps you succeed.", "ইতিবাচক মনোভাব সাফল্য এনে দেয়।", "intermediate"),
    ("attract", "verb", "আকর্ষণ করা", "The fair attracts many people.", "মেলাটি অনেক মানুষকে আকর্ষণ করে।", "intermediate"),
    # ---- Advanced (30) ----
    ("ambiguous", "adjective", "দ্ব্যর্থবোধক", "His answer was ambiguous.", "তার উত্তরটি দ্ব্যর্থবোধক ছিল।", "advanced"),
    ("anticipate", "verb", "পূর্বানুমান করা", "We anticipate heavy rain.", "আমরা ভারী বৃষ্টির পূর্বানুমান করছি।", "advanced"),
    ("arbitrary", "adjective", "খেয়ালখুশিমতো", "The decision was arbitrary.", "সিদ্ধান্তটি ছিল খেয়ালখুশিমতো।", "advanced"),
    ("articulate", "adjective", "স্পষ্টভাষী", "She is an articulate speaker.", "সে একজন স্পষ্টভাষী বক্তা।", "advanced"),
    ("assess", "verb", "মূল্যায়ন করা", "Teachers assess students every month.", "শিক্ষকরা প্রতি মাসে শিক্ষার্থীদের মূল্যায়ন করেন।", "advanced"),
    ("authentic", "adjective", "খাঁটি", "This is an authentic document.", "এটি একটি খাঁটি দলিল।", "advanced"),
    ("benevolent", "adjective", "দয়ালু", "He is a benevolent man.", "তিনি একজন দয়ালু মানুষ।", "advanced"),
    ("brevity", "noun", "সংক্ষিপ্ততা", "Brevity is the soul of wit.", "সংক্ষিপ্ততাই বুদ্ধির প্রাণ।", "advanced"),
    ("candid", "adjective", "অকপট", "She gave a candid answer.", "সে একটি অকপট উত্তর দিয়েছে।", "advanced"),
    ("coherent", "adjective", "সুসংগত", "Write a coherent paragraph.", "একটি সুসংগত অনুচ্ছেদ লেখো।", "advanced"),
    ("compassionate", "adjective", "সহানুভূতিশীল", "A doctor must be compassionate.", "একজন ডাক্তারকে সহানুভূতিশীল হতে হয়।", "advanced"),
    ("consensus", "noun", "ঐকমত্য", "The team reached a consensus.", "দলটি ঐকমত্যে পৌঁছেছে।", "advanced"),
    ("contemporary", "adjective", "সমসাময়িক", "He is a contemporary writer.", "তিনি একজন সমসাময়িক লেখক।", "advanced"),
    ("crucial", "adjective", "অত্যন্ত গুরুত্বপূর্ণ", "This is a crucial decision.", "এটি একটি অত্যন্ত গুরুত্বপূর্ণ সিদ্ধান্ত।", "advanced"),
    ("cynical", "adjective", "হতাশাবাদী", "Do not be cynical about change.", "পরিবর্তন নিয়ে হতাশাবাদী হয়ো না।", "advanced"),
    ("diligent", "adjective", "পরিশ্রমী", "Diligent students succeed in life.", "পরিশ্রমী শিক্ষার্থীরা জীবনে সফল হয়।", "advanced"),
    ("diminish", "verb", "হ্রাস করা", "His fame did not diminish.", "তার খ্যাতি হ্রাস পায়নি।", "advanced"),
    ("discreet", "adjective", "বিচক্ষণ", "Be discreet about the secret.", "গোপন বিষয়ে বিচক্ষণ হও।", "advanced"),
    ("elaborate", "verb", "বিস্তারিত ব্যাখ্যা করা", "Please elaborate your point.", "দয়া করে তোমার বক্তব্য বিস্তারিত ব্যাখ্যা করো।", "advanced"),
    ("eloquent", "adjective", "বাগ্মী", "She is an eloquent speaker.", "সে একজন বাগ্মী বক্তা।", "advanced"),
    ("empathy", "noun", "সহমর্মিতা", "Empathy makes us kind.", "সহমর্মিতা আমাদের দয়ালু করে।", "advanced"),
    ("endeavour", "verb", "প্রচেষ্টা করা", "We must endeavour to do better.", "আমাদের আরও ভালো করার প্রচেষ্টা করতে হবে।", "advanced"),
    ("enormous", "adjective", "বিশাল", "The Padma Bridge is an enormous project.", "পদ্মা সেতু একটি বিশাল প্রকল্প।", "advanced"),
    ("essential", "adjective", "অপরিহার্য", "Water is essential for life.", "পানি জীবনের জন্য অপরিহার্য।", "advanced"),
    ("evaluate", "verb", "পর্যালোচনা করা", "Evaluate your progress every week.", "প্রতি সপ্তাহে তোমার অগ্রগতি পর্যালোচনা করো।", "advanced"),
    ("evidence", "noun", "প্রমাণ", "The police found the evidence.", "পুলিশ প্রমাণ খুঁজে পেয়েছে।", "advanced"),
    ("evolve", "verb", "বিকশিত হওয়া", "Technology evolves fast.", "প্রযুক্তি দ্রুত বিকশিত হচ্ছে।", "advanced"),
    ("exaggerate", "verb", "অতিরঞ্জিত করা", "Do not exaggerate the story.", "গল্পটি অতিরঞ্জিত করো না।", "advanced"),
    ("existence", "noun", "অস্তিত্ব", "Water is necessary for existence.", "অস্তিত্বের জন্য পানি প্রয়োজন।", "advanced"),
    ("facilitate", "verb", "সহজতর করা", "Good roads facilitate trade.", "ভালো রাস্তা বাণিজ্য সহজতর করে।", "advanced"),
]

EN = {
    "appTitle": "Vocabulary BD",
    "appSubtitle": "Learn English words with Bangla meanings — flashcards, quizzes and progress tracking, fully offline.",
    "tabLearn": "Learn",
    "tabQuiz": "Quiz",
    "tabBrowse": "Browse",
    "tabStats": "Progress",
    "learnTitle": "Flashcards",
    "learnHint": "Tap the card to see the Bangla meaning and an example.",
    "btnPrev": "Previous",
    "btnNext": "Next",
    "btnShuffle": "Shuffle",
    "btnMarkKnown": "I know this",
    "btnMarkUnknown": "Still learning",
    "btnBookmark": "Bookmark",
    "btnBookmarked": "Bookmarked",
    "knownBadge": "Known",
    "levelBeginner": "Beginner",
    "levelIntermediate": "Intermediate",
    "levelAdvanced": "Advanced",
    "levelAll": "All levels",
    "quizTitle": "Quiz — pick the correct Bangla meaning",
    "quizStart": "Start quiz",
    "quizOf": "Question",
    "quizScore": "Score",
    "quizCorrect": "Correct!",
    "quizWrong": "Wrong — the correct meaning is:",
    "quizFinish": "Quiz finished!",
    "quizAgain": "Play again",
    "quizBest": "Best score",
    "quizRounds": "Quizzes played",
    "quizEmpty": "Not enough words in this level yet.",
    "quizCount": "Questions",
    "browseTitle": "All words",
    "searchPh": "Search English or Bangla…",
    "filterAll": "All",
    "filterKnown": "Known",
    "filterUnknown": "Learning",
    "filterBookmarked": "Bookmarked",
    "noResults": "No words match your search.",
    "statsTitle": "Your progress",
    "statKnown": "Words known",
    "statBookmarked": "Bookmarked",
    "statBest": "Best quiz score",
    "statRounds": "Quizzes played",
    "statProgress": "Learning progress",
    "dataTitle": "Your data",
    "btnExport": "Export progress",
    "btnImport": "Import progress",
    "btnReset": "Erase all progress",
    "resetConfirm": "Erase all progress, bookmarks and quiz history? This cannot be undone.",
    "importOk": "Progress imported.",
    "importBad": "That file is not a valid Vocabulary BD backup.",
    "exported": "Progress downloaded as JSON.",
    "langToggle": "বাংলা",
    "exampleLabel": "Example",
    "footerNote": "90 hand-picked words for Bangladeshi learners. Meanings are short dictionary-style glosses, not exam answers. Works fully offline — your progress stays on your device.",
    "cardOf": "Card",
    "tapToFlip": "Tap to flip",
    "posNoun": "noun",
    "posVerb": "verb",
    "posAdjective": "adjective",
    "posAdverb": "adverb",
    "nextQ": "Next question",
    "seeResults": "See results",
    "yourAnswer": "Your answer",
    "correctAnswer": "Correct answer",
    "reviewTitle": "Review your answers",
    "streakLabel": "Streak",
    "wordsCount": "words",
}

BN = {
    "appTitle": "ভোকাবুলারি বিডি",
    "appSubtitle": "বাংলা অর্থসহ ইংরেজি শব্দ শিখুন — ফ্ল্যাশকার্ড, কুইজ ও অগ্রগতি, সম্পূর্ণ অফলাইন।",
    "tabLearn": "শিখুন",
    "tabQuiz": "কুইজ",
    "tabBrowse": "শব্দতালিকা",
    "tabStats": "অগ্রগতি",
    "learnTitle": "ফ্ল্যাশকার্ড",
    "learnHint": "বাংলা অর্থ ও উদাহরণ দেখতে কার্ডে চাপ দিন।",
    "btnPrev": "আগেরটি",
    "btnNext": "পরেরটি",
    "btnShuffle": "এলোমেলো করুন",
    "btnMarkKnown": "আমি এটা জানি",
    "btnMarkUnknown": "এখনো শিখছি",
    "btnBookmark": "বুকমার্ক",
    "btnBookmarked": "বুকমার্ক করা",
    "knownBadge": "জানা",
    "levelBeginner": "প্রাথমিক",
    "levelIntermediate": "মাধ্যমিক",
    "levelAdvanced": "উচ্চতর",
    "levelAll": "সব স্তর",
    "quizTitle": "কুইজ — সঠিক বাংলা অর্থ বেছে নিন",
    "quizStart": "কুইজ শুরু করুন",
    "quizOf": "প্রশ্ন",
    "quizScore": "স্কোর",
    "quizCorrect": "সঠিক!",
    "quizWrong": "ভুল — সঠিক অর্থ:",
    "quizFinish": "কুইজ শেষ!",
    "quizAgain": "আবার খেলুন",
    "quizBest": "সেরা স্কোর",
    "quizRounds": "খেলা কুইজ",
    "quizEmpty": "এই স্তরে এখনো যথেষ্ট শব্দ নেই।",
    "quizCount": "প্রশ্ন সংখ্যা",
    "browseTitle": "সব শব্দ",
    "searchPh": "ইংরেজি বা বাংলা খুঁজুন…",
    "filterAll": "সব",
    "filterKnown": "জানা",
    "filterUnknown": "শিখছি",
    "filterBookmarked": "বুকমার্ক",
    "noResults": "আপনার খোঁজার সঙ্গে কোনো শব্দ মেলেনি।",
    "statsTitle": "আপনার অগ্রগতি",
    "statKnown": "জানা শব্দ",
    "statBookmarked": "বুকমার্ক",
    "statBest": "সেরা কুইজ স্কোর",
    "statRounds": "খেলা কুইজ",
    "statProgress": "শেখার অগ্রগতি",
    "dataTitle": "আপনার তথ্য",
    "btnExport": "অগ্রগতি এক্সপোর্ট",
    "btnImport": "অগ্রগতি ইমপোর্ট",
    "btnReset": "সব অগ্রগতি মুছে ফেলুন",
    "resetConfirm": "সব অগ্রগতি, বুকমার্ক ও কুইজের ইতিহাস মুছে যাবে? এটি ফেরানো যাবে না।",
    "importOk": "অগ্রগতি ইমপোর্ট হয়েছে।",
    "importBad": "এই ফাইলটি ভোকাবুলারি বিডির বৈধ ব্যাকআপ নয়।",
    "exported": "অগ্রগতি JSON হিসেবে ডাউনলোড হয়েছে।",
    "langToggle": "English",
    "exampleLabel": "উদাহরণ",
    "footerNote": "বাংলাদেশি শিক্ষার্থীদের জন্য ৯০টি হাতে বাছাই করা শব্দ। অর্থগুলো সংক্ষিপ্ত অভিধান-ধাঁচের ব্যাখ্যা, পরীক্ষার উত্তর নয়। সম্পূর্ণ অফলাইনে চলে — আপনার অগ্রগতি আপনার ডিভাইসেই থাকে।",
    "cardOf": "কার্ড",
    "tapToFlip": "উল্টাতে চাপ দিন",
    "posNoun": "বিশেষ্য",
    "posVerb": "ক্রিয়া",
    "posAdjective": "বিশেষণ",
    "posAdverb": "ক্রিয়াবিশেষণ",
    "nextQ": "পরের প্রশ্ন",
    "seeResults": "ফলাফল দেখুন",
    "yourAnswer": "আপনার উত্তর",
    "correctAnswer": "সঠিক উত্তর",
    "reviewTitle": "আপনার উত্তরগুলো দেখুন",
    "streakLabel": "টানা সঠিক",
    "wordsCount": "টি শব্দ",
}

def esc(obj):
    return json.dumps(obj, ensure_ascii=True, indent=2)

words_json = []
for i, (en, pos, bn, ex, exBn, level) in enumerate(WORDS, 1):
    words_json.append({"id": i, "en": en, "pos": pos, "bn": bn, "ex": ex, "exBn": exBn, "level": level})

data_js = """/* Vocabulary BD - word list (90 hand-picked words, 30 per level).
   Generated by gen.py; Bengali stored as \\uXXXX escapes (pure ASCII). */
const WORDS = %s;

const LEVELS = ["beginner", "intermediate", "advanced"];

const DATA_API = { WORDS, LEVELS };

if (typeof module !== 'undefined' && module.exports) module.exports = DATA_API;
if (typeof window !== 'undefined') window.VOCAB_DATA = DATA_API;
""" % esc(words_json)

i18n_js = """/* Vocabulary BD - UI strings. Generated by gen.py;
   Bengali stored as \\uXXXX escapes so sources stay pure ASCII. */
const STRINGS = {
  "en": %s,
  "bn": %s
};

function t(lang, key) {
  const pack = STRINGS[lang] || STRINGS.en;
  return (key in pack) ? pack[key] : (STRINGS.en[key] || key);
}

const I18N_API = { STRINGS, t };

if (typeof module !== 'undefined' && module.exports) module.exports = I18N_API;
if (typeof window !== 'undefined') window.VOCAB_I18N = I18N_API;
""" % (esc(EN), esc(BN))

with open(os.path.join(JS, 'data.js'), 'w', encoding='ascii') as f:
    f.write(data_js)
with open(os.path.join(JS, 'i18n.js'), 'w', encoding='ascii') as f:
    f.write(i18n_js)

# sanity: keys must match exactly
assert set(EN) == set(BN), "i18n key mismatch: %s" % (set(EN) ^ set(BN))
assert len(words_json) == 90
assert len({w["en"] for w in words_json}) == 90, "duplicate English words"
assert len({w["id"] for w in words_json}) == 90
for lvl in ("beginner", "intermediate", "advanced"):
    assert sum(1 for w in words_json if w["level"] == lvl) == 30, lvl
print("OK: 90 words (30/level), %d i18n keys, ASCII-only outputs" % len(EN))

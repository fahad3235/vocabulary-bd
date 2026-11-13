/* Vocabulary BD - pure logic (no DOM).
   Works in Node (module.exports) and in the browser (window.VOCAB_CORE). */
'use strict';

const QUIZ_SIZE = 10;
const BN_DIGITS = ['\u09E6', '\u09E7', '\u09E8', '\u09E9', '\u09EA', '\u09EB', '\u09EC', '\u09ED', '\u09EE', '\u09EF'];

function bnDigits(value) {
  return String(value).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

function fmtNum(value, lang) {
  return lang === 'bn' ? bnDigits(value) : String(value);
}

function wordsByLevel(words, level) {
  if (!level || level === 'all') return words.slice();
  return words.filter((w) => w.level === level);
}

function shuffleCopy(arr, rand) {
  const r = rand || Math.random;
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function sample(arr, n, rand) {
  return shuffleCopy(arr, rand).slice(0, Math.min(n, arr.length));
}

/* Build a quiz: `count` questions. Each asks for the Bangla meaning of a word.
   Distractors are meanings of other words from the same level when possible,
   otherwise from the whole list. Options are shuffled. Returns null when the
   pool is too small to make a valid question (fewer than 4 words). */
function buildQuiz(words, level, count, rand) {
  const pool = wordsByLevel(words, level);
  if (pool.length < 4) return null;
  const picked = sample(pool, count || QUIZ_SIZE, rand);
  const questions = picked.map((word) => {
    const sameLevel = pool.filter((w) => w.id !== word.id);
    let distractPool = sameLevel.length >= 3 ? sameLevel : words.filter((w) => w.id !== word.id);
    const distractors = sample(distractPool, 3, rand).map((w) => w.bn);
    const options = shuffleCopy([word.bn].concat(distractors), rand);
    return { wordId: word.id, en: word.en, pos: word.pos, answer: word.bn, options };
  });
  return { questions, total: questions.length };
}

function gradeQuiz(quiz, answers) {
  let correct = 0;
  const review = quiz.questions.map((q, i) => {
    const given = answers[i] === undefined ? null : answers[i];
    const ok = given === q.answer;
    if (ok) correct++;
    return { wordId: q.wordId, en: q.en, answer: q.answer, given, ok };
  });
  return { correct, total: quiz.questions.length, pct: quiz.questions.length ? Math.round((correct / quiz.questions.length) * 100) : 0, review };
}

function bestStreak(review) {
  let best = 0, cur = 0;
  review.forEach((r) => { cur = r.ok ? cur + 1 : 0; if (cur > best) best = cur; });
  return best;
}

function filterWords(words, opts) {
  const o = opts || {};
  const q = (o.q || '').trim().toLowerCase();
  const known = o.known || [];
  const bookmarks = o.bookmarks || [];
  return words.filter((w) => {
    if (o.level && o.level !== 'all' && w.level !== o.level) return false;
    if (o.tab === 'known' && known.indexOf(w.id) === -1) return false;
    if (o.tab === 'unknown' && known.indexOf(w.id) !== -1) return false;
    if (o.tab === 'bookmarked' && bookmarks.indexOf(w.id) === -1) return false;
    if (q) {
      const hay = (w.en + ' ' + w.bn + ' ' + w.pos).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  });
}

function toggleId(list, id) {
  const arr = (list || []).slice();
  const i = arr.indexOf(id);
  if (i === -1) arr.push(id); else arr.splice(i, 1);
  return arr;
}

function computeStats(words, known, bookmarks, bestScore, rounds) {
  const total = words.length;
  const knownCount = (known || []).filter((id) => words.some((w) => w.id === id)).length;
  const bmCount = (bookmarks || []).filter((id) => words.some((w) => w.id === id)).length;
  return {
    total,
    known: knownCount,
    knownPct: total ? Math.round((knownCount / total) * 100) : 0,
    bookmarked: bmCount,
    bestScore: bestScore || 0,
    rounds: rounds || 0,
  };
}

function validateBackup(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  if (obj.app !== 'vocabulary-bd' || obj.version !== 1) return false;
  if (!Array.isArray(obj.known) || !Array.isArray(obj.bookmarks)) return false;
  if (typeof obj.bestScore !== 'number' || typeof obj.rounds !== 'number') return false;
  if (obj.known.some((x) => typeof x !== 'number') || obj.bookmarks.some((x) => typeof x !== 'number')) return false;
  if (obj.bestScore < 0 || obj.bestScore > 100 || obj.rounds < 0) return false;
  return true;
}

function makeBackup(known, bookmarks, bestScore, rounds) {
  return { app: 'vocabulary-bd', version: 1, known: known || [], bookmarks: bookmarks || [], bestScore: bestScore || 0, rounds: rounds || 0 };
}

const CORE_API = {
  QUIZ_SIZE,
  bnDigits,
  fmtNum,
  wordsByLevel,
  shuffleCopy,
  sample,
  buildQuiz,
  gradeQuiz,
  bestStreak,
  filterWords,
  toggleId,
  computeStats,
  validateBackup,
  makeBackup,
};

if (typeof module !== 'undefined' && module.exports) module.exports = CORE_API;
if (typeof window !== 'undefined') window.VOCAB_CORE = CORE_API;

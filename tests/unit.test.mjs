/* Vocabulary BD - node unit tests. Run: node --test tests/unit.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Core = require('../js/core.js');
const DATA = require('../js/data.js');
const I18N = require('../js/i18n.js');

const WORDS = DATA.WORDS;

// deterministic pseudo-random for repeatable tests
function seededRand(seed) {
  let s = seed;
  return () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
}

test('data: 90 words, 30 per level, unique ids and English words', () => {
  assert.equal(WORDS.length, 90);
  for (const lvl of ['beginner', 'intermediate', 'advanced']) {
    assert.equal(WORDS.filter((w) => w.level === lvl).length, 30, lvl);
  }
  assert.equal(new Set(WORDS.map((w) => w.id)).size, 90);
  assert.equal(new Set(WORDS.map((w) => w.en)).size, 90);
  for (const w of WORDS) {
    assert.ok(w.en && w.pos && w.bn && w.ex && w.exBn, w.en);
    assert.ok(['noun', 'verb', 'adjective', 'adverb'].includes(w.pos), w.en + ' pos=' + w.pos);
    assert.ok(!/[?]/.test(w.bn) || w.bn.length > 1, w.en);
  }
});

test('data: no two words share the same Bangla meaning (quiz distractors stay distinct)', () => {
  const bns = WORDS.map((w) => w.bn);
  assert.equal(new Set(bns).size, 90);
});

test('i18n: 69 keys, EN/BN parity, every BN value non-empty', () => {
  assert.equal(Object.keys(I18N.STRINGS.en).length, 69);
  assert.deepEqual(Object.keys(I18N.STRINGS.bn).sort(), Object.keys(I18N.STRINGS.en).sort());
  for (const k of Object.keys(I18N.STRINGS.bn)) assert.ok(I18N.STRINGS.bn[k].length > 0, k);
  assert.equal(I18N.t('bn', 'quizTitle'), 'কুইজ — সঠিক বাংলা অর্থ বেছে নিন');
  assert.equal(I18N.t('en', 'quizTitle'), 'Quiz — pick the correct Bangla meaning');
  assert.equal(I18N.t('xx', 'quizTitle'), 'Quiz — pick the correct Bangla meaning'); // unknown lang falls back to EN
  assert.equal(I18N.t('bn', 'noSuchKey'), 'noSuchKey');
});

test('bnDigits: 0-9 map to Bengali digits', () => {
  assert.equal(Core.bnDigits(0), '০');
  assert.equal(Core.bnDigits(90), '৯০');
  assert.equal(Core.bnDigits('10/90'), '১০/৯০');
  assert.equal(Core.fmtNum(25, 'bn'), '২৫');
  assert.equal(Core.fmtNum(25, 'en'), '25');
});

test('wordsByLevel: all / beginner / advanced', () => {
  assert.equal(Core.wordsByLevel(WORDS, 'all').length, 90);
  assert.equal(Core.wordsByLevel(WORDS, 'beginner').length, 30);
  assert.equal(Core.wordsByLevel(WORDS, 'advanced').length, 30);
  assert.ok(Core.wordsByLevel(WORDS, 'intermediate').every((w) => w.level === 'intermediate'));
});

test('buildQuiz: 10 questions, 4 unique options each, answer present, deterministic with seed', () => {
  const q1 = Core.buildQuiz(WORDS, 'all', 10, seededRand(42));
  const q2 = Core.buildQuiz(WORDS, 'all', 10, seededRand(42));
  assert.deepEqual(q1, q2);
  assert.equal(q1.questions.length, 10);
  for (const q of q1.questions) {
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options).size, 4);
    assert.ok(q.options.includes(q.answer));
    const word = WORDS.find((w) => w.id === q.wordId);
    assert.equal(q.answer, word.bn);
    assert.equal(q.en, word.en);
  }
  assert.equal(new Set(q1.questions.map((q) => q.wordId)).size, 10);
});

test('buildQuiz: level pools stay within level; too-small pool returns null', () => {
  const q = Core.buildQuiz(WORDS, 'beginner', 10, seededRand(7));
  assert.equal(q.questions.length, 10);
  assert.ok(q.questions.every((qq) => WORDS.find((w) => w.id === qq.wordId).level === 'beginner'));
  assert.equal(Core.buildQuiz(WORDS.slice(0, 3), 'all', 10), null);
  assert.equal(Core.buildQuiz([], 'all', 10), null);
});

test('gradeQuiz: correct count, pct, review flags wrong answers with given value', () => {
  const quiz = Core.buildQuiz(WORDS, 'all', 10, seededRand(99));
  const answers = quiz.questions.map((q, i) => (i < 7 ? q.answer : '___wrong___'));
  const res = Core.gradeQuiz(quiz, answers);
  assert.equal(res.correct, 7);
  assert.equal(res.total, 10);
  assert.equal(res.pct, 70);
  assert.equal(res.review.length, 10);
  assert.ok(res.review[0].ok);
  assert.equal(res.review[7].ok, false);
  assert.equal(res.review[7].given, '___wrong___');
  assert.equal(res.review[7].answer, quiz.questions[7].answer);
  const empty = Core.gradeQuiz(quiz, []);
  assert.equal(empty.correct, 0);
  assert.equal(empty.pct, 0);
});

test('bestStreak: longest run of correct answers', () => {
  assert.equal(Core.bestStreak([{ ok: true }, { ok: true }, { ok: false }, { ok: true }]), 2);
  assert.equal(Core.bestStreak([{ ok: false }, { ok: true }, { ok: true }, { ok: true }]), 3);
  assert.equal(Core.bestStreak([]), 0);
});

test('filterWords: level + tab + query (EN and BN)', () => {
  assert.equal(Core.filterWords(WORDS, { level: 'all', tab: 'all' }).length, 90);
  assert.equal(Core.filterWords(WORDS, { level: 'advanced', tab: 'all' }).length, 30);
  const known = [1, 2, 3];
  assert.equal(Core.filterWords(WORDS, { tab: 'known', known }).length, 3);
  assert.equal(Core.filterWords(WORDS, { tab: 'unknown', known }).length, 87);
  assert.equal(Core.filterWords(WORDS, { tab: 'bookmarked', bookmarks: [5] }).length, 1);
  assert.equal(Core.filterWords(WORDS, { q: 'abandon' }).length, 1);
  assert.equal(Core.filterWords(WORDS, { q: 'পরিত্যাগ' }).length, 1);
  assert.equal(Core.filterWords(WORDS, { q: 'zzzz' }).length, 0);
  assert.equal(Core.filterWords(WORDS, { q: 'ABANDON' }).length, 1); // case-insensitive
});

test('toggleId: adds then removes', () => {
  assert.deepEqual(Core.toggleId([], 5), [5]);
  assert.deepEqual(Core.toggleId([5], 5), []);
  assert.deepEqual(Core.toggleId([5, 9], 3), [5, 9, 3]);
});

test('computeStats: known pct, ignores unknown ids', () => {
  const s = Core.computeStats(WORDS, [1, 2, 9999], [3], 80, 4);
  assert.equal(s.total, 90);
  assert.equal(s.known, 2);
  assert.equal(s.knownPct, 2); // 2/90 = 2.22 -> 2
  assert.equal(s.bookmarked, 1);
  assert.equal(s.bestScore, 80);
  assert.equal(s.rounds, 4);
  const empty = Core.computeStats(WORDS, [], [], 0, 0);
  assert.equal(empty.knownPct, 0);
});

test('validateBackup / makeBackup: round-trip and rejections', () => {
  const b = Core.makeBackup([1, 2], [3], 70, 2);
  assert.equal(Core.validateBackup(b), true);
  assert.equal(Core.validateBackup({ ...b, app: 'other' }), false);
  assert.equal(Core.validateBackup({ ...b, version: 2 }), false);
  assert.equal(Core.validateBackup({ ...b, known: ['1'] }), false);
  assert.equal(Core.validateBackup({ ...b, bestScore: 101 }), false);
  assert.equal(Core.validateBackup({ ...b, rounds: -1 }), false);
  assert.equal(Core.validateBackup(null), false);
  assert.equal(Core.validateBackup('x'), false);
  assert.equal(Core.validateBackup([]), false);
});

test('shuffleCopy: does not mutate input, keeps all elements', () => {
  const arr = [1, 2, 3, 4, 5];
  const out = Core.shuffleCopy(arr, seededRand(3));
  assert.deepEqual(arr, [1, 2, 3, 4, 5]);
  assert.deepEqual(out.slice().sort(), [1, 2, 3, 4, 5]);
});

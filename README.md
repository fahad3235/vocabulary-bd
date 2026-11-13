# Vocabulary BD

Learn English words with Bangla meanings — flashcards, quizzes and progress
tracking, fully offline. Built for Bangladeshi learners (students, job-exam
and admission candidates) who need everyday and exam-useful English
vocabulary with clear, short Bangla glosses.

## Features

- **Flashcards** — flip cards with the English word, part of speech, Bangla
  meaning, and an English example sentence with its Bangla translation.
  Previous / Next / Shuffle, and filter the deck by level.
- **Quiz** — 10-question rounds: pick the correct Bangla meaning from 4
  options. Instant feedback, final score, best streak, and a full answer
  review. Playable per level or across all levels.
- **Browse** — searchable word list (English or Bangla), filter by level,
  by Known / Learning / Bookmarked. Tap a word to expand its meaning.
- **Progress** — mark words Known, bookmark words to revise, track words
  known, best quiz score, quizzes played, and overall progress. Everything
  persists in `localStorage` on your device.
- **Bilingual UI** — full English / বাংলা toggle, with Bengali digits in
  Bangla mode. Works with zero network requests.

## Word list

90 hand-picked words, 30 per level:

| Level | Words |
| --- | --- |
| Beginner | abandon, able, absent, accept, achieve, active, advice, afraid, agree, allow, almost, alone, amount, ancient, angry, animal, answer, appear, arrive, ask, asleep, attend, available, avoid, awake, balance, basic, battle, beach, beautiful |
| Intermediate | ability, accurate, admire, admit, adopt, advance, advantage, adventure, affect, afford, agency, aim, announce, annual, anxious, apology, apparent, appreciate, approach, argue, arrange, article, ashamed, assist, assume, atmosphere, attempt, attention, attitude, attract |
| Advanced | ambiguous, anticipate, arbitrary, articulate, assess, authentic, benevolent, brevity, candid, coherent, compassionate, consensus, contemporary, crucial, cynical, diligent, diminish, discreet, elaborate, eloquent, empathy, endeavour, enormous, essential, evaluate, evidence, evolve, exaggerate, existence, facilitate |

Meanings are short dictionary-style glosses written for learners, not exam
answers. No word shares a Bangla meaning with another word, so quiz options
are always distinct.

## Stack

- Plain HTML + CSS + JavaScript, no framework, no build step, no network.
- `js/data.js` — the 90-word list (Bengali stored as `\uXXXX` escapes so
  sources stay pure ASCII).
- `js/core.js` — pure logic: quiz building, grading, filtering, stats,
  backup validation (shared by the app and the Node tests).
- `js/i18n.js` — English / Bangla UI strings (69 keys, parity-checked).
- `js/app.js` — DOM wiring and `localStorage` state.
- `gen.py` — regenerates `js/data.js` and `js/i18n.js` from the UTF-8
  source lists (run `python3 gen.py` after editing the word list).

## Prerequisites

Any modern browser. For tests: Node.js 18+ and a Chromium
`headless_shell` binary (the smoke test uses the Playwright cache at
`~/.cache/ms-playwright/chromium_headless_shell-1187/`).

## Install & run

```bash
# just open it — no install, no server needed
open index.html
# or serve locally
python3 -m http.server 8000
```

## Testing

```bash
node --test tests/unit.test.mjs   # 14/14 pass
node tests/smoke.mjs 1280         # 51/51 pass (headless Chrome, file://)
node tests/smoke.mjs 390          # 51/51 pass (mobile width)
```

Unit tests cover the word list (counts, uniqueness, distinct meanings),
i18n parity, Bengali digits, quiz building/grading (including a seeded
deterministic run), filtering, stats, and backup validation. Smoke tests
drive the real app in headless Chrome: flip, next, mark-known, bookmark,
level filter, a full 10/10 quiz, a wrong-answer check, search and filters,
language toggle with Bengali digits, stats, reload persistence, and zero
console errors / zero non-file network requests.

## Data export / import

Progress tab → **Export progress** downloads a JSON backup
(`vocabulary-bd-backup.json`); **Import progress** restores it (strict
validation — anything that is not a Vocabulary BD v1 backup is rejected).
**Erase all progress** asks for confirmation first.

## Deployment

Static site — deploy `index.html`, `styles.css` and `js/` anywhere
(GitHub Pages, Netlify, any static host). No server, no environment
variables, no secrets.

## Limitations

- The 90-word list is a starter set; it does not cover the full vocabulary
  of any exam syllabus.
- Bangla glosses are single short meanings; many English words have several
  senses, and only the most common one is shown.
- Quiz distractors are drawn from the same level's words, so a distractor
  can occasionally be a near-synonym of the answer in meaning (the exact
  strings are always distinct).
- Progress lives in one browser's `localStorage`; clearing browser data
  erases it unless you exported a backup.

## Status

Complete MVP — all features above are implemented and tested
(see `TEST_RESULTS.md`).

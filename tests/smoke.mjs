/* Vocabulary BD - headless-Chrome smoke tests via raw CDP (no deps).
   Run: node tests/smoke.mjs [width]   (default 1280; pass 390 for mobile)
   Uses the Playwright-cached headless_shell. Serves the app over file:// */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SHELL = path.join(process.env.HOME, '.cache/ms-playwright/chromium_headless_shell-1187/chrome-linux/headless_shell');
const WIDTH = parseInt(process.argv[2] || '1280', 10);
const HEIGHT = 900;
const PORT = 9335;

let failures = [];
let checks = 0;
function check(name, cond, extra = '') {
  checks++;
  if (cond) console.log('  PASS ' + name);
  else { failures.push(name + (extra ? ' — ' + extra : '')); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

const chrome = spawn(SHELL, [
  '--headless=new', '--no-sandbox', '--disable-gpu',
  `--remote-debugging-port=${PORT}`, `--window-size=${WIDTH},${HEIGHT}`,
  'about:blank'
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getWsUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      const j = await res.json();
      return j.webSocketDebuggerUrl;
    } catch { await sleep(250); }
  }
  throw new Error('CDP did not start');
}

async function main() {
  const browserWs = new WebSocket(await getWsUrl());
  await new Promise((res, rej) => { browserWs.onopen = res; browserWs.onerror = rej; });
  let msgId = 0;
  const pending = new Map();
  const events = [];
  browserWs.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    else if (m.method) events.push(m);
  };
  const send = (method, params = {}) => new Promise((res) => {
    const id = ++msgId;
    pending.set(id, res);
    browserWs.send(JSON.stringify({ id, method, params }));
  });

  const target = await send('Target.createTarget', { url: 'about:blank' });
  const targetId = target.result.targetId;
  const attached = await send('Target.attachToTarget', { targetId, flatten: true });
  const sessionId = attached.result.sessionId;
  const sendS = (method, params = {}) => new Promise((res) => {
    const id = ++msgId;
    pending.set(id, res);
    browserWs.send(JSON.stringify({ id, sessionId, method, params }));
  });

  await sendS('Runtime.enable');
  await sendS('Page.enable');
  await sendS('Network.enable');
  await sendS('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: WIDTH <= 500 });

  const consoleErrors = [];
  const pageErrors = [];
  const extRequests = [];
  const origOnMessage = browserWs.onmessage;
  browserWs.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.sessionId === sessionId && m.method === 'Runtime.exceptionThrown') {
      pageErrors.push(m.params.exceptionDetails.text + ' ' + (m.params.exceptionDetails.exception?.description || ''));
    }
    if (m.sessionId === sessionId && m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      consoleErrors.push(m.params.args.map((a) => a.value || a.description || '').join(' '));
    }
    if (m.sessionId === sessionId && m.method === 'Network.requestWillBeSent') {
      const url = m.params.request.url;
      if (!url.startsWith('file://') && !url.startsWith('data:') && !url.startsWith('blob:') && !url.startsWith('chrome')) {
        extRequests.push(url);
      }
    }
    origOnMessage(ev);
  };

  const evalJs = async (expr) => {
    const r = await sendS('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) throw new Error('eval failed: ' + JSON.stringify(r.result.exceptionDetails));
    return r.result?.result?.value;
  };

  const fileUrl = 'file://' + path.join(ROOT, 'index.html');
  await sendS('Page.navigate', { url: fileUrl });
  await sleep(1200);

  console.log(`== smoke @ ${WIDTH}px ==`);

  check('page title', (await evalJs('document.title')).includes('Vocabulary BD'));
  check('h1 renders', (await evalJs(`document.querySelector('h1').textContent`)) === 'Vocabulary BD');
  check('4 tabs present', (await evalJs(`document.querySelectorAll('.tab').length`)) === 4);
  check('flashcard shows a word', (await evalJs(`document.getElementById('fcWord').textContent.length`)) > 1,
    await evalJs(`document.getElementById('fcWord').textContent`));
  check('card counter 1 / 90', (await evalJs(`document.getElementById('fcCount').textContent`)).includes('1 / 90'),
    await evalJs(`document.getElementById('fcCount').textContent`));
  check('no horizontal overflow (learn)', (await evalJs('document.documentElement.scrollWidth')) <= WIDTH + 1,
    'scrollWidth=' + (await evalJs('document.documentElement.scrollWidth')));

  // --- flip card: back shows Bangla meaning ---
  const firstWord = await evalJs(`document.getElementById('fcWord').textContent`);
  await evalJs(`document.getElementById('flashcard').click()`);
  await sleep(200);
  check('flip reveals Bangla meaning', (await evalJs(`document.getElementById('fcBn').textContent.length`)) > 1,
    await evalJs(`document.getElementById('fcBn').textContent`));
  check('flip reveals example', (await evalJs(`document.getElementById('fcEx').textContent.length`)) > 3);
  check('meaning matches data for shown word', await evalJs(`(function(){
    const w = window.VOCAB_DATA.WORDS.find(x => x.en === ${JSON.stringify(firstWord)});
    return document.getElementById('fcBn').textContent === w.bn;
  })()`));

  // --- next card changes word; mark known persists ---
  await evalJs(`document.getElementById('fcNext').click()`);
  await sleep(200);
  const secondWord = await evalJs(`document.getElementById('fcWord').textContent`);
  check('next shows a different word', secondWord !== firstWord, secondWord + ' vs ' + firstWord);
  await evalJs(`document.getElementById('fcKnownBtn').click()`);
  await sleep(150);
  check('mark-known persists to localStorage', (await evalJs(`JSON.parse(localStorage.getItem('vocabulary-bd-v1')).known.length`)) === 1);
  check('known badge appears', (await evalJs(`document.getElementById('fcKnown').classList.contains('hidden')`)) === false);
  await evalJs(`document.getElementById('fcBookmarkBtn').click()`);
  await sleep(150);
  check('bookmark persists', (await evalJs(`JSON.parse(localStorage.getItem('vocabulary-bd-v1')).bookmarks.length`)) === 1);

  // --- level filter: beginner deck is 30 cards ---
  await evalJs(`(function(){ const s = document.getElementById('learnLevel'); s.value = 'beginner'; s.dispatchEvent(new Event('change')); })()`);
  await sleep(200);
  check('beginner deck counter is 1 / 30', (await evalJs(`document.getElementById('fcCount').textContent`)).includes('1 / 30'),
    await evalJs(`document.getElementById('fcCount').textContent`));

  // --- quiz: start, answer all 10, finish with score ---
  await evalJs(`document.querySelector('[data-tab="quiz"]').click()`);
  await sleep(200);
  await evalJs(`document.getElementById('quizStartBtn').click()`);
  await sleep(250);
  check('quiz shows question 1 / 10', (await evalJs(`document.getElementById('quizProgress').textContent`)).includes('1 / 10'),
    await evalJs(`document.getElementById('quizProgress').textContent`));
  check('quiz shows 4 options', (await evalJs(`document.querySelectorAll('#quizOptions .opt').length`)) === 4);
  // answer every question by clicking the correct option (found via data), then verify score 10/10
  for (let i = 0; i < 10; i++) {
    await evalJs(`(function(){
      const btns = document.querySelectorAll('#quizOptions .opt');
      const correct = window.VOCAB_DATA.WORDS.find(w => w.en === document.getElementById('quizWord').textContent).bn;
      for (const b of btns) if (b.textContent === correct) { b.click(); break; }
    })()`);
    await sleep(150);
    check('feedback says Correct on Q' + (i + 1), (await evalJs(`document.getElementById('quizFeedback').textContent`)).includes('Correct'));
    await evalJs(`document.getElementById('quizNextBtn').click()`);
    await sleep(150);
  }
  check('result panel shows', (await evalJs(`document.getElementById('quizResult').classList.contains('hidden')`)) === false);
  check('perfect score 10 / 10 (100%)', (await evalJs(`document.getElementById('quizFinalScore').textContent`)).includes('10 / 10'),
    await evalJs(`document.getElementById('quizFinalScore').textContent`));
  check('best streak is 10', (await evalJs(`document.getElementById('quizFinalStreak').textContent`)) === '10');
  check('review lists 10 rows', (await evalJs(`document.querySelectorAll('#quizReview .review-row').length`)) === 10);
  check('best score saved 100', (await evalJs(`JSON.parse(localStorage.getItem('vocabulary-bd-v1')).bestScore`)) === 100);
  check('rounds saved 1', (await evalJs(`JSON.parse(localStorage.getItem('vocabulary-bd-v1')).rounds`)) === 1);

  // --- quiz wrong answer: feedback names the correct meaning ---
  await evalJs(`document.getElementById('quizAgainBtn').click()`);
  await sleep(200);
  await evalJs(`document.getElementById('quizStartBtn').click()`);
  await sleep(200);
  await evalJs(`(function(){
    const btns = document.querySelectorAll('#quizOptions .opt');
    const correct = window.VOCAB_DATA.WORDS.find(w => w.en === document.getElementById('quizWord').textContent).bn;
    for (const b of btns) if (b.textContent !== correct) { b.click(); break; }
  })()`);
  await sleep(150);
  check('wrong answer feedback shows correct meaning', (await evalJs(`document.getElementById('quizFeedback').textContent`)).includes('Wrong'),
    await evalJs(`document.getElementById('quizFeedback').textContent`));

  // --- browse: search, filters, expand ---
  await evalJs(`document.querySelector('[data-tab="browse"]').click()`);
  await sleep(200);
  check('browse lists 90 words', (await evalJs(`document.querySelectorAll('#browseList .word-row').length`)) === 90);
  await evalJs(`(function(){ const s = document.getElementById('browseSearch'); s.value = 'abandon'; s.dispatchEvent(new Event('input')); })()`);
  await sleep(200);
  check('search "abandon" narrows to 1', (await evalJs(`document.querySelectorAll('#browseList .word-row').length`)) === 1);
  check('search result shows Bangla on expand', await evalJs(`(function(){
    document.querySelector('#browseList .word-row .w-head').click();
    return document.querySelector('#browseList .word-row .w-bn').textContent.length > 1;
  })()`));
  await evalJs(`(function(){ const s = document.getElementById('browseSearch'); s.value = 'zzzz'; s.dispatchEvent(new Event('input')); })()`);
  await sleep(200);
  check('no-match shows empty state', (await evalJs(`document.getElementById('browseEmpty').classList.contains('hidden')`)) === false);
  await evalJs(`(function(){ const s = document.getElementById('browseSearch'); s.value = ''; s.dispatchEvent(new Event('input')); document.querySelector('[data-filter="known"]').click(); })()`);
  await sleep(200);
  check('Known filter shows the 1 known word', (await evalJs(`document.querySelectorAll('#browseList .word-row').length`)) === 1);
  await evalJs(`document.querySelector('[data-filter="bookmarked"]').click()`);
  await sleep(200);
  check('Bookmarked filter shows the 1 bookmark', (await evalJs(`document.querySelectorAll('#browseList .word-row').length`)) === 1);

  // --- language toggle: BN title + Bengali digits ---
  await evalJs(`document.getElementById('langBtn').click()`);
  await sleep(250);
  check('BN toggle changes title', (await evalJs(`document.querySelector('h1').textContent`)) === 'ভোকাবুলারি বিডি',
    await evalJs(`document.querySelector('h1').textContent`));
  check('BN digits appear in card counter', /[০-৯]/.test(await evalJs(`document.getElementById('fcCount').textContent`)),
    await evalJs(`document.getElementById('fcCount').textContent`));
  check('lang persists in localStorage', (await evalJs(`JSON.parse(localStorage.getItem('vocabulary-bd-v1')).lang`)) === 'bn');
  await evalJs(`document.getElementById('langBtn').click()`);
  await sleep(200);
  check('toggle back to English', (await evalJs(`document.querySelector('h1').textContent`)) === 'Vocabulary BD');

  // --- stats tab + reload persistence ---
  await evalJs(`document.querySelector('[data-tab="stats"]').click()`);
  await sleep(200);
  check('stats known shows 1 / 90', (await evalJs(`document.getElementById('statKnown').textContent`)).includes('1 / 90'),
    await evalJs(`document.getElementById('statKnown').textContent`));
  check('stats best shows 100%', (await evalJs(`document.getElementById('statBest').textContent`)) === '100%');
  check('progress bar width > 0', (await evalJs(`document.getElementById('progressBar').style.width`)) !== '0%');
  await sendS('Page.navigate', { url: fileUrl });
  await sleep(1000);
  check('known word survives reload', (await evalJs(`JSON.parse(localStorage.getItem('vocabulary-bd-v1')).known.length`)) === 1);
  check('no horizontal overflow after reload', (await evalJs('document.documentElement.scrollWidth')) <= WIDTH + 1);

  // --- error / network hygiene ---
  check('zero console errors', consoleErrors.length === 0, consoleErrors.join(' | '));
  check('zero page exceptions', pageErrors.length === 0, pageErrors.join(' | '));
  check('zero non-file network requests', extRequests.length === 0, extRequests.join(', '));

  console.log(`\n${checks - failures.length}/${checks} checks passed${failures.length ? ', FAILURES:\n- ' + failures.join('\n- ') : ''}`);

  browserWs.close();
  chrome.kill();
  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => { console.error('SMOKE CRASH:', e); chrome.kill(); process.exit(1); });

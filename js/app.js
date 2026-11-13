/* Vocabulary BD - UI. Plain JS, no framework, no network.
   State in localStorage under KEY. */
(function () {
  'use strict';
  var KEY = 'vocabulary-bd-v1';
  var Core = window.VOCAB_CORE;
  var DATA = window.VOCAB_DATA;
  var I18N = window.VOCAB_I18N;
  var WORDS = DATA.WORDS;

  var state = loadState();
  var learn = { level: 'all', order: [], idx: 0, flipped: false };
  var quiz = { data: null, idx: 0, answers: [], locked: false };
  var browse = { q: '', level: 'all', tab: 'all' };

  function loadState() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var p = JSON.parse(raw);
        if (p && Array.isArray(p.known) && Array.isArray(p.bookmarks)) {
          return {
            known: p.known.filter(function (x) { return typeof x === 'number'; }),
            bookmarks: p.bookmarks.filter(function (x) { return typeof x === 'number'; }),
            bestScore: typeof p.bestScore === 'number' ? p.bestScore : 0,
            rounds: typeof p.rounds === 'number' ? p.rounds : 0,
            lang: p.lang === 'bn' ? 'bn' : 'en',
          };
        }
      }
    } catch (e) { /* corrupted state -> fresh start */ }
    return { known: [], bookmarks: [], bestScore: 0, rounds: 0, lang: 'en' };
  }

  function saveState() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage full/blocked */ }
  }

  function $(id) { return document.getElementById(id); }
  function t(key) { return I18N.t(state.lang, key); }
  function n(value) { return Core.fmtNum(value, state.lang); }
  function posLabel(pos) {
    return t('pos' + pos.charAt(0).toUpperCase() + pos.slice(1));
  }
  function levelLabel(level) {
    return t('level' + level.charAt(0).toUpperCase() + level.slice(1));
  }

  function applyI18n() {
    document.documentElement.lang = state.lang === 'bn' ? 'bn' : 'en';
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) els[i].textContent = t(els[i].getAttribute('data-i18n'));
    var phs = document.querySelectorAll('[data-i18n-ph]');
    for (var j = 0; j < phs.length; j++) phs[j].setAttribute('placeholder', t(phs[j].getAttribute('data-i18n-ph')));
    $('langBtn').textContent = t('langToggle');
  }

  /* ---------- tabs ---------- */
  var tabs = document.querySelectorAll('.tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { showTab(tab.getAttribute('data-tab')); });
  });
  function showTab(name) {
    tabs.forEach(function (tb) { tb.classList.toggle('active', tb.getAttribute('data-tab') === name); });
    ['learn', 'quiz', 'browse', 'stats'].forEach(function (p) {
      $('panel-' + p).classList.toggle('hidden', p !== name);
    });
    if (name === 'browse') renderBrowse();
    if (name === 'stats') renderStats();
    if (name === 'quiz') renderQuizSetup();
  }

  $('langBtn').addEventListener('click', function () {
    state.lang = state.lang === 'bn' ? 'en' : 'bn';
    saveState();
    applyI18n();
    renderLearn(); renderBrowse(); renderStats(); renderQuizSetup();
    if (quiz.data) renderQuizQuestion();
  });

  /* ---------- learn ---------- */
  function resetDeck() {
    var pool = Core.wordsByLevel(WORDS, learn.level);
    learn.order = Core.shuffleCopy(pool.map(function (w) { return w.id; }));
    learn.idx = 0;
    learn.flipped = false;
  }
  function currentWord() {
    var id = learn.order[learn.idx];
    return WORDS.filter(function (w) { return w.id === id; })[0];
  }
  function renderLearn() {
    if (!learn.order.length) resetDeck();
    var w = currentWord();
    if (!w) return;
    $('fcLevel').textContent = levelLabel(w.level);
    $('fcKnown').classList.toggle('hidden', state.known.indexOf(w.id) === -1);
    $('fcWord').textContent = w.en;
    $('fcPos').textContent = posLabel(w.pos);
    $('fcBn').textContent = w.bn;
    $('fcEx').textContent = w.ex;
    $('fcExBn').textContent = w.exBn;
    $('fcFront').classList.toggle('hidden', learn.flipped);
    $('fcBack').classList.toggle('hidden', !learn.flipped);
    $('fcCount').textContent = t('cardOf') + ' ' + n(learn.idx + 1) + ' / ' + n(learn.order.length);
    $('fcKnownBtn').textContent = state.known.indexOf(w.id) !== -1 ? t('btnMarkUnknown') : t('btnMarkKnown');
    $('fcBookmarkBtn').textContent = state.bookmarks.indexOf(w.id) !== -1 ? t('btnBookmarked') : t('btnBookmark');
  }
  function flip() { learn.flipped = !learn.flipped; renderLearn(); }
  $('flashcard').addEventListener('click', flip);
  $('flashcard').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
  });
  $('fcPrev').addEventListener('click', function () {
    learn.idx = (learn.idx - 1 + learn.order.length) % learn.order.length;
    learn.flipped = false; renderLearn();
  });
  $('fcNext').addEventListener('click', function () {
    learn.idx = (learn.idx + 1) % learn.order.length;
    learn.flipped = false; renderLearn();
  });
  $('fcShuffle').addEventListener('click', function () { resetDeck(); renderLearn(); });
  $('learnLevel').addEventListener('change', function (e) {
    learn.level = e.target.value; resetDeck(); renderLearn();
  });
  $('fcKnownBtn').addEventListener('click', function () {
    var w = currentWord();
    state.known = Core.toggleId(state.known, w.id);
    saveState(); renderLearn();
  });
  $('fcBookmarkBtn').addEventListener('click', function () {
    var w = currentWord();
    state.bookmarks = Core.toggleId(state.bookmarks, w.id);
    saveState(); renderLearn();
  });

  /* ---------- quiz ---------- */
  function renderQuizSetup() {
    $('quizBestLabel').textContent = n(state.bestScore) + '%';
    $('quizRoundsLabel').textContent = n(state.rounds);
    $('quizSetup').classList.remove('hidden');
    $('quizPlay').classList.add('hidden');
    $('quizResult').classList.add('hidden');
  }
  $('quizStartBtn').addEventListener('click', function () {
    var level = $('quizLevel').value;
    var q = Core.buildQuiz(WORDS, level, Core.QUIZ_SIZE);
    $('quizEmpty').classList.toggle('hidden', !!q);
    if (!q) return;
    quiz.data = q; quiz.idx = 0; quiz.answers = []; quiz.locked = false;
    $('quizSetup').classList.add('hidden');
    $('quizPlay').classList.remove('hidden');
    $('quizResult').classList.add('hidden');
    renderQuizQuestion();
  });
  function renderQuizQuestion() {
    var q = quiz.data.questions[quiz.idx];
    quiz.locked = false;
    $('quizProgress').textContent = t('quizOf') + ' ' + n(quiz.idx + 1) + ' / ' + n(quiz.data.total);
    $('quizScoreLive').textContent = t('quizScore') + ': ' + n(quiz.answers.filter(function (a, i) { return a === quiz.data.questions[i].answer; }).length);
    $('quizWord').textContent = q.en;
    $('quizPos').textContent = posLabel(q.pos);
    $('quizFeedback').textContent = '';
    $('quizFeedback').className = 'feedback';
    $('quizNextBtn').classList.add('hidden');
    $('quizNextBtn').textContent = quiz.idx === quiz.data.total - 1 ? t('seeResults') : t('nextQ');
    var box = $('quizOptions');
    box.innerHTML = '';
    q.options.forEach(function (opt) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt';
      b.textContent = opt;
      b.addEventListener('click', function () { answerOption(b, opt); });
      box.appendChild(b);
    });
  }
  function answerOption(btn, opt) {
    if (quiz.locked) return;
    quiz.locked = true;
    var q = quiz.data.questions[quiz.idx];
    quiz.answers[quiz.idx] = opt;
    var ok = opt === q.answer;
    var fb = $('quizFeedback');
    fb.textContent = ok ? t('quizCorrect') : t('quizWrong') + ' ' + q.answer;
    fb.className = 'feedback ' + (ok ? 'good' : 'bad');
    var btns = document.querySelectorAll('#quizOptions .opt');
    btns.forEach(function (b) {
      b.disabled = true;
      if (b.textContent === q.answer) b.classList.add('correct');
      else if (b === btn) b.classList.add('wrong');
    });
    $('quizScoreLive').textContent = t('quizScore') + ': ' + n(quiz.answers.filter(function (a, i) { return a === quiz.data.questions[i].answer; }).length);
    $('quizNextBtn').classList.remove('hidden');
  }
  $('quizNextBtn').addEventListener('click', function () {
    if (quiz.idx < quiz.data.total - 1) { quiz.idx++; renderQuizQuestion(); }
    else finishQuiz();
  });
  function finishQuiz() {
    var res = Core.gradeQuiz(quiz.data, quiz.answers);
    state.rounds++;
    if (res.pct > state.bestScore) state.bestScore = res.pct;
    saveState();
    $('quizPlay').classList.add('hidden');
    $('quizResult').classList.remove('hidden');
    $('quizFinalScore').textContent = n(res.correct) + ' / ' + n(res.total) + ' (' + n(res.pct) + '%)';
    $('quizFinalStreak').textContent = n(Core.bestStreak(res.review));
    var box = $('quizReview');
    box.innerHTML = '';
    res.review.forEach(function (r) {
      var div = document.createElement('div');
      div.className = 'review-row';
      var mark = document.createElement('span');
      mark.className = r.ok ? 'ok' : 'no';
      mark.textContent = r.ok ? '✓ ' : '✗ ';
      div.appendChild(mark);
      div.appendChild(document.createTextNode(r.en + ' — ' + t('correctAnswer') + ': ' + r.answer +
        (r.given && !r.ok ? ' · ' + t('yourAnswer') + ': ' + r.given : '')));
      box.appendChild(div);
    });
  }
  $('quizAgainBtn').addEventListener('click', renderQuizSetup);

  /* ---------- browse ---------- */
  $('browseSearch').addEventListener('input', function (e) { browse.q = e.target.value; renderBrowse(); });
  $('browseLevel').addEventListener('change', function (e) { browse.level = e.target.value; renderBrowse(); });
  document.querySelectorAll('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      browse.tab = chip.getAttribute('data-filter');
      document.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('active', c === chip); });
      renderBrowse();
    });
  });
  function renderBrowse() {
    var list = Core.filterWords(WORDS, { q: browse.q, level: browse.level, tab: browse.tab, known: state.known, bookmarks: state.bookmarks });
    $('browseCount').textContent = n(list.length) + ' ' + t('wordsCount');
    $('browseEmpty').classList.toggle('hidden', list.length > 0);
    var box = $('browseList');
    box.innerHTML = '';
    list.forEach(function (w) {
      var row = document.createElement('div');
      row.className = 'word-row';
      var head = document.createElement('div');
      head.className = 'w-head';
      var left = document.createElement('div');
      var en = document.createElement('span');
      en.className = 'w-en'; en.textContent = w.en;
      var meta = document.createElement('div');
      meta.className = 'w-meta'; meta.textContent = posLabel(w.pos) + ' · ' + levelLabel(w.level);
      left.appendChild(en); left.appendChild(meta);
      var btns = document.createElement('div');
      var knownBtn = document.createElement('button');
      knownBtn.type = 'button';
      knownBtn.className = 'mini' + (state.known.indexOf(w.id) !== -1 ? ' on' : '');
      knownBtn.textContent = '✓ ' + t('knownBadge');
      knownBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        state.known = Core.toggleId(state.known, w.id); saveState(); renderBrowse();
      });
      var bmBtn = document.createElement('button');
      bmBtn.type = 'button';
      bmBtn.className = 'mini' + (state.bookmarks.indexOf(w.id) !== -1 ? ' on' : '');
      bmBtn.textContent = '★';
      bmBtn.title = t('btnBookmark');
      bmBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        state.bookmarks = Core.toggleId(state.bookmarks, w.id); saveState(); renderBrowse();
      });
      btns.appendChild(knownBtn); btns.appendChild(bmBtn);
      head.appendChild(left); head.appendChild(btns);
      var detail = document.createElement('div');
      detail.className = 'hidden';
      var bn = document.createElement('div');
      bn.className = 'w-bn'; bn.textContent = w.bn;
      var ex = document.createElement('div');
      ex.className = 'w-ex'; ex.textContent = w.ex + ' — ' + w.exBn;
      detail.appendChild(bn); detail.appendChild(ex);
      head.addEventListener('click', function () { detail.classList.toggle('hidden'); });
      row.appendChild(head); row.appendChild(detail);
      box.appendChild(row);
    });
  }

  /* ---------- stats / data ---------- */
  function renderStats() {
    var s = Core.computeStats(WORDS, state.known, state.bookmarks, state.bestScore, state.rounds);
    $('statKnown').textContent = n(s.known) + ' / ' + n(s.total);
    $('statBookmarked').textContent = n(s.bookmarked);
    $('statBest').textContent = n(s.bestScore) + '%';
    $('statRounds').textContent = n(s.rounds);
    $('progressBar').style.width = s.knownPct + '%';
    $('progressLabel').textContent = t('statProgress') + ': ' + n(s.knownPct) + '% (' + n(s.known) + ' / ' + n(s.total) + ')';
  }
  $('exportBtn').addEventListener('click', function () {
    var blob = new Blob([JSON.stringify(Core.makeBackup(state.known, state.bookmarks, state.bestScore, state.rounds), null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vocabulary-bd-backup.json';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    $('dataMsg').textContent = t('exported');
  });
  $('importBtn').addEventListener('click', function () { $('importFile').click(); });
  $('importFile').addEventListener('change', function (e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var obj = JSON.parse(reader.result);
        if (!Core.validateBackup(obj)) throw new Error('invalid');
        state.known = obj.known; state.bookmarks = obj.bookmarks;
        state.bestScore = obj.bestScore; state.rounds = obj.rounds;
        saveState();
        $('dataMsg').textContent = t('importOk');
        renderBrowse(); renderStats(); renderLearn();
      } catch (err) { $('dataMsg').textContent = t('importBad'); }
      e.target.value = '';
    };
    reader.readAsText(file);
  });
  $('resetBtn').addEventListener('click', function () {
    if (!window.confirm(t('resetConfirm'))) return;
    state.known = []; state.bookmarks = []; state.bestScore = 0; state.rounds = 0;
    saveState();
    resetDeck(); renderLearn(); renderBrowse(); renderStats(); renderQuizSetup();
    $('dataMsg').textContent = '';
  });

  /* ---------- init ---------- */
  applyI18n();
  resetDeck();
  renderLearn();
  renderBrowse();
  renderStats();
  renderQuizSetup();
})();

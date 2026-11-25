(() => {
'use strict';

/* ---------- data ---------- */
const DOCS = window.TTCS_DOCS || [];
const QUIZ = window.TTCS_QUIZ || {};
const CMDS = (window.TTCS_CMDS || []).map(c => ({ c: c[0], d: c[1], l: c[2], p: c[3], k: c[4] || 'c', key: c[2] + '|' + c[0] }));
const THEORY = (window.TTCS_THEORY || []).map(t => ({ q: t[0], a: t[1], l: t[2], p: t[3], k: 't', key: 't|' + t[2] + '|' + t[0] }));
const byId = Object.fromEntries(DOCS.map(d => [d.id, d]));
const LECTURES = DOCS.filter(d => d.kind === 'lecture');
const INFO = DOCS.filter(d => d.kind !== 'lecture');
Object.keys(QUIZ).forEach(id => QUIZ[id].forEach((q, i) => { q.id = id + ':' + i; q.doc = id; }));
const ALLQ = LECTURES.flatMap(d => QUIZ[d.id] || []);
const KIND = { c: 'command', s: 'syntax', f: 'file', n: 'fact', t: 'theory' };
const NOTES = window.TTCS_NOTES || {};
const MIX_SIZE = 20;

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const app = $('#app');
const sIn = $('#q');

const store = {
  get(k, def) { try { const v = localStorage.getItem('ttcs.' + k); return v == null ? def : JSON.parse(v); } catch (e) { return def; } },
  set(k, v) { try { localStorage.setItem('ttcs.' + k, JSON.stringify(v)); } catch (e) { /* private mode: progress just isn't kept */ } }
};

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');
const pad = n => String(n).padStart(3, '0');
const img = (d, n) => `slides/${d.id}/${pad(n)}.png`;
const thumb = (d, n) => `thumbs/${d.id}/${pad(n)}.jpg`;
const pageTitle = (d, n) => { const t = d.pages[n - 1].t; return t.length > 70 ? `Page ${n}` : t; };
const docLabel = d => d.kind === 'lecture' ? `Lecture ${d.n}` : d.title;
const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
const typing = e => /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
const onControl = e => !!(e.target.closest && e.target.closest('button, a'));
// Browsers may refuse or rate-limit replaceState on file:// pages; callers fall back to location.hash.
const setUrl = h => { try { history.replaceState(null, '', h); return true; } catch (e) { return false; } };
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ---------- explanations and glossary ---------- */
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// A glossary term is looked for as a whole word; Unix names (kind n) are also not matched inside options or file names (-cd, hello.sh).
const GLOSS = (window.TTCS_GLOSS || []).map(g => {
  const names = g[0].split('|'), k = g[3] === 'n' ? 'n' : 'a';
  const before = k === 'n' ? '(?:^|[^A-Za-z0-9_.−–-])' : '(?:^|[^A-Za-z0-9])';
  const src = g[4] || names.map(t => (/^[A-Za-z0-9]/.test(t) ? before : '') + escRe(t) + (/[A-Za-z0-9]$/.test(t) ? '(?![A-Za-z0-9_])' : '')).join('|');
  return { t: names[0], full: g[1], d: g[2], k, re: new RegExp(src), low: (names.join(' ') + ' ' + g[1]).toLowerCase() };
});
const noteOf = (d, n) => (NOTES[d.id] || {})[n] || null;
const emph = (s, b, i) => s.replace(/\*\*([^*]+)\*\*/g, b).replace(/\*([^*\s][^*]*)\*/g, i);
const inline = s => s.split('`').map((part, i) => i % 2 ? `<code>${esc(part)}</code>` : emph(esc(part), '<strong>$1</strong>', '<em>$1</em>')).join('');
const notePlain = (d, n) => (noteOf(d, n) || []).map(l => l.startsWith('    ') ? l.trim() : l.replace(/^(- |! )/, '').split('`').map((part, i) => i % 2 ? part : emph(part, '$1', '$1')).join('')).join(' ');

// Note lines: "- " bullet, four spaces = code, "! " = remember box, anything else a paragraph.
function rich(lines) {
  let html = '', list = false, pre = null;
  const flush = () => {
    if (list) { html += '</ul>'; list = false; }
    if (pre) { html += `<pre>${pre.map(esc).join('\n')}</pre>`; pre = null; }
  };
  lines.forEach(l => {
    if (l.startsWith('    ')) { if (list) flush(); (pre || (pre = [])).push(l.slice(4)); return; }
    if (l.startsWith('- ')) { if (pre) flush(); if (!list) { html += '<ul>'; list = true; } html += `<li>${inline(l.slice(2))}</li>`; return; }
    flush();
    html += l.startsWith('! ') ? `<p class="keep"><b>Remember</b>${inline(l.slice(2))}</p>` : `<p>${inline(l)}</p>`;
  });
  flush();
  return html;
}

const glossCache = {};
function glossFor(d, n, withNote = true) {
  const key = d.id + ':' + n + (withNote ? '' : ':s');
  if (glossCache[key]) return glossCache[key];
  const p = d.pages[n - 1], text = p.t + ' ' + p.x + (withNote ? ' ' + notePlain(d, n) : '');
  const hits = [];
  GLOSS.forEach(g => { const m = g.re.exec(text); if (m) hits.push({ g, at: m.index }); });
  return glossCache[key] = hits.sort((a, b) => a.g.k === b.g.k ? a.at - b.at : a.g.k === 'a' ? -1 : 1).map(h => h.g);
}

let FIRST = null;   // glossary term -> first slide that uses it (lectures before the other documents)
function firstUse(g) {
  if (!FIRST) {
    FIRST = new Map();
    LECTURES.concat(INFO).forEach(d => d.pages.forEach((p, i) => glossFor(d, i + 1, false).forEach(x => { if (!FIRST.has(x)) FIRST.set(x, { d, n: i + 1 }); })));
  }
  return FIRST.get(g);
}

function markSeen(doc, n) {
  const seen = store.get('seen', {});
  const list = seen[doc.id] || (seen[doc.id] = []);
  if (!list.includes(n)) { list.push(n); store.set('seen', seen); }
  const pos = store.get('pos', {}); pos[doc.id] = n; store.set('pos', pos);
  store.set('last', { id: doc.id, n });
}

function recordAnswer(q, ok) {
  const wrong = store.get('wrong', {});
  if (ok) delete wrong[q.id]; else wrong[q.id] = 1;
  store.set('wrong', wrong);
}

function setNav(name) {
  $$('.nav a').forEach(a => a.dataset.nav === name ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
}

/* ---------- router ---------- */
let teardown = null;   // removes the current view's key handlers
let live = null;       // the open slide viewer, so slide-to-slide links don't rebuild it

function route() {
  const raw = location.hash.replace(/^#\/?/, '');
  const parts = raw.split('/');
  const name = parts[0];
  if (name === 'doc' && live && live.doc.id === parts[1]) return live.go(parseInt(parts[2], 10) || 1);
  if (teardown) { teardown(); teardown = null; }
  live = null;
  window.scrollTo(0, 0);
  if (name !== 'search' && document.activeElement !== sIn) sIn.value = '';
  if (name === 'doc' && byId[parts[1]]) return viewer(byId[parts[1]], parseInt(parts[2], 10) || 1);
  if (name === 'quiz') return parts[1] ? quizRun(parts[1]) : quizHub();
  if (name === 'cards') return cards();
  if (name === 'cheats') return cheats();
  if (name === 'glossary') return glossary();
  if (name === 'search') { let q = ''; try { q = decodeURIComponent(parts.slice(1).join('/')); } catch (e) { /* malformed escape */ } return search(q); }
  home();
}

/* ---------- home ---------- */
function home() {
  setNav('home');
  const seen = store.get('seen', {}), best = store.get('best', {}), pos = store.get('pos', {}), last = store.get('last', null);
  const wrongCount = Object.keys(store.get('wrong', {})).length;
  const totalSlides = LECTURES.reduce((s, d) => s + d.pages.length, 0);
  const seenSlides = LECTURES.reduce((s, d) => s + (seen[d.id] || []).length, 0);
  const quizzed = LECTURES.filter(d => best[d.id]);
  const avg = quizzed.length ? Math.round(quizzed.reduce((s, d) => s + best[d.id].best, 0) / quizzed.length) : null;
  const lastDoc = last && byId[last.id];

  const lecture = d => {
    const s = (seen[d.id] || []).length, b = best[d.id], nq = (QUIZ[d.id] || []).length;
    return `
    <article class="lec">
      <div class="lec-n" aria-hidden="true">${String(d.n).padStart(2, '0')}</div>
      <div class="lec-main">
        <h3><a href="#/doc/${d.id}/${pos[d.id] || 1}">${esc(d.title)}</a></h3>
        <p>${esc(d.blurb)}</p>
        <ul class="chips">${d.topics.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
      </div>
      <div class="lec-side">
        <div class="meter" role="img" aria-label="${s} of ${d.pages.length} slides viewed"><span style="width:${pct(s, d.pages.length)}%"></span></div>
        <p class="lec-stats">${s} / ${d.pages.length} slides${b ? ` · quiz best <strong>${b.best}%</strong>` : ''}</p>
        <div class="lec-actions">
          <a class="btn" href="#/doc/${d.id}/${pos[d.id] || 1}">${s ? 'Continue' : 'Open slides'}</a>
          <a class="btn ghost" href="#/quiz/${d.id}">Quiz · ${nq}</a>
        </div>
      </div>
    </article>`;
  };

  app.innerHTML = `
  <section class="page home">
    <header class="hero">
      <p class="eyebrow">University of Bucharest · Fall 2026 · Vlad Olaru</p>
      <h1>Tools and Techniques in Computer Science</h1>
      <p class="lede">All ${LECTURES.length} lectures in one place. Every slide comes with a plain-language explanation and its acronyms spelled out. Search across all of them, then check what stuck.</p>
      <div class="hero-row">
        ${lastDoc ? `<a class="btn big" href="#/doc/${lastDoc.id}/${last.n}">Continue: ${esc(docLabel(lastDoc))}, slide ${last.n}</a>` : `<a class="btn big" href="#/doc/c1/1">Start with lecture 1</a>`}
        <a class="btn ghost big" href="#/quiz/mix">Mixed quiz · ${MIX_SIZE} questions</a>
      </div>
    </header>

    <div class="stats">
      <div class="stat"><b>${seenSlides}<small> / ${totalSlides}</small></b><span>slides viewed</span><div class="meter"><span style="width:${pct(seenSlides, totalSlides)}%"></span></div></div>
      <div class="stat"><b>${quizzed.length}<small> / ${LECTURES.length}</small></b><span>quizzes taken${avg != null ? ` · average best ${avg}%` : ''}</span><div class="meter"><span style="width:${pct(quizzed.length, LECTURES.length)}%"></span></div></div>
      <a class="stat link" href="#/quiz/mistakes"><b>${wrongCount}</b><span>${wrongCount === 1 ? 'question' : 'questions'} to review</span><em>${wrongCount ? 'Practice your mistakes →' : 'Missed questions collect here'}</em></a>
      <div class="stat grading">
        <span class="stat-h">How the grade is built · pass at 50 / 100</span>
        <div class="split" role="img" aria-label="Laboratory 30 points, project 35 points, verification 35 points">
          <i style="flex:30" class="s1">Lab 30</i><i style="flex:35" class="s2">Project 35</i><i style="flex:35" class="s3">Verification 35</i>
        </div>
        <span class="fine">Labs run weeks 1–7 (labs 2–7 graded, presence mandatory). Project in teams of 2–3, weeks 8–14.</span>
      </div>
    </div>

    <h2 class="sec">Lectures</h2>
    <div class="lecs">${LECTURES.map(lecture).join('')}</div>

    <h2 class="sec">Course documents</h2>
    <div class="docs">
      ${INFO.map(d => `<a class="doc" href="#/doc/${d.id}/1"><img src="${thumb(d, 1)}" alt="" style="aspect-ratio:${d.ar}"><div><h3>${esc(d.title)}</h3><p>${esc(d.blurb)}</p><span>${d.pages.length} pages</span></div></a>`).join('')}
    </div>
  </section>`;
}

/* ---------- slide viewer ---------- */
function viewer(doc, start) {
  setNav('home');
  const N = doc.pages.length, qs = QUIZ[doc.id] || [];
  let n = 0;
  app.innerHTML = `
  <section class="viewer${doc.ar < 1 ? ' portrait' : ''}${store.get('rail', true) ? '' : ' no-rail'}${store.get('notes', true) ? ' with-notes' : ''}" style="--ar:${doc.ar}">
    <div class="v-head">
      <div>
        <a class="back" href="#/">← All lectures</a>
        <h1>${doc.kind === 'lecture' ? `<span class="v-label">Lecture ${doc.n}</span>` : ''}${esc(doc.title)}</h1>
      </div>
      <div class="v-actions">
        <button class="btn ghost" id="railBtn" type="button">Thumbnails</button>
        <button class="btn ghost" id="notesBtn" type="button" aria-pressed="${store.get('notes', true)}">Explanation</button>
        ${qs.length ? `<a class="btn ghost" href="#/quiz/${doc.id}">Quiz · ${qs.length}</a>` : ''}
        ${location.protocol === 'file:' ? `<a class="btn ghost" href="pdfs/${doc.pdf}" target="_blank" rel="noopener">Original PDF</a>` : ''}
        <button class="btn ghost" id="fsBtn" type="button">Full screen</button>
      </div>
    </div>
    <div class="v-body">
      <aside class="rail" aria-label="Slides">${doc.pages.map((p, i) => `<button type="button" data-n="${i + 1}" title="${esc(pageTitle(doc, i + 1))}"><img loading="lazy" src="${thumb(doc, i + 1)}" alt=""><span>${i + 1}</span></button>`).join('')}</aside>
      <div class="v-main">
        <div class="v-slide">
          <div class="stage-wrap">
            <button class="fs-close" type="button" aria-label="Exit full screen">✕</button>
            <div class="stage">
              <img id="slide" alt="">
              <button class="hit prev" type="button" aria-label="Previous slide"><span>‹</span></button>
              <button class="hit next" type="button" aria-label="Next slide"><span>›</span></button>
            </div>
            <div class="v-bar">
              <button class="icon-btn" id="prevBtn" type="button" aria-label="Previous slide">←</button>
              <input id="range" type="range" min="1" max="${N}" step="1" aria-label="Slide number">
              <span class="count" id="count"></span>
              <button class="icon-btn" id="nextBtn" type="button" aria-label="Next slide">→</button>
            </div>
          </div>
          <p class="v-title" id="vTitle"></p>
        </div>
        <aside class="notes" id="notes" aria-label="Explanation of this slide"></aside>
        <div class="v-extra" id="extra"></div>
        <p class="hint">← → move between slides · E explanation · F full screen · T thumbnails</p>
      </div>
    </div>
  </section>`;

  const root = $('.viewer'), slide = $('#slide'), rail = $('.rail'), range = $('#range'), wrap = $('.stage-wrap'), extra = $('#extra'), notes = $('#notes');
  const thumbs = $$('button', rail);

  function go(k) {
    k = Math.max(1, Math.min(N, k));
    if (k === n) return;
    n = k;
    slide.src = img(doc, n);
    slide.alt = `Slide ${n}: ${pageTitle(doc, n)}`;
    $('#count').textContent = `${n} / ${N}`;
    $('#vTitle').textContent = pageTitle(doc, n);
    range.value = n;
    $('#prevBtn').disabled = $('.hit.prev').disabled = n === 1;
    $('#nextBtn').disabled = $('.hit.next').disabled = n === N;
    thumbs.forEach((b, i) => b.classList.toggle('on', i === n - 1));
    const t = thumbs[n - 1];
    rail.scrollTop = t.offsetTop - rail.clientHeight / 2 + t.clientHeight / 2;
    const url = `#/doc/${doc.id}/${n}`;
    document.title = `${docLabel(doc)} · slide ${n} – TTCS`;
    markSeen(doc, n);
    if (location.hash !== url && !setUrl(url)) location.hash = url;
    [n + 1, n - 1].forEach(m => { if (m >= 1 && m <= N) new Image().src = img(doc, m); });
    drawNotes();
    drawExtra();
  }

  function drawNotes() {
    const note = noteOf(doc, n), terms = glossFor(doc, n);
    notes.innerHTML = `
      <p class="notes-k">In plain words · slide ${n}</p>
      ${note ? rich(note) : '<p class="notes-none">No explanation has been written for this slide yet.</p>'}
      ${terms.length ? `<h2 class="notes-h">Acronyms and names on this slide</h2>
      <dl class="gloss">${terms.map(g => `<div><dt>${esc(g.t)}</dt><dd><b>${esc(g.full)}</b>${g.d ? ' · ' + inline(g.d) : ''}</dd></div>`).join('')}</dl>
      <a class="notes-more" href="#/glossary">The whole glossary →</a>` : ''}`;
    notes.scrollTop = 0;
  }

  function drawExtra() {
    extra.innerHTML = '';
    const here = qs.filter(q => q.p === n);
    if (here.length) {
      const h = document.createElement('h2');
      h.className = 'extra-h';
      h.textContent = here.length === 1 ? 'Check yourself on this slide' : `Check yourself on this slide · ${here.length} questions`;
      extra.append(h);
      here.forEach(q => extra.append(questionCard(q, { showRef: false })));
    }
    if (n === N && qs.length) {
      const end = document.createElement('div');
      end.className = 'callout';
      end.innerHTML = `<div><strong>End of lecture ${doc.n}.</strong> ${qs.length} questions are waiting.</div><a class="btn" href="#/quiz/${doc.id}">Take the quiz</a>`;
      extra.append(end);
    }
  }

  // The browser's own full screen where it exists; iPhone Safari has none for a page, so there the
  // slide is laid over the whole window instead (the "fake-fs" class).
  const touch = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 1;
  const isFs = () => document.fullscreenElement || document.webkitFullscreenElement || wrap.classList.contains('fake-fs');
  const setFake = on => { wrap.classList.toggle('fake-fs', on); document.documentElement.classList.toggle('fs-open', on); };
  const toggleFs = () => {
    if (wrap.classList.contains('fake-fs')) return setFake(false);
    if (document.fullscreenElement || document.webkitFullscreenElement) return (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    const f = wrap.requestFullscreen || wrap.webkitRequestFullscreen;
    // On a phone or tablet the overlay is used every time: iPhone Safari either lacks the browser's
    // full screen or has it and quietly does nothing, and the in-app browsers are no better.
    if (touch || !f || !(document.fullscreenEnabled || document.webkitFullscreenEnabled)) return setFake(true);
    const fallback = () => { if (!document.fullscreenElement && !document.webkitFullscreenElement) setFake(true); };
    try { const r = f.call(wrap); if (r && r.catch) r.catch(fallback); } catch { setFake(true); return; }
    setTimeout(fallback, 400);
  };
  const toggleRail = () => { const off = root.classList.toggle('no-rail'); store.set('rail', !off); };
  const toggleNotes = () => { const on = root.classList.toggle('with-notes'); store.set('notes', on); $('#notesBtn').setAttribute('aria-pressed', on); };

  rail.addEventListener('click', e => { const b = e.target.closest('button'); if (b) go(+b.dataset.n); });
  range.addEventListener('input', () => go(+range.value));
  $('#prevBtn').onclick = $('.hit.prev').onclick = () => go(n - 1);
  $('#nextBtn').onclick = $('.hit.next').onclick = () => go(n + 1);
  $('#fsBtn').onclick = toggleFs;
  $('.fs-close').onclick = toggleFs;
  $('#railBtn').onclick = toggleRail;
  $('#notesBtn').onclick = toggleNotes;

  let tx = null;
  wrap.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  wrap.addEventListener('touchend', e => { if (tx == null) return; const dx = e.changedTouches[0].clientX - tx; tx = null; if (Math.abs(dx) > 50) go(n + (dx < 0 ? 1 : -1)); }, { passive: true });

  const onKey = e => {
    if (typing(e) && e.target !== range || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (k === 'ArrowRight' || k === 'PageDown' || (k === ' ' && !onControl(e))) { e.preventDefault(); go(n + 1); }
    else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); go(n - 1); }
    else if (k === 'Home') { e.preventDefault(); go(1); }
    else if (k === 'End') { e.preventDefault(); go(N); }
    else if (k === 'f' || k === 'F') toggleFs();
    else if (k === 'Escape' && wrap.classList.contains('fake-fs')) setFake(false);
    else if (k === 't' || k === 'T') toggleRail();
    else if (k === 'e' || k === 'E') toggleNotes();
  };
  document.addEventListener('keydown', onKey);
  teardown = () => { document.removeEventListener('keydown', onKey); document.title = 'TTCS Study Hub'; document.documentElement.classList.remove('fs-open'); };
  live = { doc, go };
  go(start);
}

/* ---------- question component (shared by quizzes and the slide viewer) ---------- */
function questionCard(q, { onAnswer, showRef = true, number } = {}) {
  const el = document.createElement('div');
  el.className = 'q';
  const order = shuffle(q.o.map((t, i) => ({ t, ok: i === 0 })));
  el.innerHTML = `
    <p class="q-text">${number ? `<span class="q-num">${number}</span>` : ''}${fmt(q.q)}</p>
    <div class="q-opts">${order.map((o, i) => `<button class="opt" type="button" data-i="${i}"><span class="key">${i + 1}</span><span>${fmt(o.t)}</span></button>`).join('')}</div>
    <div class="q-fb" hidden></div>`;
  let done = false;
  el.pick = i => {
    if (done || !order[i]) return;
    done = true;
    const ok = order[i].ok;
    $$('.opt', el).forEach((b, j) => { b.disabled = true; if (order[j].ok) b.classList.add('right'); else if (j === i) b.classList.add('wrong'); });
    recordAnswer(q, ok);
    const fb = $('.q-fb', el), d = byId[q.doc];
    fb.hidden = false;
    fb.classList.add(ok ? 'ok' : 'no');
    fb.innerHTML = `<strong>${ok ? 'Correct.' : 'Not quite.'}</strong> ${q.e ? fmt(q.e) : ''}${showRef ? ` <a href="#/doc/${q.doc}/${q.p}" target="_blank" rel="noopener">See lecture ${d.n}, slide ${q.p} ↗</a>` : ''}`;
    if (onAnswer) onAnswer(ok);
  };
  el.addEventListener('click', e => { const b = e.target.closest('.opt'); if (b) el.pick(+b.dataset.i); });
  return el;
}

/* ---------- quizzes ---------- */
function quizHub() {
  setNav('quiz');
  const best = store.get('best', {});
  const wrongCount = Object.keys(store.get('wrong', {})).length;
  const badge = b => b ? `<span class="score ${b.best >= 80 ? 'hi' : b.best >= 50 ? 'mid' : 'lo'}">best ${b.best}%</span>` : '<span class="score none">not taken</span>';
  app.innerHTML = `
  <section class="page">
    <header class="page-head">
      <h1>Quizzes</h1>
      <p>${ALLQ.length} questions written from the slides. Every answer explains itself and links back to the slide it comes from.</p>
    </header>
    <div class="duo">
      <a class="feature" href="#/quiz/mix"><h3>Mixed quiz</h3><p>${MIX_SIZE} random questions across all lectures, the closest thing to the verification.</p><span>${best.mix ? `Best ${best.mix.best}% · ` : ''}Start →</span></a>
      <a class="feature${wrongCount ? '' : ' off'}" href="#/quiz/mistakes"><h3>Review your mistakes</h3><p>${wrongCount ? `${wrongCount} ${wrongCount === 1 ? 'question' : 'questions'} you last answered wrong. They leave the list once you get them right.` : 'Questions you get wrong are collected here until you answer them correctly.'}</p><span>${wrongCount ? 'Practice →' : 'Nothing to review'}</span></a>
    </div>
    <h2 class="sec">By lecture</h2>
    <div class="qlist">
      ${LECTURES.map(d => `<a class="qrow" href="#/quiz/${d.id}"><span class="lec-n">${String(d.n).padStart(2, '0')}</span><span class="qrow-t"><b>${esc(d.title)}</b><small>${(QUIZ[d.id] || []).length} questions</small></span>${badge(best[d.id])}</a>`).join('')}
    </div>
  </section>`;
}

function quizRun(key) {
  setNav('quiz');
  let pool, title, sub;
  if (key === 'mix') { pool = shuffle(ALLQ).slice(0, MIX_SIZE); title = 'Mixed quiz'; sub = 'All lectures'; }
  else if (key === 'mistakes') { const w = store.get('wrong', {}); pool = shuffle(ALLQ.filter(q => w[q.id])); title = 'Review your mistakes'; sub = 'Questions you last answered wrong'; }
  else if (QUIZ[key] && byId[key]) { pool = shuffle(QUIZ[key]); title = `Lecture ${byId[key].n} quiz`; sub = byId[key].title; }
  else return quizHub();

  if (!pool.length) {
    app.innerHTML = `<section class="page narrow"><div class="empty"><h1>Nothing to review</h1><p>You have no missed questions right now. Take a quiz and anything you get wrong will show up here.</p><a class="btn" href="#/quiz">All quizzes</a></div></section>`;
    return;
  }
  run(pool);

  function run(list) {
    let i = 0, score = 0, card = null, answered = false;
    const missed = [];
    app.innerHTML = `
    <section class="page narrow quiz">
      <div class="quiz-head">
        <div><a class="back" href="#/quiz">← All quizzes</a><h1>${esc(title)}</h1><p>${esc(sub)}</p></div>
        <div class="quiz-count" id="qCount"></div>
      </div>
      <div class="meter"><span id="qBar"></span></div>
      <div id="qBody"></div>
      <div class="quiz-foot"><span class="hint">Keys 1–4 answer · Enter continues</span><button class="btn" id="qNext" type="button" hidden>Next question</button></div>
    </section>`;
    const next = $('#qNext');
    const show = () => {
      answered = false;
      next.hidden = true;
      $('#qCount').innerHTML = `<b>${i + 1}</b> / ${list.length}`;
      $('#qBar').style.width = pct(i, list.length) + '%';
      card = questionCard(list[i], { number: i + 1, onAnswer: ok => {
        answered = true;
        if (ok) score++; else missed.push(list[i]);
        $('#qBar').style.width = pct(i + 1, list.length) + '%';
        next.textContent = i === list.length - 1 ? 'See your result' : 'Next question';
        next.hidden = false;
      } });
      $('#qBody').replaceChildren(card);
    };
    const advance = () => { if (!answered) return; if (++i < list.length) show(); else finish(); };
    next.onclick = advance;
    const onKey = e => {
      if (typing(e) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^[1-4]$/.test(e.key) && card) card.pick(+e.key - 1);
      else if (e.key === 'Enter' && answered && document.activeElement !== next) { e.preventDefault(); advance(); }
    };
    if (teardown) teardown();
    document.addEventListener('keydown', onKey);
    teardown = () => document.removeEventListener('keydown', onKey);
    show();

    function finish() {
      teardown(); teardown = null;
      const p = pct(score, list.length);
      const full = list.length === pool.length;
      if (key !== 'mistakes' && full) {
        const best = store.get('best', {});
        best[key] = { best: Math.max(p, best[key] ? best[key].best : 0), last: p, total: list.length };
        store.set('best', best);
      }
      const verdict = p === 100 ? 'Flawless.' : p >= 80 ? 'Solid. A few details left to polish.' : p >= 50 ? 'Past the halfway line. Review the misses below and go again.' : 'This lecture needs another pass. The slides for each miss are linked below.';
      app.innerHTML = `
      <section class="page narrow quiz">
        <a class="back" href="#/quiz">← All quizzes</a>
        <div class="result">
          <div class="result-n ${p >= 80 ? 'hi' : p >= 50 ? 'mid' : 'lo'}"><b>${score}</b><span>/ ${list.length}</span></div>
          <div><h1>${esc(title)}: ${p}%</h1><p>${verdict}</p>
            <div class="result-actions">
              <button class="btn" id="again" type="button">Try again</button>
              ${missed.length ? `<button class="btn ghost" id="retry" type="button">Redo the ${missed.length} missed</button>` : ''}
              ${byId[key] ? `<a class="btn ghost" href="#/doc/${key}/1">Back to the slides</a>` : ''}
            </div>
          </div>
        </div>
        ${missed.length ? `<h2 class="sec">What to revisit</h2><div class="missed">${missed.map(q => `<div class="miss"><p>${fmt(q.q)}</p><p class="ans">${fmt(q.o[0])}</p>${q.e ? `<p class="why">${fmt(q.e)}</p>` : ''}<a href="#/doc/${q.doc}/${q.p}">Lecture ${byId[q.doc].n}, slide ${q.p} →</a></div>`).join('')}</div>` : ''}
      </section>`;
      window.scrollTo(0, 0);
      $('#again').onclick = () => quizRun(key);
      if (missed.length) $('#retry').onclick = () => run(shuffle(missed));
    }
  }
}

/* ---------- flashcards ---------- */
function cards() {
  setNav('cards');
  let lec = store.get('cards.lec', 0), dir = store.get('cards.dir', 'recall'), skip = store.get('cards.skip', false), kind = store.get('cards.deck', 'theory');
  const known = store.get('known', {});
  let deck = [], i = 0, open = false;
  const ASK = { c: 'Which command?', s: 'How do you write it?', f: 'Which file or path?', n: 'What is the value?' };
  const pool = () => kind === 'theory' ? THEORY : kind === 'cmds' ? CMDS : THEORY.concat(CMDS);

  app.innerHTML = `
  <section class="page narrow">
    <header class="page-head"><h1>Flashcards</h1><p>${THEORY.length} theory questions and ${CMDS.length} commands, files and numbers from the slides. Flip, judge yourself honestly, move on.</p></header>
    <div class="filters">
      <select id="fDeck" aria-label="Deck"><option value="theory">Theory questions</option><option value="cmds">Commands, files, numbers</option><option value="all">Both</option></select>
      <select id="fLec" aria-label="Lecture"><option value="0">All lectures</option>${LECTURES.map(d => `<option value="${d.n}">Lecture ${d.n}</option>`).join('')}</select>
      <select id="fDir" aria-label="Direction"><option value="recall">Show the meaning, recall the command</option><option value="explain">Show the command, explain it</option></select>
      <label class="check"><input id="fSkip" type="checkbox"> Hide cards I know</label>
    </div>
    <div id="cardArea"></div>
  </section>`;
  $('#fLec').value = lec; $('#fDir').value = dir; $('#fSkip').checked = skip; $('#fDeck').value = kind;
  const showDir = () => { $('#fDir').hidden = kind === 'theory'; };
  showDir();

  const build = () => { deck = shuffle(pool().filter(c => (!lec || c.l === lec) && (!skip || !known[c.key]))); i = 0; open = false; draw(); };
  const draw = () => {
    const area = $('#cardArea');
    if (!deck.length) { area.innerHTML = `<div class="empty"><h2>No cards left here</h2><p>You have marked every card in this selection as known.</p><button class="btn" id="resetKnown" type="button">Start over with all of them</button></div>`; $('#resetKnown').onclick = () => { pool().forEach(c => { if (!lec || c.l === lec) delete known[c.key]; }); store.set('known', known); build(); }; return; }
    if (i >= deck.length) { area.innerHTML = `<div class="empty"><h2>End of the deck</h2><p>${deck.filter(c => known[c.key]).length} of ${deck.length} marked as known.</p><button class="btn" id="reshuffle" type="button">Shuffle and go again</button></div>`; $('#reshuffle').onclick = build; return; }
    const c = deck[i], theory = c.k === 't', recall = dir === 'recall';
    const cmd = `<code class="card-cmd">${esc(c.c)}</code>`, meaning = `<span class="card-text">${esc(c.d)}</span>`;
    const front = theory ? `<span class="card-text">${fmt(c.q)}</span>` : recall ? meaning : cmd;
    const back = theory ? `<span class="card-answer">${fmt(c.a)}</span>` : recall ? cmd : meaning;
    area.innerHTML = `
      <div class="deck-meta"><span>Card ${i + 1} of ${deck.length}</span><span>${pool().filter(x => known[x.key] && (!lec || x.l === lec)).length} known</span></div>
      <button class="card${open ? ' open' : ''}" id="card" type="button" aria-label="Flip the card">
        <span class="card-tag">Lecture ${c.l} · ${KIND[c.k]}</span>
        ${theory ? '' : `<span class="card-ask">${recall ? ASK[c.k] : 'What does it do?'}</span>`}
        ${front}
        ${open ? `<span class="card-rule"></span>${back}` : '<span class="card-flip">Click or press Space to flip</span>'}
      </button>
      <div class="card-actions">
        ${open ? `<button class="btn ghost" id="again" type="button">Still learning <kbd>1</kbd></button><button class="btn" id="got" type="button">Got it <kbd>2</kbd></button><a class="card-src" href="#/doc/c${c.l}/${c.p}">Slide ${c.p} →</a>` : '<button class="btn" id="flip" type="button">Show answer</button>'}
      </div>`;
    $('#card').onclick = flip;
    if (open) { $('#again').onclick = () => judge(false); $('#got').onclick = () => judge(true); } else $('#flip').onclick = flip;
  };
  const flip = () => { if (i < deck.length) { open = !open; draw(); } };
  const judge = ok => { const c = deck[i]; if (!c) return; if (ok) known[c.key] = 1; else delete known[c.key]; store.set('known', known); i++; open = false; draw(); };

  $('#fDeck').onchange = e => { kind = e.target.value; store.set('cards.deck', kind); showDir(); build(); };
  $('#fLec').onchange = e => { lec = +e.target.value; store.set('cards.lec', lec); build(); };
  $('#fDir').onchange = e => { dir = e.target.value; store.set('cards.dir', dir); open = false; draw(); };
  $('#fSkip').onchange = e => { skip = e.target.checked; store.set('cards.skip', skip); build(); };
  const onKey = e => {
    if (typing(e) || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === ' ' || e.key === 'Enter') { if (onControl(e)) return; e.preventDefault(); flip(); }
    else if (open && e.key === '1') judge(false);
    else if (open && e.key === '2') judge(true);
  };
  document.addEventListener('keydown', onKey);
  teardown = () => document.removeEventListener('keydown', onKey);
  build();
}

/* ---------- cheat sheet ---------- */
function cheats() {
  setNav('cheats');
  app.innerHTML = `
  <section class="page">
    <header class="page-head"><h1>Cheat sheet</h1><p>Every command, file and number worth knowing by heart, in lecture order. Each row links to its slide.</p></header>
    <div class="filters"><input id="cf" type="search" placeholder="Filter, e.g. cron, mount, $@" aria-label="Filter the cheat sheet" spellcheck="false"><select id="cl" aria-label="Lecture"><option value="0">All lectures</option>${LECTURES.map(d => `<option value="${d.n}">Lecture ${d.n}</option>`).join('')}</select></div>
    <div id="cheatList"></div>
  </section>`;
  const draw = () => {
    const f = $('#cf').value.trim().toLowerCase(), l = +$('#cl').value;
    const rows = CMDS.filter(c => (!l || c.l === l) && (!f || (c.c + ' ' + c.d).toLowerCase().includes(f)));
    $('#cheatList').innerHTML = rows.length ? LECTURES.map(d => {
      const mine = rows.filter(c => c.l === d.n);
      return mine.length ? `<h2 class="sec"><span class="lec-n">${String(d.n).padStart(2, '0')}</span> ${esc(d.title)}</h2><div class="sheet">${mine.map(row).join('')}</div>` : '';
    }).join('') : '<div class="empty"><p>Nothing matches that filter.</p></div>';
  };
  const row = c => `<div class="sheet-row"><code>${esc(c.c)}</code><span>${esc(c.d)}${c.k !== 'c' ? ` <i class="tag">${KIND[c.k]}</i>` : ''}</span><a href="#/doc/c${c.l}/${c.p}" aria-label="Lecture ${c.l}, slide ${c.p}">slide ${c.p}</a></div>`;
  $('#cf').oninput = draw; $('#cl').onchange = draw;
  draw();
}

/* ---------- glossary ---------- */
const glossRow = (g, terms) => {
  const w = firstUse(g), mark = s => terms ? highlight(s, terms) : esc(s);
  return `<div class="sheet-row gl"><code>${mark(g.t)}</code><span><b>${mark(g.full)}</b>${g.d ? ' · ' + inline(g.d) : ''}</span>${w ? `<a href="#/doc/${w.d.id}/${w.n}" aria-label="First used in ${esc(docLabel(w.d))}, slide ${w.n}">${w.d.kind === 'lecture' ? 'L' + w.d.n : esc(w.d.title)} · slide ${w.n}</a>` : '<i></i>'}</div>`;
};

function glossary() {
  setNav('gloss');
  const count = k => GLOSS.filter(g => g.k === k).length;
  app.innerHTML = `
  <section class="page">
    <header class="page-head"><h1>Glossary</h1><p>${count('a')} acronyms and ${count('n')} cryptic Unix names from the slides, spelled out. Each row links to the first slide that uses it.</p></header>
    <div class="filters"><input id="gf" type="search" placeholder="Filter, e.g. DMA, tty, protocol" aria-label="Filter the glossary" spellcheck="false"><select id="gk" aria-label="Kind"><option value="">Acronyms and names</option><option value="a">Acronyms only</option><option value="n">Unix names only</option></select></div>
    <div id="glossList"></div>
  </section>`;
  const sorted = GLOSS.slice().sort((a, b) => a.t.replace(/^[^A-Za-z0-9]+/, '').localeCompare(b.t.replace(/^[^A-Za-z0-9]+/, ''), 'en', { sensitivity: 'base' }));
  const draw = () => {
    const f = $('#gf').value.trim().toLowerCase(), k = $('#gk').value;
    const rows = sorted.filter(g => (!k || g.k === k) && (!f || (g.low + ' ' + g.d).toLowerCase().includes(f)));
    const block = (kind, title) => { const mine = rows.filter(g => g.k === kind); return mine.length ? `<h2 class="sec">${title} <small>${mine.length}</small></h2><div class="sheet">${mine.map(g => glossRow(g)).join('')}</div>` : ''; };
    $('#glossList').innerHTML = rows.length ? block('a', 'Acronyms') + block('n', 'Unix names decoded') : '<div class="empty"><p>Nothing matches that filter.</p></div>';
  };
  $('#gf').oninput = draw; $('#gk').onchange = draw;
  draw();
}

/* ---------- search ---------- */
let INDEX = null;
function index() {
  if (!INDEX) INDEX = DOCS.flatMap(d => d.pages.map((p, i) => { const text = p.x.normalize('NFKC').replace(/[-]/g, '·'); const note = notePlain(d, i + 1); return { d, n: i + 1, text, low: text.toLowerCase(), title: p.t.normalize('NFKC').toLowerCase(), note, nlow: note.toLowerCase() }; }));
  return INDEX;
}

function highlight(text, terms) {
  const re = new RegExp('(' + terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'gi');
  return text.split(re).map((part, i) => i % 2 ? `<mark>${esc(part)}</mark>` : esc(part)).join('');
}

function search(q) {
  setNav('');
  if (document.activeElement !== sIn) sIn.value = q;
  const terms = q.normalize('NFKC').toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) { app.innerHTML = `<section class="page narrow"><div class="empty"><h1>Search the slides</h1><p>Type a command, a file name or a concept: <code>crontab</code>, <code>/etc/fstab</code>, <code>runlevel</code>, <code>SIGKILL</code>…</p></div></section>`; return; }
  const onSlide = e => terms.every(t => e.low.includes(t) || e.title.includes(t));
  const hits = index().filter(e => terms.every(t => e.low.includes(t) || e.title.includes(t) || e.nlow.includes(t)))
    .map(e => ({ e, s: (terms.every(t => e.title.includes(t)) ? 4 : 0) + (onSlide(e) ? 2 : 0) + (e.d.kind === 'lecture' ? 1 : 0) }))
    .sort((a, b) => b.s - a.s).map(h => h.e);
  const ql = terms.join(' ');
  const gls = GLOSS.filter(g => terms.every(t => g.low.includes(t)))
    .sort((a, b) => (b.t.toLowerCase() === ql) - (a.t.toLowerCase() === ql) || b.t.toLowerCase().startsWith(ql) - a.t.toLowerCase().startsWith(ql)).slice(0, 5);
  const cmds = CMDS.filter(c => { const s = (c.c + ' ' + c.d).toLowerCase(); return terms.every(t => s.includes(t)); }).slice(0, 6);
  const cut = (src, at) => { const from = Math.max(0, at - 70), to = Math.min(src.length, Math.max(at, 0) + 150); return (from > 0 ? '…' : '') + highlight(src.slice(from, to), terms) + (to < src.length ? '…' : ''); };
  const snippet = e => {
    if (!onSlide(e)) { let at = -1; for (const t of terms) { at = e.nlow.indexOf(t); if (at >= 0) break; } return '<i class="tag">explanation</i> ' + cut(e.note, at); }
    const raw = e.text.split(' ‖ ')[0], low = raw.toLowerCase();
    let at = -1; for (const t of terms) { at = low.indexOf(t); if (at >= 0) break; }
    const src = at >= 0 ? raw : e.text, lowSrc = src.toLowerCase();
    if (at < 0) for (const t of terms) { at = lowSrc.indexOf(t); if (at >= 0) break; }
    return cut(src, at);
  };
  const shown = hits.slice(0, 80);
  app.innerHTML = `
  <section class="page">
    <header class="page-head"><h1>${hits.length} ${hits.length === 1 ? 'slide' : 'slides'} for “${esc(q)}”</h1>${hits.length > shown.length ? `<p>Showing the first ${shown.length}. Add a word to narrow it down.</p>` : ''}</header>
    ${gls.length ? `<div class="sheet found">${gls.map(g => glossRow(g, terms)).join('')}</div>` : ''}
    ${cmds.length ? `<div class="sheet found">${cmds.map(c => `<div class="sheet-row"><code>${highlight(c.c, terms)}</code><span>${highlight(c.d, terms)}</span><a href="#/doc/c${c.l}/${c.p}">L${c.l} · slide ${c.p}</a></div>`).join('')}</div>` : ''}
    ${shown.length ? `<div class="results">${shown.map(e => `<a class="res" href="#/doc/${e.d.id}/${e.n}"><img loading="lazy" src="${thumb(e.d, e.n)}" alt="" style="aspect-ratio:${e.d.ar}"><div><span class="res-where">${esc(docLabel(e.d))} · slide ${e.n}</span><h3>${highlight(pageTitle(e.d, e.n), terms)}</h3><p>${snippet(e)}</p></div></a>`).join('')}</div>` : (cmds.length || gls.length ? '' : `<div class="empty"><p>No slide mentions that. Try a shorter word, or a command name.</p></div>`)}
  </section>`;
}

/* ---------- chrome: search box, theme, shortcuts, errors ---------- */
let st = null;
sIn.addEventListener('input', () => {
  clearTimeout(st);
  st = setTimeout(() => {
    const v = sIn.value.trim(), onSearch = location.hash.startsWith('#/search');
    if (!v && !onSearch) return;
    const h = '#/search/' + encodeURIComponent(v);
    if (onSearch && setUrl(h)) route(); else location.hash = h;
  }, 150);
});
sIn.addEventListener('keydown', e => { if (e.key === 'Escape') sIn.blur(); });

$('#theme').addEventListener('click', () => {
  const r = document.documentElement;
  const dark = r.dataset.theme ? r.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  r.dataset.theme = dark ? 'light' : 'dark';
  store.set('theme', r.dataset.theme);
});

document.addEventListener('keydown', e => { if (e.key === '/' && !typing(e) && !e.metaKey && !e.ctrlKey) { e.preventDefault(); sIn.focus(); sIn.select(); } });

window.addEventListener('error', e => {
  const b = document.createElement('p');
  b.className = 'err';
  b.textContent = 'Something broke on this page: ' + (e.message || 'unknown error');
  document.body.prepend(b);
});

window.addEventListener('hashchange', route);
if (!DOCS.length) app.innerHTML = '<div class="empty"><h1>Course data is missing</h1><p>The file data/slides.js did not load. Keep index.html next to the data, slides and thumbs folders.</p></div>';
else route();
})();

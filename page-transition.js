/* ==========================================================
   Page transition — Rotaract Club of SRCAS
   - Plays the "Forge & Rise" intro video on EVERY page load
   - Skippable: "Skip Intro" button, Esc key, or click anywhere
   - If the video can't play for any reason, the page just shows normally
   Load in <head> WITHOUT defer so the page never flashes before the overlay.
   ========================================================== */
(function () {
  var BASE = (function () {
    var s = document.currentScript && document.currentScript.src;
    return s ? s.replace(/[^\/]*$/, '') : '';
  })();
  var VIDEO = BASE + 'assets/transition/forge-intro'; // .mp4 + .webm
  var POSTER = BASE + 'assets/transition/forge-poster.jpg';
  var MAX_MS = 13000; // safety net: never cover the page longer than this
  var Z = 999990;     // just below the gear cursor

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return; // respect "reduce motion" — show the page straight away

  var css =
    'html.pt-cover{background:#05060d}' +
    'html.pt-cover body{visibility:hidden}' +
    '.pt-overlay{position:fixed;inset:0;z-index:' + Z + ';background:#05060d;opacity:1;transition:opacity .8s ease;visibility:visible}' +
    '.pt-overlay.pt-hide{opacity:0;pointer-events:none}' +
    '.pt-overlay video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;background:#05060d}' +
    '.pt-skip{position:absolute;right:22px;bottom:22px;font:600 12px/1 Jost,system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#f3dca0;background:rgba(0,0,0,.35);border:1px solid rgba(243,220,160,.55);padding:10px 16px;border-radius:999px;cursor:pointer;backdrop-filter:blur(4px);transition:background .2s}' +
    '.pt-skip:hover{background:rgba(243,220,160,.18)}';
  var st = document.createElement('style');
  st.id = 'pt-style';
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  var root = document.documentElement;
  root.classList.add('pt-cover');
  function uncover() { root.classList.remove('pt-cover'); }

  function start() {
    var o = document.createElement('div');
    o.className = 'pt-overlay';
    o.setAttribute('role', 'dialog');
    o.setAttribute('aria-label', 'Rise of Resurgence intro');

    var v = document.createElement('video');
    v.muted = true; v.defaultMuted = true; v.playsInline = true; v.autoplay = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('autoplay', '');
    v.preload = 'auto';
    v.poster = POSTER;
    // MP4 first (Chrome, Edge, Safari, phones), WebM as a fallback
    [['mp4', 'video/mp4'], ['webm', 'video/webm']].forEach(function (t) {
      var so = document.createElement('source');
      so.src = VIDEO + '.' + t[0]; so.type = t[1];
      v.appendChild(so);
    });

    var skip = document.createElement('button');
    skip.type = 'button'; skip.className = 'pt-skip'; skip.textContent = 'Skip Intro';

    o.appendChild(v); o.appendChild(skip);
    document.body.appendChild(o);
    uncover();

    var done = false;
    function finish() {
      if (done) return; done = true;
      document.removeEventListener('keydown', onKey);
      o.classList.add('pt-hide');
      setTimeout(function () {
        try { v.pause(); } catch (e) {}
        if (o.parentNode) o.parentNode.removeChild(o);
      }, 850);
    }
    function onKey(e) { if (e.key === 'Escape') finish(); }

    skip.addEventListener('click', function (e) { e.stopPropagation(); finish(); });
    o.addEventListener('click', finish);
    document.addEventListener('keydown', onKey);
    v.addEventListener('ended', finish);
    // If every source fails (missing/unsupported file) → show the page
    var last = v.querySelector('source:last-of-type');
    if (last) last.addEventListener('error', finish);
    v.addEventListener('error', finish);

    var p = v.play();
    if (p && p.catch) p.catch(finish);     // autoplay blocked → show page
    setTimeout(finish, MAX_MS);
  }

  // Back/forward cache: clear any leftover overlay
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    uncover();
    var list = document.querySelectorAll('.pt-overlay');
    for (var i = 0; i < list.length; i++) list[i].parentNode.removeChild(list[i]);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

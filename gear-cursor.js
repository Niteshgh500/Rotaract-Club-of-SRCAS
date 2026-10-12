/* ============================================================
   Rotaract Gear Cursor + Page Transition
   Works together with gear-cursor.css and gear-cursor-logo.png.
   Include this on every page with:
     <link rel="stylesheet" href="gear-cursor.css">
     <script src="gear-cursor.js" defer></script>
   ============================================================ */
(function () {
  var GEAR_SRC = 'assets/gear-cursor-logo.png';

  function init() {
    /* ---------------- Page transition overlay ---------------- */
    var overlay = document.createElement('div');
    overlay.id = 'gear-transition-overlay';
    overlay.innerHTML = '<img class="gear-transition-icon" src="' + GEAR_SRC + '" alt="">';
    document.body.appendChild(overlay);

    // Reveal the page: fade the overlay out shortly after it loads
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.classList.add('gear-reveal');
        setTimeout(function () { overlay.classList.add('gear-hidden'); }, 480);
      });
    });

    function isTransitionableLink(a) {
      if (!a || !a.getAttribute) return false;
      var href = a.getAttribute('href');
      if (!href) return false;
      if (href.charAt(0) === '#') return false;
      if (href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return false;
      if (a.target === '_blank') return false;
      if (a.hasAttribute('download')) return false;
      var url;
      try { url = new URL(a.href, window.location.href); } catch (e) { return false; }
      if (url.origin !== window.location.origin) return false;
      if (url.pathname === window.location.pathname && url.hash) return false; // same-page anchor
      return true;
    }

    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a') : null;
      if (!a || !isTransitionableLink(a)) return;
      e.preventDefault();
      var dest = a.href;
      overlay.classList.remove('gear-hidden');
      // Force the browser to notice the display change before animating opacity
      void overlay.offsetWidth;
      overlay.classList.add('gear-cover');
      setTimeout(function () { window.location.href = dest; }, 460);
    }, true);

    /* ---------------- Rotating custom cursor ---------------- */
    var canHover = window.matchMedia &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!canHover) return;

    document.body.classList.add('gear-cursor-active');

    var cursor = document.createElement('div');
    cursor.className = 'gear-cursor';
    cursor.innerHTML =
      '<div class="gear-cursor-scale"><img class="gear-cursor-spin" src="' + GEAR_SRC + '" alt=""></div>';
    document.body.appendChild(cursor);

    var mx = window.innerWidth / 2, my = window.innerHeight / 2, cx = mx, cy = my;
    var started = false;

    window.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      if (!started) { cx = mx; cy = my; started = true; }
      cursor.style.opacity = '1';
    });
    document.addEventListener('mouseleave', function () { cursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', function () { if (started) cursor.style.opacity = '1'; });

    (function tick() {
      cx += (mx - cx) * 0.28;
      cy += (my - cy) * 0.28;
      cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      requestAnimationFrame(tick);
    })();

    function spawnBurst(x, y) {
      var wrap = document.createElement('div');
      wrap.className = 'gear-burst-wrap';
      wrap.style.left = x + 'px';
      wrap.style.top = y + 'px';

      var ring = document.createElement('div');
      ring.className = 'gear-burst-ring';
      wrap.appendChild(ring);

      var count = 7;
      for (var i = 0; i < count; i++) {
        var p = document.createElement('div');
        p.className = 'gear-burst-particle';
        var angle = (Math.PI * 2 / count) * i;
        var dist = 40 + Math.random() * 20;
        p.style.setProperty('--dx', (Math.cos(angle) * dist).toFixed(1) + 'px');
        p.style.setProperty('--dy', (Math.sin(angle) * dist).toFixed(1) + 'px');
        wrap.appendChild(p);
      }
      document.body.appendChild(wrap);
      setTimeout(function () { wrap.remove(); }, 650);
    }

    document.addEventListener('mousedown', function (e) {
      cursor.classList.add('gear-cursor-click');
      spawnBurst(e.clientX, e.clientY);
    });
    document.addEventListener('mouseup', function () {
      cursor.classList.remove('gear-cursor-click');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

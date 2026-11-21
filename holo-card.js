/* HoloCard (versi vanilla JS).
   Otomatis dipasang ke ".project, .card, .post-card" (termasuk kartu galeri yang dimuat belakangan).
   Manual: HoloCard.mount(el, { tiltMax: 12, hoverScale: 1.04, lift: -8 }) */
(function () {
  'use strict';
  var SELECTOR = '.project, .card, .post-card';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mount(el, opts) {
    if (el.__holo) return el.__holo;
    opts = opts || {};
    var tiltMax = opts.tiltMax != null ? opts.tiltMax : 10;
    var hoverScale = opts.hoverScale != null ? opts.hoverScale : 1.03;
    var lift = opts.lift != null ? opts.lift : -8;

    el.classList.add('holo');
    var c = { rx: 0, ry: 0, mx: 50, my: 50, o: 0, k: 0 };
    var t = { rx: 0, ry: 0, mx: 50, my: 50, o: 0, k: 0 };
    var v = { rx: 0, ry: 0, mx: 0, my: 0, o: 0, k: 0 };
    var raf = 0, active = false;

    function step() {
      var settled = true;
      for (var key in c) {
        v[key] = (v[key] + (t[key] - c[key]) * 0.14) * 0.72;   // spring
        c[key] += v[key];
        if (Math.abs(t[key] - c[key]) > 0.01 || Math.abs(v[key]) > 0.01) settled = false;
      }
      var s = el.style;
      s.setProperty('--hc-rx', c.rx.toFixed(2) + 'deg');
      s.setProperty('--hc-ry', c.ry.toFixed(2) + 'deg');
      s.setProperty('--hc-mx', c.mx.toFixed(1) + '%');
      s.setProperty('--hc-my', c.my.toFixed(1) + '%');
      s.setProperty('--hc-o', Math.max(0, Math.min(1, c.o)).toFixed(3));
      s.setProperty('--hc-lift', (lift * c.k).toFixed(2) + 'px');
      s.setProperty('--hc-scale', (1 + (hoverScale - 1) * c.k).toFixed(4));
      if (settled && !active) { raf = 0; el.classList.remove('holo-on'); return; }
      raf = requestAnimationFrame(step);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(step); }

    function onMove(e) {
      var r = el.getBoundingClientRect();
      var x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      var y = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
      t.mx = x * 100; t.my = y * 100;
      if (!reduce) { t.ry = (x - .5) * 2 * tiltMax; t.rx = -(y - .5) * 2 * tiltMax; }
      t.o = 1; t.k = 1; active = true;
      el.classList.add('holo-on'); kick();
    }
    function onLeave() {
      t.rx = 0; t.ry = 0; t.mx = 50; t.my = 50; t.o = 0; t.k = 0;
      active = false; kick();
    }

    el.addEventListener('pointerenter', onMove);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    el.addEventListener('pointercancel', onLeave);
    el.addEventListener('focus', function () { t.o = 1; t.k = 1; el.classList.add('holo-on'); kick(); });
    el.addEventListener('blur', onLeave);

    return (el.__holo = { destroy: function () {
      cancelAnimationFrame(raf); el.classList.remove('holo', 'holo-on'); delete el.__holo;
    } });
  }

  function scan(root) {
    if (root.matches && root.matches(SELECTOR)) mount(root);
    if (root.querySelectorAll) root.querySelectorAll(SELECTOR).forEach(function (el) { mount(el); });
  }

  window.HoloCard = { mount: mount, scan: scan };

  function init() {
    scan(document);
    // kartu galeri (post-card) dibuat lewat JS setelah data dimuat
    new MutationObserver(function (list) {
      list.forEach(function (m) {
        m.addedNodes.forEach(function (n) { if (n.nodeType === 1) scan(n); });
      });
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

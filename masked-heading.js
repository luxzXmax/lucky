/*
 * MaskedHeading (vanilla JS)
 * Port dari komponen <MaskedHeading /> React Bits untuk project HTML statis ini.
 * Huruf-huruf judul jadi "jendela" yang menampilkan video/gambar yang looping.
 *
 * Pemakaian:
 *   MaskedHeading.mount(document.querySelector('h1'), {
 *     mediaType: 'video', src: 'reel.mp4', poster: 'poster.jpg',
 *     fillScale: 1.3, parallax: 34, reveal: 'scale', trigger: 'view',
 *     spotlight: true, spotlightRadius: 180, outline: true
 *   });
 *
 * Teks asli (termasuk <br>) dipakai sebagai sumber baris, dan tetap ada di DOM
 * sebagai teks tersembunyi untuk screen reader / SEO.
 */
(function (global) {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var uid = 0;

  var DEFAULTS = {
    mediaType: 'video',      // 'video' | 'image'
    src: '',
    poster: '',
    fillScale: 1.3,          // seberapa besar media dibanding area teks
    parallax: 34,            // px geser maksimum media mengikuti kursor
    hoverZoom: 1.06,         // zoom halus saat kursor di atas judul
    brightness: 1.1,
    saturation: 1.15,
    grayscale: 0,
    reveal: 'scale',         // 'scale' | 'rise' | 'blur' | 'wipe' | 'fade' | 'none'
    trigger: 'view',         // 'view' | 'load' | 'hover'
    duration: 1.2,           // detik
    spotlight: false,
    spotlightRadius: 180,
    outline: false,
    outlineColor: 'rgba(255,255,255,.55)',
    outlineWidth: 1.5
  };

  function el(name, attrs, parent) {
    var n = document.createElementNS(SVG_NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function mount(host, userOpts) {
    if (!host || host.__maskedHeading) return host && host.__maskedHeading;
    var o = {};
    for (var k in DEFAULTS) o[k] = (userOpts && userOpts[k] !== undefined) ? userOpts[k] : DEFAULTS[k];

    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var id = 'mh-clip-' + (++uid);

    // ---- ambil teks asli, dipecah per <br> jadi "paragraf" ----
    var groups = [''];
    host.childNodes.forEach(function (n) {
      if (n.nodeName === 'BR') groups.push('');
      else groups[groups.length - 1] += n.textContent;
    });
    groups = groups.map(function (g) { return g.replace(/\s+/g, ' ').trim(); }).filter(Boolean);
    var fullText = groups.join(' ');
    if (!fullText) return null;

    // ---- struktur DOM ----
    var original = host.innerHTML;
    host.classList.add('mh');
    host.innerHTML = '';

    var sr = document.createElement('span');
    sr.className = 'mh-sr';
    sr.textContent = fullText;

    var stage = document.createElement('span');
    stage.className = 'mh-stage';
    stage.setAttribute('aria-hidden', 'true');
    stage.setAttribute('data-reveal', o.reveal);

    var media = document.createElement('span');
    media.className = 'mh-media';
    media.style.clipPath = 'url(#' + id + ')';
    media.style.webkitClipPath = 'url(#' + id + ')';

    var inner = document.createElement('span');
    inner.className = 'mh-media-inner';
    var filt = 'brightness(' + o.brightness + ') saturate(' + o.saturation + ')' +
      (o.grayscale ? ' grayscale(' + o.grayscale + ')' : '');
    var node;
    if (o.mediaType === 'video') {
      node = document.createElement('video');
      node.muted = true; node.defaultMuted = true; node.loop = true;
      node.autoplay = !reduced;
      node.playsInline = true;
      node.setAttribute('muted', ''); node.setAttribute('playsinline', '');
      node.preload = 'auto';
      if (o.poster) node.poster = o.poster;
      node.src = o.src;
    } else {
      node = document.createElement('img');
      node.alt = ''; node.src = o.src; node.decoding = 'async';
    }
    node.className = 'mh-el';
    node.style.filter = filt;
    inner.appendChild(node);
    media.appendChild(inner);

    var spot = null;
    if (o.spotlight) {
      spot = document.createElement('span');
      spot.className = 'mh-spot';
      media.appendChild(spot);
    }

    var svg = el('svg', { 'class': 'mh-svg', focusable: 'false' });
    var defs = el('defs', {}, svg);
    var clip = el('clipPath', { id: id }, defs);
    var strokeG = el('g', { 'class': 'mh-outline' + (o.outline ? '' : ' mh-off') }, svg);
    strokeG.setAttribute('fill', 'none');
    strokeG.setAttribute('stroke', o.outlineColor);
    strokeG.setAttribute('stroke-width', o.outlineWidth);
    strokeG.setAttribute('stroke-linejoin', 'round');

    stage.appendChild(media);
    stage.appendChild(svg);
    host.appendChild(sr);
    host.appendChild(stage);
    host.classList.add('mh-ready');

    // ---- ukur teks (canvas) dan susun baris ----
    var ctx = document.createElement('canvas').getContext('2d');
    var geo = { w: 0, h: 0 };

    function layout() {
      var cs = getComputedStyle(host);
      var fs = parseFloat(cs.fontSize) || 64;
      var ls = parseFloat(cs.letterSpacing) || 0;
      var lh = parseFloat(cs.lineHeight);
      if (!isFinite(lh)) lh = fs * 1.2;
      ctx.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + fs + 'px ' + cs.fontFamily;
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
      function width(s) { return ctx.measureText(s).width + ls * s.length; }

      var avail = Math.max(120, (host.parentElement ? host.parentElement.clientWidth : 0) || host.clientWidth || 600);

      // pecah tiap kelompok jadi baris sesuai lebar yang tersedia
      var lines = [];
      groups.forEach(function (g) {
        var words = g.split(' '), cur = '';
        words.forEach(function (w) {
          var test = cur ? cur + ' ' + w : w;
          if (cur && width(test) > avail) { lines.push(cur); cur = w; } else cur = test;
        });
        if (cur) lines.push(cur);
      });

      var m = ctx.measureText('Hg');
      var asc = m.fontBoundingBoxAscent || fs * 0.9;
      var desc = m.fontBoundingBoxDescent || fs * 0.2;

      var maxW = 0;
      lines.forEach(function (l) { maxW = Math.max(maxW, width(l)); });
      geo.w = Math.ceil(maxW) + 2;
      geo.h = Math.ceil(lines.length * lh);

      clip.innerHTML = '';
      strokeG.innerHTML = '';
      lines.forEach(function (l, i) {
        var y = i * lh + (lh - (asc + desc)) / 2 + asc;
        var common = { x: 0, y: y.toFixed(2) };
        var t1 = el('text', common, clip); t1.textContent = l;
        var t2 = el('text', common, strokeG); t2.textContent = l;
      });
      var txtStyle = 'font:' + cs.fontStyle + ' ' + cs.fontWeight + ' ' + fs + 'px ' + cs.fontFamily +
        ';letter-spacing:' + ls + 'px;';
      clip.setAttribute('style', txtStyle);
      strokeG.setAttribute('style', txtStyle);

      stage.style.width = geo.w + 'px';
      stage.style.height = geo.h + 'px';
      svg.setAttribute('width', geo.w);
      svg.setAttribute('height', geo.h);
      svg.setAttribute('viewBox', '0 0 ' + geo.w + ' ' + geo.h);

      // media dibuat lebih besar dari area teks (fillScale) supaya bisa digeser
      inner.style.width = (geo.w * o.fillScale) + 'px';
      inner.style.height = (geo.h * o.fillScale) + 'px';
      inner.style.left = (-(geo.w * (o.fillScale - 1)) / 2) + 'px';
      inner.style.top = (-(geo.h * (o.fillScale - 1)) / 2) + 'px';
      if (spot) spot.style.setProperty('--mh-r', o.spotlightRadius + 'px');
    }

    // ---- parallax + spotlight mengikuti kursor ----
    var tx = 0, ty = 0, cx = 0, cy = 0, zoom = 1, zoomT = 1, raf = 0, inView = false;
    var sx = -9999, sy = -9999;

    function tick() {
      raf = 0;
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08; zoom += (zoomT - zoom) * 0.08;
      inner.style.transform = 'translate3d(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px,0) scale(' + zoom.toFixed(4) + ')';
      var moving = Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05 || Math.abs(zoomT - zoom) > 0.0005;
      if (moving && inView) raf = requestAnimationFrame(tick);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(tick); }

    function onMove(e) {
      if (!inView) return;
      var r = stage.getBoundingClientRect();
      if (!r.width) return;
      var nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      var ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      nx = Math.max(-1, Math.min(1, nx)); ny = Math.max(-1, Math.min(1, ny));
      // jangan sampai tepi media kelihatan
      var maxX = Math.min(o.parallax, (geo.w * (o.fillScale - 1)) / 2);
      var maxY = Math.min(o.parallax, (geo.h * (o.fillScale - 1)) / 2);
      tx = -nx * maxX; ty = -ny * maxY;
      var over = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      zoomT = over ? o.hoverZoom : 1;
      if (spot) {
        sx = e.clientX - r.left; sy = e.clientY - r.top;
        spot.style.setProperty('--mh-x', sx + 'px');
        spot.style.setProperty('--mh-y', sy + 'px');
        spot.style.opacity = '1';
      }
      kick();
    }
    function onLeave() {
      tx = ty = 0; zoomT = 1;
      if (spot) spot.style.opacity = '0';
      kick();
    }

    if (!reduced && global.matchMedia('(pointer:fine)').matches) {
      global.addEventListener('pointermove', onMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', onLeave);
    }

    // ---- reveal ----
    var revealed = false;
    function play() {
      if (revealed) return;
      revealed = true;
      stage.style.setProperty('--mh-dur', (reduced ? 0 : o.duration) + 's');
      requestAnimationFrame(function () { requestAnimationFrame(function () { stage.classList.add('mh-in'); }); });
      if (o.mediaType === 'video' && !reduced) { var p = node.play(); if (p && p.catch) p.catch(function () {}); }
    }

    var io = null;
    if (o.reveal === 'none') { stage.classList.add('mh-in', 'mh-instant'); revealed = true; }
    if ('IntersectionObserver' in global) {
      io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          inView = e.isIntersecting;
          if (o.mediaType === 'video' && !reduced && revealed) {
            if (inView) { var p = node.play(); if (p && p.catch) p.catch(function () {}); } else node.pause();
          }
          if (e.isIntersecting && o.trigger === 'view') play();
        });
      }, { threshold: 0.25 });
      io.observe(stage);
    } else { inView = true; if (o.trigger === 'view') play(); }
    if (o.trigger === 'load') play();
    if (o.trigger === 'hover') host.addEventListener('pointerenter', play, { once: true });

    // ---- hitung ulang saat font / ukuran berubah ----
    var rt = 0;
    function relayout() { clearTimeout(rt); rt = setTimeout(layout, 80); }
    layout();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
    global.addEventListener('resize', relayout);

    var api = {
      destroy: function () {
        global.removeEventListener('resize', relayout);
        global.removeEventListener('pointermove', onMove);
        document.documentElement.removeEventListener('pointerleave', onLeave);
        if (io) io.disconnect();
        cancelAnimationFrame(raf);
        host.classList.remove('mh', 'mh-ready');
        host.innerHTML = original;
        host.__maskedHeading = null;
      },
      relayout: layout
    };
    host.__maskedHeading = api;
    return api;
  }

  global.MaskedHeading = { mount: mount, defaults: DEFAULTS };
})(window);

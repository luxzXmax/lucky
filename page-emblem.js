/* =========================================================
   PAGE EMBLEM — membuat logo animasi di pojok kanan halaman
   Pilih emblem lewat atribut di <body>, contoh:
     <body data-emblem="book">         (book, notebook, cap, trophy,
                                        route, cert, nib, pen, code)
     <body data-emblem="stack-3">      (tumpukan 3 buku = Semester 3)
   Kalau atribut tidak ada, dipilih otomatis dari nama file.
   ========================================================= */
(function () {
  'use strict';

  var A = 'a', GOLD = '#f2c14e';

  /* ---------- gambar ---------- */
  var ART = {

    /* Kelas X: buku terbuka, halaman berganti, pita pembatas bergoyang */
    book: function () {
      var leaf = '<path d="M100 64 C118 54 148 54 172 62 V146 C150 138 120 138 100 148 Z"/>';
      return '' +
      '<path class="dr f" style="--d:0" d="M100 64 C80 54 50 54 28 62 V146 C50 138 80 138 100 148 C120 138 150 138 172 146 V62 C150 54 120 54 100 64 Z"/>' +
      '<path class="dr" style="--d:.2" d="M100 64 V148"/>' +
      '<path class="dr a" style="--d:.3" d="M20 70 V154 C48 146 80 146 100 158 C120 146 152 146 180 154 V70"/>' +
      '<path class="dr" style="--d:.7" d="M42 80 C54 77 68 77 86 82"/>' +
      '<path class="dr" style="--d:.8" d="M42 94 C54 91 68 91 86 96"/>' +
      '<path class="dr" style="--d:.9" d="M42 108 C54 105 68 105 86 110"/>' +
      '<path class="dr" style="--d:1" d="M42 122 C52 120 62 120 74 123"/>' +
      '<path class="dr" style="--d:.8" d="M114 82 C132 77 146 77 158 80"/>' +
      '<path class="dr" style="--d:.9" d="M114 96 C132 91 146 91 158 94"/>' +
      '<path class="dr" style="--d:1" d="M114 110 C132 105 146 105 158 108"/>' +
      '<g class="leaf" style="--l:0"><g class="fb" style="fill-opacity:.9;fill:#1a1612">' + leaf + '</g><g class="a">' + leaf + '</g></g>' +
      '<g class="leaf" style="--l:1"><g style="fill-opacity:.9;fill:#1a1612">' + leaf + '</g><g class="a">' + leaf + '</g></g>' +
      '<g class="rib"><path class="fs" d="M148 57 V168 L154 161 L160 168 V56 Z"/></g>';
    },

    /* Kelas XI: buku catatan spiral, pensil menulis */
    notebook: function () {
      var rings = '';
      for (var i = 0; i < 6; i++) rings += '<path class="dr" style="--d:' + (.3 + i * .06) + '" d="M44 ' + (64 + i * 16) + ' h14"/>';
      return '' +
      '<path class="dr f" d="M52 46 H150 a6 6 0 0 1 6 6 V152 a6 6 0 0 1 -6 6 H52 Z"/>' + rings +
      '<path class="dr a" style="--d:.5" d="M66 70 H140"/>' +
      '<path class="dr" style="--d:.9" d="M66 112 H140"/>' +
      '<path class="dr" style="--d:1" d="M66 128 H118"/>' +
      '<path class="scrib a" pathLength="1" d="M68 90 q6 -10 12 0 t12 0 t12 0 t12 0 t12 0 t12 0"/>' +
      '<g class="pencil" style="transform:translate(66px,88px) rotate(32deg)">' +
        '<path class="fs" d="M0 0 L-3 -9 H3 Z"/>' +
        '<path class="f" d="M-3 -9 H3 V-44 H-3 Z"/><path d="M-3 -44 V-9 M3 -44 V-9"/>' +
        '<path class="a" d="M-3 -50 a3 3 0 0 1 6 0 V-44 H-3 Z"/>' +
      '</g>';
    },

    /* Kelas XII: topi toga, tali jumbai berayun */
    cap: function () {
      return '<g class="capall">' +
      '<path class="dr f" d="M64 104 V130 C64 144 136 144 136 130 V104"/>' +
      '<path class="dr f a" style="--d:.3" d="M100 54 L170 86 L100 118 L30 86 Z"/>' +
      '<path class="dr" style="--d:.7" d="M100 86 L170 86"/>' +
      '<circle class="pop fs" style="--d:.9" cx="100" cy="86" r="3.5"/>' +
      '<g class="tassel"><path class="dr a" style="--d:.9" d="M170 86 V130"/>' +
      '<path class="pop fs" style="--d:1.3" d="M165 130 H175 L177 150 H163 Z"/></g></g>';
    },

    /* Semester N: tumpukan N buku, buku teratas terangkat sesekali */
    stack: function (n) {
      var out = '';
      for (var i = 0; i < n; i++) {
        var w = 104 + ((i * 29) % 4) * 10, h = 21;
        var x = 100 - w / 2 + (((i * 17) % 5) - 2) * 3, y = 168 - (i + 1) * (h + 3);
        var top = i === n - 1, sc = (i % 2) ? 'a' : '';
        var book = '<rect class="f ' + sc + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3"/>' +
          '<path d="M' + (x + 9) + ' ' + y + ' V' + (y + h) + ' M' + (x + 14) + ' ' + y + ' V' + (y + h) + '"/>' +
          '<path d="M' + (x + w - 7) + ' ' + (y + 6) + ' H' + (x + w) + ' M' + (x + w - 7) + ' ' + (y + h - 6) + ' H' + (x + w) + '"/>';
        if (top) book += '<text x="' + (x + w / 2 + 6) + '" y="' + (y + 15.5) + '" text-anchor="middle" style="font:italic 17px Instrument Serif,Georgia,serif;fill:' + GOLD + ';stroke:none">' + n + '</text>';
        out += '<g class="bk" style="--i:' + i + '">' + (top ? '<g class="lift" style="--i:' + i + '">' + book + '</g>' : book) + '</g>';
      }
      return out + '<path class="dr" style="--d:.1" d="M40 170 H160"/>';
    },

    /* Prestasi: trofi dengan kilau menyapu */
    trophy: function () {
      var cup = 'M70 56 H130 V84 C130 108 116 120 100 122 C84 120 70 108 70 84 Z';
      return '<defs><clipPath id="emCup"><path d="' + cup + '"/></clipPath></defs>' +
      '<path class="dr f" d="' + cup + '"/>' +
      '<path class="dr" style="--d:.2" d="M70 66 H54 C54 88 62 96 74 98"/>' +
      '<path class="dr" style="--d:.2" d="M130 66 H146 C146 88 138 96 126 98"/>' +
      '<path class="dr" style="--d:.4" d="M100 122 V142"/>' +
      '<path class="dr a" style="--d:.5" d="M78 142 H122 V154 H78 Z"/>' +
      '<path class="dr" style="--d:.6" d="M68 154 H132 V162 H68 Z"/>' +
      '<g clip-path="url(#emCup)"><path class="shine" d="M60 50 L74 50 L52 130 L38 130 Z" style="fill:#ece4d3;fill-opacity:.28;stroke:none"/></g>' +
      '<path class="fs starp" d="M100 70 l4.2 8.6 9.4 1.3 -6.8 6.6 1.6 9.4 -8.4 -4.4 -8.4 4.4 1.6 -9.4 -6.8 -6.6 9.4 -1.3 Z"/>';
    },

    /* Pengalaman: rute dari titik awal ke bendera, titik bergerak menyusuri */
    route: function () {
      var p = 'M34 150 C60 150 56 110 84 108 S118 128 132 96 S150 70 160 56';
      return '<path d="' + p + '" style="stroke-dasharray:2 6;stroke-opacity:.5"/>' +
      '<path class="dr a" d="' + p + '"/>' +
      '<circle class="pop f" style="--d:.5" cx="34" cy="150" r="5"/>' +
      '<circle class="pop f" style="--d:.9" cx="84" cy="108" r="5"/>' +
      '<circle class="pop f" style="--d:1.2" cx="132" cy="96" r="5"/>' +
      '<path class="dr" style="--d:1" d="M160 56 V28"/>' +
      '<path class="flag fs" d="M160 28 L186 36 L160 44 Z"/>' +
      '<circle r="3.6" class="fs"><animateMotion dur="4s" begin="1.2s" repeatCount="indefinite" path="' + p + '" keyTimes="0;.85;1" keyPoints="0;1;1" calcMode="linear"/></circle>';
    },

    /* Sertifikat: piagam, segel distempel */
    cert: function () {
      var pts = '';
      for (var i = 0; i < 32; i++) {
        var r = i % 2 ? 13 : 16, a = i * Math.PI / 16;
        pts += (i ? 'L' : 'M') + (r * Math.cos(a)).toFixed(1) + ' ' + (r * Math.sin(a)).toFixed(1);
      }
      return '' +
      '<path class="dr f" d="M38 54 H162 V144 H38 Z"/>' +
      '<path class="dr" style="--d:.3;stroke-opacity:.5" d="M46 62 H154 V136 H46 Z"/>' +
      '<path class="dr a" style="--d:.6" d="M70 82 H130"/>' +
      '<path class="dr" style="--d:.8" d="M62 98 H108"/>' +
      '<path class="dr" style="--d:.9" d="M62 110 H96"/>' +
      '<g transform="translate(138 130)"><path d="M-8 10 L-12 34 L-4 28 L2 36 L4 10" class="a" style="fill:' + GOLD + ';fill-opacity:.2"/>' +
      '<g class="seal"><path class="fs" d="' + pts + 'Z"/><circle r="8.5" style="stroke:#14110e;stroke-width:1.4"/></g></g>';
    },

    /* Karya Tulisan: mata pena menulis garis tinta */
    nib: function () {
      var p = 'M40 148 C54 112 72 168 90 136 S122 112 138 142 S162 150 168 132';
      return '<path class="ink a" pathLength="1" d="' + p + '"/>' +
      '<path d="M36 156 H172" style="stroke-opacity:.35;stroke-dasharray:2 6"/>' +
      '<g><g transform="rotate(28)"><g>' +
        '<path class="f" d="M0 0 L-10 -28 C-11 -42 -7 -52 0 -58 C7 -52 11 -42 10 -28 Z"/>' +
        '<path d="M0 0 V-24"/><circle cx="0" cy="-30" r="3" class="a"/>' +
        '<path d="M-9 -44 H9" style="stroke-opacity:.5"/>' +
      '</g></g>' +
      '<animateMotion dur="4s" begin="1s" repeatCount="indefinite" path="' + p + '" keyTimes="0;.75;1" keyPoints="0;1;1" calcMode="linear"/></g>';
    },

    /* Poster Design: bingkai poster dengan kurva bezier + titik jangkar */
    pen: function () {
      return '' +
      '<path class="dr f" d="M52 38 H148 V162 H52 Z"/>' +
      '<path class="dr" style="--d:.3;stroke-opacity:.35" d="M60 46 H140 V154 H60 Z"/>' +
      '<path class="curve dr a" style="--d:.6" d="M62 128 C 82 76, 112 150, 138 78"/>' +
      '<path d="M62 128 L82 76 M138 78 L112 150" style="stroke-opacity:.45;stroke-width:1"/>' +
      '<g class="anch"><circle class="pop" style="--d:1" cx="82" cy="76" r="3.4"/><circle class="pop" style="--d:1.1" cx="112" cy="150" r="3.4"/></g>' +
      '<rect class="pop fs" style="--d:.9" x="58" y="124" width="8" height="8"/>' +
      '<rect class="pop fs" style="--d:1" x="134" y="74" width="8" height="8"/>';
    },

    /* Project dan Karya: jendela editor, baris kode ditulis, kursor berkedip */
    code: function () {
      return '' +
      '<path class="dr f" d="M36 56 H164 a8 8 0 0 1 8 8 V144 a8 8 0 0 1 -8 8 H36 a8 8 0 0 1 -8 -8 V64 a8 8 0 0 1 8 -8 Z"/>' +
      '<path class="dr" style="--d:.3" d="M28 78 H172"/>' +
      '<circle class="pop fs" style="--d:.5" cx="42" cy="67" r="2.6"/><circle class="pop" style="--d:.6" cx="52" cy="67" r="2.6"/><circle class="pop" style="--d:.7" cx="62" cy="67" r="2.6"/>' +
      '<path class="code a" style="--k:0" pathLength="1" d="M44 94 H78"/>' +
      '<path class="code" style="--k:1" pathLength="1" d="M56 108 H118"/>' +
      '<path class="code" style="--k:2" pathLength="1" d="M56 122 H100"/>' +
      '<path class="code a" style="--k:3" pathLength="1" d="M44 136 H66"/>' +
      '<rect class="cursor fs" x="72" y="130" width="3" height="12"/>';
    }
  };

  /* ---------- pilih emblem ---------- */
  function pick() {
    var d = document.body.getAttribute('data-emblem');
    if (d) return d;
    var f = (location.pathname.split('/').pop() || '').replace('.html', '');
    var m = f.match(/^semester(\d)$/);
    if (m) return 'stack-' + m[1];
    return ({ 'school': 'book', 'school-xi': 'notebook', 'school-xii': 'cap',
      'project-1': 'code', 'project-2': 'pen', 'project-3': 'trophy',
      'pengalaman': 'route', 'sertifikat': 'cert', 'karya-tulisan': 'nib' })[f] || '';
  }

  function build() {
    var key = pick(), main = document.querySelector('main');
    if (!key || !main) return;
    var parts = key.split('-'), name = parts[0], n = parseInt(parts[1], 10) || 3;
    if (!ART[name]) return;

    var svg = ART[name](n).replace(/class="dr/g, 'pathLength="1" class="dr');
    var box = document.createElement('div');
    box.className = 'emblem';
    box.setAttribute('aria-hidden', 'true');
    box.innerHTML = '<svg viewBox="0 0 200 200" focusable="false">' + svg + '</svg>';
    main.insertBefore(box, main.firstChild);

    function play() { box.classList.remove('in'); void box.offsetWidth; box.classList.add('in'); }
    setTimeout(play, 120);
    box.addEventListener('click', play);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();

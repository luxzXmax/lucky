/* protect.js — proteksi ringan sisi-klien (buatan sendiri, tanpa payload eksternal).
   1) Anti-clickjacking: halaman tidak boleh ditanam di iframe situs lain.
   2) Menambah rel="noopener noreferrer" pada semua link target=_blank. */
(function () {
  'use strict';
  try {
    if (window.top !== window.self) {
      // Ditanam di frame lain -> sembunyikan dan coba keluar dari frame
      document.documentElement.style.display = 'none';
      window.top.location = window.self.location;
    }
  } catch (e) {
    document.documentElement.style.display = 'none';
  }
  function hardenLinks(root) {
    (root || document).querySelectorAll('a[target="_blank"]').forEach(function (a) {
      var rel = (a.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
      ['noopener', 'noreferrer'].forEach(function (r) { if (rel.indexOf(r) < 0) rel.push(r); });
      a.setAttribute('rel', rel.join(' '));
    });
  }
  document.addEventListener('DOMContentLoaded', function () {
    hardenLinks();
    new MutationObserver(function () { hardenLinks(); })
      .observe(document.body, { childList: true, subtree: true });
  });
})();

// Orbit Images effect for the existing static HTML portfolio.
(() => {
  const ring = document.querySelector('.profile-orbit-ring');
  if (!ring) return;
  // Pause the orbit while the visitor is interacting with the gallery.
  ring.addEventListener('mouseenter', () => { ring.style.animationPlayState = 'paused'; });
  ring.addEventListener('mouseleave', () => { ring.style.animationPlayState = 'running'; });
  ring.addEventListener('touchstart', () => { ring.style.animationPlayState = 'paused'; }, { passive: true });
  ring.addEventListener('touchend', () => { ring.style.animationPlayState = 'running'; }, { passive: true });
})();

/* SOY wishlist — heart toggle on product cards (front-end only) */
(function () {
  function toggle(e) {
    var btn = e.target.closest('[data-soy-wish]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    btn.classList.toggle('is-active');
    btn.setAttribute(
      'aria-label',
      btn.classList.contains('is-active') ? 'Remove from wishlist' : 'Add to wishlist'
    );
  }
  document.addEventListener('click', toggle);
})();

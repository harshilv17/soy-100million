/* SOY collection facets — auto-submit on desktop, drawer stays CSS-driven */
(function () {
  function onChange(e) {
    var input = e.target.closest('[data-soy-facet]');
    if (!input) return;
    // On desktop, apply instantly. On mobile the user taps "Show N styles".
    if (window.matchMedia('(min-width: 990px)').matches) {
      var form = input.form;
      if (form) form.submit();
    }
  }
  document.addEventListener('change', onChange);

  // Close the mobile drawer after submit isn't needed (page reloads).
})();

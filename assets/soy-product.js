/* =====================================================================
   SOY — Product (PDP) behaviour.
   Gallery, variant resolution, customize toggle, accordions,
   mobile sticky add-to-cart, notify toggle.
   ===================================================================== */
(function () {
  'use strict';

  function money(cents) {
    return '₹' + Math.round(cents / 100).toLocaleString('en-IN');
  }

  function initPdp(root) {
    if (root.dataset.soyInit) return;
    root.dataset.soyInit = '1';

    /* ---------- Gallery ---------- */
    var thumbs = root.querySelectorAll('[data-soy-thumb]');
    var slides = root.querySelectorAll('[data-soy-slide]');
    var dots = root.querySelectorAll('[data-soy-dot]');

    function showSlide(i) {
      slides.forEach(function (s) { s.classList.toggle('is-active', s.dataset.soySlide == i); });
      thumbs.forEach(function (t) { t.classList.toggle('is-active', t.dataset.soyThumb == i); });
      dots.forEach(function (d) { d.classList.toggle('is-active', d.dataset.soyDot == i); });
    }
    thumbs.forEach(function (t) { t.addEventListener('click', function () { showSlide(t.dataset.soyThumb); }); });
    dots.forEach(function (d) { d.addEventListener('click', function () { showSlide(d.dataset.soyDot); }); });

    /* swipe on stage (mobile) */
    var stage = root.querySelector('.soy-gallery__stage');
    if (stage) {
      var startX = 0, cur = 0;
      stage.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
        cur = parseInt(root.querySelector('.soy-gallery__slide.is-active').dataset.soySlide, 10) || 0;
      }, { passive: true });
      stage.addEventListener('touchend', function (e) {
        var dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) < 40) return;
        var next = dx < 0 ? cur + 1 : cur - 1;
        if (next >= 0 && next < slides.length) showSlide(next);
      }, { passive: true });
    }

    /* ---------- Variant resolution ---------- */
    var variants = [];
    var vEl = root.querySelector('[data-soy-variants]');
    try { variants = JSON.parse(vEl.textContent.trim()) || []; } catch (e) { variants = []; }

    var varIdInput = root.querySelector('[data-soy-varid]');
    var priceEl = root.querySelector('[data-soy-price]');
    var compareEl = root.querySelector('[data-soy-compare]');
    var addPriceEl = root.querySelector('[data-soy-addprice]');
    var stickyPriceEl = root.querySelector('[data-soy-sticky-price]');
    var stickySizeEl = root.querySelector('[data-soy-sticky-size]');
    var buyzone = root.querySelector('[data-soy-buyzone]');
    var notify = root.querySelector('[data-soy-notify]');
    var soldoutBadge = root.querySelector('[data-soy-soldout]');
    var addBtn = root.querySelector('[data-soy-add]');

    function selectedValues() {
      var map = {};
      root.querySelectorAll('[data-soy-opt].is-active').forEach(function (b) {
        map[b.dataset.soyOpt] = b.dataset.soyValue;
      });
      return map;
    }

    function setAvailable(avail) {
      if (buyzone) buyzone.hidden = !avail;
      if (notify) notify.hidden = avail;
      if (soldoutBadge) soldoutBadge.style.display = avail ? 'none' : '';
    }

    function resolveVariant() {
      if (!variants.length) return; // demo mode
      var sel = selectedValues();
      var match = variants.find(function (v) {
        return v.options.every(function (val, idx) { return sel[idx + 1] === undefined || sel[idx + 1] === val; });
      });
      if (!match) return;

      if (varIdInput) { varIdInput.value = match.id; varIdInput.disabled = !match.available; }

      var nowTxt = money(match.price);
      if (priceEl) priceEl.textContent = nowTxt;
      if (addPriceEl) addPriceEl.textContent = nowTxt;
      if (stickyPriceEl) stickyPriceEl.textContent = nowTxt;
      if (compareEl) compareEl.textContent = match.compare_at_price > match.price ? money(match.compare_at_price) : '';
      if (stickySizeEl) stickySizeEl.textContent = ' · ' + match.title;

      setAvailable(match.available);
      // update url (variant) without reload
      try {
        var u = new URL(window.location.href);
        u.searchParams.set('variant', match.id);
        window.history.replaceState({}, '', u);
      } catch (e) {}
    }

    /* real option buttons */
    root.querySelectorAll('[data-soy-opt]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.disabled) return;
        var pos = btn.dataset.soyOpt;
        root.querySelectorAll('[data-soy-opt="' + pos + '"]').forEach(function (s) { s.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var sel = root.querySelector('[data-soy-optsel="' + pos + '"]');
        if (sel) sel.textContent = btn.dataset.soyValue;
        resolveVariant();
      });
    });

    /* demo size/colour (visual only) */
    root.querySelectorAll('[data-soy-demosize]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.disabled) return;
        root.querySelectorAll('[data-soy-demosize]').forEach(function (s) { s.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var sz = btn.dataset.soyDemosize;
        var lbl = root.querySelector('.soy-opt__name b');
        if (stickySizeEl) stickySizeEl.textContent = ' · Size ' + sz;
        root.querySelectorAll('.soy-opt__name b').forEach(function (b) {
          if (b.previousSibling && /Size/.test(b.parentNode.textContent)) b.textContent = sz;
        });
      });
    });
    root.querySelectorAll('[data-soy-demoswatch]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        root.querySelectorAll('[data-soy-demoswatch]').forEach(function (s) { s.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var sel = root.querySelector('[data-soy-optsel="1"]');
        if (sel) sel.textContent = btn.dataset.soyDemoswatch;
      });
    });

    /* ---------- Customize toggle ---------- */
    var custToggle = root.querySelector('[data-soy-customize-toggle]');
    var mtmInput = root.querySelector('[data-soy-mtm]');
    if (custToggle) {
      custToggle.addEventListener('click', function () {
        var on = custToggle.getAttribute('aria-pressed') === 'true';
        custToggle.setAttribute('aria-pressed', String(!on));
        if (mtmInput) { mtmInput.disabled = on; mtmInput.value = on ? '' : 'Yes — send measurements after checkout'; }
      });
    }

    /* ---------- Accordions ---------- */
    root.querySelectorAll('[data-soy-acc] .soy-acc__head').forEach(function (head) {
      var body = head.nextElementSibling;
      function setOpen(open) {
        head.setAttribute('aria-expanded', String(open));
        body.style.maxHeight = open ? body.scrollHeight + 'px' : '0px';
      }
      if (head.getAttribute('aria-expanded') === 'true') {
        requestAnimationFrame(function () { body.style.maxHeight = body.scrollHeight + 'px'; });
      }
      head.addEventListener('click', function () {
        setOpen(head.getAttribute('aria-expanded') !== 'true');
      });
    });

    /* ---------- Mobile sticky bar ---------- */
    var sticky = root.querySelector('[data-soy-sticky]');
    var anchor = root.querySelector('.soy-buy') || buyzone;
    if (sticky && anchor && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var show = !en.isIntersecting && en.boundingClientRect.top < 0;
          sticky.classList.toggle('is-visible', show);
          sticky.setAttribute('aria-hidden', String(!show));
        });
      }, { threshold: 0 });
      io.observe(anchor);
    }
    var stickyAdd = root.querySelector('[data-soy-sticky-add]');
    if (stickyAdd && addBtn) {
      stickyAdd.addEventListener('click', function (e) { e.preventDefault(); addBtn.click(); });
    }

    // init
    resolveVariant();
  }

  function boot() {
    document.querySelectorAll('[data-soy-pdp]').forEach(initPdp);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  // Shopify theme editor re-render
  document.addEventListener('shopify:section:load', function (e) {
    var el = e.target.querySelector('[data-soy-pdp]');
    if (el) initPdp(el);
  });
})();

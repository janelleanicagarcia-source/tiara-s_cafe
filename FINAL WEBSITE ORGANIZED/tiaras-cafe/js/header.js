/* Header: mobile menu toggle and highlighting the current section in the nav. */
(function () {
  'use strict';
  var TC = window.TC;
  var $ = TC.$,
    $$ = TC.$$;

  /* ---------- Mobile nav ---------- */
  var nav = $('#nav'),
    toggle = $('#nav-toggle');
  toggle.addEventListener('click', function () {
    var o = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', o ? 'true' : 'false');
  });
  $$('a', nav).forEach(function (l) {
    l.addEventListener('click', function () {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
  if ('IntersectionObserver' in window) {
    var map = { home: 0, about: 1, menu: 2, reservation: 3, reviews: 4, contact: 5 },
      links = $$('a', nav);
    var io = new IntersectionObserver(
      function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && map[e.target.id] !== undefined) {
            links.forEach(function (l, i) {
              if (i === map[e.target.id]) l.setAttribute('aria-current', 'true');
              else l.removeAttribute('aria-current');
            });
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }
})();

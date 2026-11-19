/* Contact / footer: Facebook link and copy-number buttons. */
(function () {
  'use strict';
  var TC = window.TC;
  var $ = TC.$,
    $$ = TC.$$,
    copyText = TC.copyText;

  /* ---------- Facebook link: paste the page URL here to turn the footer text into a link ---------- */
  var FACEBOOK_URL = '';
  if (FACEBOOK_URL) {
    var fb = $('#fb');
    fb.textContent = '';
    var a = document.createElement('a');
    a.href = FACEBOOK_URL;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = "Tiara's Café Facebook Page";
    fb.appendChild(a);
  }

  $$('[data-copy]').forEach(function (b) {
    var idle = b.textContent;
    b.addEventListener('click', function () {
      copyText(b.getAttribute('data-copy'), b, idle);
    });
  });
})();

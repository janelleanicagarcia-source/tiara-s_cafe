/* Shared helpers. Loaded first; other scripts read them from window.TC. */
(function () {
  'use strict';

  var $ = function (s, r) {
    return (r || document).querySelector(s);
  };
  var $$ = function (s, r) {
    return Array.prototype.slice.call((r || document).querySelectorAll(s));
  };
  var PESO = '₱';
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function setErr(id, msg) {
    var f = document.getElementById(id),
      e = document.getElementById('err-' + id);
    if (e) e.textContent = msg;
    if (f) {
      if (msg) f.setAttribute('aria-invalid', 'true');
      else f.removeAttribute('aria-invalid');
    }
  }

  function copyText(text, btn, idle) {
    var done = function (ok) {
      var o = idle || btn.textContent;
      btn.textContent = ok ? 'Copied' : 'Select and copy';
      setTimeout(function () {
        btn.textContent = o;
      }, 1800);
    };
    var fallback = function () {
      var ok = false;
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch (e) {}
      done(ok);
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          done(true);
        }, fallback);
      } else fallback();
    } catch (e) {
      fallback();
    }
  }

  window.TC = { $: $, $$: $$, PESO: PESO, esc: esc, setErr: setErr, copyText: copyText };
})();

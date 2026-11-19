/* Reviews: list, rating form and local storage. */
(function () {
  'use strict';
  var TC = window.TC;
  var $ = TC.$,
    setErr = TC.setErr;

  /* ---------- Reviews ---------- */
  var KEY = 'tiaras-reviews-v1',
    reviews = [];
  try {
    reviews = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(reviews)) reviews = [];
  } catch (e) {
    reviews = [];
  }
  function renderReviews() {
    var list = $('#review-list');
    list.textContent = '';
    if (!reviews.length) {
      var p = document.createElement('p');
      p.className = 'empty';
      p.textContent = 'Customer reviews will appear here.';
      list.appendChild(p);
      return;
    }
    reviews
      .slice()
      .reverse()
      .forEach(function (r) {
        var a = document.createElement('article');
        a.className = 'review';
        var s = document.createElement('div');
        s.className = 'stars';
        s.setAttribute('role', 'img');
        s.setAttribute('aria-label', r.rating + ' out of 5 stars');
        s.textContent = new Array(r.rating + 1).join('★') + new Array(6 - r.rating).join('☆');
        var p = document.createElement('p');
        p.textContent = r.comment;
        var m = document.createElement('small');
        m.textContent = r.date;
        a.appendChild(s);
        a.appendChild(p);
        a.appendChild(m);
        list.appendChild(a);
      });
  }
  renderReviews();
  $('#review-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var rating = Number($('#rv-rating').value),
      comment = $('#rv-comment').value.trim(),
      bad = false;
    setErr('rv-rating', rating ? '' : 'Select a rating.');
    setErr('rv-comment', comment.length >= 3 ? '' : 'Tell us a little about your visit.');
    if (!rating) {
      $('#rv-rating').focus();
      bad = true;
    } else if (comment.length < 3) {
      $('#rv-comment').focus();
      bad = true;
    }
    if (bad) return;
    reviews.push({
      rating: rating,
      comment: comment,
      date: new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }),
    });
    try {
      localStorage.setItem(KEY, JSON.stringify(reviews));
    } catch (err) {}
    $('#review-form').reset();
    renderReviews();
    $('#rv-status').textContent = 'Thank you for sharing your experience!';
  });
  ['rv-rating', 'rv-comment'].forEach(function (id) {
    var f = document.getElementById(id);
    var c = function () {
      setErr(id, '');
    };
    f.addEventListener('input', c);
    f.addEventListener('change', c);
  });
})();

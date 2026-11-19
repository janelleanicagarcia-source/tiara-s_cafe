/* Menu: sample menu data, rendering and search. */
(function () {
  'use strict';
  var TC = window.TC;
  var $ = TC.$,
    $$ = TC.$$,
    PESO = TC.PESO,
    esc = TC.esc;

  /* ---------- Menu data: SAMPLE sizes and prices (edit here) ---------- */
  var D2 = ['12oz', '16oz'];
  var MENU = [
    {
      id: 'coffee',
      title: 'Coffee',
      note: 'Iced',
      sizes: D2,
      items: [
        ['Americano', 59, 79, 'assets/americano.jpg'],
        ['Americano Caramel', 69, 89, 'assets/americano.jpg'],
        ['Americano Hazelnut', 69, 89],
        ['Americano Vanilla', 69, 89],
        ['Ube Coffee', 79, 99],
        ['Caramel Coffee', 79, 99],
        ['Salted Caramel', 79, 99],
        ['Vanilla Coffee', 79, 99],
        ['Mocha Coffee', 79, 99],
        ['Salted Caramel Mocha', 89, 109],
        ['Barista Drink', 89, 109],
        ['Dirty Matcha', 99, 119],
        ['Spanish Latte', 89, 109],
      ],
    },
    {
      id: 'blends',
      title: 'Non-Coffee Blends',
      note: 'Iced',
      sizes: D2,
      items: [
        ['Strawberry Mocha', 89, 109],
        ['Strawberry Matcha', 99, 119],
        ['Matcha Caramel', 99, 119],
        ['Blueberry Matcha', 99, 119],
      ],
    },
    {
      id: 'noncoffee',
      title: 'Non-Coffee',
      note: 'Iced',
      sizes: D2,
      items: [
        ['Ube Milk', 79, 99],
        ['Mocha Milk', 79, 99],
        ['Matcha Milk', 89, 109],
        ['Blueberry Milk', 79, 99],
        ['Strawberry Milk', 79, 99],
        ['Choco Hazelnut', 79, 99],
        ['Choco Hazelnut Milk', 79, 99],
      ],
    },
    {
      id: 'soda',
      title: 'Fruit Soda',
      note: 'Iced',
      sizes: D2,
      items: [
        ['Lychee', 59, 79],
        ['Blueberry', 59, 79],
        ['Strawberry', 59, 79],
        ['Green Apple', 59, 79],
      ],
    },
    {
      id: 'food',
      title: 'Snacks and Food',
      note: '',
      sizes: ['per order'],
      food: true,
      items: [
        ['Pork Siomai', 49],
        ['Japanese Siomai', 59],
        ['Gyoza', 69],
        ['Carbonara', 89],
        ['Spaghetti', 79],
        ['Pancit Canton Original', 49],
        ['PC Hot & Spicy', 49],
        ['PC Sweet & Spicy', 49],
      ],
    },
  ];
  var CUP =
    '<svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 14h32l-4 38a4 4 0 0 1-4 3.6H24a4 4 0 0 1-4-3.6z"/><path d="M13 14h38"/><path d="M37 4l-4 10"/></svg>';
  var PLATE =
    '<svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="13"/></svg>';
  var chips = $('#menu-chips'),
    cats = $('#menu-cats');
  MENU.forEach(function (c) {
    chips.insertAdjacentHTML(
      'beforeend',
      '<a class="chip" href="#menu-' + c.id + '">' + esc(c.title) + '</a>',
    );
    var h =
      '<div class="cat" id="menu-' +
      c.id +
      '" data-title="' +
      esc(c.title.toLowerCase()) +
      '"><h3>' +
      esc(c.title) +
      (c.note ? ' <small>' + esc(c.note) + '</small>' : '') +
      '</h3><div class="items">';
    c.items.forEach(function (it) {
      var tile = it[3]
        ? '<img loading="lazy" src="' + it[3] + '" alt="' + esc(it[0]) + '">'
        : c.food
          ? PLATE
          : CUP;
      var price = c.food
        ? '<span><b>' + PESO + it[1] + '</b> per order</span>'
        : '<span>' +
          c.sizes[0] +
          ' <b>' +
          PESO +
          it[1] +
          '</b></span><span>' +
          c.sizes[1] +
          ' <b>' +
          PESO +
          it[2] +
          '</b></span>';
      h +=
        '<div class="item" data-name="' +
        esc(it[0].toLowerCase()) +
        '"><div class="tile">' +
        tile +
        '</div><h4>' +
        esc(it[0]) +
        '</h4><p class="price">' +
        price +
        '</p></div>';
    });
    cats.insertAdjacentHTML('beforeend', h + '</div></div>');
  });

  /* ---------- Menu search ---------- */
  var qi = $('#menu-search'),
    qc = $('#menu-clear'),
    qn = $('#menu-count'),
    qe = $('#menu-empty');
  function filterMenu() {
    var q = qi.value.trim().toLowerCase(),
      shown = 0;
    qc.hidden = !q;
    $$('.cat', cats).forEach(function (c) {
      var n = 0,
        catHit = q && c.getAttribute('data-title').indexOf(q) > -1;
      $$('.item', c).forEach(function (it) {
        var ok = !q || catHit || it.getAttribute('data-name').indexOf(q) > -1;
        it.hidden = !ok;
        if (ok) n++;
      });
      c.hidden = n === 0;
      shown += n;
      var chip = $('.chip[href="#' + c.id + '"]', chips);
      if (chip) chip.hidden = n === 0;
    });
    qn.textContent = q ? shown + (shown === 1 ? ' item found' : ' items found') : '';
    qe.hidden = !(q && shown === 0);
    if (q && shown === 0) $('#menu-q').textContent = qi.value.trim();
  }
  qi.addEventListener('input', filterMenu);
  qc.addEventListener('click', function () {
    qi.value = '';
    filterMenu();
    qi.focus();
  });
  qi.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && qi.value) {
      qi.value = '';
      filterMenu();
    }
  });
})();

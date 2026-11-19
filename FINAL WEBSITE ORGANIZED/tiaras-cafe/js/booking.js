/* Booking: calendar, time slots, 3-step form, validation and booking summary. */
(function () {
  'use strict';
  var TC = window.TC;
  var $ = TC.$,
    $$ = TC.$$,
    setErr = TC.setErr,
    copyText = TC.copyText;

  /* ---------- Booking ---------- */
  var MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  var DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  var SLOTS = ['8:00 AM – 11:00 AM', '11:00 AM – 2:00 PM', '2:00 PM – 5:00 PM', '5:00 PM – 8:00 PM'];
  /* SAMPLE availability for layout. Replace with real bookings. Values are slot numbers already taken (0 to 3). */
  var SAMPLE_BOOKED = {
    '2026-11-21': [1],
    '2026-11-22': [0, 1, 2, 3],
    '2026-11-26': [2],
    '2026-11-28': [0, 1],
    '2026-11-29': [3],
    '2026-12-05': [0, 1, 2, 3],
    '2026-12-06': [1, 2],
    '2026-12-12': [0],
    '2026-12-13': [0, 1, 2, 3],
    '2026-12-19': [2, 3],
    '2026-12-20': [1],
    '2026-12-24': [0, 1, 2, 3],
    '2026-12-25': [0, 1, 2, 3],
    '2026-12-31': [3],
    '2027-01-01': [0, 1, 2, 3],
  };
  function pad(n) {
    return (n < 10 ? '0' : '') + n;
  }
  function iso(y, m, d) {
    return y + '-' + pad(m + 1) + '-' + pad(d);
  }
  function parse(s) {
    var p = s.split('-').map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  }
  function addDays(s, n) {
    var d = parse(s);
    d.setDate(d.getDate() + n);
    return iso(d.getFullYear(), d.getMonth(), d.getDate());
  }
  function dayDiff(a, b) {
    return Math.round((parse(a) - parse(b)) / 86400000);
  }
  var now = new Date(),
    todayISO = iso(now.getFullYear(), now.getMonth(), now.getDate());
  var st = {
    y: now.getFullYear(),
    m: now.getMonth(),
    multi: false,
    start: null,
    end: null,
    slot: null,
    step: 1,
  };
  function taken(d) {
    return SAMPLE_BOOKED[d] || [];
  }
  function isFull(d) {
    return taken(d).length >= SLOTS.length;
  }
  function rangeDays() {
    if (!st.start) return [];
    var out = [],
      d = st.start;
    while (d <= st.end) {
      out.push(d);
      d = addDays(d, 1);
    }
    return out;
  }
  function slotTaken(i) {
    return rangeDays().some(function (d) {
      return taken(d).indexOf(i) > -1;
    });
  }
  function fmtDate(s) {
    var d = parse(s);
    return MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }
  function fmtRange() {
    if (!st.start) return '';
    if (st.start === st.end) return fmtDate(st.start);
    var a = parse(st.start),
      b = parse(st.end);
    if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear())
      return MONTHS[a.getMonth()] + ' ' + a.getDate() + ' – ' + b.getDate() + ', ' + a.getFullYear();
    return fmtDate(st.start) + ' – ' + fmtDate(st.end);
  }
  function pickDate(d) {
    var extend = st.multi && st.start && st.start === st.end && d > st.start && dayDiff(d, st.start) <= 2;
    if (extend) {
      var x = st.start;
      while (x <= d) {
        if (isFull(x)) {
          extend = false;
          break;
        }
        x = addDays(x, 1);
      }
    }
    if (extend) {
      st.end = d;
    } else {
      st.start = d;
      st.end = d;
    }
    if (st.slot !== null && slotTaken(st.slot)) st.slot = null;
    renderCal();
    renderSlots();
    updateStep1();
  }
  function renderCal() {
    var first = new Date(st.y, st.m, 1),
      days = new Date(st.y, st.m + 1, 0).getDate(),
      h = '';
    DOW.forEach(function (d) {
      h += '<span class="dow">' + d + '</span>';
    });
    for (var i = 0; i < first.getDay(); i++) h += '<span></span>';
    for (var d = 1; d <= days; d++) {
      var s = iso(st.y, st.m, d),
        cls = 'day',
        dis = false,
        label = MONTHS[st.m] + ' ' + d + ', ' + st.y,
        sel = st.start && s >= st.start && s <= st.end;
      if (s <= todayISO) {
        cls += ' past';
        dis = true;
        label += ', not available';
      } else if (isFull(s)) {
        cls += ' full';
        dis = true;
        label += ', fully booked';
      } else if (taken(s).length) {
        cls += ' res';
        label += ', some slots taken';
      } else label += ', available';
      if (sel) cls += ' sel';
      h +=
        '<button type="button" class="' +
        cls +
        '" data-d="' +
        s +
        '" aria-label="' +
        label +
        '" aria-pressed="' +
        (sel ? 'true' : 'false') +
        '"' +
        (dis ? ' disabled' : '') +
        '>' +
        d +
        '</button>';
    }
    $('#cal-grid').innerHTML = h;
    $('#cal-title').textContent = MONTHS[st.m] + ' ' + st.y;
    $('#cal-prev').disabled = st.y === now.getFullYear() && st.m === now.getMonth();
    var diff = (st.y - now.getFullYear()) * 12 + (st.m - now.getMonth());
    $('#cal-next').disabled = diff >= 12;
  }
  function renderSlots() {
    var h = '';
    SLOTS.forEach(function (t, i) {
      var tk = st.start && slotTaken(i);
      h +=
        '<button type="button" class="slot' +
        (tk ? ' taken' : '') +
        '" data-i="' +
        i +
        '" aria-pressed="' +
        (st.slot === i ? 'true' : 'false') +
        '"' +
        (!st.start || tk ? ' disabled' : '') +
        '>' +
        t +
        (tk ? ' (taken)' : '') +
        '</button>';
    });
    $('#slots').innerHTML = h;
  }
  function updateStep1() {
    var ok = st.start && st.slot !== null;
    $('#sel-summary').textContent = st.start
      ? 'Date: ' + fmtRange() + (st.slot !== null ? '  ·  Time: ' + SLOTS[st.slot] : '')
      : '';
    $('#step1-hint').textContent = ok
      ? ''
      : st.start
        ? 'Choose a time to continue.'
        : 'Choose a date and time to continue.';
    $('#to-2').disabled = !ok;
  }
  $('#cal-grid').addEventListener('click', function (e) {
    var b = e.target.closest('.day');
    if (b && !b.disabled) pickDate(b.getAttribute('data-d'));
  });
  $('#slots').addEventListener('click', function (e) {
    var b = e.target.closest('.slot');
    if (b && !b.disabled) {
      st.slot = Number(b.getAttribute('data-i'));
      renderSlots();
      updateStep1();
    }
  });
  $('#cal-prev').addEventListener('click', function () {
    st.m--;
    if (st.m < 0) {
      st.m = 11;
      st.y--;
    }
    renderCal();
  });
  $('#cal-next').addEventListener('click', function () {
    st.m++;
    if (st.m > 11) {
      st.m = 0;
      st.y++;
    }
    renderCal();
  });
  $('#multi').addEventListener('change', function (e) {
    st.multi = e.target.checked;
    if (!st.multi && st.start) {
      st.end = st.start;
      if (st.slot !== null && slotTaken(st.slot)) st.slot = null;
      renderCal();
      renderSlots();
      updateStep1();
    }
  });

  /* Steps */
  function go(n, scroll) {
    st.step = n;
    [1, 2, 3].forEach(function (i) {
      $('#step-' + i).hidden = i !== n;
    });
    $$('.step').forEach(function (el) {
      var i = Number(el.getAttribute('data-step'));
      el.classList.toggle('done', i < n);
      if (i === n) el.setAttribute('aria-current', 'step');
      else el.removeAttribute('aria-current');
      $('.dot', el).textContent = i < n ? '✓' : String(i);
    });
    if (n === 3) fillSummary();
    if (scroll) $('#wizard').scrollIntoView({ block: 'start' });
  }
  $('#to-2').addEventListener('click', function () {
    if (st.start && st.slot !== null) go(2, true);
  });
  $$('[data-go]').forEach(function (b) {
    b.addEventListener('click', function () {
      go(Number(b.getAttribute('data-go')), true);
    });
  });

  /* Validation */
  var rules = {
    'ev-type': function (v) {
      return v ? '' : 'Choose an event type.';
    },
    'ev-location': function (v) {
      return v.trim().length >= 5 ? '' : 'Enter the full event address.';
    },
    'ev-guests': function (v) {
      var n = Number(v);
      return v !== '' && Number.isInteger(n) && n >= 1 && n <= 1000
        ? ''
        : 'Enter the number of guests (1 or more).';
    },
    'bk-name': function (v) {
      return v.trim().length >= 2 ? '' : 'Enter your full name.';
    },
    'bk-contact': function (v) {
      return /^(09|\+639)\d{9}$/.test(v.replace(/[\s-]/g, ''))
        ? ''
        : 'Enter a Philippine mobile number, like 09XX XXX XXXX.';
    },
    'bk-email': function (v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter a valid email address.';
    },
  };
  Object.keys(rules).forEach(function (id) {
    var f = document.getElementById(id);
    var clear = function () {
      if (f.getAttribute('aria-invalid')) setErr(id, '');
    };
    f.addEventListener('input', clear);
    f.addEventListener('change', clear);
  });
  $('#bk-terms').addEventListener('change', function () {
    $('#err-bk-terms').textContent = '';
  });
  $('#to-3').addEventListener('click', function () {
    var firstBad = null;
    Object.keys(rules).forEach(function (id) {
      var msg = rules[id](document.getElementById(id).value);
      setErr(id, msg);
      if (msg && !firstBad) firstBad = id;
    });
    if (!$('#bk-terms').checked) {
      $('#err-bk-terms').textContent = 'Please accept the terms to continue.';
      if (!firstBad) firstBad = 'bk-terms';
    }
    if (firstBad) {
      document.getElementById(firstBad).focus();
      return;
    }
    go(3, true);
  });

  /* Summary */
  function val(id) {
    return document.getElementById(id).value.trim();
  }
  function pkgLabel() {
    var v = val('ev-package');
    return v
      ? {
          50: 'Package 1: 50 cups (₱6,500)',
          100: 'Package 2: 100 cups (₱10,500)',
          150: 'Package 3: 150 cups (₱14,500)',
        }[v]
      : 'Not sure yet';
  }
  function bookingText() {
    return [
      "Tiara's Café booking request",
      'Status: Pending (waiting for 50% down payment)',
      '',
      'Event type: ' + val('ev-type'),
      'Date: ' + fmtRange(),
      'Time: ' + SLOTS[st.slot],
      'Location: ' + val('ev-location'),
      'Guests: ' + val('ev-guests'),
      'Package: ' + pkgLabel(),
      '',
      'Full name: ' + val('bk-name'),
      'Contact: ' + val('bk-contact'),
      'Email: ' + val('bk-email'),
      'Additional requests: ' + (val('ev-message') || 'None'),
    ].join('\n');
  }
  function fillSummary() {
    var set = function (id, t) {
      $('#' + id).textContent = t;
    };
    set('sm-type', val('ev-type'));
    set('sm-date', fmtRange());
    set('sm-time', SLOTS[st.slot]);
    set('sm-location', val('ev-location'));
    set('sm-guests', val('ev-guests'));
    set('sm-package', pkgLabel());
    set('sm-name', val('bk-name'));
    set('sm-contact', val('bk-contact'));
    set('sm-email', val('bk-email'));
    set('sm-message', val('ev-message') || 'None');
    $('#bk-text').value = bookingText();
  }
  $$('[data-pkg]').forEach(function (a) {
    a.addEventListener('click', function () {
      $('#ev-package').value = a.getAttribute('data-pkg');
    });
  });

  $('#copy-booking').addEventListener('click', function (e) {
    var b = e.currentTarget;
    copyText($('#bk-text').value, b, 'Copy booking details');
    $('#bk-text').select();
  });

  /* init */
  renderCal();
  renderSlots();
  updateStep1();
})();

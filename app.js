/* Panchang Calendar — app logic.
   Depends on: astronomy.browser.min.js (global Astronomy), panchang.js (global Panchang), festivals.js (global FESTIVALS). */
(function () {
  'use strict';
  var P = window.Panchang, A = window.Astronomy;
  var C = P.constants;
  var IST = 5.5 * 3600 * 1000, DAY = 86400000;

  // ---------- cities ----------
  var CITIES = [
    { key: 'delhi', name: 'Delhi', hi: 'दिल्ली', lat: 28.6139, lng: 77.2090 },
    { key: 'mumbai', name: 'Mumbai', hi: 'मुंबई', lat: 19.0760, lng: 72.8777 },
    { key: 'varanasi', name: 'Varanasi', hi: 'वाराणसी', lat: 25.3176, lng: 82.9739 },
    { key: 'bengaluru', name: 'Bengaluru', hi: 'बेंगलुरु', lat: 12.9716, lng: 77.5946 },
    { key: 'kolkata', name: 'Kolkata', hi: 'कोलकाता', lat: 22.5726, lng: 88.3639 },
    { key: 'chennai', name: 'Chennai', hi: 'चेन्नई', lat: 13.0827, lng: 80.2707 },
    { key: 'hyderabad', name: 'Hyderabad', hi: 'हैदराबाद', lat: 17.3850, lng: 78.4867 },
    { key: 'ahmedabad', name: 'Ahmedabad', hi: 'अहमदाबाद', lat: 23.0225, lng: 72.5714 },
    { key: 'pune', name: 'Pune', hi: 'पुणे', lat: 18.5204, lng: 73.8567 },
    { key: 'jaipur', name: 'Jaipur', hi: 'जयपुर', lat: 26.9124, lng: 75.7873 },
    { key: 'lucknow', name: 'Lucknow', hi: 'लखनऊ', lat: 26.8467, lng: 80.9462 },
    { key: 'bhopal', name: 'Bhopal', hi: 'भोपाल', lat: 23.2599, lng: 77.4126 },
    { key: 'patna', name: 'Patna', hi: 'पटना', lat: 25.5941, lng: 85.1376 },
    { key: 'guwahati', name: 'Guwahati', hi: 'गुवाहाटी', lat: 26.1445, lng: 91.7362 },
    { key: 'bhubaneswar', name: 'Bhubaneswar', hi: 'भुवनेश्वर', lat: 20.2961, lng: 85.8245 },
    { key: 'thiruvananthapuram', name: 'Thiruvananthapuram', hi: 'तिरुवनंतपुरम', lat: 8.5241, lng: 76.9366 },
    { key: 'amritsar', name: 'Amritsar', hi: 'अमृतसर', lat: 31.6340, lng: 74.8723 },
    { key: 'srinagar', name: 'Srinagar', hi: 'श्रीनगर', lat: 34.0837, lng: 74.7973 },
    { key: 'nepal', name: 'Kathmandu', hi: 'काठमांडू', lat: 27.7172, lng: 85.3240 }
  ];

  var COLORS = ['#4f46e5', '#0d9488', '#e11d48', '#f59e0b', '#8b5cf6', '#0ea5e9'];

  // ---------- Hindi names ----------
  var MONTH_HI = ['चैत्र', 'वैशाख', 'ज्येष्ठ', 'आषाढ़', 'श्रावण', 'भाद्रपद', 'आश्विन', 'कार्तिक', 'मार्गशीर्ष', 'पौष', 'माघ', 'फाल्गुन'];
  var TITHI_HI = ['प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा', 'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'अमावस्या'];
  var NAK_HI = ['अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा', 'पुनर्वसु', 'पुष्य', 'आश्लेषा', 'मघा', 'पूर्वाफाल्गुनी', 'उत्तराफाल्गुनी', 'हस्त', 'चित्रा', 'स्वाति', 'विशाखा', 'अनुराधा', 'ज्येष्ठा', 'मूल', 'पूर्वाषाढ़ा', 'उत्तराषाढ़ा', 'श्रवण', 'धनिष्ठा', 'शतभिषा', 'पूर्वाभाद्रपद', 'उत्तराभाद्रपद', 'रेवती'];
  var YOGA_HI = ['विष्कुंभ', 'प्रीति', 'आयुष्मान', 'सौभाग्य', 'शोभन', 'अतिगंड', 'सुकर्मा', 'धृति', 'शूल', 'गंड', 'वृद्धि', 'ध्रुव', 'व्याघात', 'हर्षण', 'वज्र', 'सिद्धि', 'व्यतीपात', 'वरीयान', 'परिघ', 'शिव', 'सिद्ध', 'साध्य', 'शुभ', 'शुक्ल', 'ब्रह्म', 'इंद्र', 'वैधृति'];
  var KARANA_HI = { 'Kimstughna': 'किंस्तुघ्न', 'Bava': 'बव', 'Balava': 'बालव', 'Kaulava': 'कौलव', 'Taitila': 'तैतिल', 'Garaja': 'गरज', 'Vanija': 'वणिज', 'Vishti': 'विष्टि', 'Shakuni': 'शकुनि', 'Chatushpada': 'चतुष्पद', 'Naga': 'नाग' };
  var WD_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var WD_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var WD_SHORT_HI = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
  var PAKSHA_HI = { Shukla: 'शुक्ल', Krishna: 'कृष्ण' };
  var MONTH_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  var L = {
    en: { month: 'Month', week: 'Week', day: 'Day', year: 'Year', addEvent: '+ Event', today: 'Today',
      tithi: 'Tithi', nakshatra: 'Nakshatra', yoga: 'Yoga', karana: 'Karana', paksha: 'Paksha', masa: 'Lunar month (Amanta)',
      masaP: 'Lunar month (Purnimanta)', rashi: 'Sun sign (Rashi)', vara: 'Weekday', sunrise: 'Sunrise', sunset: 'Sunset',
      moonrise: 'Moonrise', moonset: 'Moonset', muhurat: 'Muhurat & inauspicious times', chogh: 'Choghadiya', festivals: 'Festivals & vrat',
      events: 'Your events', ends: 'ends', panchang: 'Panchang', samvat: 'Samvat', addDay: '+ Add event on this day',
      brahma: 'Brahma Muhurat', abhijit: 'Abhijit Muhurat', rahu: 'Rahu Kaal', yama: 'Yamaganda', guli: 'Gulika', durm: 'Durmuhurta',
      noEvents: 'No events yet. Tap “+ Event”.', allDay: 'All day' },
    hi: { month: 'माह', week: 'सप्ताह', day: 'दिन', year: 'वर्ष', addEvent: '+ कार्यक्रम', today: 'आज',
      tithi: 'तिथि', nakshatra: 'नक्षत्र', yoga: 'योग', karana: 'करण', paksha: 'पक्ष', masa: 'चांद्र मास (अमांत)',
      masaP: 'चांद्र मास (पूर्णिमांत)', rashi: 'राशि', vara: 'वार', sunrise: 'सूर्योदय', sunset: 'सूर्यास्त',
      moonrise: 'चंद्रोदय', moonset: 'चंद्रास्त', muhurat: 'मुहूर्त एवं अशुभ काल', chogh: 'चौघड़िया', festivals: 'त्योहार एवं व्रत',
      events: 'आपके कार्यक्रम', ends: 'तक', panchang: 'पंचांग', samvat: 'संवत', addDay: '+ इस दिन कार्यक्रम जोड़ें',
      brahma: 'ब्रह्म मुहूर्त', abhijit: 'अभिजित मुहूर्त', rahu: 'राहु काल', yama: 'यमगंड', guli: 'गुलिक', durm: 'दुर्मुहूर्त',
      noEvents: 'अभी कोई कार्यक्रम नहीं। “+ कार्यक्रम” दबाएँ।', allDay: 'पूरा दिन' }
  };

  // ---------- helpers ----------
  function devNum(n) { return String(n).replace(/[0-9]/g, function (d) { return '०१२३४५६७८९'[d]; }); }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function istParts(d) { var t = new Date(d.getTime() + IST); return { y: t.getUTCFullYear(), m: t.getUTCMonth(), d: t.getUTCDate(), h: t.getUTCHours(), mi: t.getUTCMinutes(), wd: t.getUTCDay() }; }
  function istDate(y, m, d, h, mi) { return new Date(Date.UTC(y, m, d, h || 0, mi || 0) - IST); }
  function dayKey(d) { var p = istParts(d); return p.y + '-' + pad(p.m + 1) + '-' + pad(p.d); }
  function parseKey(k) { var a = k.split('-'); return { y: +a[0], m: +a[1] - 1, d: +a[2] }; }
  function keyToDate(k) { var p = parseKey(k); return istDate(p.y, p.m, p.d); }
  function addDays(d, n) { return new Date(d.getTime() + n * DAY); }
  function startOfMonth(d) { var p = istParts(d); return istDate(p.y, p.m, 1); }
  function sameDay(a, b) { return dayKey(a) === dayKey(b); }
  function fmtT(d, lang) {
    if (!d) return '—';
    var p = istParts(d); var h = p.h, ap = h < 12 ? 'am' : 'pm'; var hh = h % 12; if (hh === 0) hh = 12;
    var s = hh + ':' + pad(p.mi) + ' ' + ap;
    return lang === 'hi' ? devNum(s) : s;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function tithiNum(ti) { return ti < 15 ? ti + 1 : ti - 14; }

  // ---------- state ----------
  var state = {
    view: 'month', cursor: startOfMonth(new Date()), selected: dayKey(new Date()),
    city: localStorage.getItem('panchang.city') || 'delhi',
    lang: localStorage.getItem('panchang.lang') || 'en',
    theme: localStorage.getItem('panchang.theme') || 'light',
    editingId: null
  };
  function city() { for (var i = 0; i < CITIES.length; i++) if (CITIES[i].key === state.city) return CITIES[i]; return CITIES[0]; }
  function T(k) { return (L[state.lang] || L.en)[k] || k; }

  // ---------- summary cache ----------
  var sumCache = {};
  function summary(date) {
    var c = city(), k = dayKey(date) + '|' + c.key;
    if (sumCache[k]) return sumCache[k];
    var st = P.sunTimes(date, c.lat, c.lng);
    var ref = st.sunrise || istDate(istParts(date).y, istParts(date).m, istParts(date).d, 6, 0);
    var ti = P.tithiIndex(ref);
    var lm = P.lunarMonth(ref);
    var sv = P.samvat(ref);
    var ni = P.nakshatraIndex(ref);
    var out = { key: dayKey(date), date: date, sunrise: st.sunrise, sunset: st.sunset, ti: ti,
      tithi: P.tithiName(ti), paksha: ti < 15 ? 'Shukla' : 'Krishna', nakshatra: C.NAK[ni],
      masa: lm.amantaName, masaPurn: lm.purnimantaName, adhika: lm.adhika, samvat: sv, wd: istParts(date).wd };
    sumCache[k] = out; return out;
  }
  function masaLabel(name, lang) {
    var adhika = name.indexOf('Adhika ') === 0;
    var idx = C.MONTHS.indexOf(name.replace('Adhika ', ''));
    if (lang === 'hi') return (adhika ? 'अधिक ' : '') + (MONTH_HI[idx] || name);
    return name;
  }
  // North-Indian convention: the purnimanta month name leads the date.
  function hinduDateLabel(s, lang) {
    var m = masaLabel(s.masaPurn, lang);
    if (lang === 'hi') return m + ' ' + (s.paksha === 'Shukla' ? 'शु.' : 'कृ.') + ' ' + devNum(tithiNum(s.ti));
    return m + ' ' + s.paksha + ' ' + tithiNum(s.ti);
  }

  // ---------- events ----------
  var events = [];
  try { events = JSON.parse(localStorage.getItem('panchang.events.v1') || '[]'); } catch (e) { events = []; }
  function saveEvents() { localStorage.setItem('panchang.events.v1', JSON.stringify(events)); }
  function occOn(e, key) {
    if (e.repeat === 'none' || !e.repeat) return e.date === key;
    if (key < e.date) return false;
    var b = parseKey(e.date), k = parseKey(key);
    if (e.repeat === 'daily') return true;
    if (e.repeat === 'weekly') return new Date(Date.UTC(b.y, b.m, b.d)).getUTCDay() === new Date(Date.UTC(k.y, k.m, k.d)).getUTCDay();
    if (e.repeat === 'monthly') return b.d === k.d;
    if (e.repeat === 'yearly') return b.m === k.m && b.d === k.d;
    return false;
  }
  function eventsOn(key) {
    return events.filter(function (e) { return occOn(e, key); }).sort(function (a, b) { return (a.allDay ? -1 : a.start) < (b.allDay ? -1 : b.start) ? -1 : 1; });
  }

  // ---------- render: header ----------
  function renderHead() {
    document.getElementById('viewseg').querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === state.view); });
    var p = istParts(state.cursor);
    var lbl;
    if (state.view === 'month') lbl = MONTH_EN[p.m] + ' ' + p.y;
    else if (state.view === 'year') lbl = '' + p.y;
    else if (state.view === 'week') { var ws = addDays(state.cursor, -p.wd); var we = addDays(ws, 6); var a = istParts(ws), b = istParts(we); lbl = a.d + ' ' + MONTH_EN[a.m].slice(0, 3) + ' – ' + b.d + ' ' + MONTH_EN[b.m].slice(0, 3) + ' ' + b.y; }
    else lbl = WD_EN[p.wd] + ', ' + p.d + ' ' + MONTH_EN[p.m] + ' ' + p.y;
    document.getElementById('period').textContent = lbl;
    var s = summary(state.cursor);
    var sub = state.lang === 'hi'
      ? 'विक्रम संवत ' + devNum(s.samvat.vikram) + ' · शक संवत ' + devNum(s.samvat.shaka)
      : 'Vikram Samvat ' + s.samvat.vikram + ' · Shaka ' + s.samvat.shaka + ' · ' + s.samvat.samvatsara;
    document.getElementById('brandSub').textContent = sub;
    document.getElementById('langBtn').textContent = state.lang === 'hi' ? 'A' : 'हि';
    document.getElementById('addBtn').textContent = T('addEvent');
  }

  // ---------- render: month ----------
  function renderMonth() {
    var head = document.getElementById('calhead'), grid = document.getElementById('grid');
    head.innerHTML = WD_SHORT.map(function (w, i) { return '<div' + (i === 0 ? ' class="sun"' : '') + '>' + (state.lang === 'hi' ? WD_SHORT_HI[i] : w) + '</div>'; }).join('');
    var first = startOfMonth(state.cursor), p = istParts(first);
    var start = addDays(first, -p.wd);
    var today = new Date();
    var dim = new Date(Date.UTC(p.y, p.m + 1, 0)).getUTCDate();
    var rows = Math.ceil((p.wd + dim) / 7);
    grid.style.gridTemplateRows = 'repeat(' + rows + ',1fr)';
    var html = '';
    for (var i = 0; i < rows * 7; i++) {
      var d = addDays(start, i); var k = dayKey(d); var s = summary(d);
      var out = istParts(d).m !== p.m;
      var fests = window.FESTIVALS[k] || [];
      var evs = eventsOn(k);
      var cls = 'cell' + (out ? ' out' : '') + (sameDay(d, today) ? ' today' : '') + (fests.length ? ' fest' : '');
      var gcls = 'gdate' + (istParts(d).wd === 0 ? ' sat' : '');
      html += '<div class="' + cls + '" data-key="' + k + '">' +
        '<div class="top"><div class="' + gcls + '">' + devNum(istParts(d).d) + '</div>' +
        '<div class="hdate">' + esc(hinduDateLabel(s, 'hi')) + '</div></div>' +
        '<div class="tithi">' + (state.lang === 'hi' ? esc(TITHI_HI[s.ti]) : esc(s.paksha + ' ' + s.tithi)) + '</div>' +
        '<div class="fests">' + fests.slice(0, 2).map(function (f) { return '<span class="fchip ' + (f.type === 'major' ? 'major' : '') + '">' + esc(f.name) + '</span>'; }).join('') + '</div>' +
        (evs.length ? '<div class="dots">' + evs.slice(0, 5).map(function (e) { return '<span class="dot" style="background:' + (e.color || '#4f46e5') + '"></span>'; }).join('') + '</div>' : '') +
        '</div>';
    }
    grid.innerHTML = html;
  }

  // ---------- render: week ----------
  function renderWeek() {
    document.getElementById('calhead').innerHTML = '';
    var grid = document.getElementById('grid');
    grid.style.gridTemplateColumns = 'repeat(7,1fr)';
    var p = istParts(state.cursor); var start = addDays(state.cursor, -p.wd);
    var html = '';
    for (var i = 0; i < 7; i++) {
      var d = addDays(start, i); var k = dayKey(d); var s = summary(d);
      var fests = window.FESTIVALS[k] || []; var evs = eventsOn(k);
      html += '<div class="cell" data-key="' + k + '" style="gap:6px">' +
        '<div class="top"><div class="gdate">' + devNum(istParts(d).d) + '</div><div class="hdate">' + esc(WD_SHORT[istParts(d).wd]) + '</div></div>' +
        '<div class="hdate" style="text-align:left;font-size:.7rem">' + esc(hinduDateLabel(s, 'hi')) + '</div>' +
        '<div class="tithi">' + esc(s.paksha + ' ' + s.tithi) + '</div>' +
        '<div class="fests">' + fests.map(function (f) { return '<span class="fchip ' + (f.type === 'major' ? 'major' : '') + '">' + esc(f.name) + '</span>'; }).join('') + '</div>' +
        '<div style="margin-top:auto;display:flex;flex-direction:column;gap:3px">' + evs.map(function (e) {
          return '<div class="fchip" style="background:' + (e.color || '#4f46e5') + ';color:#fff">' + esc((e.allDay ? '' : e.start + ' ') + e.title) + '</div>';
        }).join('') + '</div></div>';
    }
    grid.innerHTML = html;
  }

  // ---------- render: day ----------
  function renderDay() {
    document.getElementById('calhead').innerHTML = '';
    var grid = document.getElementById('grid');
    grid.style.gridTemplateColumns = '1fr';
    var k = dayKey(state.cursor); var s = summary(state.cursor);
    var fests = window.FESTIVALS[k] || []; var evs = eventsOn(k);
    grid.innerHTML = '<div class="cell" style="cursor:default;padding:16px;gap:10px">' +
      '<div style="display:flex;justify-content:space-between;align-items:baseline"><div style="font-size:2rem;font-weight:800">' + devNum(istParts(state.cursor).d) + ' ' + MONTH_EN[istParts(state.cursor).m] + ' ' + istParts(state.cursor).y + '</div>' +
      '<div style="color:var(--indigo);font-weight:700">' + esc(hinduDateLabel(s, 'hi')) + '</div></div>' +
      '<div class="tithi" style="font-size:.9rem">' + esc(s.paksha + ' ' + s.tithi) + ' · ' + esc(s.nakshatra) + ' · ' + esc(s.masa) + '</div>' +
      '<div class="fests">' + fests.map(function (f) { return '<span class="fchip ' + (f.type === 'major' ? 'major' : '') + '">' + esc(f.name) + '</span>'; }).join('') + '</div>' +
      '<div style="margin-top:6px;display:flex;flex-direction:column;gap:5px">' + (evs.length ? evs.map(function (e) {
        return '<div class="evitem"><span class="bar" style="background:' + (e.color || '#4f46e5') + '"></span><div><div class="et">' + esc(e.title) + '</div><div class="es">' + (e.allDay ? T('allDay') : e.start + ' – ' + e.end) + (e.repeat && e.repeat !== 'none' ? ' · ' + e.repeat : '') + '</div></div></div>';
      }).join('') : '<div class="es" style="color:var(--ink-soft)">' + T('noEvents') + '</div>') + '</div>' +
      '<div><button class="btn primary" id="dayAdd">' + T('addDay') + '</button></div></div>';
    var da = document.getElementById('dayAdd'); if (da) da.onclick = function () { openEvent(null, k); };
  }

  // ---------- render: year ----------
  function renderYear() {
    document.getElementById('calhead').innerHTML = '';
    var grid = document.getElementById('grid');
    grid.style.gridTemplateColumns = 'repeat(4,1fr)'; grid.style.gridAutoRows = '1fr';
    var y = istParts(state.cursor).y, html = '';
    for (var m = 0; m < 12; m++) {
      var first = istDate(y, m, 1), fp = istParts(first);
      var start = addDays(first, -fp.wd);
      var cells = '';
      for (var i = 0; i < 42; i++) {
        var d = addDays(start, i); var k = dayKey(d); var out = istParts(d).m !== m;
        var f = (window.FESTIVALS[k] || []).filter(function (x) { return x.type === 'major'; });
        var style = 'padding:2px 0;text-align:center;font-size:.62rem;border-radius:6px;';
        if (out) style += 'opacity:.25;';
        else if (f.length) style += 'background:linear-gradient(135deg,rgba(255,122,24,.9),rgba(255,77,109,.85));color:#fff;font-weight:700;';
        else if (sameDay(d, new Date())) style += 'outline:1.5px solid var(--saffron);';
        cells += '<div style="' + style + '">' + istParts(d).d + '</div>';
      }
      html += '<div class="cell" data-goto="' + y + '-' + pad(m + 1) + '-01" style="cursor:pointer;padding:8px">' +
        '<div style="font-weight:750;margin-bottom:4px">' + MONTH_EN[m] + '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:1px;flex:1;align-content:start">' +
        WD_SHORT.map(function (w) { return '<div style="font-size:.55rem;text-align:center;color:var(--ink-soft)">' + w[0] + '</div>'; }).join('') + cells + '</div></div>';
    }
    grid.innerHTML = html;
  }

  // ---------- render: detail ----------
  function renderDetail() {
    var k = state.selected; if (!k) return;
    var d = keyToDate(k); var c = city();
    var p = P.dayPanchang(d, c.lat, c.lng);
    var s = summary(d);
    var fests = window.FESTIVALS[k] || []; var evs = eventsOn(k);
    var lang = state.lang;
    document.getElementById('dGd').textContent = WD_EN[istParts(d).wd] + ', ' + istParts(d).d + ' ' + MONTH_EN[istParts(d).m] + ' ' + istParts(d).y;
    document.getElementById('dHd').textContent = hinduDateLabel(s, 'hi') + '  ·  ' + (lang === 'hi' ? 'विक्रम संवत ' + devNum(p.samvat.vikram) : 'Vikram Samvat ' + p.samvat.vikram);
    document.getElementById('dSv').innerHTML =
      chip('वि.सं. ' + devNum(p.samvat.vikram) + ' ' + p.samvat.samvatsara) +
      chip('शक ' + devNum(p.samvat.shaka) + ' ' + p.samvat.samvatsaraShaka) +
      chip((lang === 'hi' ? 'गुजराती ' : 'Gujarati ') + p.samvat.gujarati) +
      chip(p.adhika ? (lang === 'hi' ? 'अधिक मास' : 'Adhika Masa') : (lang === 'hi' ? 'निज मास' : 'Nija Masa'));

    var body = '';
    if (fests.length) body += '<div class="sect"><h3>' + T('festivals') + '</h3>' + fests.map(function (f) {
      var ic = f.type === 'major' ? '🪔' : f.type === 'ekadashi' ? '🌗' : f.type === 'purnima' ? '🌕' : f.type === 'amavasya' ? '🌑' : f.type === 'vrat' ? '🕉️' : '✦';
      return '<div class="festline"><span class="ic">' + ic + '</span><span>' + esc(f.name) + '</span></div>';
    }).join('') + '</div>';

    function row(kk, v, sub) { return '<div class="k">' + kk + '</div><div class="v">' + v + (sub ? '<small>' + sub + '</small>' : '') + '</div>'; }
    body += '<div class="sect"><h3>' + T('panchang') + '</h3><div class="kv">' +
      row(T('tithi'), (lang === 'hi' ? esc(TITHI_HI[p.tithiIndex]) : esc(p.tithi)) + ' · ' + esc(lang === 'hi' ? PAKSHA_HI[p.paksha] : p.paksha), (lang === 'hi' ? 'अंत ' : T('ends') + ' ') + fmtT(p.tithiEnd, lang)) +
      row(T('nakshatra'), (lang === 'hi' ? esc(NAK_HI[p.nakshatraIndex]) : esc(p.nakshatra)), (lang === 'hi' ? 'अंत ' : T('ends') + ' ') + fmtT(p.nakshatraEnd, lang)) +
      row(T('yoga'), (lang === 'hi' ? esc(YOGA_HI[p.yogaIndex]) : esc(p.yoga)), (lang === 'hi' ? 'अंत ' : T('ends') + ' ') + fmtT(p.yogaEnd, lang)) +
      row(T('karana'), lang === 'hi' ? esc(KARANA_HI[p.karana] || p.karana) : esc(p.karana)) +
      row(T('masa'), esc(masaLabel(p.masa, lang))) +
      row(T('masaP'), esc(masaLabel(p.masaPurnimanta, lang))) +
      row(T('rashi'), lang === 'hi' ? esc(p.rashiHi) : esc(p.rashi)) +
      row(T('vara'), lang === 'hi' ? esc(p.varaHi) : esc(p.vara)) +
      row(T('sunrise'), fmtT(p.sunrise, lang)) +
      row(T('sunset'), fmtT(p.sunset, lang)) +
      row(T('moonrise'), fmtT(p.moonrise, lang)) +
      row(T('moonset'), fmtT(p.moonset, lang)) +
      '</div></div>';

    // muhurat
    var m = p.muhurat || {};
    function mbox(name, r, cls) { return '<div class="m ' + (cls || '') + '"><div class="t">' + name + '</div><div class="r">' + (r ? fmtT(r[0], lang) + '–' + fmtT(r[1], lang) : '—') + '</div></div>'; }
    body += '<div class="sect"><h3>' + T('muhurat') + '</h3><div class="muh">' +
      mbox(T('brahma'), m.brahma, 'good') + mbox(T('abhijit'), m.abhijit, 'good') +
      mbox(T('rahu'), m.rahu, 'bad') + mbox(T('yama'), m.yamaganda, 'bad') +
      mbox(T('guli'), m.gulika, 'bad') + mbox(T('durm'), m.durmuhurta && m.durmuhurta[0], 'bad') +
      '</div></div>';

    if (m.choghadiyaDay && m.choghadiyaDay.length) {
      body += '<div class="sect"><h3>' + T('chogh') + ' — ' + (lang === 'hi' ? 'दिन' : 'Day') + '</h3><div class="chogh">' +
        m.choghadiyaDay.map(function (x) { return '<span class="c ' + (x.good ? 'good' : 'bad') + '" title="' + fmtT(x.range[0], lang) + '–' + fmtT(x.range[1], lang) + '">' + x.name + '</span>'; }).join('') + '</div></div>';
      body += '<div class="sect"><h3>' + T('chogh') + ' — ' + (lang === 'hi' ? 'रात्रि' : 'Night') + '</h3><div class="chogh">' +
        m.choghadiyaNight.map(function (x) { return '<span class="c ' + (x.good ? 'good' : 'bad') + '" title="' + fmtT(x.range[0], lang) + '–' + fmtT(x.range[1], lang) + '">' + x.name + '</span>'; }).join('') + '</div></div>';
    }

    body += '<div class="sect"><h3>' + T('events') + '</h3>' + (evs.length ? evs.map(function (e) {
      return '<div class="evitem"><span class="bar" style="background:' + (e.color || '#4f46e5') + '"></span><div><div class="et">' + esc(e.title) + '</div><div class="es">' + (e.allDay ? T('allDay') : e.start + ' – ' + e.end) + (e.notes ? ' · ' + esc(e.notes) : '') + '</div></div><button class="del" data-edit="' + e.id + '">edit</button></div>';
    }).join('') : '<div class="es" style="color:var(--ink-soft)">' + T('noEvents') + '</div>') +
      '<div style="margin-top:8px"><button class="btn primary" id="detailAdd">' + T('addDay') + '</button></div></div>';

    document.getElementById('dBody').innerHTML = body;
    document.getElementById('detail').classList.remove('hide');
    var da = document.getElementById('detailAdd'); if (da) da.onclick = function () { openEvent(null, k); };
    document.getElementById('dBody').querySelectorAll('[data-edit]').forEach(function (b) { b.onclick = function () { openEvent(b.dataset.edit); }; });
  }
  function chip(x) { return '<span class="chip" style="background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.8)">' + esc(x) + '</span>'; }

  // ---------- render dispatcher ----------
  function render() {
    var grid = document.getElementById('grid');
    grid.style.gridTemplateColumns = 'repeat(7,1fr)'; grid.style.gridAutoRows = '1fr'; grid.style.gridTemplateRows = '';
    renderHead();
    if (state.view === 'month') renderMonth();
    else if (state.view === 'week') renderWeek();
    else if (state.view === 'day') renderDay();
    else renderYear();
    if (!document.getElementById('detail').classList.contains('hide')) renderDetail();
  }

  // ---------- event modal ----------
  function openEvent(id, key) {
    state.editingId = id || null;
    var e = id ? events.filter(function (x) { return x.id === id; })[0] : null;
    document.getElementById('modalTitle').textContent = e ? 'Edit event' : 'Add event';
    document.getElementById('evTitle').value = e ? e.title : '';
    document.getElementById('evDate').value = e ? e.date : (key || state.selected || dayKey(new Date()));
    document.getElementById('evAllDay').value = e && e.allDay ? 'yes' : 'no';
    document.getElementById('evStart').value = e ? e.start : '09:00';
    document.getElementById('evEnd').value = e ? e.end : '10:00';
    document.getElementById('evRepeat').value = e ? (e.repeat || 'none') : 'none';
    document.getElementById('evRemind').value = e ? String(e.remind == null ? 10 : e.remind) : '10';
    document.getElementById('evNotes').value = e ? (e.notes || '') : '';
    renderSwatches(e ? e.color : COLORS[0]);
    document.getElementById('evDelete').style.display = e ? 'inline-block' : 'none';
    document.getElementById('overlay').classList.add('on');
    setTimeout(function () { document.getElementById('evTitle').focus(); }, 30);
  }
  var pickedColor = COLORS[0];
  function renderSwatches(sel) {
    pickedColor = sel || COLORS[0];
    document.getElementById('swatches').innerHTML = COLORS.map(function (c) { return '<div class="sw' + (c === pickedColor ? ' on' : '') + '" data-c="' + c + '" style="background:' + c + '"></div>'; }).join('');
    document.getElementById('swatches').querySelectorAll('.sw').forEach(function (s) { s.onclick = function () { renderSwatches(s.dataset.c); }; });
  }
  function closeModal() { document.getElementById('overlay').classList.remove('on'); }
  function saveEvent() {
    var title = document.getElementById('evTitle').value.trim();
    if (!title) { toast('Please add a title'); return; }
    var obj = {
      title: title, date: document.getElementById('evDate').value,
      allDay: document.getElementById('evAllDay').value === 'yes',
      start: document.getElementById('evStart').value, end: document.getElementById('evEnd').value,
      repeat: document.getElementById('evRepeat').value, remind: +document.getElementById('evRemind').value,
      notes: document.getElementById('evNotes').value.trim(), color: pickedColor
    };
    if (state.editingId) { var e = events.filter(function (x) { return x.id === state.editingId; })[0]; Object.assign(e, obj); }
    else { obj.id = 'e' + Date.now() + Math.random().toString(36).slice(2, 6); events.push(obj); }
    saveEvents(); closeModal(); render(); toast(state.editingId ? 'Event updated' : 'Event added');
    askNotify();
  }
  function deleteEvent() {
    events = events.filter(function (x) { return x.id !== state.editingId; });
    saveEvents(); closeModal(); render(); toast('Event deleted');
  }

  // ---------- notifications ----------
  var notified = {};
  function askNotify() {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  }
  function checkReminders() {
    var now = new Date();
    var today = dayKey(now), nowMs = now.getTime();
    eventsOn(today).forEach(function (e) {
      if (e.allDay || e.remind < 0) return;
      var dt = keyToDate(e.date); var pp = e.start.split(':'); var st = istDate(istParts(dt).y, istParts(dt).m, istParts(dt).d, +pp[0], +pp[1]);
      var at = st.getTime() - e.remind * 60000; var id = e.id + '@' + today;
      if (nowMs >= at && nowMs < st.getTime() && !notified[id]) {
        notified[id] = 1;
        var msg = e.title + ' at ' + e.start + (e.remind ? ' (in ' + e.remind + ' min)' : '');
        toast('⏰ ' + msg);
        if ('Notification' in window && Notification.permission === 'granted') { try { new Notification('Panchang reminder', { body: msg }); } catch (x) {} }
      }
    });
  }

  // ---------- share ----------
  function share() {
    var payload = { v: 1, events: events, city: state.city };
    var hash = '#cal=' + btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    var url = location.origin + location.pathname + hash;
    if (navigator.share) { navigator.share({ title: 'My Panchang calendar', url: url }).catch(function () {}); }
    else { copy(url); toast('Shareable link copied'); }
  }
  function copy(s) { try { navigator.clipboard.writeText(s); } catch (e) { var ta = document.createElement('textarea'); ta.value = s; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); } }
  function loadShared() {
    if (!location.hash || location.hash.indexOf('#cal=') !== 0) return;
    try {
      var data = JSON.parse(decodeURIComponent(escape(atob(location.hash.slice(5)))));
      if (data && data.events && data.events.length) {
        var n = 0;
        data.events.forEach(function (e) { if (!events.some(function (x) { return x.id === e.id; })) { events.push(e); n++; } });
        if (data.city) { state.city = data.city; document.getElementById('city').value = data.city; }
        saveEvents();
        if (n) toast(n + ' shared event(s) imported');
      }
    } catch (e) { console.warn('bad share link', e); }
    history.replaceState(null, '', location.pathname);
  }

  // ---------- toast ----------
  var toastT;
  function toast(msg) { var el = document.getElementById('toast'); el.textContent = msg; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('on'); }, 2600); }

  // ---------- events wiring ----------
  function init() {
    var sel = document.getElementById('city');
    sel.innerHTML = CITIES.map(function (c) { return '<option value="' + c.key + '">' + c.name + '</option>'; }).join('');
    sel.value = state.city;
    sel.onchange = function () { state.city = sel.value; localStorage.setItem('panchang.city', state.city); sumCache = {}; render(); };
    document.body.classList.toggle('dark', state.theme === 'dark');

    document.getElementById('prev').onclick = function () { move(-1); };
    document.getElementById('next').onclick = function () { move(1); };
    document.getElementById('today').onclick = function () { state.cursor = startOfMonth(new Date()); if (state.view === 'day' || state.view === 'week') state.cursor = new Date(); state.selected = dayKey(new Date()); render(); };
    document.getElementById('viewseg').querySelectorAll('button').forEach(function (b) {
      b.onclick = function () {
        state.view = b.dataset.v;
        if (state.view === 'month' || state.view === 'year') state.cursor = startOfMonth(state.cursor);
        render();
      };
    });
    document.getElementById('langBtn').onclick = function () { state.lang = state.lang === 'hi' ? 'en' : 'hi'; localStorage.setItem('panchang.lang', state.lang); render(); };
    document.getElementById('themeBtn').onclick = function () { state.theme = state.theme === 'dark' ? 'light' : 'dark'; localStorage.setItem('panchang.theme', state.theme); document.body.classList.toggle('dark', state.theme === 'dark'); };
    document.getElementById('shareBtn').onclick = share;
    document.getElementById('addBtn').onclick = function () { openEvent(null, state.selected); };
    document.getElementById('closeDetail').onclick = function () { document.getElementById('detail').classList.add('hide'); };
    document.getElementById('evCancel').onclick = closeModal;
    document.getElementById('evSave').onclick = saveEvent;
    document.getElementById('evDelete').onclick = deleteEvent;
    document.getElementById('overlay').onclick = function (ev) { if (ev.target.id === 'overlay') closeModal(); };

    document.getElementById('grid').onclick = function (ev) {
      var cell = ev.target.closest('.cell'); if (!cell) return;
      if (cell.dataset.goto) { state.cursor = keyToDate(cell.dataset.goto); state.view = 'month'; render(); return; }
      var k = cell.dataset.key; if (!k) return;
      state.selected = k; renderDetail();
    };
    document.addEventListener('keydown', function (ev) {
      if (document.getElementById('overlay').classList.contains('on')) return;
      if (ev.key === 'ArrowLeft') move(-1); else if (ev.key === 'ArrowRight') move(1);
      else if (ev.key === 'Escape') document.getElementById('detail').classList.add('hide');
      else if (ev.key === 'n') openEvent(null, state.selected);
    });
    loadShared();
    render();
    // auto-select today's detail
    state.selected = dayKey(new Date());
    setInterval(checkReminders, 30000); checkReminders();
  }
  function move(dir) {
    if (state.view === 'month') { var p = istParts(state.cursor); state.cursor = istDate(p.y, p.m + dir, 1); }
    else if (state.view === 'year') { var q = istParts(state.cursor); state.cursor = istDate(q.y + dir, 0, 1); }
    else if (state.view === 'week') state.cursor = addDays(state.cursor, 7 * dir);
    else state.cursor = addDays(state.cursor, dir);
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

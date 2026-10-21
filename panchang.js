/* Panchang engine — Indian lunisolar calendar (Vikram & Shaka Samvat).
   Uses astronomy-engine for sun/moon positions; Lahiri (Chitrapaksha) ayanamsa.
   Works in Node (require) and the browser (global Astronomy + global Panchang). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('astronomy-engine'));
  } else {
    root.Panchang = factory(root.Astronomy);
  }
})(typeof self !== 'undefined' ? self : this, function (A) {
  'use strict';

  const IST = 5.5 * 3600 * 1000;           // India Standard Time offset (ms)
  const DAY = 86400000;

  const TITHI_S = ['Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima'];
  const TITHI_K = ['Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Amavasya'];
  const NAK = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
  const YOGA = ['Vishkambha','Priti','Ayushman','Saubhagya','Shobhana','Atiganda','Sukarman','Dhriti','Shula','Ganda','Vriddhi','Dhruva','Vyaghata','Harshana','Vajra','Siddhi','Vyatipata','Variyana','Parigha','Shiva','Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhriti'];
  const KARANA_MOV = ['Bava','Balava','Kaulava','Taitila','Garaja','Vanija','Vishti'];
  const KARANA_FIX = ['Shakuni','Chatushpada','Naga'];
  const MONTHS = ['Chaitra','Vaishakha','Jyeshtha','Ashadha','Shravana','Bhadrapada','Ashwin','Kartika','Margashirsha','Pausha','Magha','Phalguna'];
  const VARA = ['Ravivara','Somavara','Mangalavara','Budhavara','Guruvara','Shukravara','Shanivara'];
  const VARA_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const VARA_HI = ['रविवार','सोमवार','मंगलवार','बुधवार','गुरुवार','शुक्रवार','शनिवार'];
  const RASHI = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];
  const RASHI_HI = ['मेष','वृषभ','मिथुन','कर्क','सिंह','कन्या','तुला','वृश्चिक','धनु','मकर','कुंभ','मीन'];
  const SAMVATSARA = ['Prabhava','Vibhava','Shukla','Pramoda','Prajapati','Angirasa','Shrimukha','Bhava','Yuva','Dhatri','Ishvara','Bahudhanya','Pramathi','Vikrama','Vrisha','Chitrabhanu','Svabhanu','Tarana','Parthiva','Vyaya','Sarvajit','Sarvadhari','Virodhi','Vikriti','Khara','Nandana','Vijaya','Jaya','Manmatha','Durmukha','Hemalamba','Vilambi','Vikari','Sharvari','Plava','Shubhakrit','Shobhakrit','Krodhi','Vishvavasu','Parabhava','Plavanga','Kilaka','Saumya','Sadharana','Virodhikrit','Paridhavi','Pramadi','Ananda','Rakshasa','Anala','Pingala','Kalayukta','Siddharthi','Raudra','Durmati','Dundubhi','Rudhirodgari','Raktakshi','Krodhana','Akshaya'];

  const AY_EPOCH = Date.UTC(2026, 2, 19);
  function ayanamsa(date) {
    return 24.22998 + 0.01397 * ((date.getTime() - AY_EPOCH) / DAY) / 365.25;
  }
  function norm(x) { return ((x % 360) + 360) % 360; }

  function sunLon(date) { return A.SunPosition(date).elon; }
  function moonLon(date) { return A.Ecliptic(A.GeoMoon(date)).elon; }
  function elongation(date) { return norm(moonLon(date) - sunLon(date)); }
  function sidMoon(date) { return norm(moonLon(date) - ayanamsa(date)); }
  function sidSun(date) { return norm(sunLon(date) - ayanamsa(date)); }

  function tithiIndex(date) { return Math.floor(elongation(date) / 12); }
  function nakshatraIndex(date) { return Math.floor(sidMoon(date) / (360 / 27)); }
  function yogaIndex(date) { return Math.floor(norm(sidSun(date) + sidMoon(date)) / (360 / 27)); }
  function karanaIndex(date) { return Math.floor(elongation(date) / 6); }

  function tithiName(i) { return i < 15 ? TITHI_S[i] : TITHI_K[i - 15]; }
  function karanaName(k) {
    if (k === 0) return 'Kimstughna';
    if (k >= 1 && k <= 56) return KARANA_MOV[(k - 1) % 7];
    return KARANA_FIX[k - 57];
  }

  // Root-find the next instant a cyclic quantity (0..max) reaches `target`.
  function findCrossing(fn, target, from, maxDays) {
    let lo = from.getTime();
    let hi = lo + (maxDays || 3) * DAY;
    let flo = fn(new Date(lo)) - target;
    // bisection on (value - target) mod max, assuming monotonic increase
    const MAXV = 360;
    let fHi = fn(new Date(hi)) - target;
    if (fHi < flo) fHi += MAXV;
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      let f = fn(new Date(mid)) - target;
      if (f < flo) f += MAXV;
      if (f >= 0) { hi = mid; fHi = f; } else { lo = mid; flo = f; }
    }
    return new Date(hi);
  }

  function tithiEnd(date) {
    const k = tithiIndex(date);
    return findCrossing(elongation, (k + 1) * 12, date, 2.5);
  }
  function nakshatraEnd(date) {
    const k = nakshatraIndex(date);
    return findCrossing(sidMoon, (k + 1) * (360 / 27), date, 2.5);
  }
  function yogaEnd(date) {
    const k = yogaIndex(date);
    const f = (d) => norm(sidSun(d) + sidMoon(d));
    return findCrossing(f, (k + 1) * (360 / 27), date, 2.5);
  }

  // ---- sunrise / sunset / moonrise / moonset (IST day) ----
  function istMidnight(date) {
    const t = date.getTime() + IST;
    const d = new Date(t);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - IST);
  }
  function riseSet(body, obs, dir, date) {
    const start = istMidnight(date);
    const ev = A.SearchRiseSet(body, obs, dir, start, 1);
    return ev ? ev.date : null;
  }
  function sunTimes(date, lat, lng) {
    const obs = new A.Observer(lat, lng, 200);
    return { sunrise: riseSet(A.Body.Sun, obs, +1, date), sunset: riseSet(A.Body.Sun, obs, -1, date) };
  }
  function moonTimes(date, lat, lng) {
    const obs = new A.Observer(lat, lng, 200);
    return { moonrise: riseSet(A.Body.Moon, obs, +1, date), moonset: riseSet(A.Body.Moon, obs, -1, date) };
  }

  // ---- lunar month (amanta) & samvat ----
  function prevNewMoon(date) {
    const start = new Date(date.getTime() - 32 * DAY);
    const nm = A.SearchMoonPhase(0, start, 40);
    return nm ? nm.date : null;
  }
  function nextNewMoon(date) {
    const nm = A.SearchMoonPhase(0, date, 40);
    return nm ? nm.date : null;
  }
  function signAt(d) { return Math.floor(sidSun(d) / 30); }

  // Returns amanta lunar-month info for the day containing `date`.
  function lunarMonth(date) {
    const nm = prevNewMoon(date);
    const nm2 = nextNewMoon(date);
    const l0 = sidSun(nm);
    const l1 = sidSun(nm2);
    const crossed = (Math.floor(l1 / 30) - Math.floor(l0 / 30) + 12) % 12;
    let nameIndex, adhika = false;
    if (crossed === 0) { nameIndex = (Math.floor(l0 / 30) + 1) % 12; adhika = true; }
    else { nameIndex = Math.floor(l1 / 30) % 12; }
    const purnimantaIndex = (tithiIndex(date) < 15) ? nameIndex : (nameIndex + 1) % 12;
    return {
      amantaIndex: nameIndex, purnimantaIndex: purnimantaIndex, adhika: adhika,
      amantaName: (adhika ? 'Adhika ' : '') + MONTHS[nameIndex],
      purnimantaName: (adhika ? 'Adhika ' : '') + MONTHS[purnimantaIndex],
      start: nm, end: nm2
    };
  }

  // Chaitra Shukla Pratipada (Hindu lunar new year) for a Gregorian year.
  const _nyCache = {};
  function chaitraNewYear(ceYear) {
    if (_nyCache[ceYear]) return _nyCache[ceYear];
    const _r = _chaitraNewYear(ceYear); _nyCache[ceYear] = _r; return _r;
  }
  function _chaitraNewYear(ceYear) {
    // Mesha sankranti (sun enters Aries) ~ 14 April; Chaitra month starts at the
    // new moon just before it.
    const apr = new Date(Date.UTC(ceYear, 3, 20));
    let sankranti = null;
    for (let d = 0; d < 30; d++) {
      const t = new Date(Date.UTC(ceYear, 3, 1) + d * DAY);
      if (signAt(t) === 0) { sankranti = t; break; }
    }
    if (!sankranti) sankranti = new Date(Date.UTC(ceYear, 3, 14));
    const nm = prevNewMoon(sankranti);
    // first day whose sunrise tithi is Shukla Pratipada
    const d0 = istMidnight(nm);
    for (let i = 0; i < 2; i++) {
      const day = new Date(d0.getTime() + i * DAY);
      const sr = riseSet(A.Body.Sun, new A.Observer(23.2, 77.4, 200), +1, day) || new Date(day.getTime() + 6 * 3600000);
      if (tithiIndex(sr) === 0) return day;
    }
    return d0; // Pratipada touches no sunrise -> the day it begins
  }

  function samvat(date) {
    const y = new Date(date.getTime() + IST).getUTCFullYear();
    let ny = chaitraNewYear(y);
    if (date.getTime() + IST < ny.getTime()) ny = chaitraNewYear(y - 1);
    const vs = new Date(ny.getTime() + IST).getUTCFullYear() + 57;
    // Gujarati (Kartika-based) Vikram year turns at Diwali (Kartika Shukla Pratipada)
    const lm = lunarMonth(date);
    let gujarati = vs;
    if (lm.amantaIndex >= 1 && lm.amantaIndex <= 6 && !lm.adhika) gujarati = vs - 1;
    // Samvatsara name (60-year Jovian cycle)
    const shaka = vs - 135;
    return {
      vikram: vs, shaka: shaka, gujarati: gujarati, newYear: ny,
      samvatsara: SAMVATSARA[(vs + 9) % 60],
      samvatsaraShaka: SAMVATSARA[(shaka + 11) % 60]
    };
  }

  // ---- muhurats ----
  function parts(sr, ss, n, k) {
    const d = ss.getTime() - sr.getTime();
    return [new Date(sr.getTime() + (k - 1) * d / n), new Date(sr.getTime() + k * d / n)];
  }
  const RAHU = [8, 2, 7, 5, 6, 4, 3];      // Sun..Sat
  const YAMA = [5, 4, 3, 2, 1, 7, 6];
  const GULI = [7, 6, 5, 4, 3, 2, 1];
  const DURM = [[14], [9, 12], [4], [8], [6, 12], [4, 9], [1, 2]];
  const CHOGH_DAY = [
    ['Udveg','Char','Labh','Amrit','Kaal','Shubh','Rog','Udveg'],
    ['Amrit','Kaal','Shubh','Rog','Udveg','Char','Labh','Amrit'],
    ['Rog','Udveg','Char','Labh','Amrit','Kaal','Shubh','Rog'],
    ['Labh','Amrit','Kaal','Shubh','Rog','Udveg','Char','Labh'],
    ['Shubh','Rog','Udveg','Char','Labh','Amrit','Kaal','Shubh'],
    ['Char','Labh','Amrit','Kaal','Shubh','Rog','Udveg','Char'],
    ['Kaal','Shubh','Rog','Udveg','Char','Labh','Amrit','Kaal']
  ];
  const CHOGH_NIGHT = [
    ['Shubh','Amrit','Char','Rog','Kaal','Labh','Udveg','Shubh'],
    ['Char','Rog','Kaal','Labh','Udveg','Shubh','Amrit','Char'],
    ['Kaal','Labh','Udveg','Shubh','Amrit','Char','Rog','Kaal'],
    ['Udveg','Shubh','Amrit','Char','Rog','Kaal','Labh','Udveg'],
    ['Amrit','Char','Rog','Kaal','Labh','Udveg','Shubh','Amrit'],
    ['Rog','Kaal','Labh','Udveg','Shubh','Amrit','Char','Rog'],
    ['Labh','Udveg','Shubh','Amrit','Char','Rog','Kaal','Labh']
  ];
  const GOOD_CHOGH = { Amrit: 1, Shubh: 1, Labh: 1, Char: 1 };

  function muhurats(date, lat, lng) {
    const st = sunTimes(date, lat, lng);
    const sr = st.sunrise, ss = st.sunset;
    if (!sr || !ss) return { sunrise: sr, sunset: ss };
    const wd = new Date(date.getTime() + IST).getUTCDay();
    const D = ss.getTime() - sr.getTime();
    const mid = new Date((sr.getTime() + ss.getTime()) / 2);
    const brahma = [new Date(sr.getTime() - 96 * 60000), new Date(sr.getTime() - 48 * 60000)];
    const abhijit = wd === 3 ? null : [new Date(mid.getTime() - D / 30), new Date(mid.getTime() + D / 30)];
    const rahu = parts(sr, ss, 8, RAHU[wd]);
    const yama = parts(sr, ss, 8, YAMA[wd]);
    const guli = parts(sr, ss, 8, GULI[wd]);
    const durm = DURM[wd].map(k => parts(sr, ss, 15, k));
    const chDay = CHOGH_DAY[wd].map((n, i) => ({ name: n, good: !!GOOD_CHOGH[n], range: parts(sr, ss, 8, i + 1) }));
    const nextSr = riseSet(A.Body.Sun, new A.Observer(lat, lng, 200), +1, new Date(ss.getTime() + 3600000));
    let chNight = [];
    if (nextSr) {
      const N = nextSr.getTime() - ss.getTime();
      chNight = CHOGH_NIGHT[wd].map((n, i) => {
        const s = new Date(ss.getTime() + i * N / 8), e = new Date(ss.getTime() + (i + 1) * N / 8);
        return { name: n, good: !!GOOD_CHOGH[n], range: [s, e] };
      });
    }
    return { sunrise: sr, sunset: ss, brahma: brahma, abhijit: abhijit, rahu: rahu, yamaganda: yama, gulika: guli, durmuhurta: durm, choghadiyaDay: chDay, choghadiyaNight: chNight };
  }

  // ---- full panchang for a day (using sunrise as reference) ----
  function dayPanchang(date, lat, lng) {
    const st = sunTimes(date, lat, lng);
    const ref = st.sunrise || new Date(istMidnight(date).getTime() + 6 * 3600000);
    const ti = tithiIndex(ref), ni = nakshatraIndex(ref), yi = yogaIndex(ref), ki = karanaIndex(ref);
    const lm = lunarMonth(ref);
    const sv = samvat(ref);
    const mt = moonTimes(date, lat, lng);
    const wd = new Date(date.getTime() + IST).getUTCDay();
    return {
      date: date, sunrise: st.sunrise, sunset: st.sunset, moonrise: mt.moonrise, moonset: mt.moonset,
      tithiIndex: ti, tithi: tithiName(ti), paksha: ti < 15 ? 'Shukla' : 'Krishna',
      tithiEnd: tithiEnd(ref),
      nakshatraIndex: ni, nakshatra: NAK[ni], nakshatraEnd: nakshatraEnd(ref),
      yogaIndex: yi, yoga: YOGA[yi], yogaEnd: yogaEnd(ref),
      karanaIndex: ki, karana: karanaName(ki),
      vara: VARA[wd], varaEn: VARA_EN[wd], varaHi: VARA_HI[wd], weekday: wd,
      masa: lm.amantaName, masaPurnimanta: lm.purnimantaName, adhika: lm.adhika,
      rashi: RASHI[Math.floor(sidSun(ref) / 30)], rashiHi: RASHI_HI[Math.floor(sidSun(ref) / 30)],
      samvat: sv, muhurat: muhurats(date, lat, lng)
    };
  }

  return {
    ayanamsa, sunLon, moonLon, elongation, sidMoon, sidSun,
    tithiIndex, nakshatraIndex, yogaIndex, karanaIndex,
    tithiName, karanaName, tithiEnd, nakshatraEnd, yogaEnd,
    sunTimes, moonTimes, lunarMonth, samvat, chaitraNewYear, muhurats, dayPanchang,
    istMidnight, prevNewMoon, nextNewMoon,
    constants: { TITHI_S, TITHI_K, NAK, YOGA, MONTHS, VARA, VARA_EN, VARA_HI, RASHI, RASHI_HI }
  };
});

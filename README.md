# पंचांग · Panchang Calendar

A **liquid-glass Indian calendar** — built around the Hindu lunisolar calendar
(Vikram Samvat and Shaka Samvat) rather than the Gregorian one.

## What it does

- **Month / Week / Day / Year views** with a frosted-glass, Apple-style UI.
- **Every day shows the Hindu date first** — the purnimanta lunar month, paksha and
  tithi — alongside the Gregorian date.
- **Full Panchang** in the day panel: Tithi (with end time), Nakshatra, Yoga, Karana,
  Paksha, lunar month (amanta **and** purnimanta), Sun sign, weekday, sunrise/sunset,
  moonrise/moonset.
- **Vikram Samvat, Shaka Samvat, Gujarati Samvat** and the 60-year Samvatsara name.
- **Muhurat & inauspicious times**: Brahma Muhurat, Abhijit, Rahu Kaal, Yamaganda,
  Gulika, Durmuhurta, and the day/night **Choghadiya**.
- **Festivals & vrat** for 2026–2027 (Diwali, Holi, Navratri, Ekadashi, Purnima,
  Amavasya, Pradosh, Sankashti and more).
- **Events**: add/edit/delete, colour, notes, **recurring** (daily/weekly/monthly/
  yearly), **reminders** via browser notifications, stored locally.
- **Sharing**: a Share button copies a link that carries your events to another device.
- **18 Indian cities** for sunrise/sunset & muhurat; **English ⇄ हिन्दी** toggle;
  light/dark theme.

## How the calendar is computed

The Panchang is computed live in the browser from astronomical positions using the
[`astronomy-engine`](https://github.com/cosinekitty/astronomy) library, with the
**Lahiri (Chitrapaksha) ayanamsa**.

- **Tithi** — 12° of the Moon–Sun elongation (ayanamsa-independent).
- **Nakshatra / Yoga** — sidereal longitudes, after subtracting the ayanamsa.
- **Karana** — 6° of elongation.
- **Lunar month** — amanta (new moon to new moon), named by the solar sign the Sun
  enters during it; a month with no sankranti is marked **Adhika**.
- **Samvat** — the year turns at Chaitra Shukla Pratipada.

Computed tithi, nakshatra, yoga, karana and sunrise/sunset were verified against
Drik Panchang for multiple dates and cities (see `panchang.js`).

> A tithi is read at **sunrise**, so a day's panchang can differ by a day between
> cities, and a short tithi can be skipped (kshaya). Where sources differ, this app
> follows the Drik convention.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure |
| `styles.css` | Liquid-glass styling |
| `panchang.js` | The Panchang engine |
| `app.js` | Calendar UI, events, sharing |
| `festivals.js` | Festival data, 2026–2027 |
| `astronomy.browser.min.js` | astronomy-engine (MIT) |

## Run locally

It's a static site — open `index.html`, or serve the folder:

```
python3 -m http.server 8000
```

Festival data is for India (IST); the app is India-focused.

# Output C – Final interactive prototype

> Sample prototype for learning and educational purposes only. Not for commercial use or commercial testing.

Wellness Tracker is a mobile-first fitness and wellness app for SOEN 357 (Concordia). It covers the four essential tasks:
- **T1:** set up a profile;
- **T2:** find today's information;
- **T3:** browse detailed data and pin or reorder metrics;
- **T4:** change personal information and preferences.

The questionnaire answers produce three different experiences: **Casual**, **Training** and **Performance**.

## Run it locally

Requirements: Node.js 20 or later and npm. It was tested with Node 26.13 and npm 11.20.

```bash
# from the project root
npm install          # once
npm run dev          # http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload on port 5173 |
| `npm run build` | Type check, then production build into `Output_C/prototype/dist` |
| `npm run preview` | Serve the production build on port 4173 |
| `npm run test:c` | Automated tests (needs a build and Chromium); writes `Final_Testing/test-results.md` |
| `npm run screens` | Re-export the high-fidelity screens into `Output_C/hi-fi/screens` |
| `npm run lofi` | Rebuild the low-fidelity wireframes from `Output_C/lo-fi/spec.mjs` |

The production build uses relative paths and a hash router, so `dist/` can be served from any static host or folder.

**Viewing as a phone:** open the URL in Chrome or Edge, press F12, then Ctrl+Shift+M, and choose a 390 × 844 device (iPhone 12/13/14). From 1024 px wide, the app switches to a side navigation layout.

## How to try it

| Way in | What you see |
|---|---|
| Welcome screen → **Try a demo profile → Sam Lee** | Casual: steps gauge, next session, nutrition. Sleep sits under "More" |
| **Alex Martin** | Training: today's session, weekly plan, volume, recovery, macros, sleep stages |
| **Jordan Rivera** | Performance: readiness estimate, key session, training load, hypnogram, macro rings |
| **Create account** | Full questionnaire (6 steps + preview), then an empty account with "Get started" |

The demo password for every demo account is `Demo1234`. To reset everything, go to **Settings → Prototype tools → Reset the whole prototype**.

## Simulated functionality (not real)

| Feature | What actually happens |
|---|---|
| Accounts and login | Stored in this browser's localStorage, with plain-text passwords. There is no server and no security |
| Demo accounts | Three fictional people with about two months of generated sample data |
| Food recognition from a photo | No image analysis. A food word in the file name ("banana.jpg") is matched; otherwise a stable pseudo-random food is chosen after 1.2 s. "blur", "dark" or "fail" in the name, or the **Blurry photo** sample, always fails |
| Smart device | No Bluetooth or health platform. Connecting waits 1.4 s and generates 14 days of steps |
| Data synchronization | Waits 1.1 s and succeeds. **Settings → Prototype tools → Simulate a sync failure** makes it fail so you can test **Retry** |
| Sleep stages for nights entered by hand | Generated from the duration and labelled "estimated" |
| Readiness score (Performance) | A documented formula on logged data: 45 % sleep vs goal, 35 % training-load balance, 20 % routine. It is labelled "Estimate", and no biometric measurement is involved |
| Training plan, fuel advice | Rule-based text written for the prototype. It is not coaching or medical advice |

## Limitations
- Data lives only in the current browser. Clearing site data removes it, and nothing syncs between devices.
- English only. Dates use the en-CA format.
- No real camera processing; the photo never leaves the browser.
- Charts show up to 8 weeks; there is no export.
- Tested in Chromium 130 (headless) at 360, 390, 412 and 1280 px. Real iPhone, Galaxy and Pixel devices and Safari were not tested.
- Screen readers were checked only by automated rules (axe-core) and by the structure (labels, roles, live regions). No manual NVDA or VoiceOver session was run.

## Where things are

```
Output_C/
  prototype/         app entry (index.html, main.tsx, vite.config.ts)
  lo-fi/             wireframes: spec.mjs → screens/*.svg, flow.svg, index.html, png/
  hi-fi/             screens/*.png (25 exports) + index.html gallery
  interactions.md    interaction annotations
  design-decisions.md
  changelog.md       what changed and why (vs the archived Output A / B)
packages/
  design-system/     tokens, components, charts (shared by future A/B)
  core/              data model, sample data, personalization engine, metrics, simulations, store
  screens/           all screens
Final_Testing/       test plan, results (run 1 and run 2), C.1 fixes, screenshots
```

The code before the C.1 fixes is kept in git as the tag `output-c` (`git checkout output-c`).

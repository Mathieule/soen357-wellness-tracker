# SOEN 357 – Phase 2, Task 4: Wellness Tracker

> Sample prototype for learning and educational purposes only. Not for commercial use or commercial testing.

Wellness Tracker is a mobile-first fitness and wellness app for casual users and athletes. The questionnaire answers produce three experiences: Casual, Training and Performance.

## Quick start

```bash
npm install
npm run dev            # Output C prototype → http://localhost:5173
```

On the welcome screen, choose **Try a demo profile** (Sam = Casual, Alex = Training, Jordan = Performance), or create an account. Full instructions, the list of simulated features and the limitations are in [Output_C/README.md](Output_C/README.md).

| Command | Purpose |
|---|---|
| `npm run dev` / `npm run build` / `npm run preview` | Develop, build (type check + Vite), serve the build |
| `npm run test:c` | Automated test run → `Final_Testing/test-results.md` |
| `npm run screens` | Export the high-fidelity screens (390 × 844) |
| `npm run lofi` / `npm run lofi:png` | Rebuild the wireframes / export them as PNG |
| `npm run archive:a` / `archive:b` | Run the archived first versions of Output A / B |

The screenshot and test tools need Chromium. They use `~/.cache/ms-playwright/chromium-1140` by default, or set `CHROMIUM_PATH`. On a bare Ubuntu/WSL install, also run `sudo apt install libnss3 libasound2t64 fonts-liberation`.

## Status

| Deliverable | State |
|---|---|
| **Output C** – final design and interactive prototype | Done: lo-fi (15 + flow), hi-fi (25 screens), prototype, interactions, design decisions, changelog, README |
| **Final testing** – plan, results, C.1 fixes | Done: 38 automated checks pass after C.1. No participant tests were run |
| **Output A / B** in the new design system | Planned. The first versions, faithful to Task 3, are in `Archive/v1-task3-faithful` |
| **AI documentation** | Updated; the team must complete `student-revisions.md` |

## Structure

```
packages/
  design-system/   tokens (tokens.css), components, charts          → @ds
  core/            data model, sample data, personalization engine,
                   metrics, simulations, localStorage store          → @core
  screens/         every screen of the app                           → @screens
Output_C/          prototype entry, lo-fi, hi-fi, docs
Final_Testing/     test-plan.md, test-results*.md, fixes-c1.md, screenshots/
Archive/           v1 (Task 3 faithful) Output A, B and early C preview
tools/             wireframe generator, screenshot exporter, test runner
AI_Documentation/  prompts, AI outputs, student revisions, verification
```

The new A and B iterations will reuse the same packages with different settings instead of copying code.

## Versions in git

| Tag / branch | Content |
|---|---|
| `v1-task3-faithful` | First A / B (literal Task 3) and the early C preview |
| `output-c` | Output C as first tested (test run 1) |
| `output-c1` / `main` | Output C.1 after the fixes |

## Credits
The component approach and `cn()` helper were adapted from [shadcndashboard/shadcndashboard](https://github.com/shadcndashboard/shadcndashboard) (MIT). Visual inspiration came from Skulpt, fitness-ui-mobile and logpress-public (patterns only, no code copied). See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

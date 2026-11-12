# C.1 revision log

| Run | Version | Result | Where |
|---|---|---|---|
| 1 | Original Output C (git tag `output-c`) | 32 passed, 5 failed of 37 | `test-results-run1.md` |
| 2 | After the C.1 fixes below (git tag `output-c1`) | 38 / 38 | git history, tag `output-c1` |
| 3 | Final Output C, aligned with the Task 2 Output C document (week / month / year charts, "more data?" question, recommendations, accessibility mode, labels, dashboard top, questionnaire rules, meal quantity; see `Output_C/requirements-check.md`) | **44 / 44** | `test-results.md` |

Before and after screenshots are in `screenshots/`.

## Product issues fixed

### C1-01 – "Simulate a sync failure" switch too small
- **Issue:** the switch in Settings → Prototype tools was a native checkbox of 28 × 28 px.
- **Impact:** below the 44 × 44 px touch target (AR4). It was hard to hit for users with motor impairments, and its state was shown only by a small tick.
- **Component:** `packages/screens/src/settings/SettingsScreen.tsx` (ToolsSection).
- **Correction:** replaced with a `role="switch"` button of 84 × 44 px. Its state is shown by the knob position **and** the words "On" / "Off". It is labelled by the visible title, with the explanation linked through `aria-describedby`.
- **Verification:** test A-01 failed in run 1 ("Settings: INPUT 28×28") and passes in run 2 (all targets 44 px or more on 5 pages). axe-core still reports no serious or critical issues (A-03). Screenshots: `C1-01-settings-before.png` and `-after.png`.

### C1-02 – Last night's duration wrapped on two lines
- **Issue:** on the Sleep page at 390 px, the "Great night" pill shared the row with the 36 px duration, so "8 h 45 min" broke onto two lines and the pill text wrapped too.
- **Impact:** the key number of the screen was harder to read, and the card looked broken (visual hierarchy, AR12 consistency).
- **Component:** `SleepScreen.tsx` (LastNight) and `Surface.tsx` (`Pill`).
- **Correction:** the label and pill moved to their own row, and the duration sits on its own line with `nowrap`. Pills can no longer wrap or shrink anywhere in the app.
- **Verification:** new regression test R-03 (duration takes 1 line) passes; visual check in `C1-02-03-sleep-after.png`.

### C1-03 – Sleep log time ranges split over two lines
- **Issue:** in the sleep log, the quality pill on the right squeezed the meta text, so "23:00 to / 07:45" broke in the middle of the range.
- **Impact:** a time range split across lines is easy to misread, and the list was taller and harder to scan.
- **Component:** `SleepScreen.tsx` (Log).
- **Correction:** the row now reads "Today · 8 h 45 min" on the first line and "23:00–07:45 · Great night" on the second (quality as words, an en dash for the range).
- **Verification:** R-03 (meta on 1 line) passes; visual check in `C1-02-03-sleep-after.png`.

## Test-script issues (no product change)

| ID | Tests | Cause | Fix | Verified |
|---|---|---|---|---|
| TS-01 | T4-01, X-04 | The script read the page before navigation finished (heading still "Settings"; meal list not rendered yet) | Wait for the expected heading before reading | Both pass in run 2 |
| TS-02 | X-07, X-08 | The label "Bedtime" also matched the "Bedtime regularity" section, so the locator was ambiguous | Use an exact label match | Both pass in run 2 |

## Tool fix
- **Issue:** in full-page screenshot exports, a fixed toast appeared in the middle of the image.
- **Correction:** the exporter now hides fixed live regions before a full-page capture (`tools/screenshots/capture.mjs`).
- The app itself is unchanged, since toasts are correctly placed on the real screen.

## Not changed (known, accepted)
- **Readiness:** the estimate can reach the high 90s for well-rested demo users. This is accepted because the formula is documented and labelled "Estimate".

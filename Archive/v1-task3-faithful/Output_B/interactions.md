# Output B – Interaction annotations

Revised design, built from Output A plus the Task 3 Output B changelog. **Only the differences from A are described in full here.** Everything else behaves as in [Output_A/interactions.md](../Output_A/interactions.md).

- **Low-fidelity:** [lo-fi/index.html](lo-fi/index.html) (B-L01 to B-L16, plus [lo-fi/flow.svg](lo-fi/flow.svg)). Red dashed outlines mark changes.
- **High-fidelity:** [hi-fi/app](hi-fi/app), with exported screens in `hi-fi/screens/` (B01–B29).
- **Changelog with reasons:** [changelog.md](changelog.md).

## Navigation model (changes in **bold**)

| From | Control | Goes to |
|---|---|---|
| Dashboard / any menu | **Settings button (top-right)** | **Settings** |
| Fitness / Sleep / Nutrition / Settings | **Back button (top-left)** | **Dashboard** |
| Any signed-in page | Bottom bar: Home, Nutrition, Fitness, Sleep (**no Profile**) | that menu |
| Dashboard | **Customize dashboard / Done customizing** | toggles edit mode |
| Dashboard, More metrics | **Nutrition Metrics ›** | that menu (even when unpinned) |

## Dashboard (B04, B25–B27)

**Normal mode** is the same as A: the widget grid, ↓/↑ between widgets, and ↓ on the last widget to the nav bar. There is now a Settings button top-right and a **Customize dashboard** button under the greeting.

**Customize mode** (the button has `aria-pressed="true"` and reads "Done customizing"):
- Widgets are shown one per row inside a dashed frame, each followed by a group labelled "Arrange <metric>" with three buttons:
  - **Up** moves the widget one place up. It is disabled on the first widget.
  - **Down** moves it one place down. It is disabled on the last widget.
  - **Unpin** removes it from the dashboard and moves it to **More metrics**.
- Every action is **saved immediately** (localStorage) and confirmed with a success message that gives the new position.
- After the action, focus stays on the same arrow button. After Unpin or Pin, focus moves to Customize.

**More metrics** appears when at least one metric is unpinned. Each row has a link to open the menu and a **Pin** button that adds the metric back at the end of the dashboard.

**Empty state:** if every metric is unpinned, the page says "No metrics are pinned. Pin a metric under 'More metrics' below."

## Menus: Fitness, Sleep, Nutrition (B09–B21)
- **Top bar:** Back (← "Back") on the left, the page title, and Settings (⚙ "Settings") on the right. Both buttons are 64 × 64 px, in the same gray as the nav bar, with a text label under the icon. Their accessible names are "Back to dashboard" and "Settings".
- **Focus on arrival:**
  - From a dashboard widget or a More metrics link, focus moves to the main action (**Add exercise / Add or edit sleep / Add food**).
  - From the nav bar, focus **stays on the nav bar item**, so the user can continue with ← / → or Enter.
- **↑ on the main action** moves focus to the current nav bar item (C11, C15, C18 in Output B).
- All pop-ups (add, detail, calendar, photo recognition) are unchanged from A.

## Settings (B22–B24)
- Settings opens from the top-right button. It has a Back button and no nav item is highlighted.
- It contains the avatar and name, Personal information (with confirmation), Fitness profile (with confirmation), Log out, Delete account ("Are you sure?") and Reset prototype data.
- The **Dashboard widgets section was removed** and replaced by a hint: "To pin, unpin or reorder… use Customize dashboard".

## Navigation bar (all signed-in pages)
- There are four items. **← / →** move focus along the bar and wrap around. Tab still works as usual.
- Links carry `{ via: 'nav' }` in router state, so the next page knows not to steal focus.

## Keyboard summary (Output B)

| Where | Keys | Result |
|---|---|---|
| Nav bar | ← / → | Previous / next item (wraps) |
| Nav bar | Enter | Open the menu; **focus stays on the bar** |
| Dashboard widget | ↓ / ↑, Enter | Move between widgets; Enter opens the menu and **focuses its main action** |
| Menu main action | ↑ | **Focus the current nav bar item** |
| Customize mode | Tab, Enter / Space | Reach and press Up / Down / Unpin / Pin; focus is kept after each change |
| Pop-ups | Esc | Close (same as A) |

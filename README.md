# Jenga Code — Maze Studio

Extract this ZIP into your maze project folder. `index.html`, `css/` and `js/` belong directly inside that folder. Open `index.html` in a modern browser or upload the files to your static hosting. No build step, external JavaScript or API key is required.

The page uses the shared blue/white Jenga Code style, with compact controls on the left and a large maze on the right. The desktop workspace fits the viewport where space allows; short screens can scroll the sidebar, and narrow screens stack the controls and canvas. The explanation is in an expandable sidebar section. The maze uses light backgrounds, blue activity and solution colours, and a coral exit.

## Controls

- Set width and height between 5 and 100 cells.
- Generate maze runs animated recursive backtracking.
- Solve maze becomes available after generation completes.
- Adjust animation speed while an operation runs.
- Clear cancels generation or solving and returns to an uncarved grid.

Generation and solving algorithms are retained. The renderer changes are colour styling only. The app also refreshes button states after replacing a grid, so Solve remains disabled after Clear or a dimension change.

## Website integration

Shared links and the logo assume this page lives two folders below the site root, for example `/projects/maze/`. The logo is loaded from `../../images/logo.png`, with a text fallback when unavailable. Shared site pages and the logo are not included.

## Validation

Generation, solving, clear, animation cancellation and button states passed using actual canvas rendering with a simulated DOM. A solved maze was visually inspected. All app IDs and local file references were checked. A full browser page-layout preview was unavailable; check the desktop/mobile layout after extracting.

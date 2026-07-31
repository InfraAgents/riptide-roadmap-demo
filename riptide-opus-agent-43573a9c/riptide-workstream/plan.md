# Implementation plan — Scientific mode

## Technical context

- **Stack:** plain ES modules, no build step, `node --test`, `index.html` at the
  repo root served as-is by GitHub Pages. No dependencies may be added.
- **Existing shape:** `src/calculator.js` is a pure, immutable state machine for
  the basic keypad; `src/app.js` renders state and dispatches actions;
  `index.html` holds the markup; `styles.css` the theme. Tests live in
  `test/calculator.test.js` and drive the pure functions directly.
- **Guiding constraint from the roadmap:** the first slice must build the
  precedence-aware expression evaluator as a *reusable foundation*. So the
  evaluator is a separate module with a variable-binding seam, not baked into
  the UI.

## Approach & key decisions

1. **New module `src/expression.js` — pure evaluator.** A tokeniser plus a
   recursive-descent (Pratt-style) parser producing a value directly. Chosen
   over shunting-yard because recursive descent reads clearly, handles
   right-associative `^` and unary minus naturally, and stays dependency-free.
   It exports `evaluate(expression, variables = {})` returning a `number` and
   throwing on syntax errors. **Rationale:** keeping it pure and string-in /
   number-out means the graphing slice can call `evaluate(src, { x })` per
   sample with zero changes (FR-005, SC-003).

2. **Radians for trig, base-10 for `log`, natural for `ln`.** Matches common
   scientific-calculator conventions and the standard `Math.*` primitives, so
   no conversion tables are needed. Degrees mode is a non-goal.

3. **Scientific *expression* entry mode layered on the existing engine.** The
   basic keypad and its `calculator.js` state machine are left untouched
   (FR-010). Scientific mode maintains a separate expression string in
   `app.js`; scientific keys append tokens; `=` calls `evaluate` and formats via
   the existing `formatNumber`. **Rationale:** this avoids re-architecting the
   proven basic engine while delivering full-expression evaluation, and keeps
   the risk contained to new code paths.

4. **A `Sci` toggle hides/shows scientific keys** (FR-009). Basic view is the
   default and pixel-identical to today. **Rationale:** the roadmap demands "no
   crowding the basic keypad."

5. **Errors throw, non-finite results use the existing `Error` state.** Syntax
   errors throw from `evaluate`; `app.js` catches them and shows the existing
   recoverable `Error` display. Non-finite math (`ln(0)`) is caught by the same
   finiteness check used today (FR-006, FR-008).

## File-by-file changes

### Added

- **`src/expression.js`** — the reusable evaluator.
  - `tokenize(source)` → array of tokens (numbers, operators, parens,
    identifiers, function names, constants). ASCII aliases normalised:
    `*`→`×`, `/`→`÷`, `pi`→`π`, `sqrt`→`√`.
  - `evaluate(source, variables = {})` → `number`; recursive-descent parser with
    precedence: `parseExpression` (`+ −`) → `parseTerm` (`× ÷`) → `parsePower`
    (`^`, right-assoc, with unary minus) → `parsePrimary` (numbers, constants,
    variables, `(` … `)`, function calls). Throws `Error` on malformed input.
  - Constants table `{ π, e }`, functions table
    `{ sin, cos, tan, ln, log, √ }`.

- **`test/expression.test.js`** — `node --test` suite covering precedence,
  parentheses, `^` associativity, unary minus, every function and constant,
  variable binding, and each error case from the spec (SC-001…SC-005).

### Changed

- **`index.html`** — add a `Sci` toggle button and a scientific key panel
  (`sin cos tan ln log √ ^ ( ) π e`) inside the keypad region, using the
  existing `data-action` / `data-value` convention. The panel is hidden by
  default via a class toggled from `app.js`. Update the keyboard hint text.

- **`src/app.js`** — add scientific-mode state and dispatch:
  - a `mode` flag and expression string; `render` shows the expression while in
    scientific mode.
  - handlers for the new actions (append function/constant/paren/operator token,
    evaluate on `=` through `evaluate`, catch errors → `Error` state).
  - wire the `Sci` toggle. Keyboard bindings extended for `(`, `)`, `^`.

- **`styles.css`** — styles for the `Sci` toggle and the scientific panel
  (a compact grid row above the existing keypad), following the current
  `--key` / `--accent` variables. Purely additive; basic layout unchanged.

- **`README.md`** — a short "Scientific mode" note describing the toggle and the
  supported functions/constants, matching the existing README tone.

## Testing strategy

- Unit tests for `evaluate` are the primary safety net (pure, fast, exhaustive
  over the spec's success criteria and edge cases).
- The full existing `test/calculator.test.js` runs unchanged to prove the basic
  engine is untouched (FR-010).
- UI wiring is verified manually against the wireframe; no DOM test harness is
  added (the project has none and adding one would break the dependency-free
  constraint).

## Risks & mitigations

- **Tokeniser ambiguity** (e.g. `-` as unary vs binary): resolved in the parser
  by handling unary minus in `parsePower`/`parsePrimary` based on position.
- **Scope creep into graphing:** explicitly deferred; only the `variables` seam
  is delivered and tested (SC-003).
- **Regressing the basic keypad:** mitigated by leaving `calculator.js` and its
  tests untouched and keeping scientific state separate in `app.js`.

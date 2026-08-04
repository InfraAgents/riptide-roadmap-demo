# Implementation plan — Scientific mode

## Technical context

- Dependency-free ES modules, no build step; `index.html` at the repo root is
  served as-is by GitHub Pages.
- Tests run with `node --test` against pure modules that never touch the DOM.
- The current engine (`src/calculator.js`) is a step-at-a-time left-to-right
  state machine. Scientific mode needs a real parser, so we add a **new** pure
  module rather than contorting the existing one, and keep the basic path
  untouched.

## Approach

1. **New pure expression engine** (`src/expression.js`) — tokenizer +
   recursive-descent parser producing a number. This is the reusable
   foundation the roadmap asks for. It is DOM-free and fully unit-tested. It
   accepts a small options object (`{ degrees }`) so the DEG/RAD toggle can be
   threaded through, and later graphing can bind `x`.
2. **Scientific state in the calculator module** — add functions to
   `src/calculator.js` that build an expression string from key presses and an
   `evaluateExpression(state, options)` that calls the engine and formats the
   result with the existing `formatNumber`. Scientific state lives alongside the
   existing basic state, keyed by a `mode` flag, so basic behaviour is
   unchanged when scientific mode is off.
3. **UI wiring** — add a scientific toggle and a hidden scientific key panel to
   `index.html`, style it in `styles.css`, and extend `src/app.js` to dispatch
   the new actions and keyboard bindings.

## File-by-file changes

### New: `src/expression.js`
- `evaluate(input, options = {})` — parse and evaluate; returns a number.
  Throws `ExpressionError` for malformed input.
- Internal `tokenize(input)` — numbers, operators, parentheses, function
  names, constants; normalises `*`→`×`, `/`→`÷`, `pi`→`π`, `sqrt`→`√`.
- Internal recursive-descent parser: `parseExpression` (`+ -`),
  `parseTerm` (`× ÷`), `parseFactor` (unary minus, `^` right-assoc),
  `parseAtom` (number, constant, parenthesised group, function call).
- `FUNCTIONS` map (`sin`, `cos`, `tan`, `ln`, `log`, `√`) and `CONSTANTS`
  (`π`, `e`); trig honours `options.degrees`.
- Non-finite results throw `ExpressionError`.

### New: `test/expression.test.js`
- Precedence, associativity, parentheses, functions, constants, DEG/RAD,
  and every error edge case from spec.md.

### Changed: `src/calculator.js`
- Add scientific-input helpers that append tokens to an `expression` string in
  state and an `evaluateExpression` that runs the engine and formats via
  `formatNumber`. Keep all existing exports and behaviour intact.
- Add `expressionInput`, `evaluateExpression`, `toggleAngleMode` (or similar)
  and extend `initialState` with `mode: "basic"`, `expression: ""`,
  `degrees: false` **without** breaking `deepEqual` on the basic reset test —
  the existing `clear` test compares to `initialState`, so new fields are added
  to `initialState` itself so equality still holds.

### Changed: `test/calculator.test.js`
- Add scientific-mode state-machine tests (building an expression, evaluating,
  backspace, clear). Existing tests are **not** modified.

### Changed: `index.html`
- Add a "Sci" toggle button and a `.keypad--scientific` panel (hidden by
  default) with keys: `(`, `)`, `sin`, `cos`, `tan`, `ln`, `log`, `√`, `^`,
  `π`, `e`, and a `DEG/RAD` toggle. Uses the same `data-action`/`data-value`
  convention as existing keys.

### Changed: `src/app.js`
- Handle the new actions (`toggle-scientific`, `function`, `constant`, `paren`,
  `power`, `toggle-angle`) and route input to scientific state when the mode is
  on. Add keyboard bindings for `(`, `)`, `^` and typed constants.

### Changed: `styles.css`
- Style the scientific panel and toggle; hidden state; responsive grid that
  does not disturb the basic keypad layout.

### Changed: `README.md`
- Document scientific mode, the expression engine module, and DEG/RAD in the
  feature list and layout table.

## Key decisions

- **Recursive-descent parser, no `eval`.** Predictable, testable, safe, and
  small enough to stay dependency-free. `eval`/`Function` are rejected for
  security and because they don't give us controlled error handling or the
  DEG/RAD hook graphing will need.
- **Separate engine module.** Keeping `evaluate` DOM-free and standalone is
  exactly what makes graphing able to reuse it (`evaluate(expr, { x })`
  later), and mirrors the repo's existing "pure logic in a module" convention.
- **New fields go into `initialState`.** The existing `clear` test does
  `deepEqual(state, initialState)`; adding the scientific fields to
  `initialState` itself keeps that test green while giving scientific mode the
  state it needs.
- **Radians default with a DEG toggle.** Matches JS `Math` semantics as the
  base, with an opt-in DEG mode that most casual users expect — documented and
  tested both ways.
- **No implicit multiplication.** Keeps the tokenizer and parser simple and the
  behaviour unambiguous; documented as a non-goal.

## Testing strategy

- `test/expression.test.js` covers the engine exhaustively (values + errors).
- New cases in `test/calculator.test.js` cover the scientific state path.
- All existing tests must remain green (`npm test`), proving no basic-mode
  regression.

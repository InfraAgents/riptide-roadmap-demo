# Tasks — Scientific mode

Dependency-ordered. Each task lists an acceptance check. Build the engine and
its tests first (the reusable foundation), then the state machine, then the UI.

## T001 — Create the expression engine skeleton
Add `src/expression.js` with `ExpressionError`, `tokenize(input)`, and an
`evaluate(input, options)` stub. Normalise `*`→`×`, `/`→`÷`, `sqrt`→`√`,
`pi`→`π`.
**Check:** `tokenize("2 + 3")` yields the expected token list; module imports
without error.

## T002 — Implement the recursive-descent parser and evaluation
Implement `parseExpression`/`parseTerm`/`parseFactor`/`parseAtom` covering
`+ - × ÷ ^`, unary minus, parentheses, numbers, and constants `π`, `e`.
**Check:** `evaluate("2 + 3 × 4")` = `14`; `evaluate("(2 + 3) × 4")` = `20`;
`evaluate("2 ^ 3 ^ 2")` = `512`; `evaluate("π")` ≈ `3.14159265`.

## T003 — Add functions and DEG/RAD support
Add `sin`, `cos`, `tan`, `ln`, `log`, `√` with `options.degrees` for trig.
**Check:** `evaluate("sin(π / 6)")` = `0.5` (rad); `evaluate("sin(30)", {degrees:true})` = `0.5`;
`evaluate("log(1000)")` = `3`; `evaluate("ln(e)")` = `1`; `evaluate("√(9)")` = `3`.

## T004 — Error handling for malformed input
Throw `ExpressionError` for unbalanced parentheses, unknown tokens, empty
input, division by zero, `√` of negatives, and non-finite results.
**Check:** `evaluate("(2 + 3")` throws; `evaluate("1 ÷ 0")` throws;
`evaluate("√(-1)")` throws; `evaluate("")` throws.

## T005 — Write `test/expression.test.js`
Cover every US-1/US-2 scenario and every edge case from spec.md (values +
error paths).
**Check:** `npm test` runs the new file and it passes.

## T006 — Add scientific state to the calculator module
Extend `initialState` with `mode`, `expression`, `degrees`; add
`expressionInput`, `evaluateExpression` (using `formatNumber`), backspace/clear
handling for the expression, and an angle-mode toggle. Do not change existing
exports/behaviour.
**Check:** Building `2`,`+`,`3` then evaluating gives `5`; existing `clear`
`deepEqual(initialState)` test still passes.

## T007 — Add scientific-mode tests to `test/calculator.test.js`
Add cases for building/evaluating an expression, backspace, clear, and DEG/RAD
toggle. Do not modify existing tests.
**Check:** `npm test` passes including new cases.

## T008 — Add the scientific keypad and toggle to `index.html`
Add a "Sci" toggle and a hidden `.keypad--scientific` panel with functions,
constants, `(`, `)`, `^`, `√`, and DEG/RAD, using the existing
`data-action`/`data-value` convention.
**Check:** Page loads; basic keypad unchanged; scientific panel present but
hidden by default.

## T009 — Wire scientific actions and keyboard in `src/app.js`
Dispatch the new actions, route input to scientific state when the mode is on,
render the expression line, and add keyboard bindings for `(`, `)`, `^`, and
typed constants without breaking existing bindings.
**Check:** Manual: toggling Sci shows the panel; `sin(π/6)=` shows `0.5`;
existing basic keyboard flow still works.

## T010 — Style the scientific panel in `styles.css`
Hidden/shown states, responsive grid, consistent with existing key styles.
**Check:** Panel matches the wireframe; no layout shift to the basic keypad
when closed.

## T011 — Update README and run full suite
Document scientific mode, DEG/RAD, and the engine module. Run `npm test`.
**Check:** `npm test` green; README reflects the new feature and layout.

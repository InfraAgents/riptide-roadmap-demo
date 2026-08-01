# Tasks — Scientific mode

Dependency-ordered. Each task is small enough to verify on its own.

## T001 — Tokenizer for the scientific grammar
Create `src/expression.js` with a tokenizer that turns an expression string into
tokens: numbers (with decimals), operators (`+ - × ÷ ^`), parens (`( )`),
functions (`sin cos tan log ln √`), and constants (`π e`). Unknown characters
throw `ExpressionError`.
**Check:** temporary console/test call tokenizes `"2 + 3 × 4"` and
`"sin(π ÷ 2)"` into the expected token lists; an unknown char throws.

## T002 — Recursive-descent evaluator (precedence + parens)
Implement `evaluate(expression)` in `src/expression.js` using the grammar in
plan.md: `expr → term → power → unary → primary`. Handle `+ - × ÷`, right-
associative `^`, unary minus, and parentheses. Throw `ExpressionError` on
malformed input (empty, trailing operator, unbalanced parens).
**Check:** `evaluate("2 + 3 × 4") === 14`, `evaluate("(2 + 3) × 4") === 20`,
`evaluate("2 ^ 3 ^ 2") === 512`, `evaluate("10 − 2 − 3") === 5`;
`evaluate("(1")` and `evaluate("2 +")` throw.

## T003 — Functions and constants
Wire `sin cos tan log ln √` (radians; `log` base 10, `ln` natural) and the
constants `π`, `e` into the evaluator. Functions require a parenthesised
argument.
**Check:** `evaluate("sin(π ÷ 2)") ≈ 1`, `evaluate("log(1000)") === 3`,
`evaluate("ln(e)") ≈ 1`, `evaluate("√(9)") === 3`, `evaluate("2 ^ 10") === 1024`.

## T004 — Non-finite results surface as errors
Ensure results that are `NaN`/`±Infinity` are detectable by the caller (the
evaluator returns the number; the calculator layer maps non-finite to `Error`).
**Check:** `evaluate("√(-1)")` is `NaN`; `evaluate("log(0)")` is `-Infinity` —
both classified as errors by the calculator helper in T006.

## T005 — Tests for the expression engine
Write `test/expression.test.js` covering: precedence, associativity,
parentheses, unary minus, every function and constant, and error cases (empty,
trailing operator, unbalanced/empty parens, `√(-1)`, `log(0)`).
**Check:** `node --test` passes with the new file.

## T006 — Calculator scientific sub-state
Extend `src/calculator.js` with helpers to build an expression buffer from
tokens, backspace within it, and `evaluateExpression(state)` that calls
`evaluate`, reuses `formatNumber`, and maps thrown errors / non-finite results
to the existing recoverable `errorState`. Basic-mode exports stay unchanged.
**Check:** existing `test/calculator.test.js` still passes; new focused tests
for the expression helpers pass.

## T007 — Scientific panel markup and toggle
Edit `index.html` to add the scientific-mode toggle (`aria-pressed`) and a
scientific key panel (`sin cos tan`, `log ln √`, `x²`/`xʸ` (`^`), `π`, `e`,
`(`, `)`), hidden by default. Basic keypad markup unchanged.
**Check:** page renders; toggling shows/hides the panel; basic keypad identical.

## T008 — App wiring for scientific mode
Edit `src/app.js`: handle the toggle, append scientific tokens to the buffer,
route `=` through `evaluateExpression` when in scientific mode, and add keyboard
bindings for `(`, `)`, `^`. Off-mode behaviour unchanged.
**Check:** in the browser, `( 2 + 3 ) × 4 =` shows `20`; `sin ( π ÷ 2 ) =`
shows `1`; unbalanced parens show recoverable `Error`.

## T009 — Styling
Edit `styles.css` to style the toggle and scientific panel using existing
`.key`/`.keypad` conventions and the current colour scheme. No new palette.
**Check:** panel matches the app's look in light and dark; layout stays on the
calculator shell.

## T010 — README update
Document scientific mode, the radians convention, and note graphing is future
work.
**Check:** README lists scientific mode under Features and mentions radians;
`src/expression.js` appears in the layout table.

## T011 — Green build and commit
Run the full suite; ensure SC-001…SC-006 hold. Commit all changes.
**Check:** `node --test` is green; `git status` clean after commit.

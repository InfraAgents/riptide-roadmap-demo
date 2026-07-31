# Tasks — Scientific mode

Dependency-ordered. Each task is small enough to verify on its own.

## T001 — Tokeniser in `src/expression.js`
Create `src/expression.js` with `tokenize(source)` producing tokens for
numbers, operators (`+ − × ÷ ^`), parentheses, identifiers, function names and
constants. Normalise ASCII aliases: `*`→`×`, `/`→`÷`, `pi`→`π`, `sqrt`→`√`.
Ignore whitespace.
**Acceptance:** `tokenize("2 + sin(π)")` yields the expected token sequence;
unknown characters throw.

## T002 — Recursive-descent `evaluate` with precedence
Add `evaluate(source, variables = {})` parsing tokens with precedence
`+ −` → `× ÷` → `^` (right-assoc, unary minus) → primary (number, constant,
variable, parenthesised group, function call). Return a `number`.
**Acceptance:** `evaluate("2 + 3 × 4") === 14`,
`evaluate("(2 + 3) × 4") === 20`, `evaluate("2 ^ 3 ^ 2") === 512`,
`evaluate("2 × -4") === -8`. (Covers SC-001.)

## T003 — Functions and constants
Wire the functions `sin cos tan ln log √` (radians; `log` base 10) and constants
`π e` into the primary parser.
**Acceptance:** `Math.abs(evaluate("sin(π / 6)") - 0.5) < 1e-12`,
`evaluate("log(1000)") === 3`, `evaluate("√(144)") === 12`,
`evaluate("2 × e") ≈ 2 × Math.E`. (Covers SC-002.)

## T004 — Variable binding seam
Support the optional `variables` map: identifiers that aren't a known constant
or function resolve from it; unknown & unbound identifiers throw.
**Acceptance:** `evaluate("x ^ 2 + 1", { x: 4 }) === 17`;
`evaluate("y", {})` throws. (Covers SC-003, FR-005.)

## T005 — Error handling for malformed input
Ensure syntax problems throw `Error` (never return `NaN`): unbalanced parens,
missing operands, trailing operators, empty input.
**Acceptance:** `evaluate("(2 + 3")`, `evaluate("2 +")`, `evaluate("2 + × 3")`,
`evaluate("")` each throw. (Covers SC-004, FR-006.)

## T006 — Expression evaluator test suite
Write `test/expression.test.js` (`node --test`) covering T002–T005 and every
edge case in the spec (nested parens, `((1))`, unary minus after operator).
**Acceptance:** `npm test` runs the new suite green alongside the existing
`calculator.test.js`. (Covers SC-006.)

## T007 — Scientific keypad markup and toggle
In `index.html`, add a `Sci` toggle and a scientific key panel
(`sin cos tan ln log √ ^ ( ) π e`) using the existing `data-action` /
`data-value` convention; hidden by default. Update the keyboard hint.
**Acceptance:** default view is identical to today; toggling reveals the panel.
(Covers US-2, FR-009.)

## T008 — Scientific-mode wiring in `src/app.js`
Add scientific-mode state (mode flag + expression string), dispatch handlers to
append tokens, evaluate on `=` via `evaluate`, catch errors → recoverable
`Error` state, and use `formatNumber` for output. Wire the toggle and extend
keyboard bindings for `(`, `)`, `^`.
**Acceptance:** entering `sin(π ÷ 6) =` shows `0.5`; `(2 + 3` then `=` shows
`Error` and the next digit starts fresh; basic keypad still works. (Covers
US-1, US-3, FR-007, FR-008.)

## T009 — Styles and README
Add `styles.css` rules for the toggle and scientific panel using existing CSS
variables (additive; basic layout unchanged). Add a short "Scientific mode"
note to `README.md`.
**Acceptance:** the scientific panel is legible in light and dark themes and on
narrow screens; README documents the toggle and supported functions.

## T010 — Full regression
Run `npm test`; confirm all pre-existing `calculator.test.js` tests still pass
and the new `expression.test.js` passes.
**Acceptance:** `npm test` is green. (Covers FR-010, SC-006.)

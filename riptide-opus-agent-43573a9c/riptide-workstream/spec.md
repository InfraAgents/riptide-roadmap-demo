# Scientific mode — expression evaluator with functions, constants & parentheses

## Summary

Add a **scientific mode** to the calculator: trigonometry, logarithms, powers
and roots, the constants `π` and `e`, and parentheses. This requires a real
expression evaluator with operator precedence and grouping — the foundation the
roadmap says "whichever lands first should build so the other can reuse it."
This slice builds that evaluator as a standalone, tested module and wires it
into a togglable scientific keypad, without crowding the existing basic keypad.

The current calculator keeps a running left-to-right `state` machine
(`previous`/`operator`/`current`). Scientific expressions like
`2 + 3 × sin(π ÷ 6)` cannot be evaluated that way. So this slice introduces a
new pure module, `src/expression.js`, that tokenises and evaluates a string
expression with correct precedence, and a lightweight expression-entry mode in
the UI layered on top of the existing basic calculator.

## Roadmap coverage

This workstream covers roadmap item **1. Scientific mode** and the shared
foundation both remaining items depend on:

> 1. **Scientific mode** — trigonometry, logarithms, powers and roots, `π` and
>    `e`, and parentheses, without crowding the basic keypad.

> Both need to evaluate expressions with real precedence and parentheses, which
> the current left-to-right engine can't do. Whichever lands first should build
> that foundation so the other can reuse it.

Scientific mode is chosen as the first slice precisely because it is the natural
home for that foundation: it exercises functions, constants, powers and
parentheses. The evaluator is deliberately exported as a reusable
`evaluate(expression)` / `evaluate(expression, variables)` function so the later
graphing slice can call it with `x` bound per sample point — no rework needed.

## User stories

### US-1 — Compute a scientific expression (Priority: P1)

As someone doing math beyond arithmetic, I want to type an expression with
functions, constants and parentheses and get the correct result respecting
precedence, so I don't have to break it into left-to-right steps.

**Why this priority:** it is the core promise of the slice and the reason the
evaluator exists.

**Acceptance scenarios:**

1. **Given** the calculator, **when** I enter `2 + 3 × 4` and press `=`,
   **then** the display shows `14` (multiplication before addition).
2. **Given** the calculator, **when** I enter `( 2 + 3 ) × 4` and press `=`,
   **then** the display shows `20`.
3. **Given** the calculator, **when** I enter `sin( π ÷ 6 )` and press `=`,
   **then** the display shows `0.5`.
4. **Given** the calculator, **when** I enter `2 ^ 10` and press `=`,
   **then** the display shows `1024`.
5. **Given** the calculator, **when** I enter `√( 144 )` and press `=`,
   **then** the display shows `12`.

### US-2 — Toggle the scientific keypad (Priority: P1)

As a user who mostly does arithmetic, I want scientific functions tucked behind
a toggle so the basic keypad stays uncluttered, but reachable in one tap.

**Why this priority:** the roadmap explicitly requires "without crowding the
basic keypad."

**Acceptance scenarios:**

1. **Given** the default view, **when** the page loads, **then** the basic
   keypad is shown exactly as it is today and a **Sci** toggle is visible.
2. **Given** the basic view, **when** I activate the **Sci** toggle, **then** an
   extra row/panel of scientific keys (`sin cos tan ln log √ ^ ( ) π e`)
   appears and the toggle reflects the active state.
3. **Given** the scientific view, **when** I activate the toggle again, **then**
   the scientific keys hide and the basic layout returns.

### US-3 — Recover from malformed input (Priority: P2)

As a user, when I enter something that isn't a valid expression, I want a clear,
recoverable error rather than a crash or a wrong number.

**Acceptance scenarios:**

1. **Given** the calculator, **when** I enter `( 2 + 3` and press `=`,
   **then** the display shows `Error` and the next digit I type starts a fresh
   entry (mirrors today's division-by-zero recovery).
2. **Given** the calculator, **when** I enter `ln( 0 )` and press `=`,
   **then** the display shows `Error` (result is not finite).
3. **Given** the calculator, **when** I enter `2 + × 3` and press `=`,
   **then** the display shows `Error`.

## Functional requirements

- **FR-001** The system MUST provide a pure function `evaluate(expression)` in
  `src/expression.js` that parses a string and returns a `number`, respecting
  standard precedence: parentheses → function application → unary minus and `^`
  (right-associative) → `× ÷` → `+ −`.
- **FR-002** `evaluate` MUST support the binary operators `+`, `-`, `×` (and
  ASCII `*`), `÷` (and ASCII `/`), and `^`, and unary minus (e.g. `-3`,
  `2 × -4`).
- **FR-003** `evaluate` MUST support the functions `sin`, `cos`, `tan`, `ln`
  (natural log), `log` (base 10), and `√`/`sqrt`, applied to a parenthesised
  argument. Trigonometric functions operate in **radians**.
- **FR-004** `evaluate` MUST recognise the constants `π` (and ASCII `pi`) and
  `e`, substituting `Math.PI` and `Math.E`.
- **FR-005** `evaluate` MUST accept an optional second argument
  `variables` (an object map, e.g. `{ x: 2 }`) so identifiers not matching a
  known constant or function resolve from it — enabling the future graphing
  slice to bind `x` per sample without any change to this module.
- **FR-006** On malformed input (unbalanced parentheses, missing operands,
  unknown identifiers with no binding, empty expression) `evaluate` MUST throw
  an `Error`; it MUST NOT return `NaN` for syntax problems.
- **FR-007** The calculator MUST gain a scientific entry mode where key presses
  append tokens to an expression string shown on the display, and `=` evaluates
  it via `evaluate`, formatting the result with the existing `formatNumber`.
- **FR-008** A non-finite result (e.g. `1 ÷ 0`, `ln(0)`, `√(-1)`) MUST produce
  the existing recoverable `Error` state, consistent with today's behaviour.
- **FR-009** A **Sci** toggle MUST show/hide the scientific keys; the basic
  keypad and its existing behaviour MUST be unchanged when the toggle is off.
- **FR-010** Existing basic-calculator tests and behaviour (all of
  `test/calculator.test.js`) MUST continue to pass unchanged.
- **FR-011** The project MUST stay dependency-free: plain ES modules,
  `node --test`, no build step, `index.html` served as-is.

## Success criteria

- **SC-001** `evaluate("2 + 3 × 4")` returns `14`, `evaluate("(2 + 3) × 4")`
  returns `20`, and `evaluate("2 ^ 3 ^ 2")` returns `512` (right-associative).
- **SC-002** `evaluate("sin(π / 6)")` returns a value within `1e-12` of `0.5`,
  and `evaluate("log(1000)")` returns `3`.
- **SC-003** `evaluate("x ^ 2 + 1", { x: 4 })` returns `17`, demonstrating the
  variable binding the graphing slice will reuse.
- **SC-004** `evaluate("(2 + 3")`, `evaluate("2 +")`, and `evaluate("")` each
  throw an `Error`.
- **SC-005** Every scientific function/constant/parenthesis key produces the
  correct token in the expression string, and pressing `=` shows the formatted
  result; malformed expressions show recoverable `Error`.
- **SC-006** `npm test` passes with the new expression tests and all
  pre-existing tests green.

## Edge cases

- Unary minus after an operator or open paren: `2 × -4` → `-8`, `-(3 + 1)` →
  `-4`.
- Implicit-multiplication is **out of scope**: `2π` is not supported; users type
  `2 × π`. This keeps the tokeniser unambiguous.
- Right-associative exponent: `2 ^ 3 ^ 2` = `2 ^ (3 ^ 2)` = `512`.
- Deeply nested / adjacent parentheses: `((1))` → `1`, `2 × (3 + (4 − 1))` →
  `12`.
- Whitespace between tokens is ignored; the evaluator does not depend on spaces.
- Division by zero and domain errors (`ln(0)`, `√(-1)`) yield non-finite results
  handled by FR-008.

## Non-goals

- Graphing / plotting `y = f(x)` — roadmap item 2, a separate slice that will
  reuse `evaluate`. This slice only guarantees the reusable seam (FR-005).
- Degrees mode, hyperbolic functions, factorial, inverse-trig, memory registers,
  or a full formula history — not mentioned in the roadmap.
- Implicit multiplication and scientific-notation *input* (e.g. `1e3` typed by
  the user).
- Rewriting the basic left-to-right engine; the basic keypad keeps its current
  state machine untouched.

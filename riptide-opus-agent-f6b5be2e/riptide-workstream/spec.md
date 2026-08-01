# Scientific mode — precedence, parentheses, and functions

## Summary

Add a scientific mode to the calculator: a real expression engine with operator
precedence and parentheses, plus the scientific functions the roadmap names —
trigonometry, logarithms, powers and roots, and the constants `π` and `e`. The
engine is built as a **pure, tested module** that graphing can reuse later, and
the extra keys live behind a toggle so the basic keypad stays uncrowded.

This slice deliberately delivers the shared foundation the roadmap asks for
("Whichever lands first should build that foundation so the other can reuse it")
without also building graphing — graphing stays a separate, later workstream.

## Roadmap coverage

This workstream covers roadmap item **1. Scientific mode** and the shared
foundation both items require:

> 1. **Scientific mode** — trigonometry, logarithms, powers and roots, `π` and
>    `e`, and parentheses, without crowding the basic keypad.

> Both need to evaluate expressions with real precedence and parentheses, which
> the current left-to-right engine can't do. Whichever lands first should build
> that foundation so the other can reuse it.

It does **not** cover roadmap item 2 (Graphing); it only leaves a reusable
`evaluate(expression)` entry point for that future work.

## User stories

### US-1 — Evaluate an expression with real precedence

As someone doing arithmetic, I want `2 + 3 × 4` to give `14`, so multiplication
binds tighter than addition the way maths (and every other calculator) works.

**Acceptance scenarios**

1. **Given** the calculator is in scientific mode, **when** I enter
   `2 + 3 × 4` and press `=`, **then** the result is `14`.
2. **Given** scientific mode, **when** I enter `2 ^ 3 ^ 2` and press `=`,
   **then** the result is `512` (exponentiation is right-associative).
3. **Given** scientific mode, **when** I enter `10 − 2 − 3` and press `=`,
   **then** the result is `5` (left-associative subtraction).

### US-2 — Group with parentheses

As someone building a longer calculation, I want `( 2 + 3 ) × 4` to give `20`,
so I can override the default precedence.

**Acceptance scenarios**

1. **Given** scientific mode, **when** I enter `( 2 + 3 ) × 4` and press `=`,
   **then** the result is `20`.
2. **Given** scientific mode, **when** I enter an expression with unbalanced
   parentheses and press `=`, **then** a recoverable `Error` is shown that a
   further digit clears.
3. **Given** an open parenthesis with no close, **when** I press `=`, **then**
   the engine reports `Error` rather than a partial result.

### US-3 — Scientific functions and constants

As someone doing scientific work, I want `sin`, `cos`, `tan`, `log`, `ln`,
`√`, `x²`, `xʸ`, `π`, and `e`, so I can compute beyond the four basic
operations.

**Acceptance scenarios**

1. **Given** scientific mode, **when** I compute `sin( π ÷ 2 )`, **then** the
   result is `1`.
2. **Given** scientific mode, **when** I compute `log( 1000 )`, **then** the
   result is `3`, and `ln( e )` gives `1`.
3. **Given** scientific mode, **when** I compute `√( 9 )`, **then** the result
   is `3`, and `2 ^ 10` gives `1024`.
4. **Given** scientific mode, **when** I compute `√( −1 )` or `log( 0 )`,
   **then** a recoverable `Error` is shown.

### US-4 — Toggle scientific mode without crowding the basic keypad

As a casual user, I want the calculator to open in its familiar basic layout
and reveal scientific keys only when I ask, so the default keypad stays simple.

**Acceptance scenarios**

1. **Given** the calculator loads, **when** I look at the keypad, **then** the
   basic keypad and its behaviour are unchanged from today.
2. **Given** the basic keypad, **when** I press the scientific-mode toggle,
   **then** a panel of scientific keys appears and the toggle reflects the
   active state (`aria-pressed`).
3. **Given** scientific mode is on, **when** I press the toggle again, **then**
   the scientific keys are hidden and basic behaviour resumes.

## Functional requirements

- **FR-001** A pure module (`src/expression.js`) exposes
  `evaluate(expression)` that parses a string of tokens and returns a JS
  number, throwing a typed error on malformed input. It uses no DOM APIs so it
  runs under `node --test`.
- **FR-002** The evaluator supports binary operators `+`, `-`, `×`, `÷`, and
  `^` with correct precedence: `^` highest (right-associative), then `× ÷`,
  then `+ -` (left-associative).
- **FR-003** The evaluator supports balanced parentheses to any depth and
  reports unbalanced parentheses as an error.
- **FR-004** The evaluator supports unary minus (e.g. `-3`, `2 × -4`) and the
  functions `sin`, `cos`, `tan`, `log` (base 10), `ln` (natural), and `√`
  (square root), each applied to a parenthesised argument.
- **FR-005** The evaluator supports the constants `π` and `e` as literals that
  expand to `Math.PI` and `Math.E`.
- **FR-006** Trigonometric functions operate in **radians** (matching
  `Math.sin` etc.); this is stated in the spec and documented in the README so
  the behaviour is not surprising.
- **FR-007** Any result that is not a finite number (`NaN`, `±Infinity`, e.g.
  `√(−1)`, `log(0)`, division by zero) yields the existing recoverable `Error`
  state; entering a digit afterwards resets to a fresh calculation.
- **FR-008** Results reuse the existing `formatNumber` so precision, floating
  point noise trimming, and exponential formatting stay consistent with basic
  mode.
- **FR-009** Scientific mode is off by default. A toggle button in the UI shows
  or hides a scientific key panel; the basic keypad and its existing state
  machine remain untouched when the toggle is off.
- **FR-010** In scientific mode, the calculator builds an expression string
  from keypresses; `=` evaluates it via `evaluate`, and the running expression
  is shown on the existing expression line.
- **FR-011** Keyboard support in scientific mode maps `(`, `)`, `^`, and the
  existing operator keys; unmapped keys are ignored (no crash).

## Success criteria

- **SC-001** `node --test` passes, including new tests for `src/expression.js`
  covering precedence, associativity, parentheses, every function and constant,
  unary minus, and error cases.
- **SC-002** All existing `test/calculator.test.js` tests still pass unchanged —
  basic mode is not regressed.
- **SC-003** `evaluate("2 + 3 × 4")` returns `14`; `evaluate("(2 + 3) × 4")`
  returns `20`; `evaluate("sin(π ÷ 2)")` returns `1` (within display
  precision); `evaluate("2 ^ 3 ^ 2")` returns `512`.
- **SC-004** Malformed input (`evaluate("2 +")`, `evaluate("(1")`,
  `evaluate("")`) throws, and the UI turns that into the recoverable `Error`
  state.
- **SC-005** With scientific mode off, the DOM and behaviour of the basic
  keypad are byte-for-byte the prior experience (verified by the unchanged
  calculator tests and manual review of the wireframe).
- **SC-006** No new runtime dependencies; no build step; `index.html` still
  serves from the repository root.

## Edge cases

- Empty expression or an expression ending in an operator → `Error`.
- Unbalanced or empty parentheses (`()`) → `Error`.
- Function name with no parentheses (`sin 5`) → `Error`.
- `tan(π ÷ 2)` is mathematically undefined; because floating point makes it a
  huge finite number rather than infinity, it displays that large number via
  the existing exponential formatting rather than erroring — documented as a
  known limitation, not a bug.
- Implicit multiplication (`2π`, `3(4)`) is **out of scope**; users type an
  explicit operator. Stated as a non-goal so the parser stays small.
- Very long expressions that exceed the display width reuse the existing
  shrink-to-fit sizing on the display element.

## Non-goals

- Graphing / plotting `y = f(x)` (roadmap item 2 — a separate workstream that
  will reuse `evaluate`).
- Degrees mode / a DEG/RAD switch (radians only for this slice).
- Implicit multiplication, factorials, inverse-trig, hyperbolic functions, or
  memory registers.
- Persisting mode preference across reloads.
- Any change under `.github/`.

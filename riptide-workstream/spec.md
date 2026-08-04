# Scientific mode — expression engine with precedence, parentheses, and scientific functions

## Summary

Add a **scientific mode** to the calculator: an expression engine that
evaluates full mathematical expressions with real operator precedence and
parentheses, plus a scientific keypad exposing trigonometry, logarithms,
powers, roots, `π`, and `e`. The current calculator chains operations
left-to-right one step at a time; scientific mode lets people build and
evaluate a whole expression such as `sin(π / 6) + 2 ^ 3` at once.

This slice deliberately builds the **shared expression-evaluation foundation**
the roadmap calls for, so the later graphing slice can reuse the same parser
to evaluate `y = f(x)`.

## Roadmap coverage

This workstream covers roadmap item **1. Scientific mode** and lays the
foundation the roadmap requires:

> 1. **Scientific mode** — trigonometry, logarithms, powers and roots, `π` and
>    `e`, and parentheses, without crowding the basic keypad.

> Both need to evaluate expressions with real precedence and parentheses, which
> the current left-to-right engine can't do. Whichever lands first should build
> that foundation so the other can reuse it.

Graphing (roadmap item 2) is explicitly **out of scope** here, but the
expression engine is designed as a reusable module so graphing can consume it
without change.

## User stories

### US-1 — Evaluate an expression with correct precedence

As someone doing more than one-off arithmetic, I want the calculator to respect
standard math precedence and parentheses, so that `2 + 3 × 4` is `14` and
`(2 + 3) × 4` is `20`.

**Acceptance scenarios**

1. **Given** the expression `2 + 3 × 4`, **when** I evaluate it, **then** the
   result is `14` (multiplication before addition).
2. **Given** the expression `(2 + 3) × 4`, **when** I evaluate it, **then** the
   result is `20` (parentheses first).
3. **Given** the expression `2 ^ 3 ^ 2`, **when** I evaluate it, **then** the
   result is `512` (exponentiation is right-associative).
4. **Given** an unbalanced expression like `(2 + 3`, **when** I evaluate it,
   **then** a recoverable `Error` is shown, not a crash.

### US-2 — Use scientific functions and constants

As someone doing scientific calculations, I want trig, logs, roots, powers, and
the constants `π` and `e`, so that I can compute `sin(π / 6)` = `0.5` or
`√(9)` = `3`.

**Acceptance scenarios**

1. **Given** `sin(π / 6)`, **when** I evaluate it, **then** the result is `0.5`.
2. **Given** `log(1000)`, **when** I evaluate it, **then** the result is `3`
   (base-10), and `ln(e)` is `1` (natural log).
3. **Given** `√(9)`, **when** I evaluate it, **then** the result is `3`, and
   `2 ^ 10` is `1024`.
4. **Given** `π` alone, **when** I evaluate it, **then** the result rounds to
   `3.14159265359`.

### US-3 — Toggle scientific keys without crowding the basic keypad

As someone who mostly does basic arithmetic, I want the scientific keys tucked
away until I ask for them, so the familiar keypad stays uncluttered.

**Acceptance scenarios**

1. **Given** the calculator loads, **when** I look at the keypad, **then** only
   the existing basic keys are visible by default.
2. **Given** I press the scientific toggle, **when** the panel opens, **then**
   the scientific keys appear (functions, constants, parentheses, power/root).
3. **Given** scientific mode is open, **when** I press the toggle again,
   **then** the scientific panel hides and the basic keypad remains fully
   usable.

### US-4 — See and edit the expression I am building

As someone composing an expression, I want to see the expression as I type and
correct mistakes, so that I trust what will be evaluated.

**Acceptance scenarios**

1. **Given** I press `2`, `+`, `sin`, `(`, `3`, `0`, `)`, **when** I look at the
   display, **then** the expression line shows `2 + sin(30)`.
2. **Given** I have typed part of an expression, **when** I press backspace,
   **then** the last token is removed.
3. **Given** any expression, **when** I press clear, **then** the expression
   resets to empty and the display shows `0`.

## Functional requirements

- **FR-001** A new pure module `src/expression.js` exposes `evaluate(input)`
  that parses and evaluates a math expression string and returns a JavaScript
  number (or throws a typed error for invalid input).
- **FR-002** The engine implements precedence: parentheses > functions >
  exponentiation (`^`, right-associative) > unary minus > `×` `÷` (mod not
  required) > `+` `-`, evaluated with a tokenizer + recursive-descent
  (or shunting-yard) parser — no `eval`, no `Function` constructor.
- **FR-003** The engine supports the binary operators `+`, `-`, `×`, `÷`, `^`
  and grouping with `(` `)`, accepting both `×`/`*` and `÷`/`/` as input.
- **FR-004** The engine supports functions `sin`, `cos`, `tan`, `ln` (natural
  log), `log` (base-10), and `√`/`sqrt` (square root), and constants `π`/`pi`
  and `e`.
- **FR-005** Trig functions operate in a documented angle unit. Default is
  **radians**; a **DEG/RAD** toggle switches the interpretation so
  `sin(30)` in DEG is `0.5`.
- **FR-006** Invalid input (unbalanced parentheses, unknown token, empty
  expression, division by zero, `√` of a negative, etc.) results in a
  recoverable `Error` state — never an unhandled exception in the UI.
- **FR-007** Results reuse the existing `formatNumber` so precision, exponential
  formatting, and floating-point-noise trimming behave exactly as today.
- **FR-008** The calculator state machine gains a scientific-input path that
  builds an expression string from key presses (digits, operators, functions,
  constants, parentheses, decimal, backspace, clear) and evaluates it on
  `equals`.
- **FR-009** The keypad gains a **scientific toggle** and a scientific key
  panel (functions, constants, `(`, `)`, `^`, `√`, DEG/RAD). By default the
  panel is hidden so the basic keypad is not crowded.
- **FR-010** The existing basic-mode behaviour, all existing tests, and full
  keyboard control remain unchanged when scientific mode is closed.
- **FR-011** New keyboard bindings are added for scientific input where they do
  not conflict with existing bindings: `(`, `)`, `^`, and `p`→`π`, `e`→`e`
  (typed constants), without breaking any current key.

## Success criteria

- **SC-001** `evaluate` returns the correct value for all US-1 and US-2
  acceptance scenarios (verified by unit tests).
- **SC-002** Every existing test in `test/calculator.test.js` still passes
  unchanged.
- **SC-003** `evaluate` never throws an uncaught error for malformed input in
  the UI path; malformed input yields the recoverable `Error` state.
- **SC-004** With scientific mode closed, the rendered basic keypad is
  byte-for-byte the same set of keys as today (no visual regression to basic
  use).
- **SC-005** New behaviour is covered by tests in a dedicated
  `test/expression.test.js` (engine) with at least the scenarios in US-1/US-2,
  plus scientific state-machine coverage.

## Edge cases

- Unbalanced parentheses `(2 + 3` or `2 + 3)` → `Error`.
- Empty or whitespace-only expression → `Error` (or `0` when the display is a
  bare `0` with nothing typed — no-op, matching current `equals` behaviour).
- Implicit multiplication is **not** supported: `2π` must be typed `2 × π`
  (documented non-goal to keep the parser simple and predictable).
- `√` of a negative number and `log`/`ln` of non-positive numbers →
  `Error` (non-finite result).
- Exponentiation right-associativity: `2 ^ 3 ^ 2` = `512`, not `64`.
- Unary minus: `-3 ^ 2` is `-9` (unary minus binds looser than `^`, matching
  common calculator convention) — the chosen convention is documented and
  tested.
- Very long expressions and very large/small results reuse `formatNumber`'s
  existing exponential handling.

## Non-goals

- **Graphing** (roadmap item 2) — not in this slice; the engine is built to be
  reusable by it.
- Implicit multiplication (`2π`, `2(3)`).
- Variables other than what graphing will later need (no `x` binding here).
- Memory keys (M+, M-, MR), history, or a tape.
- Inverse/hyperbolic trig (`asin`, `sinh`) and factorial — could be a later
  follow-up; kept out to bound this slice.

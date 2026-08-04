# Scientific Mode with Expression Evaluation

## Overview
Add scientific calculator functions (trigonometry, logarithms, powers, constants) with a proper expression evaluator that respects operator precedence and parentheses. This lays the foundation for graphing, which will reuse the same parser.

## User Stories

### US-001: Evaluate expressions with operator precedence
As a student,
I want to type `2 + 3 × 4` and get `14` (not `20`),
So that complex calculations work correctly.

**Acceptance:** Parser respects standard precedence (exponents > mult/div > add/sub).

### US-002: Group operations with parentheses
As a student,
I want to type `(2 + 3) × 4` and get `20`,
So that I can override natural precedence.

**Acceptance:** Parentheses are parsed and evaluated in the correct order.

### US-003: Use trigonometric functions
As a physics student,
I want to compute `sin(π/6)` and `cos(0)`,
So that I can solve physics problems.

**Acceptance:** sin, cos, tan buttons work with radians; each returns correctly rounded results.

### US-004: Compute logarithms and exponentials
As a scientist,
I want to compute `ln(e)`, `log₁₀(100)`, and `2^10`,
So that I can work with exponential growth and scientific notation.

**Acceptance:** ln, log₁₀, and power (^) operators work correctly.

### US-005: Access mathematical constants
As a mathematician,
I want quick access to `π` and `e`,
So that I don't have to type them manually.

**Acceptance:** π and e buttons insert their values; scientific mode display shows them as symbols (π, e).

### US-006: Switch between basic and scientific modes
As a casual user,
I want to toggle scientific mode on and off,
So that the keypad doesn't overwhelm me with unfamiliar buttons.

**Acceptance:** 
- One button (labeled "Scientific" or "≡") toggles the mode.
- Basic mode shows the familiar 4-operation keypad.
- Scientific mode reveals additional buttons (sin, cos, tan, ln, log, ^, √, π, e, parentheses).
- Toggling mode clears the current input (AC) but preserves calculation history intent.

## Functional Requirements

### FR-001: Expression Parser
- Build a recursive descent parser that handles:
  - Binary operators: `+`, `-`, `×`, `÷`, `^` (exponentiation)
  - Unary functions: `sin`, `cos`, `tan`, `ln`, `log`, `√`
  - Constants: `π`, `e`
  - Parentheses for grouping
  - Operator precedence: exponentiation > unary functions > multiplication/division > addition/subtraction
- Parser consumes an input string and returns the numeric result or an error.
- **No external parsing library** — implement from first principles using recursive descent.

### FR-002: UI Mode Toggle
- Add a "Scientific" button to switch between two keypad layouts.
- Basic mode: current 4-operation layout.
- Scientific mode: current layout + scientific buttons (sin, cos, tan, ln, log, ^, √, π, e, left/right parenthesis).
- Layout should not wrap or overflow on mobile.

### FR-003: Button Integration
- New buttons dispatch actions to the calculator state:
  - Function buttons (sin, cos, etc.) insert the function name followed by `(`.
  - Binary operator buttons (^) behave like `+`, `-`, etc.
  - Constant buttons (π, e) insert the symbol.
  - Parenthesis buttons insert `(` or `)`.
- Keyboard bindings for common functions (e.g., `s` for sin, `l` for log, `^` for power).

### FR-004: Display Expression During Entry
- Show the full expression being entered (e.g., `sin(π/2)`) in the expression display area.
- Allow user to press `=` to evaluate and show the result.
- Allow backspace to remove one character at a time.

### FR-005: Angle Mode
- Default to **radians** for trig functions.
- Future enhancement: add a degrees toggle (not in this slice).

## Success Criteria

### SC-001: Parser correctness
- Expressions with mixed operators and parentheses evaluate correctly.
- Test suite verifies: `2 + 3 * 4 = 14`, `(2 + 3) * 4 = 20`, `sin(0) = 0`, `log(100) = 2`, `2^3 = 8`, `sqrt(16) = 4`.

### SC-002: UI responsiveness
- Toggling scientific mode is instant.
- All buttons (basic and scientific) are clickable and styled consistently.
- No layout shift or overflow when toggling mode.

### SC-003: Keyboard support
- Digits, operators, and `=` work as before.
- New actions bindable to keys: `s` → sin, `c` → cos, `t` → tan, `l` → log, `n` → ln, `^` → power, `(` / `)` → parentheses.

### SC-004: Error handling
- Division by zero, invalid expressions, domain errors (e.g., `sqrt(-1)`) show "Error".
- Recovery: pressing any digit after an error clears it and starts fresh.

### SC-005: Mobile-friendly layout
- Scientific buttons fit on screen without horizontal scroll on devices ≥ 360px wide.
- Text on buttons is readable (small font acceptable, but not illegible).

## Edge Cases & Non-Goals

### Edge Cases
- Nested parentheses: `((2 + 3) * 4)` → 20.
- Function nesting: `sin(cos(0))` → sin(1) ≈ 0.841.
- Leading zeros and decimals: `.5` → 0.5.
- Very small/large numbers from trig: `sin(π)` ≈ 0 (not 1e-16).

### Non-Goals
- **Degrees mode** — stay in radians; degrees can be a future toggle.
- **Hyperbolic functions** (sinh, cosh, tanh) — keep to standard trig.
- **Complex numbers** — real numbers only.
- **History / undo** — not in scope.
- **Variables or user-defined functions** — not in scope.
- **Graphing** — that is a separate roadmap item.

## Roadmap Coverage
This slice covers item **1. Scientific Mode** from the roadmap:
> "Scientific mode — trigonometry, logarithms, powers and roots, π and e, and parentheses, without crowding the basic keypad."

It also builds the **expression evaluator with precedence**, which the roadmap identifies as the foundation both scientific mode and graphing depend on.

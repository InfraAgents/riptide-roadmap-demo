# Scientific Mode with Expression Precedence

## Overview

Add trigonometric, logarithmic, and power functions to the calculator alongside support for proper operator precedence and parentheses. This slice builds the expression parsing foundation that graphing can later reuse.

The current calculator evaluates left-to-right (e.g., `2 + 3 × 4 = 20`). Scientific mode requires a proper precedence-respecting parser so that `2 + 3 × 4 = 14` (multiply before add). Once built, this parser enables both new scientific functions and future graphing.

## User Stories

### US-001: Trigonometric Functions
**As a** student or engineer  
**When** I am calculating angles and triangles  
**I want** quick access to sin, cos, tan, and their inverses (arcsin, arccos, arctan)  
**So that** I don't need a separate app

**Acceptance Scenarios:**
- `sin(90)` (in degrees) returns `1`
- `cos(0)` returns `1`
- `tan(45)` returns `1`
- `arcsin(1)` returns `90` (in degrees)
- All trig functions work on the current display value
- Degrees/radians mode can be toggled via a UI button (initially degrees)

### US-002: Logarithmic Functions
**As a** scientist  
**When** I need to compute logarithms  
**I want** `ln` (natural log), `log₁₀`, and exponential (`e^x`)  
**So that** I can solve exponential and logarithmic equations

**Acceptance Scenarios:**
- `ln(e)` returns `1`
- `log₁₀(100)` returns `2`
- `e^2` returns `≈7.389`
- These are callable as single-argument functions on the current display value

### US-003: Power and Root Functions
**As a** mathematician  
**When** calculating powers and roots  
**I want** `x²`, `x³`, `√x`, `∛x`, and `x^y` operations  
**So that** I don't have to type them manually

**Acceptance Scenarios:**
- `2²` returns `4`
- `27^(1/3)` (cube root) returns `3`
- `x^y` takes two operands: `2 ^ 3 =` returns `8`
- Square root is a single-argument function applied to the display

### US-004: Mathematical Constants
**As a** student  
**When** I need π or e in a calculation  
**I want** dedicated buttons or keyboard shortcuts for `π` and `e`  
**So that** I don't have to remember their decimal expansions

**Acceptance Scenarios:**
- Pressing π inserts `π` into the expression
- Pressing e inserts `e` into the expression
- `π` displays as the symbol or approximation as needed
- `sin(π/2)` evaluates correctly

### US-005: Parentheses and Proper Precedence
**As a** anyone using the calculator  
**When** I enter an expression like `2 + 3 × 4`  
**I want** it to evaluate as `14` (not `20`), respecting standard order of operations  
**So that** I get mathematically correct results

**Acceptance Scenarios:**
- `2 + 3 × 4 =` returns `14`
- `(2 + 3) × 4 =` returns `20`
- Nested parentheses work: `((1 + 2) × 3) + 4 = 13`
- Unmatched parentheses show an error or prompt for closure
- Backspace works inside parentheses
- Expression display shows the full expression with parentheses

### US-006: Toggle Between Basic and Scientific Modes
**As a** user  
**When** I open the calculator  
**I want** to see the basic 4-operation keypad by default, and have a button to reveal scientific functions  
**So that** the interface isn't overwhelming for simple math

**Acceptance Scenarios:**
- A "Scientific" button toggles to show additional keys (or a second keypad)
- Basic operators still work in scientific mode
- Toggling back hides scientific keys
- State is preserved when switching modes (e.g., ongoing calculation isn't lost)

## Functional Requirements

**FR-001:** Implement a proper expression parser that respects operator precedence (+/- lower, ×/÷ higher, ^/root higher still, functions highest) and parentheses.

**FR-002:** Support single-argument functions: `sin`, `cos`, `tan`, `arcsin`, `arccos`, `arctan`, `ln`, `log₁₀`, `e^x`, `√`, `∛`, and `x²`, `x³`.

**FR-003:** Support binary operators: `+`, `-`, `×`, `÷`, `^` (power), and root (e.g., `x^(1/y)`).

**FR-004:** Add constants `π` and `e` that are inserted as values into expressions.

**FR-005:** Track and display the full expression (not just pending operation) so users see what they're building.

**FR-006:** Provide a UI toggle (button) to switch between basic and scientific keypads without loss of state.

**FR-007:** Add a degrees/radians toggle button in scientific mode; all trig functions use the current mode.

**FR-008:** Error handling: mismatched parentheses, division by zero, domain errors (e.g., `sqrt(-1)`) should display recoverable errors like the basic mode does.

## Success Criteria

**SC-001:** All user story acceptance scenarios pass.

**SC-002:** Expression parser is a pure, testable module (no DOM access) following the existing architecture pattern.

**SC-003:** All existing basic-mode tests pass (backward compatibility).

**SC-004:** New scientific functions are covered by unit tests (at least 20 new test cases for parser, precedence, and functions).

**SC-005:** Scientific mode can be toggled without losing the current calculation state.

**SC-006:** Keyboard support: digits and operators work; scientific functions have keyboard shortcuts (e.g., `s` for sin, `l` for ln, `p` for π).

**SC-007:** Responsive layout: scientific keypad reflows on small screens without overflow.

**SC-008:** WCAG 2.1 AA accessibility: all buttons labeled, aria-live on display, logical tab order preserved.

## Edge Cases

- **Empty expressions:** Pressing `=` with an empty expression or unmatched parentheses
- **Nested functions:** `sin(arcsin(0.5))` should return `0.5` (or close)
- **Very large exponents:** `2^100` should handle correctly or show overflow error
- **Division by zero in denominator of a fraction:** `1/(2-2)` should error
- **Radix conversion:** Ensure that π and e are stored at high precision internally and only rounded for display
- **Keyboard vs. button input:** Ensure both work consistently for all new operations
- **State reset:** Clearing should reset mode toggles (degrees/radians, basic/scientific) to defaults

## Non-Goals

- Graphing (deferred to a future slice; foundation is built here)
- Symbolic algebra or equation solving
- History or calculation log
- Custom functions or variables
- Complex number support
- Matrix operations

## Roadmap Coverage

This slice covers the first roadmap item:

> **Scientific mode** — trigonometry, logarithms, powers and roots, `π` and `e`, and parentheses, without crowding the basic keypad.

It also builds the expression parser foundation required by the second roadmap item:

> **Graphing** — plot `y = f(x)` and let people explore the curve. [Both] need to evaluate expressions with real precedence and parentheses, which the current left-to-right engine can't do. Whichever lands first should build that foundation so the other can reuse it.

This slice delivers the foundation (the parser); graphing can reuse it in a future workstream.

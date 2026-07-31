# Scientific Mode with Expression Parsing

Add a scientific mode toggle to reveal advanced functions (sin, cos, tan, log, ln, sqrt, pow, π, e) and rebuild the calculator's evaluation engine to respect operator precedence and parentheses. This establishes the expression parser foundation for both scientific and graphing features.

## User Stories

### US-001: Toggle scientific mode
**As a** calculator user  
**I want to** toggle between basic and scientific modes without reloading  
**So that** the keypad adapts to my current needs without cluttering the interface.

**Acceptance scenarios:**
- A mode toggle button appears in the header or corner.
- Clicking it reveals a second keypad region with scientific functions.
- The toggle state persists during the session.
- The basic keypad remains fully functional and unchanged.

### US-002: Evaluate expressions with operator precedence
**As a** calculator user  
**I want to** enter `2 + 3 × 4` and get `14` (not `20`)  
**So that** my expressions are mathematically correct regardless of entry order.

**Acceptance scenarios:**
- `2 + 3 × 4 =` yields `14`.
- `10 - 5 + 3 =` yields `8`.
- `2 × 3 + 4 × 5 =` yields `26`.
- Mixed operators respect the standard precedence: multiplication and division before addition and subtraction.

### US-003: Use parentheses to override precedence
**As a** calculator user  
**I want to** enter `(2 + 3) × 4` and get `20`  
**So that** I can force evaluation order when needed.

**Acceptance scenarios:**
- `(2 + 3) × 4 =` yields `20`.
- `2 × (3 + 4) =` yields `14`.
- Nested parentheses work: `2 × (3 + (4 - 1)) =` yields `18`.
- Mismatched parentheses show an error: `(2 + 3 × 4` displays "Error".
- Empty parentheses `()` are rejected.

### US-004: Use scientific functions
**As a** calculator user  
**I want to** use functions like sin, cos, tan, log, ln, sqrt, and constants like π and e  
**So that** I can compute advanced mathematical operations.

**Acceptance scenarios:**
- `sin(0) =` yields `0`.
- `cos(0) =` yields `1`.
- `sqrt(16) =` yields `4`.
- `log(100) =` yields `2` (base 10).
- `ln(1) =` yields `0` (natural log).
- `2 ^ 3 =` (or `2 ** 3 =`) yields `8` (exponentiation).
- Pressing `π` inserts the constant `3.14159265359`.
- Pressing `e` inserts the constant `2.71828182846`.
- Functions accept parenthesized subexpressions: `sin(π / 2) =` yields `1`.
- Trigonometry operates in both degrees and radians; a mode toggle or indicator shows which.

### US-005: Maintain backward compatibility
**As a** calculator user  
**I want to** basic operations to work exactly as before  
**So that** existing workflows are not disrupted.

**Acceptance scenarios:**
- All existing test cases pass without modification.
- Keyboard shortcuts remain the same for basic operations.
- The basic keypad renders and functions identically when scientific mode is off.

## Functional Requirements

**FR-001: Expression parser**  
Implement a recursive descent or shunting-yard parser that:
- Recognizes integers and decimals.
- Respects operator precedence: `^` (exponentiation, highest), `×` and `÷`, then `+` and `-` (lowest).
- Handles parentheses for grouping.
- Parses function calls: `sin(x)`, `log(x)`, etc.
- Reports syntax errors (unmatched parentheses, invalid tokens) without crashing.

**FR-002: Scientific functions**  
Provide pure JavaScript implementations (or native Math methods) for:
- Trigonometry: `sin()`, `cos()`, `tan()` (with angle mode: degrees/radians).
- Logarithms: `log()` (base 10) and `ln()` (natural log).
- Roots and powers: `sqrt()` and `pow()` (or `^` operator).
- Constants: `π` and `e` with sufficient precision.

**FR-003: Scientific mode UI**  
- A toggle button to switch modes (basic ↔ scientific).
- In scientific mode, display an additional keypad or panel with function and constant buttons.
- Display a label or indicator showing the current angle mode (degrees/radians).
- Maintain responsive design and dark/light theme support.

**FR-004: Preserve state machine separation**  
- Keep the evaluation logic in a pure `calculator.js` module (testable in Node without a browser).
- DOM interaction remains in `app.js`.
- No external dependencies beyond Node's `Math` object.

**FR-005: Angle mode toggle**  
- Provide a button to switch between degrees and radians.
- Store the mode in the state and apply it to all trigonometric computations.
- Display the current mode in the UI.

## Success Criteria

**SC-001: All new features are testable**  
- Unit tests cover the parser (valid expressions, edge cases, errors).
- Tests cover each scientific function with expected inputs and outputs.
- Tests cover angle mode switching and its effect on trigonometry.
- No tests are skipped.

**SC-002: Backward compatibility**  
- All existing calculator tests pass.
- The basic keypad is unchanged and fully functional.
- No TypeScript, build step, or dependencies are introduced.

**SC-003: Performance**  
- Parsing and evaluation complete in <10ms for typical expressions.
- The DOM renders within one frame (60 FPS) after a key press.

**SC-004: Accessibility**  
- All new buttons have descriptive aria-labels.
- The angle mode indicator is announced to screen readers.
- Keyboard navigation works for scientific keys.

**SC-005: Design consistency**  
- The scientific keypad matches the basic keypad's styling.
- Dark/light theme preferences are respected.
- The layout is responsive on mobile and desktop.

## Edge Cases

- **Compound functions:** `sqrt(sin(π / 4))` should parse and evaluate.
- **Trailing operators:** `2 +` followed by `=` should handle gracefully (revert or error).
- **Large exponents:** `2 ^ 100` should display in exponential notation.
- **Negative arguments to sqrt:** `sqrt(-1)` should produce an error or "NaN".
- **Division by zero in a subexpression:** `1 / (2 - 2)` should error.
- **Switching angle modes mid-expression:** The UI prevents confusion by enforcing a mode before entry.
- **Pasting an expression:** The input field (if added) should validate via the parser before display.

## Non-Goals

- **Symbolic computation** (e.g., `sin(x)` as a function to plot later) — keep everything numerical.
- **Custom functions or variables** — stick to built-ins and constants.
- **Undo/redo** — not in scope; clear or backspace are sufficient.
- **Expression history** — keep the display minimal.
- **LaTeX or mathematical notation** — use ASCII and simple symbols.

## Roadmap Coverage

This workstream covers **Item 1: Scientific mode** from the roadmap:

> Scientific mode — trigonometry, logarithms, powers and roots, `π` and `e`, and parentheses, without crowding the basic keypad.

By implementing a proper expression parser with precedence and parentheses support, it also establishes the foundation required by **Item 2: Graphing**, which will reuse the parser to evaluate `y = f(x)` across a range of x values.

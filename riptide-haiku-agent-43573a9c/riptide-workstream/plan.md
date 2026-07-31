# Implementation Plan: Scientific Mode with Expression Parsing

## Technical Context

### Current State
- Calculator uses left-to-right evaluation (e.g., `2 + 3 × 4 = 20`).
- State machine in `calculator.js` tracks operands, operator, and display state.
- UI in `app.js` wires keyboard and button clicks to state changes.
- No expression parser; evaluation is immediate and flat.

### Design Decision: Shunting-Yard Parser
We will implement the **Shunting-Yard algorithm** (Dijkstra's classic) to convert infix expressions (user input) to postfix (Reverse Polish Notation) and then evaluate the postfix result. This approach:
- **Cleanly separates parsing from evaluation** — easier to test and extend.
- **Handles precedence and parentheses naturally** without recursion complexity.
- **Fits the pure-module constraint** — no DOM, no side effects, pure functions.
- **Is lightweight** — ~150 lines of code, no dependencies.

Alternative (recursive descent parser) would work but is more verbose for this scope.

### Angle Mode Strategy
- Store `angleMode: "degrees" | "radians"` in the calculator state.
- Trigonometric functions convert user input to radians internally (Math functions use radians).
- Display an indicator showing the current mode; allow toggling via UI button.

### State Machine Evolution
Current state shape:
```javascript
{
  current: "0",
  previous: null,
  operator: null,
  overwrite: true,
  error: false
}
```

New state shape for expression-based mode:
```javascript
{
  current: "0",          // display string
  expression: "",        // raw user input (for re-editing if needed)
  error: false,
  angleMode: "degrees"   // or "radians"
}
```

The old left-to-right state machine will be replaced entirely by the new parser-based one. This is a **breaking change** for the internal state, but the UI (buttons, display, etc.) remains the same.

## File-by-File Structure

### Modified Files

**`src/calculator.js`** (rewritten)
- Remove: `inputDigit`, `inputDecimal`, `setOperator`, `equals`, `negate`, `percent` (these assume left-to-right evaluation).
- Add: `parseExpression()` — main parser entry point.
- Add: `TokenType`, `Token`, `Tokenizer` — lexer for breaking input into tokens.
- Add: `Parser` — shunting-yard parser to build a postfix queue.
- Add: `evaluatePostfix()` — evaluates a postfix expression queue.
- Add: `inputCharacter()` — new entry point for typing a single character or pasting text.
- Add: `appendFunction()`, `appendConstant()` — insert function calls and constants.
- Add: `toggleAngleMode()` — switch between degrees and radians.
- Keep: `formatNumber()`, `clear()`, `backspace()`, `initialState` (with updated shape).
- Keep: `expressionText()` (adapt to show current expression or pending operation).

**`src/app.js`** (updated)
- Update `dispatch()` to call new action handlers (`inputCharacter`, `appendFunction`, `toggleAngleMode`).
- Add button click handlers for scientific functions (`sin`, `cos`, `tan`, `log`, `ln`, `sqrt`, `pow`, `π`, `e`).
- Add angle-mode toggle button and indicator display.
- Maintain keyboard handling for digits and basic operators (reuse KEY_BINDINGS with new semantics).
- Remove old direct calls to `inputDigit`, `setOperator`, etc.; replace with `inputCharacter`.

**`index.html`** (updated)
- Add a mode toggle button (e.g., "Basic ↔ Sci" or an icon toggle).
- Add a scientific keypad section (initially hidden, shown when mode is "scientific").
- Scientific keypad contains buttons for: `sin`, `cos`, `tan`, `log`, `ln`, `sqrt`, `^` (or `**`), `π`, `e`, `(`, `)`.
- Add an angle-mode indicator and toggle button (e.g., "DEG ↔ RAD").
- Keep the basic keypad unchanged.

**`styles.css`** (updated)
- Add classes for `.mode-toggle`, `.keypad--scientific` (hidden by default).
- Add `.angle-mode-indicator`.
- Ensure scientific keypad matches basic keypad styling and color scheme.
- Responsive: stack keypads vertically on mobile or show side-by-side on desktop.

**`test/calculator.test.js`** (rewritten)
- Remove: old test functions (`press()`) designed for left-to-right evaluation.
- Add: `testParse()` helper to parse and evaluate an expression string directly.
- Add: tests for parsing (simple to complex expressions, edge cases, errors).
- Add: tests for each scientific function.
- Add: tests for angle mode switching.
- Add: tests for backward compatibility (basic operations still work).

### New Files

None required beyond the modified files above.

## Key Decisions & Rationale

1. **Replace the entire evaluation engine, not extend it.**
   - The left-to-right logic and the new precedence-aware logic are fundamentally incompatible.
   - A cleaner slate avoids bugs and complexity; the UI change is minimal.

2. **Shunting-Yard algorithm for parsing.**
   - Proven, efficient, and fits a 1-file implementation.
   - Easier to debug and test than recursive descent for this scope.

3. **Angle mode in state.**
   - Stored mode avoids global state or function closures.
   - Pure state machine allows tests to verify behavior.

4. **Degree mode as default.**
   - More intuitive for general users (e.g., `sin(90)` = 1, not `sin(π/2)`).
   - Advanced users can toggle to radians.

5. **No intermediate expression tree.**
   - Postfix evaluation is simpler than building and walking an AST.
   - Reduces code and matches the constraint of staying lightweight.

6. **Maintain `formatNumber()` and `clear()` from the old module.**
   - No need to reinvent number formatting.
   - Provides a smooth migration.

## Testing Strategy

- **Unit tests in `test/calculator.test.js`:**
  - Test parser with valid expressions (no deps on app or DOM).
  - Test evaluator with each function and constant.
  - Test angle mode effect on trig functions.
  - Test error handling (syntax errors, division by zero, etc.).

- **Manual/integration tests via the UI:**
  - Toggle mode and verify keypad visibility.
  - Toggle angle mode and check indicator.
  - Press buttons and verify result.
  - Use keyboard to enter expressions.

- **Regression:**
  - All existing calculator tests must pass (after rewrite to match new state and interface).

## Build and Deployment

- No new dependencies.
- No build step (remains a plain HTML + ES modules setup).
- Tests run with `npm test` (Node's `--test` runner).
- Deploy as before via GitHub Actions (no CI changes).

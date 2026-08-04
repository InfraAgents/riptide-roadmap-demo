# Tasks: Scientific Mode Implementation

## Task Dependencies
```
T001 → T002 → T003 (parser chain)
          ↓
T004 (calculator logic) → T005 (app state/render) → T006 (UI)
                     ↓
T007 (keyboard) → T008 (tests) → T009 (polish)
```

---

## T001: Implement Tokenizer

**Objective:** Break expression input into tokens.

**File:** `src/parser.js` (new)

**Acceptance:**
- `tokenize("2 + 3")` → `[{type: 'number', value: 2}, {type: 'op', value: '+'}, {type: 'number', value: 3}]`
- `tokenize("sin(π)")` → `[{type: 'func', value: 'sin'}, {type: 'lparen'}, {type: 'const', value: 'π'}, {type: 'rparen'}]`
- `tokenize("2.5e-3")` → `[{type: 'number', value: 0.0025}]`
- Invalid: `tokenize("2 + + 3")` → throws error with position info.
- Tokenizer ignores whitespace.

**Definition of Done:**
- Export `tokenize(input: string) → Token[]`.
- Handle all token types: numbers, operators (+, −, ×, ÷, ^), functions (sin, cos, tan, ln, log, sqrt), constants (π, e), parentheses, decimal points.
- Error messages include position in input (e.g., "Invalid character '!' at position 5").

---

## T002: Implement Parser (AST Builder)

**Objective:** Convert tokens into an abstract syntax tree respecting operator precedence.

**File:** `src/parser.js` (extend)

**Acceptance:**
- `parse("2 + 3 * 4")` produces a tree where 3*4 is grouped together (not 2+3 first).
- `parse("(2 + 3) * 4")` produces a tree where 2+3 is grouped first.
- `parse("sin(π/2)")` produces a tree: function node with division node as child.
- `parse("2^3^2")` evaluates right-to-left: 2^(3^2) = 512 (not 8^2 = 64).
- Invalid: `parse("2 +")` → throws error.
- Invalid: `parse("(2 + 3")` → throws error (unmatched paren).

**Definition of Done:**
- Implement recursive descent with functions:
  - `parseExpression()` — handles `+`, `−` (lowest precedence, left-assoc).
  - `parseTerm()` — handles `×`, `÷`.
  - `parseFactor()` — handles `^` (right-associative).
  - `parseUnary()` — handles unary `−` and functions.
  - `parsePrimary()` — handles numbers, constants, `(expr)`, function calls.
- Export internal `parse(tokens: Token[]) → ASTNode` for testing.
- Node structure: `{type: 'binop', op: '+', left: ..., right: ...}` or `{type: 'func', name: 'sin', arg: ...}` or `{type: 'number', value: 42}`.

---

## T003: Implement Evaluator

**Objective:** Walk the AST and compute the numeric result.

**File:** `src/parser.js` (extend)

**Acceptance:**
- `evaluate({type: 'number', value: 5})` → `5`
- `evaluate(parseTree for "2 + 3")` → `5`
- `evaluate(parseTree for "sin(π/2)")` → `1` (or within `1e-10`)
- `evaluate(parseTree for "sqrt(16)")` → `4`
- `evaluate(parseTree for "log(100)")` → `2`
- `evaluate(parseTree for "ln(e)")` → `1` (or within `1e-10`)
- Domain errors: `evaluate(parseTree for "sqrt(-1)")` → `NaN` (caught by equals() and converted to "Error")
- `evaluate(parseTree for "2^-3")` → `0.125`

**Definition of Done:**
- Implement `evaluate(node: ASTNode) → number`.
- Define all functions: sin, cos, tan, sqrt, log, ln, power.
- Use JavaScript's `Math` library for implementations.
- Return `Number.NaN` on domain error (sqrt of negative, log of non-positive, etc.); caller converts to error state.

---

## T004: Update Calculator State & Logic

**Objective:** Integrate the parser into the calculator's state machine.

**File:** `src/calculator.js` (modify)

**Acceptance:**
- `initialState.mode = 'basic'` (new field).
- `inputDigit(state, '2')` continues to work as before.
- `inputFunction(state, 'sin')` appends `sin(` to `state.current`.
- `inputConstant(state, 'π')` appends `π` to `state.current`.
- `inputParenthesis(state, '(')` appends `(` to `state.current`.
- `equals(state)` with `state.current = "2 + 3 * 4"` parses and evaluates: returns state with `current: "14"`, `overwrite: true`.
- `equals(state)` with invalid expression returns error state.
- `setMode(state, 'scientific')` returns a new state with `mode: 'scientific'`, `current: '0'`, `overwrite: true` (cleared input).
- `setMode(state, 'basic')` similarly clears and sets mode.
- Backspace works with new input format (removing chars from expressions).
- Clear resets everything including mode? **Decision:** Clear (AC) resets expression and overwrite, but preserves mode.

**Definition of Done:**
- Export new functions: `inputFunction(state, name)`, `inputConstant(state, symbol)`, `inputParenthesis(state, paren)`, `setMode(state, newMode)`.
- All new functions follow the immutable state pattern.
- `equals()` updated to call `parse(state.current)` instead of left-to-right eval.
- `formatNumber()` improved: `sin(π)` returns "0" not "1.2e-16".
- Tests in `test/calculator.test.js` pass (extend the `press()` helper to handle new actions).

---

## T005: Update App State & Render

**Objective:** Wire state mutations to UI and render the mode-specific keypad.

**File:** `src/app.js` (modify)

**Acceptance:**
- Clicking the "Scientific" button toggles `state.mode` and updates display (scientific buttons appear/disappear).
- Clicking scientific buttons (sin, cos, etc.) dispatches their actions.
- Display shows the expression being typed (e.g., `sin(π/2)`) in the expression line, not just a pending operator.
- Pressing `=` evaluates and shows the result.
- The mode toggle button is always visible and clearly labeled.
- No console errors.

**Definition of Done:**
- Add dispatch cases for: `'function'`, `'constant'`, `'lparen'`, `'rparen'`, `'toggle-mode'`.
- Update `render()` to apply class `.mode-scientific` to the keypad when `state.mode === 'scientific'`.
- Ensure `expressionText()` or a new function shows the full input expression (not just `previous operator`).
- Mode toggle button is implemented with clear labeling.

---

## T006: Update HTML & Styles

**Objective:** Add scientific buttons and layout for both modes.

**File:** `index.html` (modify) and `styles.css` (modify)

**Acceptance:**
- New buttons for: sin, cos, tan, ln, log, ^, √, π, e, (, ).
- Buttons are initially hidden (display: none in basic mode).
- When `.mode-scientific` class is applied to keypad, scientific buttons appear.
- All buttons fit on screen without horizontal scroll on 360px+ devices.
- Buttons are styled consistently with existing keys (same colors, sizes, spacing).
- "Scientific" toggle button is positioned clearly (e.g., above the keypad or in the display area).
- Mobile-friendly: button text is readable, fonts don't shrink below 1rem on small screens.

**Definition of Done:**
- HTML updated with new buttons and mode toggle.
- CSS grid layout adjusted to fit both basic and scientific buttons (or uses flexbox for flexibility).
- `.mode-scientific` class shown/hidden correctly.
- No layout shift when toggling mode.
- Tested on 360px, 768px, and desktop widths (Chrome DevTools).

---

## T007: Add Keyboard Bindings

**Objective:** Map keys to new scientific actions.

**File:** `src/app.js` (modify)

**Acceptance:**
- `s` → sin, `c` → cos, `t` → tan (may conflict with existing bindings? Check!)
- `l` → log, `n` → ln.
- `^` → power.
- `(` and `)` → parentheses.
- `Shift+S` → Scientific mode toggle? Or a dedicated key? **Decision:** No keyboard shortcut for toggle (UI button only).
- Existing bindings still work: digits, +, −, *, /, Enter, Esc, etc.

**Definition of Done:**
- Update `KEY_BINDINGS` map with new entries.
- Test on keyboard: verify each binding works and doesn't interfere with text input elsewhere on the page.
- Document bindings in the HTML hint text.

---

## T008: Test Coverage

**Objective:** Verify parser, calculator, and integration.

**File:** `src/parser.test.js` (new) and `test/calculator.test.js` (extend)

**Acceptance:**

**parser.test.js:**
- Tokenize: numbers, operators, functions, constants, parentheses, whitespace.
- Parse: operator precedence (2 + 3*4 = 14, not 20), parentheses, functions, constants, right-associativity of ^.
- Evaluate: all functions return correct values (within floating-point tolerance).
- Error cases: invalid syntax, unmatched parens, domain errors.

**calculator.test.js (extend):**
- New actions: `inputFunction`, `inputConstant`, `inputParenthesis`, `setMode`.
- Integration: `press(['sin', '(', 'π', '/', '2', '='])` → result close to 1.
- Mode toggle clears input.
- Basic mode still works after scientific additions.

**Definition of Done:**
- Run `npm test` → all tests pass (no failures or warnings).
- Code coverage for parser: 100% of parse/evaluate functions exercised.
- Edge cases covered: nested parens, function composition, constants in expressions.

---

## T009: Polish & Documentation

**Objective:** Final QA, code review, edge case fixes.

**Acceptance:**
- No console errors or warnings.
- Very long expressions don't overflow display (use existing `data-size` scaling).
- Error recovery: pressing digit after "Error" clears and starts fresh.
- Floating-point results are formatted cleanly (e.g., sin(π) shows "0", not "1e-16").
- README or inline comments explain the parser architecture.
- All tasks above complete and tested.

**Definition of Done:**
- Manual QA on Chrome, Firefox, Safari (at least one each).
- Manual QA on mobile (iOS Safari, Chrome Mobile).
- No edge case regressions.
- Commit message explains the change (see plan.md for context).
- Ready for code review.

---

## Task Ordering Justification

**T001 → T002 → T003:** Parser builds bottom-up; tokenizer is independent, parser depends on it, evaluator walks the parser's output.

**T004:** Calculator logic integrates the parser; must come after T003 and before app logic.

**T005:** App dispatches and renders; needs T004's state exports.

**T006:** UI changes are independent of logic but should come before T007 (keyboard bindings).

**T007:** Bindings reference UI elements and dispatch actions; after T005.

**T008:** Tests verify all above; can run in parallel with T006 but logically last (verification).

**T009:** Polish after everything else works.

Parallel potential: T006 can start as soon as T005 rough logic is in place. T008 can run tests incrementally as each component completes.

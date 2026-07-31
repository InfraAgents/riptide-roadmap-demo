# Tasks: Scientific Mode with Expression Parsing

Tasks are listed in dependency order. Each task is small enough to verify in isolation.

## T001: Tokenizer and basic parser structure
**Acceptance:** `test/calculator.test.js` includes a test that tokenizes a simple expression like `"2 + 3"` into tokens and verifies the token stream is correct.

**Implementation notes:**
- Add `TokenType` enum: `NUMBER`, `OPERATOR`, `LPAREN`, `RPAREN`, `FUNCTION`, `CONSTANT`, `EOF`.
- Add `Token` class: holds `type`, `value`, `precedence`.
- Add `Tokenizer` class: takes an input string, produces an array of tokens.
  - Handle multi-digit numbers and decimals.
  - Recognize operators: `+`, `-`, `*`, `/`, `^` (or `**`), `%`.
  - Recognize functions: `sin`, `cos`, `tan`, `log`, `ln`, `sqrt`, `pow`.
  - Recognize constants: `π`, `e`, `pi` (for keyboard input).
  - Recognize parentheses.
  - Skip whitespace.
  - Reject invalid characters and report line/column for errors.
- Export `parseTokens(inputString)` function that returns `Token[]` or throws on syntax error.

## T002: Shunting-Yard parser (infix → postfix)
**Acceptance:** `test/calculator.test.js` includes a test that parses `"2 + 3 * 4"` to postfix and verifies the result is `"2 3 4 * +"` (or equivalent postfix representation).

**Implementation notes:**
- Add `Parser` class (or function) that takes a token array.
- Implement the Shunting-Yard algorithm:
  - Maintain an operator stack and output queue.
  - For numbers: emit to output.
  - For operators: pop higher-precedence ops from stack to output, then push current op.
  - For functions: push to operator stack (treated like operators but with special handling).
  - For `(`: push to stack.
  - For `)`: pop from stack to output until `(` is found; pop the `(` but don't emit it.
  - At end: pop all remaining operators to output.
- Export `toPostfix(tokens)` that returns a queue/array of tokens in postfix order.
- Detect and report errors: mismatched parentheses, invalid syntax.

## T003: Postfix evaluator
**Acceptance:** `test/calculator.test.js` includes tests that evaluate postfix expressions: `toPostfix(tokenize("2 + 3")) → evaluate(...)` yields `5`, and `toPostfix(tokenize("2 + 3 * 4")) → evaluate(...)` yields `14`.

**Implementation notes:**
- Add `evaluatePostfix(postfixTokens, angleMode)` function.
- Maintain a stack of numbers.
- For each token:
  - Number: push to stack.
  - Binary operator: pop two operands, apply, push result.
  - Unary function: pop one operand, apply (e.g., `sin`, `sqrt`).
  - Constant: push its value (e.g., π, e).
- Handle division by zero and invalid operations (e.g., sqrt of negative number): return `NaN` or throw.
- Return the single value on the stack; error if stack has ≠1 element at end.

## T004: Complete parse-and-evaluate pipeline
**Acceptance:** `test/calculator.test.js` includes an integration test: `parseExpression("sin(π / 2)", "radians")` yields `1` (or very close to 1 accounting for floating-point).

**Implementation notes:**
- Add `parseExpression(inputString, angleMode)` top-level function.
- Call `tokenize(inputString)` → `toPostfix(tokens)` → `evaluatePostfix(postfixTokens, angleMode)`.
- Catch and report errors from any stage.
- Format the result with `formatNumber()`.
- Return state object: `{ current: formattedResult, error: false, expression: inputString }`.

## T005: New state machine and calculator entry points
**Acceptance:** `test/calculator.test.js` includes tests that:
- Create an `initialState` with `current: "0"`, `expression: ""`, `angleMode: "degrees"`.
- Call `inputCharacter(state, "2")` and verify `state.expression` becomes `"2"` and display updates.
- Call `inputCharacter(state, "+")` and verify the expression is `"2 +"` (or similar).
- Call `equals(state)` after a complete expression and verify the result is displayed.

**Implementation notes:**
- Export new `initialState`: `{ current: "0", expression: "", angleMode: "degrees", error: false }`.
- Add `inputCharacter(state, char)` — appends `char` to `expression`, re-parses, updates `current`. If parsing fails, set `error: true`.
- Add `equals(state)` — if `expression` is non-empty and valid, parse and evaluate it, then reset `expression`. Otherwise, return state.
- Add `backspace(state)` — remove last character from `expression`, re-parse.
- Add `clear()` — reset to `initialState`.
- Add `toggleAngleMode(state)` — switch `angleMode` between "degrees" and "radians".
- Keep `formatNumber()` and `expressionText(state)` (adapt as needed).

## T006: Append function and constant helpers
**Acceptance:** `test/calculator.test.js` includes tests:
- `appendFunction(state, "sin")` on state with `expression: ""` yields `expression: "sin("`.
- `appendConstant(state, "π")` on state with `expression: "2 +"` yields `expression: "2 + π"`.
- After appending, a user can continue typing or press `=` to evaluate.

**Implementation notes:**
- Add `appendFunction(state, funcName)` — appends `"${funcName}("` to expression.
- Add `appendConstant(state, constantName)` — appends the constant symbol or word (e.g., `"π"` or `"pi"`) to expression.
- Both trigger re-parse and update `current` display.

## T007: Update `index.html` UI
**Acceptance:** The page renders with:
- Basic keypad (unchanged from original).
- A "Sci" or mode-toggle button in the header or corner.
- A scientific keypad section (initially hidden with `display: none` or similar).
- An angle-mode indicator showing "DEG" or "RAD" and a toggle button (shown only in scientific mode or always).

**Implementation notes:**
- Add a mode toggle button: `<button id="modeToggle" aria-label="Toggle scientific mode">Sci</button>`.
- Add scientific keypad div: `<div id="scientificKeypad" class="keypad keypad--scientific">`.
- Include buttons for each scientific function and constant, with `data-action` and `data-value` attributes matching the app's dispatch system.
- Add angle-mode indicator: `<div class="angle-indicator" id="angleMode">DEG</div>` and toggle button.
- Ensure responsive layout (e.g., `display: flex`, `flex-direction: column` on small screens).

## T008: Update `styles.css` for scientific mode
**Acceptance:** When the page loads, the scientific keypad is hidden. After clicking the mode toggle, the scientific keypad appears and is styled consistently with the basic keypad. The angle-mode indicator is visible and styled appropriately.

**Implementation notes:**
- Add `.keypad--scientific { display: none; }`.
- Add `.keypad--scientific.is-visible { display: grid; }` (or flex, to match basic keypad layout).
- Style buttons in scientific keypad to match basic keypad (same font, colors, hover states, dark/light theme).
- Style `.angle-indicator` with appropriate styling and prominence.
- Ensure dark/light theme (via `color-scheme` media queries) applies to all new elements.

## T009: Update `src/app.js` to wire scientific mode
**Acceptance:** 
- Clicking the mode toggle hides/shows the scientific keypad.
- The angle-mode indicator updates when the angle-mode toggle button is clicked.
- Scientific buttons (sin, cos, etc.) call `appendFunction()` or `appendConstant()` and update the display.
- The expression display (or a separate input field) shows the current expression as the user types.

**Implementation notes:**
- Add event listener to mode toggle button: toggle class `is-visible` on scientific keypad.
- Add event listener to angle-mode toggle: call `toggleAngleMode(state)` and update indicator display.
- Update `dispatch()` to handle new actions: `"appendFunction"`, `"appendConstant"`, `"toggleAngleMode"`.
- For `"appendFunction"`, extract function name from `event.target.dataset.value`.
- Update keyboard handler: reuse existing bindings but interpret them through `inputCharacter()` instead of the old handlers.
- Update `render()` to display `state.angleMode` in the indicator.

## T010: Rewrite `test/calculator.test.js` for the new state machine
**Acceptance:** All tests pass (`npm test` exits 0). Tests cover:
- Parsing valid expressions and verifying results.
- Each scientific function with typical inputs.
- Angle mode switching and its effect on trig functions.
- Error handling (malformed expressions, division by zero, etc.).
- Backward compatibility: basic arithmetic still works correctly.

**Implementation notes:**
- Remove old `press()` helper; add new `evaluate(inputString, angleMode = "degrees")` that calls `parseExpression()`.
- Rewrite all existing tests to use the new function, e.g., `assert.equal(evaluate("2 + 3"), "5")`.
- Add new tests for each scientific function:
  - `sin(0)`, `sin(90, "degrees")`, `sin(π/2, "radians")`.
  - `cos(0)`, `cos(180, "degrees")`, etc.
  - `tan`, `log`, `ln`, `sqrt`, `pow`/`^`.
  - Constants: `π`, `e`.
- Add tests for operator precedence: `2 + 3 * 4`, `10 - 5 / 5`, etc.
- Add tests for parentheses: `(2 + 3) * 4`, nested parentheses.
- Add tests for error cases: `(2 + 3`, `sqrt(-1)`, `1 / 0`, etc.
- Ensure all tests are deterministic (use exact assertions or small epsilon for floating-point).

## T011: Verify backward compatibility and run full test suite
**Acceptance:** `npm test` passes all tests (≥10 tests covering new functionality, all old tests updated and passing).

**Implementation notes:**
- Run `npm test` and verify output.
- Spot-check the live page: toggle mode, click buttons, use keyboard, verify results.
- Test on mobile (narrow viewport) to verify responsive layout.
- Test dark/light theme toggle (if system preference is available).

## T012: Clean up and finalize
**Acceptance:** 
- No `console.log()` or debug code remains.
- Code is well-commented in complex sections (tokenizer, parser).
- Commit message is clear and references the workstream.

**Implementation notes:**
- Review all modified files for debugging output or commented-out code.
- Add JSDoc comments to key functions if they're not self-explanatory.
- Verify no TypeScript or build artifacts are present.
- Commit with message: "Add scientific mode with expression parser and angle mode toggle".

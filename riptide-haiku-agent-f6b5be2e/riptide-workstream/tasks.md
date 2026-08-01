# Task Breakdown

## T001: Add Expression Tokenizer
**Depends on:** None  
**Owner:** Parser implementation

Create a `tokenize(input)` function in `src/calculator.js` that converts a user input string into an array of tokens.

**Implementation:**
- Recognize tokens: numbers (including decimals and scientific notation), operators (`+`, `-`, `×`, `÷`, `^`), functions (names like `sin`, `cos`, `ln`, etc.), constants (`π`, `e`), and parentheses
- Handle whitespace (strip)
- Return array of token objects: `{ type: 'number' | 'operator' | 'function' | 'constant' | 'paren', value: ... }`
- Throw or return error for unrecognized characters

**Acceptance Check:**
- `tokenize("2 + 3")` → `[{ type: 'number', value: 2 }, { type: 'operator', value: '+' }, { type: 'number', value: 3 }]`
- `tokenize("sin(π/2)")` → tokens for `sin`, `(`, `π`, `/`, `2`, `)`
- `tokenize("invalid@")` → error or throws
- All numbers are parsed as JavaScript numbers (with correct sign and decimal handling)

---

## T002: Implement Recursive Descent Parser
**Depends on:** T001  
**Owner:** Parser implementation

Create `parseExpression(tokens)` and `evaluateAST(ast, angleMode)` functions that implement a recursive descent parser respecting PEMDAS (operator precedence and parentheses).

**Implementation:**
- Precedence levels (lowest to highest):
  - Addition/subtraction: `+`, `-`
  - Multiplication/division: `×`, `÷`
  - Exponentiation: `^` (right-associative)
  - Unary (functions, unary minus, parentheses)
- Return an AST (lightweight tree) or evaluated result
- Error handling for mismatched parentheses, invalid operators, etc.

**Acceptance Check:**
- `parseExpression(tokenize("2 + 3 * 4")) → 14`
- `parseExpression(tokenize("(2 + 3) * 4")) → 20`
- `parseExpression(tokenize("2 ^ 3 ^ 2")) → 512` (right-associative: 2^(3^2))
- `parseExpression(tokenize("(2 + 3")) → error (mismatched)`
- Works without functions defined yet (they're added in T003)

---

## T003: Implement Trigonometric Functions
**Depends on:** T002  
**Owner:** Scientific function library

Add `sin`, `cos`, `tan`, `asin`, `acos`, `atan` to the function library.

**Implementation:**
- Each function checks `angleMode` parameter (passed through parser)
- If `angleMode === "degrees"`, convert input to radians before calling Math.sin/cos/etc., and convert output back to degrees
- If `angleMode === "radians"`, use Math functions directly
- Handle domain errors: e.g., `asin(2)` returns NaN (display as error)
- Use high precision (built-in Math functions)

**Acceptance Check:**
- With angle mode = "degrees":
  - `sin(90)` → `1`
  - `cos(0)` → `1`
  - `tan(45)` → `1`
  - `asin(1)` → `90`
- With angle mode = "radians":
  - `sin(π/2)` → `1`
  - `cos(0)` → `1`
- Domain errors return NaN (displayed as "Error")

---

## T004: Implement Logarithmic and Exponential Functions
**Depends on:** T002  
**Owner:** Scientific function library

Add `ln`, `log10`, `exp` to the function library.

**Implementation:**
- `ln(x)` = natural logarithm (base e)
- `log10(x)` = logarithm base 10
- `exp(x)` = e^x
- Domain errors: `ln(0)`, `ln(-1)`, `log10(-1)` all return NaN

**Acceptance Check:**
- `ln(e)` → `1`
- `log10(100)` → `2`
- `exp(0)` → `1`
- `ln(-1)` → NaN (error display)
- Precision: `ln(2.718281828)` ≈ `1` (within rounding)

---

## T005: Implement Power and Root Functions
**Depends on:** T002  
**Owner:** Scientific function library

Add `pow`, `sqrt`, `cbrt`, `x^y` (binary exponentiation) to the function library.

**Implementation:**
- `sqrt(x)` = x^0.5
- `cbrt(x)` = x^(1/3)
- `pow(x, y)` or `x ^ y` = x to the power of y
- Handle negative bases with fractional exponents (e.g., `(-8)^(1/3)` → `-2`, not NaN)
- Exponentiation is right-associative: `2 ^ 3 ^ 2` = `2 ^ (3 ^ 2)` = `2 ^ 9` = `512`

**Acceptance Check:**
- `sqrt(4)` → `2`
- `cbrt(27)` → `3`
- `2 ^ 3` → `8`
- `4 ^ 0.5` → `2`
- `2 ^ 3 ^ 2` → `512` (right-associative)
- Domain errors: `sqrt(-1)` → NaN (unless real cube root of negative is requested)

---

## T006: Add Constants π and e
**Depends on:** T001  
**Owner:** Scientific function library

Add `π` and `e` as recognizable tokens and constants.

**Implementation:**
- Tokenizer recognizes `π` (and aliases: `pi`, `PI`, `Pi`)
- Tokenizer recognizes `e` when standalone (not part of an identifier)
- Parser replaces these with their numeric values: `π ≈ 3.14159265359`, `e ≈ 2.71828182846`
- Constants are stored at high precision internally

**Acceptance Check:**
- `tokenize("π")` → `{ type: 'constant', value: π }`
- `parseExpression(tokenize("π"))` → `3.14159265359`
- `parseExpression(tokenize("sin(π/2)"))` → `1`
- `parseExpression(tokenize("e^1"))` → `2.71828...`

---

## T007: Add Angle Mode to Calculator State
**Depends on:** T003  
**Owner:** State machine

Update `src/calculator.js` state object and related functions to support angle mode.

**Implementation:**
- Add `angleMode` field to state: `"degrees"` or `"radians"` (default: `"degrees"`)
- Add `toggleAngleMode(state)` function to toggle between modes
- Update `equals` and `setOperator` to pass `angleMode` through to the parser
- Ensure angle mode is preserved when switching between basic and scientific modes

**Acceptance Check:**
- Initial state: `angleMode: "degrees"`
- `toggleAngleMode(state)` with `"degrees"` → `"radians"`
- `toggleAngleMode(state)` with `"radians"` → `"degrees"`
- Functions respect the current angle mode during evaluation
- Existing non-trig operations are unaffected

---

## T008: Update Expression State Tracking
**Depends on:** T002, T007  
**Owner:** State machine

Modify the calculator state machine to build and display full expressions, not just pending operations.

**Implementation:**
- Add `expression` field to state (the full expression string being built)
- Append digits, operators, function names, and parentheses to `expression`
- On `=`, parse and evaluate the full expression
- Update `expressionText(state)` to return the current expression (for display)
- Backspace removes one character from expression
- Clear resets expression to empty
- Error states reset expression

**Acceptance Check:**
- `inputDigit(state, "2")` → expression includes `"2"`
- After `inputDigit`, `setOperator`, `inputDigit(state, "3")` → expression is `"2+3"` (or similar, depending on operator)
- `equals` parses and evaluates the full expression
- Display shows the full expression as user builds it
- Backspace removes last character from expression

---

## T009: Add Scientific Mode Toggle to HTML
**Depends on:** None (UI markup)  
**Owner:** UI/UX

Add HTML markup for scientific keypad and toggle button.

**Implementation:**
- Add a "Scientific" button in or near the keypad
- Create a hidden `<div class="keypad--scientific">` with buttons for:
  - Trig: `sin`, `cos`, `tan`, `arcsin`, `arccos`, `arctan`
  - Logs: `ln`, `log₁₀`, `e^x`
  - Powers: `x²`, `x³`, `√`, `∛`, `x^y`
  - Constants: `π`, `e`
  - Parentheses: `(`, `)`
  - Angle mode toggle button (showing current mode, e.g., "DEG" or "RAD")
- All buttons have `data-action` attributes for the dispatcher
- Hidden state: `display: none`; toggle adds a class to show it

**Acceptance Check:**
- Scientific keypad exists in HTML (initially hidden)
- All required buttons are present with appropriate labels and data attributes
- Toggle button is present and clickable
- Angle mode button shows current mode

---

## T010: Style Scientific Keypad
**Depends on:** T009  
**Owner:** UI/UX

Add CSS for scientific mode layout and styling.

**Implementation:**
- Add `.keypad--scientific` styles
- Scientific keys inherit basic button styling but may have different colors for function classes
- Layout: grid or flex that reflows on small screens
- Show/hide animation (optional, subtle)
- Angle mode button styling (distinct)
- Maintain accessibility: focus states, labels, etc.

**Acceptance Check:**
- Scientific keypad is visually distinct from basic keypad
- Layout is responsive and doesn't overflow on mobile (<380px)
- Buttons are keyboard-accessible (tab order, focus visible)
- Color contrast meets WCAG AA standards

---

## T011: Implement Scientific Mode Toggle Logic in app.js
**Depends on:** T007, T009, T010  
**Owner:** UI/UX

Wire up the scientific toggle button to show/hide the scientific keypad without losing calculation state.

**Implementation:**
- Add global flag or state for `scientificModeEnabled`
- Toggle button click handler:
  - Toggles the visibility of scientific keypad
  - Does NOT reset calculator state
- Add keyboard shortcut (e.g., `Ctrl+Shift+S` or similar) if possible
- Update dispatcher to handle new actions: `toggleScientificMode`, `toggleAngleMode`

**Acceptance Check:**
- Clicking "Scientific" button shows scientific keypad
- Clicking again hides it
- Ongoing calculation is preserved when toggling
- Angle mode persists when toggling
- Keyboard shortcut (if added) works consistently

---

## T012: Add Keyboard Shortcuts for Scientific Functions
**Depends on:** T011, T003, T004, T005  
**Owner:** UI/UX

Map keyboard keys to scientific functions.

**Implementation:**
- Add to `KEY_BINDINGS` or a similar mapping:
  - `s` → `sin`, `Shift+S` → `arcsin` (or another combo)
  - `c` → `cos`, `Shift+C` → `arccos`
  - `t` → `tan`, `Shift+T` → `arctan`
  - `l` → `ln`
  - `Shift+L` → `log₁₀` (or `L`)
  - `e` → `exp` (or insert `e` constant; clarify in UX)
  - `p` → `π`
  - `r` → toggle angle mode (radians/degrees)
  - `(` and `)` → insert parentheses
  - `^` or `Shift+6` → exponentiation
  - `Shift+√` (or dedicated key) → square root
- Ensure no conflicts with browser shortcuts
- Non-ASCII keys (π, √) may not have keyboard bindings; use button only

**Acceptance Check:**
- Pressing `s` enters `sin(`
- Pressing `l` enters `ln(`
- Pressing `p` enters `π`
- Pressing `r` toggles angle mode
- No keyboard conflicts or unexpected browser behavior

---

## T013: Write Parser Tests
**Depends on:** T002, T003, T004, T005, T006  
**Owner:** Testing

Add comprehensive unit tests for the expression parser and functions.

**Implementation:**
- Create a test suite (in `test/calculator.test.js` or a new file) covering:
  - Tokenizer: single tokens, whitespace, numbers, functions, constants, parentheses
  - Parser: operator precedence, associativity, parentheses, error cases
  - Functions: trigonometric (both angle modes), logarithmic, power, roots
  - Full expressions: complex nested expressions, edge cases

**Test Cases (minimum 30):**
- Precedence: `2 + 3 * 4 = 14`, `(2 + 3) * 4 = 20`, `2 ^ 3 ^ 2 = 512`
- Parentheses: nested, unmatched, empty
- Functions: `sin(90)`, `ln(e)`, `sqrt(16)`, etc.
- Constants: `π`, `e`
- Angle modes: `sin(π/2)` in radians vs. degrees
- Edge cases: division by zero, domain errors, very large numbers, scientific notation
- Error handling: mismatched parens, unknown functions, etc.

**Acceptance Check:**
- All test cases pass
- Coverage includes all new functions and parser paths
- Backward compatibility: all existing basic-mode tests still pass

---

## T014: Verify Backward Compatibility
**Depends on:** T013  
**Owner:** Testing

Run all existing tests and ensure nothing breaks.

**Implementation:**
- Run `npm test` and verify all original test cases pass
- Specifically test that basic operations still work as before: `2 + 3 * 4 = 20` (left-to-right, unchanged in basic mode) vs. `14` (when using the new parser)
- Confirm that existing keyboard and button inputs behave the same

**Design Note:** The existing left-to-right mode is preserved for backward compatibility when NOT using the new parser. The new parser is used only when an expression is entered that requires it (e.g., contains functions or parentheses). This needs to be clarified during implementation: do we always use the new parser (changing basic mode behavior) or do we toggle between them?

**Decision for this spec:** Use the new parser for ALL expressions (including basic 4-operation ones), so precedence is always correct. This is a breaking change for basic mode (e.g., `2 + 3 * 4` now = `14` instead of `20`), but it's the correct mathematical behavior. Existing tests will need to be updated or we accept that basic mode behavior changes.

**Acceptance Check:**
- Either: all existing tests pass unchanged (requiring two-parser logic), or
- All existing tests are updated to expect correct precedence (simpler implementation)

---

## T015: Accessibility Audit
**Depends on:** T009, T010, T011, T012  
**Owner:** UI/UX

Ensure scientific mode meets WCAG 2.1 AA standards.

**Implementation:**
- Verify all new buttons have descriptive `aria-label` attributes
- Check color contrast: all text on buttons meets 4.5:1 or 3:1 (large text)
- Test keyboard navigation: Tab/Shift+Tab cycles through all new buttons
- Verify focus visible: all buttons have visible focus states
- Test with screen reader (e.g., NVDA, JAWS, or browser built-in)
- Ensure display updates are announced: `aria-live="polite"` on expression display

**Acceptance Check:**
- All buttons have labels and pass color contrast check
- Keyboard navigation works smoothly
- Screen reader announces new functions and mode changes
- Focus visible on all interactive elements

---

## T016: Integrate and Final Testing
**Depends on:** T013, T014, T015  
**Owner:** Integration

Run full integration tests, verify all user stories pass, and prepare for deployment.

**Implementation:**
- Manual testing of all user story acceptance scenarios
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Mobile testing (small screens, touch)
- Performance: test with very long expressions
- Deployment checklist: all files committed, tests pass, no console errors

**Acceptance Check:**
- All user story scenarios verified manually
- Tests pass on all target browsers
- Mobile layout is responsive and usable
- No console errors or warnings
- Ready for production deployment

---

## Dependency Graph

```
T001 (Tokenizer)
  ↓
T002 (Parser)
  ├→ T003 (Trig functions)
  ├→ T004 (Log/exp functions)
  └→ T005 (Power/root functions)
     ↓
T006 (Constants π, e) — can proceed in parallel

T007 (Angle mode state)
  ├→ T008 (Expression state)
  │   ↓
  │   T013 (Tests)
  │     ↓
  │     T014 (Backward compat)
  │       ↓
  │       T016 (Integration tests)

T009 (Scientific HTML markup)
  ├→ T010 (Styling)
  │   ├→ T011 (Toggle logic)
  │   │   ├→ T012 (Keyboard shortcuts)
  │   │   └→ T015 (Accessibility)
  │   └→ (already depends on T010)
```

**Suggested execution order:**
1. T001 → T002 → T006 (parser foundation)
2. T003, T004, T005 (functions, in parallel or serial)
3. T007 → T008 (state machine updates)
4. T009 → T010 → T011 (UI structure)
5. T012 (keyboard support)
6. T013 → T014 → T015 (testing and accessibility)
7. T016 (integration and final checks)

This order ensures the core parser and functions work before integrating with UI, and testing follows implementation.

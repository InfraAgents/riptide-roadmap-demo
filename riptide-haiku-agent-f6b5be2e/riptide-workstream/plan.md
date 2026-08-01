# Implementation Plan

## Technical Context

The current calculator uses a simple left-to-right state machine in `src/calculator.js` with no expression parsing. To support scientific mode and proper precedence, we need:

1. **Expression Parser** — a recursive descent parser that tokenizes input, respects operator precedence (PEMDAS), handles parentheses, and evaluates expressions
2. **Function Library** — trigonometric, logarithmic, power, and root functions with angle mode (degrees/radians) support
3. **UI/UX Layer** — toggle between basic and scientific keypads, show full expression, handle new keyboard bindings
4. **State Machine Update** — adapt the existing state machine to work with the new parser

The parser will be a pure module (no DOM), testable in Node, and reusable by future graphing code.

## Architecture Decisions

### Decision 1: Parser Design
**Choice:** Recursive descent parser with tokenizer  
**Rationale:**
- Simple to understand and test
- Naturally handles nested parentheses and operator precedence
- Pure function (no side effects), testable in Node
- Fast enough for calculator-sized expressions (< 100 tokens)

**Alternatives Considered:**
- Shunting-yard algorithm: more complex, no clear advantage here
- Abstract syntax tree (AST): overkill for simple evaluation, but we'll build a lightweight one anyway for clarity

### Decision 2: Angle Mode
**Choice:** Store mode (degrees/radians) in calculator state; trig functions read it  
**Rationale:**
- Degrees are more intuitive for users (especially students)
- Easy to toggle and persist
- Matches scientific calculator UX

### Decision 3: UI Toggle
**Choice:** A "Scientific" button that shows/hides a second set of keys  
**Rationale:**
- Doesn't crowd the basic keypad (roadmap requirement)
- User can work in basic mode and toggle to scientific as needed
- Preserves ongoing calculation state

### Decision 4: Backward Compatibility
**Choice:** Reuse the existing `calculator.js` state machine structure where possible; add new functions alongside  
**Rationale:**
- Existing tests pass unchanged
- Familiar pattern for the codebase
- Easier review and integration

## File Structure

### Modified Files
- **`src/calculator.js`** — extend with new parser and functions; keep existing basic operations working
  - Add `parseExpression(input)` function (the main parser entry point)
  - Add `evaluateExpression(tokens)` (recursive descent evaluation)
  - Add trig functions: `sin`, `cos`, `tan`, `asin`, `acos`, `atan`
  - Add log functions: `ln`, `log10`, `exp`
  - Add power functions: `pow`, `sqrt`, `cbrt`
  - Add state field: `angleMode` (default: "degrees")
  - Update `setOperator` and other functions to work with the new parser when needed
  - Keep all existing exports for backward compatibility

- **`src/app.js`** — extend with scientific mode UI
  - Add toggle button click handler
  - Show/hide scientific keypad
  - Handle new keyboard bindings (e.g., 's' for sin)
  - Update display to show full expression
  - Add degrees/radians toggle button and handler

- **`index.html`** — add scientific keypad markup
  - Scientific buttons (sin, cos, tan, arcsin, etc.)
  - π and e constant buttons
  - Power and root buttons
  - Parenthesis buttons
  - Degrees/radians toggle button
  - Scientific toggle button

- **`styles.css`** — style scientific keypad
  - Hidden/shown states for keypad
  - Layout for scientific buttons (may wrap or use a modal)
  - Styling for new button types (function, constant, etc.)

- **`test/calculator.test.js`** — extend with new test cases
  - Parser tokenization tests
  - Precedence tests (e.g., `2 + 3 * 4 = 14`)
  - Parentheses tests
  - Trig function tests (degrees and radians modes)
  - Log function tests
  - Power and root tests
  - Edge case tests (mismatched parens, domain errors, etc.)
  - Backward compatibility tests (ensure old tests still pass)

## Implementation Phases

### Phase 1: Expression Parser (Tokenizer + Recursive Descent)
- Tokenize input string into numbers, operators, functions, constants, and parentheses
- Implement recursive descent parser with precedence levels:
  - Level 0 (lowest): `+`, `-` (addition/subtraction)
  - Level 1: `×`, `÷` (multiplication/division)
  - Level 2: `^` (exponentiation, right-associative)
  - Level 3 (highest): unary functions and parentheses
- Return an evaluable result or throw/return error

### Phase 2: Function Library
- Implement trig functions (with angle mode support)
- Implement log functions
- Implement power and root functions
- Add constants π and e

### Phase 3: State Machine & UI Integration
- Add `angleMode` to calculator state
- Update state machine to toggle between basic and scientific modes
- Add keyboard shortcuts for scientific functions
- Update `app.js` to handle new actions (toggle mode, toggle angle mode, input function names)

### Phase 4: UI & Styling
- Add scientific keypad HTML (initially hidden)
- Add toggle button
- Add degrees/radians indicator and toggle
- Style to match existing design
- Ensure responsive layout

### Phase 5: Testing & Polish
- Write comprehensive tests for parser and functions
- Verify backward compatibility
- Test edge cases and error handling
- Accessibility audit

## Key Design Patterns

**Parser Output:** Functions return either `{ success: true, value: number }` or `{ success: false, error: string }` to mirror the existing error handling.

**Function Signature:** All scientific functions accept a single number (the current display value) and return a number or error. Binary operators use the existing pattern (left operand stored in state, right operand entered, then applied).

**Tokens:** Represented as objects: `{ type: 'number' | 'operator' | 'function' | 'constant' | 'paren', value: ... }`

**Expression String:** User builds up an expression string (e.g., `"sin(π/2) + 3"`) that is parsed on `=` or operator precedence breaks.

## Testing Strategy

1. **Unit tests for tokenizer** — ensure input strings are split correctly
2. **Unit tests for parser** — precedence, parentheses, error cases
3. **Unit tests for functions** — each function with known inputs and outputs
4. **Integration tests** — full expressions from UI to result
5. **Regression tests** — all existing basic-mode tests pass unchanged

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Parser bugs cause wrong results | Comprehensive unit tests; start with simple cases (no functions) and build up |
| Parentheses mismatched; unclear error message | Provide clear error messages; highlight mismatched parens in the expression display |
| Keyboard shortcuts conflict with browser defaults | Test common shortcuts; document any that can't be used; provide UI alternatives |
| Performance degrades with long expressions | Parser is single-pass; should be fast enough; test with pathologically long inputs (> 1000 chars) |
| Backward compatibility breaks | Run all existing tests; add a regression test suite |

## Open Questions Resolved

- **Angle mode default?** Degrees (more intuitive for students)
- **Where to store angle mode?** In calculator state, toggled via button
- **How to show scientific buttons?** Hidden by default; toggle button reveals them (or modal)
- **Keyboard shortcuts for functions?** Use mnemonics where possible (e.g., `s` for sin, `l` for ln, `p` for π)

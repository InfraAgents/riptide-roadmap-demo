# Implementation Plan: Scientific Mode

## Technical Context

### Current Architecture
- **calculator.js**: Pure state machine. No parsing — left-to-right evaluation only.
- **app.js**: Event handlers dispatch actions; state updates; render.
- **HTML**: Hardcoded buttons and layout. Two-line display (expression + current).
- **Tests**: Simple sequence-based tests using a `press()` helper.

### Why a New Parser?
The current left-to-right engine can't handle operator precedence or functions. Scientific mode requires:
1. Parsing a full expression string into an AST (abstract syntax tree) or equivalent.
2. Respecting operator precedence: `^` > unary funcs > `×/÷` > `+−`.
3. Handling parentheses and function calls: `sin(π/2)`.

### Parser Design
Use a **recursive descent parser** (LL grammar, no external libs):
- **Tokenizer**: break input into tokens (digits, operators, function names, parentheses).
- **Parser**: recursive functions for each precedence level.
  - `parseExpression()` — addition/subtraction (lowest precedence).
  - `parseTerm()` — multiplication/division.
  - `parseFactor()` — exponentiation.
  - `parseUnary()` — unary functions and negation.
  - `parsePrimary()` — numbers, constants, parenthesized expressions, function calls.
- **Evaluator**: walk the tree and compute the result.

This keeps everything in pure functions, testable, and dependency-free.

### State Machine Changes
- Keep the existing state structure mostly intact.
- Add a `mode` field: `'basic' | 'scientific'`.
- The `current` field now holds an expression string (not just a number in entry).
- When `=` is pressed, parse and evaluate the expression; store the result.

### UI Changes
- Add a "Scientific" toggle button (top-right or bottom of display area).
- Two keypad layouts in CSS (toggle visibility via `.mode-scientific`).
- All new buttons inserted inline (not a separate panel).

## File Structure

### Files to Add
```
src/parser.js
  - tokenize(input: string) → Token[]
  - parse(input: string) → number
  - (exports parse as the public API)

riptide-workstream/
  - spec.md (this file's parent)
  - plan.md (this)
  - tasks.md (task breakdown)
  - wireframe.html (UI mockup)
```

### Files to Modify
```
src/calculator.js
  - Add initialState.mode = 'basic'
  - Add inputFunction(state, funcName) → inserts function with open paren
  - Add inputConstant(state, constant) → inserts π or e symbol
  - Add inputParenthesis(state, paren) → inserts ( or )
  - Modify equals() to call parse(state.current) instead of direct eval
  - Modify clear(), etc. to preserve/reset mode as appropriate
  - Add formatNumber improvements for very small trig results (sin(π) → 0)

src/app.js
  - Add mode toggle button and click handler
  - Update dispatch() to handle new actions
  - Update render() to show/hide scientific buttons and apply mode class
  - Add keyboard bindings for scientific functions

index.html
  - Add mode toggle button
  - Add scientific buttons (all initially hidden, shown with .mode-scientific)
  - Update keypad layout to grid that accommodates all buttons

styles.css
  - Add styles for scientific buttons
  - Add .mode-scientific class to toggle visibility
  - Ensure grid layout doesn't overflow on 360px+ devices
```

## Key Decisions & Rationale

### 1. Recursive Descent Parser
**Why not eval()?** Dangerous, slow, and not in the spirit of dependency-free.
**Why not an expression tree library?** No external dependencies.
**Why recursive descent?** Elegant, easy to test, explicit precedence, and can extend for future features (variables, user functions).

### 2. Radians Only
**Why radians?** Standard in mathematics and physics. Easier to implement without UI clutter (degrees toggle can be added later).

### 3. Tokenizer + Parser Separation
**Why separate?** Cleaner code, easier to test tokenization independently, easier to extend (e.g., add variables later by enhancing the tokenizer).

### 4. Mode Toggle Clears Input
**Rationale:** Switching modes is a deliberate user action; it's safer UX to clear the input buffer to avoid confusion (e.g., user types `2+3`, toggles to scientific, types `sin` expecting `2+3sin(?)` but getting `sin(?)`).

### 5. Symbols in Display (π, e, not "pi", "e")
**Why?** Cleaner, more professional. The parser's tokenizer knows that `π` is `Math.PI`.

### 6. No Separate Function Panel
**Why integrated?** Keeps the design simple, no modal or tab switching, easier on mobile.

## Parser Implementation Sketch

```javascript
// Tokenize: "2 + 3 * sin(π/2)" → 
//   [NUM(2), OP(+), NUM(3), OP(*), FUNC(sin), LPAREN, CONST(π), OP(/), NUM(2), RPAREN]

// Parse recursively:
// parseExpression() handles +/- (lowest precedence, left-associative)
//   parseTerm() handles */, (next level)
//     parseFactor() handles ^, (right-associative)
//       parseUnary() handles unary - and functions
//         parsePrimary() handles numbers, constants, (expr), and function calls

// Evaluate by traversing the tree.
```

## Testing Strategy

### Unit Tests (src/parser.test.js — new file)
- Tokenization: valid and invalid input.
- Parsing: operator precedence, parentheses, functions, constants.
- Evaluation: results match expected values (with floating-point tolerance).

### Integration Tests (test/calculator.test.js — extend)
- New actions: `inputFunction`, `inputConstant`, `inputParenthesis`.
- Scientific expressions via the `press()` helper (expand it to handle new tokens).
- Mode toggling doesn't break basic operations.

### Manual Testing (QA)
- Try expressions in browser.
- Check mobile layout.
- Verify keyboard shortcuts.

## Deployment
- No changes to CI/CD (hands off .github/).
- No build step required (parser is plain ES modules).
- GitHub Pages serves updated index.html as-is.

## Rollback Plan
If the parser proves buggy:
1. The mode toggle defaults to 'basic'.
2. Basic mode uses the original left-to-right calculator, unchanged.
3. Revert src/parser.js and roll back src/calculator.js and src/app.js to revert scientific-specific logic only.

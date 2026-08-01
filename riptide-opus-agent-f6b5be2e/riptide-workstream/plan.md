# Implementation plan — Scientific mode

## Technical context

- **Stack:** plain ES modules, no build step, no dependencies. Tests run with
  `node --test`. `index.html` is served from the repo root by GitHub Pages.
- **Current shape:** `src/calculator.js` is a pure left-to-right state machine
  (immutable state objects, no DOM). `src/app.js` wires it to the DOM and
  keyboard. `formatNumber` already handles precision, noise trimming, and
  exponential display.
- **Key constraint from the roadmap:** the expression engine must be reusable
  by graphing later, so it lives in its own pure module with a single
  `evaluate(expression)` entry point and no DOM dependency — exactly the
  pattern `calculator.js` already follows.

## Approach & key decisions

1. **New pure module `src/expression.js`** — a small tokenizer + recursive
   descent (Pratt-style) parser/evaluator. Chosen over the shunting-yard
   algorithm because recursive descent reads clearly for the grammar we need
   (precedence, right-associative `^`, unary minus, parenthesised functions)
   and is easy to unit-test function-by-function. It throws an
   `ExpressionError` for any malformed input; the caller maps that to the
   existing recoverable `Error` state. **Rationale:** keeping the engine pure
   and framework-free is what lets graphing reuse it and lets us test it under
   Node, matching the project's existing testability story.

2. **Grammar (radians, out of scope: implicit multiplication):**

   ```
   expr    := term (("+" | "-") term)*
   term    := power (("×" | "÷") power)*
   power   := unary ("^" power)?          # right-associative
   unary   := "-" unary | primary
   primary := number | constant | func "(" expr ")" | "(" expr ")"
   func    := "sin" | "cos" | "tan" | "log" | "ln" | "√"
   constant:= "π" | "e"
   ```

   The tokenizer recognises numbers (with decimals), the operator/paren symbols
   used by the UI (`×`, `÷`, `−`/`-`, `+`, `^`, `(`, `)`), the function names,
   and the constants. Unknown characters throw.

3. **Extend `src/calculator.js` with an expression sub-state** rather than
   rewriting the basic state machine. Basic mode keeps its existing functions
   untouched (protecting SC-002/SC-005). Scientific input builds a token/string
   buffer; a new `evaluateExpression(state)` calls `evaluate` and folds the
   result (or `Error`) back into the shared state shape (`current`, `error`,
   `overwrite`). `formatNumber` is reused for the result.

4. **UI: a toggle + a scientific panel in `index.html`.** The scientific keys
   (`sin cos tan`, `log ln √`, `x²`, `xʸ` (`^`), `π`, `e`, `(`, `)`) sit in a
   panel that is hidden by default and revealed by a toggle button with
   `aria-pressed`. `src/app.js` gains handlers that append the relevant token
   to the expression buffer and route `=` through `evaluateExpression`. When
   the toggle is off, the app behaves exactly as today.

5. **Styling in `styles.css`** for the toggle and the scientific panel,
   following the existing `.key` / `.keypad` conventions and the dark/light
   colour scheme. No new colours invented beyond the existing palette.

## File-by-file changes

| Path | Change |
| --- | --- |
| `src/expression.js` | **New.** Pure tokenizer + recursive-descent evaluator. Exports `evaluate(expression)` and `ExpressionError`. No DOM. |
| `test/expression.test.js` | **New.** Unit tests: precedence, associativity, parentheses, unary minus, every function/constant, and error cases (empty, trailing operator, unbalanced parens, `√(−1)`, `log(0)`). |
| `src/calculator.js` | **Edit.** Add scientific expression sub-state helpers (append token, backspace within expression, `evaluateExpression`) that reuse `formatNumber` and the existing `errorState`. Basic-mode exports unchanged. |
| `src/app.js` | **Edit.** Add the mode toggle, scientific key handlers, keyboard bindings for `(`, `)`, `^`, and route `=` to the expression evaluator when in scientific mode. |
| `index.html` | **Edit.** Add the scientific-mode toggle button and the (hidden-by-default) scientific key panel; basic keypad markup unchanged. |
| `styles.css` | **Edit.** Style the toggle and scientific panel using existing conventions. |
| `README.md` | **Edit.** Document scientific mode, the radians convention, and note graphing remains future work. |

## Testing strategy

- New `test/expression.test.js` drives `evaluate` directly (pure, fast).
- Existing `test/calculator.test.js` must pass unchanged (regression guard).
- Any calculator-level scientific helpers get focused tests in
  `test/calculator.test.js` or a companion file, mirroring the existing style
  (`press`-style sequences where practical).
- Manual check against `riptide-workstream/wireframe.html` for layout/toggle.

## Risks & mitigations

- **Risk:** rewriting the state machine could regress basic mode. **Mitigation:**
  additive changes only; keep existing exports and tests intact.
- **Risk:** parser scope creep. **Mitigation:** the grammar above is fixed;
  implicit multiplication and degrees mode are explicit non-goals.
- **Risk:** `tan(π/2)` returns a huge finite number. **Mitigation:** documented
  as a known limitation; it flows through existing exponential formatting.

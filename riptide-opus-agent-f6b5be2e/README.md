# Calculator

A small web calculator with no dependencies and no build step — `index.html`
plus a couple of ES modules, tested with `node --test` and deployed to GitHub
Pages.

**Live:** https://nvdtf.github.io/riptide-roadmap-demo/

## Features

- The four basic operations, with left-to-right chaining (`2 + 3 × 4 = 20`)
- Percent, sign toggle, backspace, and clear
- Full keyboard control: digits, `+` `-` `*` `/`, `Enter` to evaluate,
  `Backspace` to delete, `Esc` to clear
- Division by zero shows a recoverable `Error` instead of `Infinity`
- Results are rounded to 12 significant digits, so `0.1 + 0.2` displays `0.3`
- Responsive layout that follows the system light/dark preference

## Layout

| Path                  | What it holds                                       |
| --------------------- | --------------------------------------------------- |
| `index.html`          | Markup and the keypad                               |
| `styles.css`          | All styling                                         |
| `src/calculator.js`   | Pure state machine — every operation, no DOM access |
| `src/app.js`          | Wires the state machine to the DOM and keyboard     |
| `test/calculator.test.js` | Unit tests for the state machine                |

Keeping the arithmetic in a pure module is what makes it testable in Node
without a browser or a DOM shim.

## Running locally

Because the page uses ES modules, opening `index.html` straight from the
filesystem will trip CORS. Serve it over HTTP instead:

```bash
npm start          # http://localhost:8000
```

## Tests

```bash
npm test           # node --test
```

## Deployment

Every push to `main` runs the tests and, if they pass, publishes the repository
root to GitHub Pages via `.github/workflows/deploy.yml`.

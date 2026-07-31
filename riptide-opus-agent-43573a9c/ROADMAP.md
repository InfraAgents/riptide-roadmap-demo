# Roadmap

Features I'm thinking about adding to this project.

Keep the project dependency-free — plain ES modules, `node --test` for tests,
`index.html` as the entry point, and no build step so GitHub Pages can serve
the repository root as-is.

1. **Scientific mode** — trigonometry, logarithms, powers and roots, `π` and
   `e`, and parentheses, without crowding the basic keypad.

2. **Graphing** — plot `y = f(x)` and let people explore the curve.

Both need to evaluate expressions with real precedence and parentheses, which
the current left-to-right engine can't do. Whichever lands first should build
that foundation so the other can reuse it.

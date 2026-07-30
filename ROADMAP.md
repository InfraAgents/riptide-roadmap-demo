# Roadmap

Each item below is meant to be a self-contained slice: one agent, one
sitting, one pull request. Keep the project dependency-free — plain ES
modules, `node --test` for tests, `index.html` as the entry point.

1. **Players and scores** — add named players, increment and decrement each
   player's score with big tap targets, and show the current leader. Scores
   live in a small importable module so tests can exercise the logic
   directly.

2. **Persistence across reloads** — keep the current game in `localStorage`
   and restore it on load, with a visible "new game" action that clears it.

3. **Round history** — record each scoring change with a timestamp and show
   the last ten in a collapsible panel, so a disputed point can be traced.

4. **Shareable game state** — encode the whole game into the URL hash so a
   link restores it on another device, with a "copy link" button.

5. **Keyboard and accessibility pass** — full keyboard operation, visible
   focus states, ARIA labels on the score controls, and a contrast check.

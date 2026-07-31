import {
  backspace,
  clear,
  equals,
  expressionText,
  initialState,
  inputDecimal,
  inputDigit,
  negate,
  percent,
  setOperator,
} from "./calculator.js";

const displayEl = document.getElementById("display");
const expressionEl = document.getElementById("expression");
const keypadEl = document.querySelector(".keypad");

let state = { ...initialState };

function render() {
  displayEl.textContent = state.current;
  expressionEl.textContent = expressionText(state);
  displayEl.classList.toggle("is-error", state.error);

  // Long results shrink to stay on one line rather than overflow the shell.
  const length = state.current.length;
  displayEl.dataset.size = length > 12 ? "sm" : length > 8 ? "md" : "lg";
}

function dispatch(action, value) {
  switch (action) {
    case "digit":
      state = inputDigit(state, value);
      break;
    case "decimal":
      state = inputDecimal(state);
      break;
    case "operator":
      state = setOperator(state, value);
      break;
    case "equals":
      state = equals(state);
      break;
    case "clear":
      state = clear();
      break;
    case "backspace":
      state = backspace(state);
      break;
    case "negate":
      state = negate(state);
      break;
    case "percent":
      state = percent(state);
      break;
    default:
      return;
  }
  render();
}

keypadEl.addEventListener("click", (event) => {
  const key = event.target.closest("button[data-action]");
  if (!key) return;
  dispatch(key.dataset.action, key.dataset.value);
});

const KEY_BINDINGS = new Map([
  ["+", { action: "operator", value: "+" }],
  ["-", { action: "operator", value: "-" }],
  ["*", { action: "operator", value: "×" }],
  ["x", { action: "operator", value: "×" }],
  ["/", { action: "operator", value: "÷" }],
  ["=", { action: "equals" }],
  ["Enter", { action: "equals" }],
  [".", { action: "decimal" }],
  [",", { action: "decimal" }],
  ["Backspace", { action: "backspace" }],
  ["Delete", { action: "clear" }],
  ["Escape", { action: "clear" }],
  ["%", { action: "percent" }],
]);

function flashKey(action, value) {
  const selector =
    value === undefined
      ? `[data-action="${action}"]:not([data-value])`
      : `[data-action="${action}"][data-value="${value}"]`;
  const key = keypadEl.querySelector(selector);
  if (!key) return;
  key.classList.add("is-active");
  setTimeout(() => key.classList.remove("is-active"), 120);
}

document.addEventListener("keydown", (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;

  let binding;
  if (/^[0-9]$/.test(event.key)) {
    binding = { action: "digit", value: event.key };
  } else {
    binding = KEY_BINDINGS.get(event.key);
  }
  if (!binding) return;

  // Enter would otherwise re-trigger whichever button was last focused.
  event.preventDefault();
  dispatch(binding.action, binding.value);
  flashKey(binding.action, binding.value);
});

render();

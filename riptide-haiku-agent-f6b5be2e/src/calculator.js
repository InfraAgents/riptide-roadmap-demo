const MAX_INPUT_DIGITS = 12;
const SIGNIFICANT_DIGITS = 12;

export const initialState = Object.freeze({
  current: "0",
  previous: null,
  operator: null,
  overwrite: true,
  error: false,
});

const errorState = Object.freeze({
  current: "Error",
  previous: null,
  operator: null,
  overwrite: true,
  error: true,
});

export function formatNumber(value) {
  if (!Number.isFinite(value)) return "Error";
  if (Number.isInteger(value) && Math.abs(value) < 1e15) return String(value);

  // Floating point noise (0.1 + 0.2) is trimmed by rounding before display.
  const rounded = Number.parseFloat(value.toPrecision(SIGNIFICANT_DIGITS));
  const magnitude = Math.abs(rounded);
  if (magnitude !== 0 && (magnitude >= 1e12 || magnitude < 1e-6)) {
    return rounded.toExponential(6).replace(/\.?0+e/, "e");
  }
  return String(rounded);
}

function applyOperator(left, operator, right) {
  switch (operator) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "×":
      return left * right;
    case "÷":
      return right === 0 ? Number.NaN : left / right;
    default:
      throw new Error(`Unknown operator: ${operator}`);
  }
}

function digitCount(display) {
  return display.replace(/[-.]/g, "").length;
}

export function inputDigit(state, digit) {
  const base = state.error ? initialState : state;
  if (base.overwrite) return { ...base, current: digit, overwrite: false };
  if (digitCount(base.current) >= MAX_INPUT_DIGITS) return base;
  if (base.current === "0") return { ...base, current: digit };
  if (base.current === "-0") return { ...base, current: `-${digit}` };
  return { ...base, current: base.current + digit };
}

export function inputDecimal(state) {
  const base = state.error ? initialState : state;
  if (base.overwrite) return { ...base, current: "0.", overwrite: false };
  if (base.current.includes(".")) return base;
  return { ...base, current: `${base.current}.` };
}

export function setOperator(state, operator) {
  if (state.error) return state;

  // A second operand is waiting, so fold it in before starting the next step.
  if (state.operator !== null && !state.overwrite) {
    const result = applyOperator(
      state.previous,
      state.operator,
      Number.parseFloat(state.current),
    );
    if (!Number.isFinite(result)) return { ...errorState };
    return {
      current: formatNumber(result),
      previous: result,
      operator,
      overwrite: true,
      error: false,
    };
  }

  return {
    ...state,
    previous:
      state.operator === null ? Number.parseFloat(state.current) : state.previous,
    operator,
    overwrite: true,
  };
}

export function equals(state) {
  if (state.error || state.operator === null) return state;
  const result = applyOperator(
    state.previous,
    state.operator,
    Number.parseFloat(state.current),
  );
  if (!Number.isFinite(result)) return { ...errorState };
  return {
    current: formatNumber(result),
    previous: null,
    operator: null,
    overwrite: true,
    error: false,
  };
}

export function backspace(state) {
  if (state.error) return { ...initialState };
  if (state.overwrite) return state;
  const next = state.current.slice(0, -1);
  if (next === "" || next === "-") {
    return { ...state, current: "0", overwrite: true };
  }
  return { ...state, current: next };
}

export function negate(state) {
  if (state.error) return state;
  if (state.current === "0") return state;
  const current = state.current.startsWith("-")
    ? state.current.slice(1)
    : `-${state.current}`;
  return { ...state, current };
}

export function percent(state) {
  if (state.error) return state;
  const value = Number.parseFloat(state.current) / 100;
  return { ...state, current: formatNumber(value), overwrite: true };
}

export function clear() {
  return { ...initialState };
}

export function expressionText(state) {
  if (state.error || state.operator === null || state.previous === null) return "";
  return `${formatNumber(state.previous)} ${state.operator}`;
}

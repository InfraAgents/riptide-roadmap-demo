import assert from "node:assert/strict";
import { test } from "node:test";

import {
  backspace,
  clear,
  equals,
  expressionText,
  formatNumber,
  initialState,
  inputDecimal,
  inputDigit,
  negate,
  percent,
  setOperator,
} from "../src/calculator.js";

function press(sequence) {
  return sequence.reduce((state, token) => {
    if (/^[0-9]$/.test(token)) return inputDigit(state, token);
    if (token === ".") return inputDecimal(state);
    if (token === "=") return equals(state);
    if (token === "±") return negate(state);
    if (token === "%") return percent(state);
    if (token === "⌫") return backspace(state);
    if (token === "AC") return clear();
    return setOperator(state, token);
  }, { ...initialState });
}

test("starts at zero", () => {
  assert.equal(initialState.current, "0");
  assert.equal(expressionText(initialState), "");
});

test("digits replace the leading zero", () => {
  assert.equal(press(["0", "5"]).current, "5");
  assert.equal(press(["1", "2", "3"]).current, "123");
});

test("evaluates the four basic operations", () => {
  assert.equal(press(["2", "+", "3", "="]).current, "5");
  assert.equal(press(["9", "-", "4", "="]).current, "5");
  assert.equal(press(["6", "×", "7", "="]).current, "42");
  assert.equal(press(["8", "÷", "2", "="]).current, "4");
});

test("chained operators evaluate left to right", () => {
  assert.equal(press(["2", "+", "3", "×", "4", "="]).current, "20");
  assert.equal(press(["1", "0", "-", "3", "-", "2", "="]).current, "5");
});

test("pressing an operator twice swaps it without evaluating", () => {
  const state = press(["7", "+", "×", "2", "="]);
  assert.equal(state.current, "14");
});

test("decimal point is accepted only once", () => {
  assert.equal(press(["1", ".", "5"]).current, "1.5");
  assert.equal(press(["1", ".", "5", ".", "2"]).current, "1.52");
  assert.equal(press([".", "5"]).current, "0.5");
});

test("division by zero produces a recoverable error", () => {
  const state = press(["5", "÷", "0", "="]);
  assert.equal(state.current, "Error");
  assert.equal(state.error, true);
  assert.equal(inputDigit(state, "7").current, "7");
  assert.equal(inputDigit(state, "7").error, false);
});

test("floating point noise is rounded away", () => {
  assert.equal(press(["0", ".", "1", "+", "0", ".", "2", "="]).current, "0.3");
});

test("backspace removes one character and bottoms out at zero", () => {
  assert.equal(press(["1", "2", "3", "⌫"]).current, "12");
  assert.equal(press(["5", "⌫"]).current, "0");
  assert.equal(press(["5", "⌫", "⌫"]).current, "0");
});

test("negate toggles sign but leaves a bare zero alone", () => {
  assert.equal(press(["5", "±"]).current, "-5");
  assert.equal(press(["5", "±", "±"]).current, "5");
  assert.equal(press(["±"]).current, "0");
  assert.equal(press(["5", "±", "+", "3", "="]).current, "-2");
});

test("percent divides the current entry by one hundred", () => {
  assert.equal(press(["5", "0", "%"]).current, "0.5");
});

test("clear resets everything", () => {
  const state = press(["1", "2", "+", "3", "AC"]);
  assert.deepEqual(state, { ...initialState });
});

test("input length is capped", () => {
  const digits = Array.from({ length: 20 }, () => "9");
  assert.equal(press(digits).current.length, 12);
});

test("expression line shows the pending operation", () => {
  assert.equal(expressionText(press(["1", "2", "+"])), "12 +");
  assert.equal(expressionText(press(["1", "2", "+", "3", "="])), "");
});

test("equals without a pending operator is a no-op", () => {
  assert.equal(press(["7", "="]).current, "7");
});

test("formatNumber handles integers, precision and extremes", () => {
  assert.equal(formatNumber(42), "42");
  assert.equal(formatNumber(-0.5), "-0.5");
  assert.equal(formatNumber(1 / 3), "0.333333333333");
  assert.equal(formatNumber(Number.NaN), "Error");
  assert.equal(formatNumber(Number.POSITIVE_INFINITY), "Error");
  assert.match(formatNumber(1e20), /e\+20$/);
});

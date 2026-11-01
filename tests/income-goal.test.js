import test from "node:test";
import assert from "node:assert/strict";

import { calculateIncomeGoalProgress, normalizeMonthlyGoal } from "../src/features/income-goal.js";

test("normalizes supported whole-dollar monthly goals", () => {
  assert.equal(normalizeMonthlyGoal("7500.4"), 7500);
  assert.equal(normalizeMonthlyGoal(100), 100);
  assert.equal(normalizeMonthlyGoal(99), null);
  assert.equal(normalizeMonthlyGoal("not-a-number"), null);
  assert.equal(normalizeMonthlyGoal(1_000_001), null);
});

test("calculates progress without exceeding one hundred percent", () => {
  assert.deepEqual(calculateIncomeGoalProgress(2750, 5000), {
    goal: 5000,
    paid: 2750,
    remaining: 2250,
    percent: 55
  });
  assert.deepEqual(calculateIncomeGoalProgress(6200, 5000), {
    goal: 5000,
    paid: 6200,
    remaining: 0,
    percent: 100
  });
});

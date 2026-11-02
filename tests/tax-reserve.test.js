import test from "node:test";
import assert from "node:assert/strict";

import { calculateTaxReserve, normalizeTaxRate } from "../src/features/tax-reserve.js";

test("normalizes supported reserve percentages", () => {
  assert.equal(normalizeTaxRate("27.46"), 27.5);
  assert.equal(normalizeTaxRate(""), null);
  assert.equal(normalizeTaxRate(0), 0);
  assert.equal(normalizeTaxRate(60), 60);
  assert.equal(normalizeTaxRate(-1), null);
  assert.equal(normalizeTaxRate(60.1), null);
  assert.equal(normalizeTaxRate("unknown"), null);
});

test("calculates the reserve and remaining paid income", () => {
  assert.deepEqual(calculateTaxReserve(4200, 25), {
    income: 4200,
    rate: 25,
    reserve: 1050,
    afterReserve: 3150
  });
  assert.deepEqual(calculateTaxReserve(-100, 20), {
    income: 0,
    rate: 20,
    reserve: 0,
    afterReserve: 0
  });
});

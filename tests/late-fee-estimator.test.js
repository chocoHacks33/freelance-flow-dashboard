import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateLateFee,
  getOverdueInvoiceOptions,
  normalizeMonthlyRate
} from "../src/features/late-fee-estimator.js";

test("validates and calculates a prorated monthly late fee", () => {
  assert.equal(normalizeMonthlyRate("1.256"), 1.26);
  assert.equal(normalizeMonthlyRate(""), null);
  assert.equal(normalizeMonthlyRate(-0.1), null);
  assert.equal(normalizeMonthlyRate(10.1), null);
  assert.equal(calculateLateFee(2400, 15, 1.5), 18);
  assert.equal(calculateLateFee(2400, -4, 1.5), 0);
});

test("lists only overdue invoices with valid positive balances", () => {
  const today = new Date("2026-11-02T12:00:00");
  const results = getOverdueInvoiceOptions(
    [
      { id: "LATE", amount: 900, dueAt: "2026-10-23", status: "outstanding" },
      { id: "FUTURE", amount: 500, dueAt: "2026-11-20", status: "outstanding" },
      { id: "PAID", amount: 700, dueAt: "2026-10-01", status: "paid" },
      { id: "INVALID", amount: 0, dueAt: "2026-10-01", status: "outstanding" }
    ],
    today
  );

  assert.deepEqual(results, [
    { id: "LATE", amount: 900, dueAt: "2026-10-23", status: "outstanding", lateDays: 10 }
  ]);
});

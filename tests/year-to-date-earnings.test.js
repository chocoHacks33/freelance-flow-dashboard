import test from "node:test";
import assert from "node:assert/strict";

import { summarizeYearToDate } from "../src/features/year-to-date-earnings.js";

test("summarizes completed payments through the current day", () => {
  const summary = summarizeYearToDate(
    [
      { amount: 1200, paidAt: "2026-01-10", status: "paid" },
      { amount: 1800, paidAt: "2026-10-30", status: "paid" },
      { amount: 900, paidAt: "2026-12-10", status: "paid" },
      { amount: 500, paidAt: "2025-12-30", status: "paid" },
      { amount: 700, paidAt: "2026-05-10", status: "outstanding" }
    ],
    new Date("2026-11-02T12:00:00")
  );

  assert.deepEqual(summary, {
    year: 2026,
    invoiceCount: 2,
    total: 3000,
    monthlyAverage: 273,
    largestPayment: 1800
  });
});

test("ignores invalid dates and non-positive payment amounts", () => {
  assert.deepEqual(
    summarizeYearToDate(
      [
        { amount: 100, paidAt: "2026-02-31", status: "paid" },
        { amount: 0, paidAt: "2026-02-01", status: "paid" }
      ],
      new Date("2026-03-15T12:00:00")
    ),
    { year: 2026, invoiceCount: 0, total: 0, monthlyAverage: 0, largestPayment: 0 }
  );
});

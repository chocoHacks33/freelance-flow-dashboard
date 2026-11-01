import test from "node:test";
import assert from "node:assert/strict";

import { summarizePaymentTiming } from "../src/features/payment-timing.js";

test("summarizes average payment time and on-time rate", () => {
  const summary = summarizePaymentTiming([
    { status: "paid", issuedAt: "2026-10-01", dueAt: "2026-10-15", paidAt: "2026-10-11" },
    { status: "paid", issuedAt: "2026-09-01", dueAt: "2026-09-10", paidAt: "2026-09-21" },
    { status: "outstanding", issuedAt: "2026-10-01", dueAt: "2026-10-31" }
  ]);

  assert.deepEqual(summary, { invoiceCount: 2, averageDays: 15, onTimeCount: 1, onTimeRate: 50 });
});

test("ignores incomplete and impossible payment history", () => {
  assert.deepEqual(
    summarizePaymentTiming([
      { status: "paid", issuedAt: "bad-date", dueAt: "2026-10-20", paidAt: "2026-10-10" },
      { status: "paid", issuedAt: "2026-10-12", dueAt: "2026-10-20", paidAt: "2026-10-10" }
    ]),
    { invoiceCount: 0, averageDays: 0, onTimeCount: 0, onTimeRate: 0 }
  );
});

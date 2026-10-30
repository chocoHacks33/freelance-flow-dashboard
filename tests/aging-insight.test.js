import test from "node:test";
import assert from "node:assert/strict";

import { buildAgingBuckets } from "../src/features/aging-insight.js";

test("groups unpaid balances into stable aging boundaries", () => {
  const invoice = (id, dueAt, amount, status = "outstanding") => ({ id, dueAt, amount, status });
  const invoices = [
    invoice("CURRENT", "2026-11-10", 100),
    invoice("DAY-1", "2026-10-29", 200),
    invoice("DAY-7", "2026-10-23", 300),
    invoice("DAY-8", "2026-10-22", 400),
    invoice("DAY-30", "2026-09-30", 500),
    invoice("DAY-31", "2026-09-29", 600),
    invoice("PAID", "2026-09-01", 5000, "paid")
  ];

  assert.deepEqual(buildAgingBuckets(invoices, new Date("2026-10-30T12:00:00")), [
    { key: "current", label: "Not yet due", count: 1, total: 100 },
    { key: "week", label: "1–7 days", count: 2, total: 500 },
    { key: "month", label: "8–30 days", count: 2, total: 900 },
    { key: "older", label: "31+ days", count: 1, total: 600 }
  ]);
});

test("returns zeroed buckets when every invoice is paid", () => {
  const result = buildAgingBuckets(
    [{ id: "PAID", dueAt: "2026-09-01", amount: 800, status: "paid" }],
    new Date("2026-10-30T12:00:00")
  );
  assert.equal(result.every(({ count, total }) => count === 0 && total === 0), true);
});


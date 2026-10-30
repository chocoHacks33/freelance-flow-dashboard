import test from "node:test";
import assert from "node:assert/strict";

import { buildMonthlyRevenue } from "../src/features/revenue-chart.js";

test("builds chronological revenue buckets across a year boundary", () => {
  const invoices = [
    { amount: 800, paidAt: "2025-12-20" },
    { amount: 1200, paidAt: "2026-01-05" },
    { amount: 300, paidAt: "2026-01-18" },
    { amount: 4000, paidAt: "2025-08-10" },
    { amount: 900 }
  ];

  assert.deepEqual(buildMonthlyRevenue(invoices, 3, new Date("2026-01-31T12:00:00")), [
    { key: "2025-11", label: "Nov", total: 0 },
    { key: "2025-12", label: "Dec", total: 800 },
    { key: "2026-01", label: "Jan", total: 1500 }
  ]);
});

test("ignores paid invoices outside the requested range", () => {
  const result = buildMonthlyRevenue(
    [{ amount: 450, paidAt: "2026-03-02" }],
    2,
    new Date("2026-05-10T12:00:00")
  );
  assert.deepEqual(result.map(({ total }) => total), [0, 0]);
});


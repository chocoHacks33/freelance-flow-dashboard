import test from "node:test";
import assert from "node:assert/strict";

import { getInvoicesDueSoon, summarizeDueSoon } from "../src/features/due-forecast.js";

const today = new Date("2026-10-31T08:00:00");
const invoices = [
  { id: "TODAY", dueAt: "2026-10-31", amount: 300, status: "outstanding" },
  { id: "WEEK", dueAt: "2026-11-07", amount: 900, status: "outstanding" },
  { id: "BOUNDARY", dueAt: "2026-11-14", amount: 500, status: "outstanding" },
  { id: "LATER", dueAt: "2026-11-15", amount: 1100, status: "outstanding" },
  { id: "OVERDUE", dueAt: "2026-10-30", amount: 700, status: "outstanding" },
  { id: "PAID", dueAt: "2026-11-02", amount: 600, status: "paid" }
];

test("includes unpaid invoices from today through the forecast boundary", () => {
  assert.deepEqual(
    getInvoicesDueSoon(invoices, 14, today).map(({ id, daysUntilDue }) => ({ id, daysUntilDue })),
    [
      { id: "TODAY", daysUntilDue: 0 },
      { id: "WEEK", daysUntilDue: 7 },
      { id: "BOUNDARY", daysUntilDue: 14 }
    ]
  );
});

test("summarizes the due-soon balance and next invoice", () => {
  const summary = summarizeDueSoon(invoices, 14, today);
  assert.equal(summary.count, 3);
  assert.equal(summary.total, 1700);
  assert.equal(summary.nextInvoice.id, "TODAY");
});

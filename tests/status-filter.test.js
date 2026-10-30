import test from "node:test";
import assert from "node:assert/strict";

import { filterInvoicesByStatus } from "../src/features/status-filter.js";

const today = new Date("2026-10-30T12:00:00");
const invoices = [
  { id: "PAID", dueAt: "2026-10-10", status: "paid" },
  { id: "OPEN", dueAt: "2026-11-10", status: "outstanding" },
  { id: "LATE", dueAt: "2026-10-10", status: "outstanding" }
];

test("returns a safe copy when all statuses are requested", () => {
  const result = filterInvoicesByStatus(invoices, "all", today);
  assert.deepEqual(result, invoices);
  assert.notEqual(result, invoices);
});

test("filters invoices using their derived payment status", () => {
  assert.deepEqual(filterInvoicesByStatus(invoices, "overdue", today).map(({ id }) => id), ["LATE"]);
  assert.deepEqual(filterInvoicesByStatus(invoices, "outstanding", today).map(({ id }) => id), ["OPEN"]);
  assert.deepEqual(filterInvoicesByStatus(invoices, "paid", today).map(({ id }) => id), ["PAID"]);
});


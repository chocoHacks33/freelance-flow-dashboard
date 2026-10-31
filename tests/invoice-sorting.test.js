import test from "node:test";
import assert from "node:assert/strict";

import { sortInvoices } from "../src/features/invoice-sorting.js";

const invoices = [
  { id: "INV-3", client: "Zenith", dueAt: "2026-12-01", amount: 400 },
  { id: "INV-2", client: "apex", dueAt: "2026-11-05", amount: 900 },
  { id: "INV-1", client: "Cedar", dueAt: "2026-11-20", amount: 400 }
];

test("sorts invoices by due date, amount, and client", () => {
  assert.deepEqual(sortInvoices(invoices, "due-soonest").map(({ id }) => id), ["INV-2", "INV-1", "INV-3"]);
  assert.deepEqual(sortInvoices(invoices, "amount-highest").map(({ id }) => id), ["INV-2", "INV-3", "INV-1"]);
  assert.deepEqual(sortInvoices(invoices, "client").map(({ id }) => id), ["INV-2", "INV-1", "INV-3"]);
});

test("keeps equal values stable and never mutates the source array", () => {
  const result = sortInvoices(invoices, "amount-highest");
  assert.deepEqual(result.map(({ id }) => id), ["INV-2", "INV-3", "INV-1"]);
  assert.deepEqual(invoices.map(({ id }) => id), ["INV-3", "INV-2", "INV-1"]);
  assert.notEqual(sortInvoices(invoices, "original"), invoices);
});

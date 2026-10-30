import test from "node:test";
import assert from "node:assert/strict";

import { daysOverdue, getInvoiceStatus, summarizeInvoices } from "../src/data.js";

const today = new Date("2026-10-30T12:00:00");
const invoices = [
  { id: "PAID", amount: 700, dueAt: "2026-10-15", paidAt: "2026-10-20", status: "paid" },
  { id: "OPEN", amount: 900, dueAt: "2026-11-15", status: "outstanding" },
  { id: "LATE", amount: 1200, dueAt: "2026-10-20", status: "outstanding" }
];

test("derives invoice status from payment state and due date", () => {
  assert.equal(getInvoiceStatus(invoices[0], today), "paid");
  assert.equal(getInvoiceStatus(invoices[1], today), "outstanding");
  assert.equal(getInvoiceStatus(invoices[2], today), "overdue");
});

test("summarizes paid, outstanding, and overdue balances", () => {
  assert.deepEqual(summarizeInvoices(invoices, today), {
    paidThisMonth: 700,
    outstanding: 2100,
    overdue: 1200,
    overdueCount: 1
  });
});

test("counts overdue age without including the due date", () => {
  assert.equal(daysOverdue(invoices[2], today), 10);
  assert.equal(daysOverdue(invoices[1], today), 0);
});


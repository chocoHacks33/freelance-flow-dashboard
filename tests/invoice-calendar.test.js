import test from "node:test";
import assert from "node:assert/strict";

import { buildInvoiceCalendar, escapeCalendarText, getCalendarInvoices } from "../src/features/invoice-calendar.js";

test("escapes calendar punctuation and line breaks", () => {
  assert.equal(escapeCalendarText("Acme, Inc.; phase 1\nFollow-up"), "Acme\\, Inc.\\; phase 1\\nFollow-up");
});

test("exports one all-day event for every valid unpaid deadline", () => {
  const invoices = [
    { id: "INV-2", client: "Acme, Inc.", amount: 900, dueAt: "2026-11-15", status: "outstanding" },
    { id: "INV-1", client: "Paid client", amount: 500, dueAt: "2026-11-10", status: "paid" },
    { id: "INV-X", client: "Broken", amount: 100, dueAt: "2026-02-31", status: "outstanding" }
  ];

  assert.equal(getCalendarInvoices(invoices).length, 1);
  const calendar = buildInvoiceCalendar(invoices, new Date("2026-11-02T01:02:03Z"));
  assert.match(calendar, /DTSTAMP:20261102T010203Z/);
  assert.match(calendar, /DTSTART;VALUE=DATE:20261115/);
  assert.match(calendar, /DTEND;VALUE=DATE:20261116/);
  assert.match(calendar, /DESCRIPTION:Acme\\, Inc\. · 900/);
  assert.equal((calendar.match(/BEGIN:VEVENT/g) ?? []).length, 1);
});

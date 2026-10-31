import test from "node:test";
import assert from "node:assert/strict";

import { filterInvoicesByQuery, invoiceMatchesQuery } from "../src/features/invoice-search.js";

const invoices = [
  { id: "INV-1042", client: "Northstar Studio" },
  { id: "INV-1041", client: "Brightline Cafe" },
  { id: "CREDIT-7", client: "Cedar & Co." }
];

test("matches invoice IDs and client names without case sensitivity", () => {
  assert.equal(invoiceMatchesQuery(invoices[0], "inv-1042"), true);
  assert.equal(invoiceMatchesQuery(invoices[1], "BRIGHTLINE"), true);
  assert.equal(invoiceMatchesQuery(invoices[2], "missing"), false);
});

test("trims queries and returns every invoice for an empty search", () => {
  assert.deepEqual(filterInvoicesByQuery(invoices, "  cedar "), [invoices[2]]);
  assert.deepEqual(filterInvoicesByQuery(invoices, "   "), invoices);
});

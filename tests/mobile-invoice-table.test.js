import test from "node:test";
import assert from "node:assert/strict";

import { buildInvoiceDisplayCells } from "../src/features/mobile-invoice-table.js";

test("builds labeled values for every invoice table column", () => {
  const cells = buildInvoiceDisplayCells(
    { id: "INV-204", client: "Apex Design", dueAt: "2026-11-30", amount: 1250 },
    (date) => `date:${date}`,
    (amount) => `money:${amount}`
  );

  assert.deepEqual(cells, [
    { label: "Invoice", value: "INV-204" },
    { label: "Client", value: "Apex Design" },
    { label: "Due", value: "date:2026-11-30" },
    { label: "Amount", value: "money:1250" }
  ]);
});

test("keeps raw client text as data rather than building markup", () => {
  const cells = buildInvoiceDisplayCells(
    { id: "INV-1", client: "<strong>Client</strong>", dueAt: "2026-11-30", amount: 1 },
    String,
    String
  );
  assert.equal(cells[1].value, "<strong>Client</strong>");
});

import test from "node:test";
import assert from "node:assert/strict";

import { createInvoice, loadStoredInvoices, saveStoredInvoices } from "../src/features/invoice-form.js";

test("normalizes a valid invoice for dashboard storage", () => {
  assert.deepEqual(
    createInvoice(
      { id: " inv-204 ", client: "  Apex Design ", dueAt: "2026-11-30", amount: "1250.456" },
      new Date("2026-10-30T12:00:00")
    ),
    {
      id: "INV-204",
      client: "Apex Design",
      issuedAt: "2026-10-30",
      dueAt: "2026-11-30",
      amount: 1250.46,
      status: "outstanding"
    }
  );
});

test("rejects invalid IDs, client names, dates, and amounts", () => {
  const valid = { id: "INV-1", client: "Apex", dueAt: "2026-11-30", amount: 10 };
  assert.throws(() => createInvoice({ ...valid, id: "?" }), /invoice ID/);
  assert.throws(() => createInvoice({ ...valid, client: " " }), /client name/);
  assert.throws(() => createInvoice({ ...valid, dueAt: "tomorrow" }), /due date/);
  assert.throws(() => createInvoice({ ...valid, amount: 0 }), /amount/);
});

test("persists valid invoices and safely recovers from corrupt storage", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  };
  const invoice = createInvoice(
    { id: "INV-10", client: "Apex", dueAt: "2026-11-30", amount: 500 },
    new Date("2026-10-30T12:00:00")
  );

  saveStoredInvoices(storage, [invoice]);
  assert.deepEqual(loadStoredInvoices(storage), [invoice]);

  storage.setItem("freelance-flow:user-invoices", "not json");
  assert.deepEqual(loadStoredInvoices(storage), []);
});


import test from "node:test";
import assert from "node:assert/strict";

import { escapeCsvValue, invoicesToCsv } from "../src/features/csv-export.js";

test("escapes commas, quotes, line breaks, and spreadsheet formulas", () => {
  assert.equal(escapeCsvValue("Cedar, Inc."), '"Cedar, Inc."');
  assert.equal(escapeCsvValue('A "quoted" client'), '"A ""quoted"" client"');
  assert.equal(escapeCsvValue("line one\nline two"), '"line one\nline two"');
  assert.equal(escapeCsvValue("=2+2"), "'=2+2");
});

test("exports stable columns with derived invoice status and decimal amounts", () => {
  const csv = invoicesToCsv(
    [
      {
        id: "INV-12",
        client: "Cedar, Inc.",
        issuedAt: "2026-09-20",
        dueAt: "2026-10-20",
        amount: 1250,
        status: "outstanding"
      }
    ],
    new Date("2026-10-30T12:00:00")
  );

  assert.equal(
    csv,
    'invoice_id,client,issued_at,due_at,paid_at,amount,status\r\nINV-12,"Cedar, Inc.",2026-09-20,2026-10-20,,1250.00,overdue'
  );
});


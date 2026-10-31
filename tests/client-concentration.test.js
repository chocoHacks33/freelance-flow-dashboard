import test from "node:test";
import assert from "node:assert/strict";

import { summarizeClientConcentration } from "../src/features/client-concentration.js";

const today = new Date("2026-10-31T12:00:00");

test("aggregates unpaid balances by client and identifies the leading share", () => {
  const result = summarizeClientConcentration(
    [
      { client: "Northstar", dueAt: "2026-11-10", amount: 600, status: "outstanding" },
      { client: "northstar", dueAt: "2026-10-20", amount: 400, status: "outstanding" },
      { client: "Cedar", dueAt: "2026-11-20", amount: 500, status: "outstanding" },
      { client: "Paid Client", dueAt: "2026-10-01", amount: 5000, status: "paid" }
    ],
    today
  );

  assert.equal(result.clientCount, 2);
  assert.equal(result.totalOutstanding, 1500);
  assert.deepEqual(result.leadingClient, { client: "Northstar", balance: 1000, invoiceCount: 2 });
  assert.equal(result.leadingShare, 67);
});

test("returns an empty insight when every invoice is paid", () => {
  assert.deepEqual(
    summarizeClientConcentration(
      [{ client: "Northstar", dueAt: "2026-10-01", amount: 600, status: "paid" }],
      today
    ),
    { clientCount: 0, totalOutstanding: 0, leadingClient: null, leadingShare: 0 }
  );
});

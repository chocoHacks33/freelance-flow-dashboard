import test from "node:test";
import assert from "node:assert/strict";

import { summarizeCollectionRate } from "../src/features/collection-rate.js";

test("summarizes collection by value and invoice count", () => {
  assert.deepEqual(
    summarizeCollectionRate([
      { amount: 1500, status: "paid" },
      { amount: 500, status: "paid" },
      { amount: 3000, status: "outstanding" }
    ]),
    {
      invoiceCount: 3,
      paidCount: 2,
      totalAmount: 5000,
      paidAmount: 2000,
      rate: 40
    }
  );
});

test("ignores non-positive and invalid invoice amounts", () => {
  assert.deepEqual(
    summarizeCollectionRate([
      { amount: 0, status: "paid" },
      { amount: -20, status: "paid" },
      { amount: Number.NaN, status: "outstanding" }
    ]),
    { invoiceCount: 0, paidCount: 0, totalAmount: 0, paidAmount: 0, rate: 0 }
  );
});

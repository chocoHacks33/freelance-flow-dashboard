import test from "node:test";
import assert from "node:assert/strict";

import { buildReminderMessage, getOverdueInvoices } from "../src/features/overdue-reminder.js";

const today = new Date("2026-11-01T12:00:00");

test("orders overdue invoices by age and excludes non-overdue work", () => {
  const overdue = getOverdueInvoices(
    [
      { id: "RECENT", client: "A", dueAt: "2026-10-30", amount: 300, status: "outstanding" },
      { id: "OLD", client: "B", dueAt: "2026-10-02", amount: 700, status: "outstanding" },
      { id: "FUTURE", client: "C", dueAt: "2026-11-10", amount: 900, status: "outstanding" },
      { id: "PAID", client: "D", dueAt: "2026-09-01", amount: 500, status: "paid" }
    ],
    today
  );

  assert.deepEqual(
    overdue.map(({ id, overdueDays }) => ({ id, overdueDays })),
    [
      { id: "OLD", overdueDays: 30 },
      { id: "RECENT", overdueDays: 2 }
    ]
  );
});

test("builds a clear reminder using the selected invoice details", () => {
  const message = buildReminderMessage(
    { id: "INV-204", client: "Cedar & Co.", dueAt: "2026-10-24", amount: 3200, status: "outstanding" },
    today
  );

  assert.match(message, /^Hi Cedar & Co\.,/);
  assert.match(message, /invoice INV-204 for \$3,200/);
  assert.match(message, /due on Oct 24, 2026/);
  assert.match(message, /8 days overdue/);
  assert.match(message, /Review|scheduled\?/);
});

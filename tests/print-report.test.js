import test from "node:test";
import assert from "node:assert/strict";

import { formatReportTimestamp } from "../src/features/print-report.js";

test("formats a stable report timestamp in the requested time zone", () => {
  assert.equal(formatReportTimestamp("2026-11-01T03:30:00Z", "UTC"), "November 1, 2026 at 3:30 AM");
  assert.equal(formatReportTimestamp("2026-11-01T03:30:00Z", "Asia/Singapore"), "November 1, 2026 at 11:30 AM");
});

test("rejects invalid report timestamps", () => {
  assert.equal(formatReportTimestamp("not-a-date", "UTC"), null);
});

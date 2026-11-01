import test from "node:test";
import assert from "node:assert/strict";

import { getNextTheme, resolveTheme } from "../src/features/theme-preference.js";

test("uses a saved supported theme before the system preference", () => {
  assert.equal(resolveTheme("light", true), "light");
  assert.equal(resolveTheme("dark", false), "dark");
});

test("falls back to the current system preference for missing or invalid values", () => {
  assert.equal(resolveTheme(null, true), "dark");
  assert.equal(resolveTheme("sepia", false), "light");
});

test("toggles predictably between the supported themes", () => {
  assert.equal(getNextTheme("light"), "dark");
  assert.equal(getNextTheme("dark"), "light");
  assert.equal(getNextTheme("unknown"), "dark");
});

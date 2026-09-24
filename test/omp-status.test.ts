import { expect, test } from "bun:test";

import { formatOmpVimGutter, insertOmpVimPendingRow } from "../src/omp-status.ts";

test("prompt gutter shows a single-letter mode cue at the band cue's width", () => {
  expect(formatOmpVimGutter("normal")).toBe("╰N ");
  expect(formatOmpVimGutter("insert")).toBe("╰I ");
  expect(formatOmpVimGutter("visual")).toBe("╰V ");
  expect(formatOmpVimGutter("visualLine")).toBe("╰L ");
  expect(formatOmpVimGutter("visualBlock")).toBe("╰B ");
});

const BAND = "status band";
const PROMPT = "\x1b[38;5;240m╰N \x1b[39mvim motions";

test("pending grammar inserts a rail row directly above the corner in the corner's colour", () => {
  expect(insertOmpVimPendingRow([BAND, PROMPT], "d")).toEqual([
    BAND,
    "\x1b[38;5;240m│\x1b[0m  d…",
    PROMPT,
  ]);
});

test("no pending grammar or no corner gutter leaves the frame untouched", () => {
  expect(insertOmpVimPendingRow([BAND, PROMPT], undefined)).toEqual([BAND, PROMPT]);
  expect(insertOmpVimPendingRow([BAND, PROMPT], "")).toEqual([BAND, PROMPT]);
  const boxed = ["╭─ status ─╮", "│ text     │"];
  expect(insertOmpVimPendingRow(boxed, "d")).toEqual(boxed);
});

import type { VimMode } from "./types.ts";

/** Single-cell mode cue drawn in the prompt corner: `╰N `, `╰I `, … */
const MODE_CUE: Record<VimMode, string> = {
  insert: "I",
  normal: "N",
  visual: "V",
  visualLine: "L",
  visualBlock: "B",
};

/** Prompt gutter replacing the band composer's `╰─ `; same 3-cell width so text never shifts. */
export function formatOmpVimGutter(mode: VimMode): string {
  return `╰${MODE_CUE[mode]} `;
}

const CORNER_ROW = /^((?:\x1b\[[0-9;]*m)*)╰/;
const SGR_RESET = "\x1b[0m";

/**
 * While Vim grammar is pending (`d`, `2c`, `:s/x`…), insert a `│ d…` row between the
 * status band and the `╰N ` prompt row, reusing the corner's colour so the rail joins it.
 * Only fires when the corner gutter is actually drawn; other composer shapes are untouched.
 */
export function insertOmpVimPendingRow(lines: string[], pending: string | undefined): string[] {
  if (!pending) return lines;
  const row = lines.findIndex((line) => CORNER_ROW.test(line));
  if (row === -1) return lines;
  const color = CORNER_ROW.exec(lines[row]!)![1];
  const pendingRow = `${color}│${SGR_RESET}  ${pending}…`;
  return [...lines.slice(0, row), pendingRow, ...lines.slice(row)];
}

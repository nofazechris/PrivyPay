/** `0x1234abcd…ef0` → `0x12…ef0`, matching the design's address style. Full value is kept for copy. */
export function shortAddress(a: string): string {
  return a.length > 10 ? `${a.slice(0, 4)}…${a.slice(-3)}` : a;
}

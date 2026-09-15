/** `0x1234abcd…ef0` → `0x12…ef0`, matching the design's address style. Full value is kept for copy. */
export function shortAddress(a: string): string {
  return a.length > 10 ? `${a.slice(0, 4)}…${a.slice(-3)}` : a;
}

/**
 * Colour for a payment status label — green when settled, amber while in flight, red when it
 * failed, neutral otherwise. Accepts both the display labels (Completed/Pending/Failed) and the
 * raw engine statuses (CONFIRMED/BROADCASTING/…), case-insensitively.
 */
export function statusColor(label: string): string {
  const s = (label || '').toLowerCase();
  if (s === 'completed' || s === 'confirmed') return '#167A54'; // green
  if (s === 'pending' || s === 'broadcasting' || s === 'processing' || s === 'authorized') return '#B7791F'; // amber
  if (s === 'failed' || s === 'rejected' || s === 'cancelled' || s === 'expired') return '#B42318'; // red
  return '#5F6878'; // neutral / unknown
}

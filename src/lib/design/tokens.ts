/**
 * Design tokens (§94–97).
 *
 * The single source of truth for PrivyPay's visual language: premium AI-native fintech, not a
 * generic crypto dashboard. Values match what the imported design already renders, so
 * hand-built components (auth, real payment preview, dashboard data states) are visually
 * identical to the generated screens. The same values are mirrored as CSS variables in
 * `globals.css` for styling that lives in CSS.
 *
 * Palette is restrained and deliberate — cobalt / navy / off-white / blue-gray, with a single
 * restrained green and red. No AI purple, no neon, no gradients-as-decoration (§94, §137).
 */

export const color = {
  // Primary — cobalt blue
  primary: '#1B45D7',
  primaryHover: '#153AB4',
  primarySoft: '#EDF1FE',
  primarySoftBorder: '#DDE3F6',

  // Ink — deep navy
  ink: '#0E1420',

  // Surfaces — warm off-white
  background: '#F6F7F9',
  surface: '#FFFFFF',
  surfaceMuted: '#FBFBFD',

  // Cool blue-gray text
  muted: '#5B6472',
  mutedStrong: '#5F6878',
  faint: '#6C7484',

  // Borders
  border: '#E4E7EC',
  borderStrong: '#DCE0E7',
  borderFaint: '#EDEFF3',

  // Restrained status colors
  success: '#167A54',
  successSoft: '#E8F3ED',
  warning: '#8A6A1E',
  warningDot: '#D8A93A',
  danger: '#C0362A',
  dangerSoft: '#F6E9E7',
} as const;

export const radius = {
  // §96 — cards 12–16, controls 10–12; nothing becomes a pill.
  card: '14px',
  control: '11px',
  pill: '999px',
} as const;

export const shadow = {
  // Restrained, high-offset, low-opacity — depth without heaviness.
  card: '0 30px 60px -38px rgba(14,20,32,.34)',
  soft: '0 24px 48px -34px rgba(14,20,32,.30)',
} as const;

export const font = {
  sans: "var(--font-geist), system-ui, sans-serif",
  mono: "var(--font-geist-mono), ui-monospace, monospace",
} as const;

export const focusRing = '0 0 0 3px rgba(27,69,215,.10)';

export const tokens = { color, radius, shadow, font, focusRing } as const;
export type Tokens = typeof tokens;

import { color } from '@/lib/design/tokens';

export interface SpinnerProps {
  size?: number;
  /** Ring color; defaults to cobalt. */
  tone?: string;
  label?: string;
}

/**
 * Loading spinner reusing the design's `pp-spin` keyframe (defined in the generated
 * design.css). Carries an accessible label for screen readers (§99).
 */
export function Spinner({ size = 18, tone = color.primary, label = 'Loading' }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} style={{ display: 'inline-flex', width: size, height: size }}>
      <span
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: '2px solid ' + color.borderFaint,
          borderTopColor: tone,
          animation: 'pp-spin .8s linear infinite',
        }}
      />
    </span>
  );
}

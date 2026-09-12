import type { Icon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { color, radius } from '@/lib/design/tokens';
import { Text } from './Text';

export interface EmptyStateProps {
  icon?: Icon;
  title: string;
  description?: string;
  /** Optional action (e.g. a Button) shown beneath the copy. */
  action?: ReactNode;
}

/**
 * Empty / zero state (§101 — every major surface has loading, empty, error and populated
 * states, never a blank page). Restrained: a muted icon, a title, a line of guidance.
 */
export function EmptyState({ icon: IconCmp, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '12px',
        padding: '40px 24px',
        border: `1px solid ${color.borderFaint}`,
        borderRadius: radius.card,
        background: color.surfaceMuted,
      }}
    >
      {IconCmp ? (
        <span
          style={{
            display: 'inline-flex',
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: color.background,
            color: color.muted,
          }}
        >
          <IconCmp size={22} weight="regular" />
        </span>
      ) : null}
      <div style={{ display: 'grid', gap: '4px' }}>
        <Text variant="card" as="p">
          {title}
        </Text>
        {description ? (
          <Text variant="caption" tone="muted">
            {description}
          </Text>
        ) : null}
      </div>
      {action}
    </div>
  );
}

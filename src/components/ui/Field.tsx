import { useId, type InputHTMLAttributes } from 'react';
import { color, radius, font } from '@/lib/design/tokens';
import { cn } from './cn';

export interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Accessible error text; also flips the border to the danger color (§99–100). */
  error?: string;
  hint?: string;
}

/**
 * Labelled text input with accessible error wiring. Focus ring comes from `.pp-input` in
 * globals.css. Errors are announced (`role="alert"`) and linked via `aria-describedby`, never
 * conveyed by color alone (§99).
 */
export function Field({ label, error, hint, id, className, style, ...rest }: FieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div style={{ display: 'grid', gap: '6px' }}>
      {label ? (
        <label htmlFor={inputId} style={{ fontSize: '13.5px', fontWeight: 500, color: color.ink }}>
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={cn('pp-input', className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        style={{
          width: '100%',
          fontFamily: font.sans,
          fontSize: '15px',
          color: color.ink,
          background: color.surface,
          border: `1px solid ${error ? color.danger : color.borderStrong}`,
          borderRadius: radius.control,
          padding: '13px 15px',
          ...style,
        }}
        {...rest}
      />
      {error ? (
        <span id={`${inputId}-error`} role="alert" style={{ fontSize: '12.5px', color: color.danger }}>
          {error}
        </span>
      ) : hint ? (
        <span id={`${inputId}-hint`} style={{ fontSize: '12.5px', color: color.muted }}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}

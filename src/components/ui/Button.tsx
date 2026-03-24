import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'approve' | 'reject' | 'record' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  recording?: boolean;
}

export default function Button({
  variant = 'secondary',
  recording = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const classes = [
    'btn',
    variant !== 'secondary' ? `btn-${variant}` : '',
    recording ? 'recording' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

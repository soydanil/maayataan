import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  sublabel?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

export default function FormField({ label, sublabel, htmlFor, children, className = '' }: FormFieldProps) {
  return (
    <div className={`form-field ${className}`.trim()}>
      <label htmlFor={htmlFor}>
        <span className="field-label-maya">{label}</span>
        {sublabel && <span className="field-label-es">{sublabel}</span>}
      </label>
      {children}
    </div>
  );
}

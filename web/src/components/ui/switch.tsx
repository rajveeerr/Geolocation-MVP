import * as React from 'react';

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
}

export const Switch = ({ checked, onCheckedChange, id, ...props }: SwitchProps) => {
  return (
    <label
      htmlFor={id}
      className="relative inline-flex items-center cursor-pointer select-none"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="sr-only"
        aria-checked={checked}
        {...props}
      />

      <span
        className={`block w-12 h-7 rounded-full transition-colors duration-200 ${checked ? 'bg-brand-primary-600' : 'bg-neutral-200'}`}
        aria-hidden
      />

      <span
        aria-hidden
        className={`pointer-events-none absolute left-0 top-0 mt-0.5 ml-0.5 inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </label>
  );
};

export default Switch;

import React from "react";
import { clsx } from "clsx";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, helperText, error, className, children, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-semibold text-gray-800" htmlFor={props.id}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={clsx(
            "w-full rounded-xl border bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:border-primary focus:ring-primary/40",
            error ? "border-red-400" : "border-gray-200",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {(helperText || error) && (
          <p className={clsx("text-sm", error ? "text-red-600" : "text-gray-500")}>{error ?? helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;

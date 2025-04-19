/**
 * Input Component
 *
 * A simple input component with some default styles applied.
 */
import React, { useState, useEffect, ChangeEvent } from 'react';
import { cn } from '@/lib/utils';
import {dateFormatCheck} from "@/lib/utils.ts";

/**
 * Props for the DateInput component.
 *
 * @extends React.InputHTMLAttributes<HTMLInputElement>
 */
interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Date format string (e.g., 'MM-DD', 'YYYY-MM-DD') for validation.
   */
  format?: string;
  /**
   * Custom validation function that takes the input value as a string.
   *
   * @param value Input value as a string.
   * @returns Whether the input value is valid.
   */
  isValid?: (value: string) => boolean;
  /**
   * Callback function to notify parent of validity change.
   *
   * @param isValid Whether the input value is valid.
   */
  onValidityChange?: (isValid: boolean) => void;
}

/**
 * DateInput: Input component with validation for date formats or custom logic.
 */
const DateInput = ({ className, type = 'text', format, isValid, onValidityChange, value = '', ...props }: DateInputProps) => {
  // State to track if the input value is valid.
  const [valid, setValid] = useState(true);

  useEffect(() => {
    let validNow = true;
    // If value exists, perform validation.
    if (value) {
      if (isValid) {
        // Use custom validation function if provided.
        validNow = isValid(value.toString());
      } else if (format) {
        // Otherwise, validate using format regex if format is provided.
        validNow = dateFormatCheck(format).test(value.toString());
      }
    }
    setValid(validNow);
    // Notify parent of validity change if callback provided.
    if (onValidityChange) onValidityChange(validNow);
  }, [value, format, isValid, onValidityChange]);

  // Handle input change and propagate to parent handler.
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (props.onChange) props.onChange(e);
  };

  return (
    // Render input with dynamic classes for styling and validation feedback.
    <input
      type={type}
      className={cn(
        'input',
        'flex h-10 w-full rounded-md border border-input',
        'bg-background px-3 py-2',
        'text-sm ring-offset-background',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
        'text-neutral-grey-medium placeholder:text-neutral-grey-medium',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-blue',
        'disabled:cursor-not-allowed disabled:opacity-50',
        !valid && 'border-red-500', // Red border if not valid.
        className
      )}
      value={value}
      onChange={handleChange}
      {...props}
    />
  );
};

DateInput.displayName = 'DateInput';

export { DateInput };

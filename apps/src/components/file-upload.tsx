/**
 * FileUpload component
 *
 * Wraps native HTML file input with error state management.
 * Uses HTML5 Constraint Validation API for error handling.
 */

import { useRef, useState, type ChangeEvent, type InputHTMLAttributes } from 'react';

export interface FileUploadProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  /**
   * Callback when file selection changes
   */
  onChange?: (file: File | null) => void;
  /**
   * Custom error message to display
   */
  error?: string;
  /**
   * Class name for the input element
   */
  className?: string;
  /**
   * Class name for the input when in error state
   */
  errorClassName?: string;
  /**
   * Class name for the error message container
   */
  errorMessageClassName?: string;
}

/**
 * File upload component with native HTML input and error state support.
 *
 * Features:
 * - Uses native `<input type="file">` element
 * - HTML5 Constraint Validation API for error states
 * - Flexible styling via className props
 * - Accessible error messages linked via aria-describedby
 *
 * @example
 * ```typescript
 * const [error, setError] = useState<string>();
 *
 * const handleFileChange = async (file: File | null) => {
 *   if (!file) {
 *     setError(undefined);
 *     return;
 *   }
 *
 *   try {
 *     const inspection = await introspectFile(file);
 *     if (!inspection.isZip) {
 *       setError('File must be a ZIP archive');
 *     } else {
 *       setError(undefined);
 *     }
 *   } catch (err) {
 *     setError('Failed to read file');
 *   }
 * };
 *
 * <FileUpload
 *   accept="application/zip"
 *   onChange={handleFileChange}
 *   error={error}
 * />
 * ```
 */
export const FileUpload = ({
  onChange,
  error,
  className = '',
  errorClassName = '',
  errorMessageClassName = '',
  id,
  ...props
}: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputId] = useState(() => id || `file-upload-${Math.random().toString(36).slice(2)}`);
  const errorId = `${inputId}-error`;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    if (onChange) {
      onChange(file);
    }
  };

  // Update custom validity when error changes
  if (inputRef.current) {
    inputRef.current.setCustomValidity(error || '');
  }

  const hasError = Boolean(error);
  const inputClassName = hasError
    ? `${className} ${errorClassName}`.trim()
    : className;

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        id={inputId}
        className={inputClassName}
        onChange={handleChange}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        {...props}
      />
      {hasError && (
        <div
          id={errorId}
          role="alert"
          className={errorMessageClassName}
        >
          {error}
        </div>
      )}
    </div>
  );
};

/**
 * Tests for FileUpload component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileUpload } from './file-upload';

describe('FileUpload', () => {
  it('renders a file input', () => {
    render(<FileUpload />);

    const input = screen.getByRole('button', { name: /choose file|browse|select/i });
    expect(input).toBeInTheDocument();
  });

  it('applies accept attribute', () => {
    render(<FileUpload accept="application/zip" />);

    const input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('accept', 'application/zip');
  });

  it('calls onChange when file is selected', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const file = new File(['content'], 'test.zip', { type: 'application/zip' });

    render(<FileUpload onChange={handleChange} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, file);

    expect(handleChange).toHaveBeenCalledWith(file);
  });

  it('calls onChange with null when selection is cleared', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<FileUpload onChange={handleChange} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    // Simulate clearing the selection
    await user.click(input);
    // In real browser, user can cancel the file picker
    // Simulate by triggering change with no files
    Object.defineProperty(input, 'files', {
      value: null,
      writable: true,
    });
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handleChange).toHaveBeenCalledWith(null);
  });

  it('displays error message when error prop is set', () => {
    const errorMessage = 'File must be a ZIP archive';

    render(<FileUpload error={errorMessage} />);

    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent(errorMessage);
  });

  it('sets aria-invalid when error is present', () => {
    render(<FileUpload error="Invalid file" />);

    const input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('links error message with aria-describedby', () => {
    render(<FileUpload id="test-upload" error="Invalid file" />);

    const input = document.querySelector('input[type="file"]');
    const errorId = input?.getAttribute('aria-describedby');

    expect(errorId).toBe('test-upload-error');

    const error = document.getElementById(errorId!);
    expect(error).toHaveTextContent('Invalid file');
  });

  it('applies error className when error is present', () => {
    render(
      <FileUpload
        className="base-class"
        errorClassName="error-class"
        error="Invalid file"
      />,
    );

    const input = document.querySelector('input[type="file"]');
    expect(input).toHaveClass('base-class', 'error-class');
  });

  it('does not apply error className when no error', () => {
    render(
      <FileUpload
        className="base-class"
        errorClassName="error-class"
      />,
    );

    const input = document.querySelector('input[type="file"]');
    expect(input).toHaveClass('base-class');
    expect(input).not.toHaveClass('error-class');
  });

  it('applies custom error message className', () => {
    render(
      <FileUpload
        error="Invalid file"
        errorMessageClassName="custom-error-message"
      />,
    );

    const error = screen.getByRole('alert');
    expect(error).toHaveClass('custom-error-message');
  });

  it('generates unique id when not provided', () => {
    const { container } = render(<FileUpload />);

    const input = container.querySelector('input[type="file"]');
    expect(input?.id).toMatch(/^file-upload-/);
  });

  it('uses provided id', () => {
    render(<FileUpload id="custom-id" />);

    const input = document.querySelector('input[type="file"]');
    expect(input?.id).toBe('custom-id');
  });
});

/**
 * Ladle stories for FileUpload component
 */

import { useState } from 'react';
import type { Story } from '@ladle/react';
import { FileUpload } from './file-upload';
import { introspectFile } from '../lib/shapefile/file-introspection';

export const Basic: Story = () => {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Basic File Upload</h2>
      <FileUpload
        accept="application/zip"
        onChange={setFile}
      />
      {file && (
        <div style={{ marginTop: '1rem' }}>
          <strong>Selected:</strong> {file.name} ({file.size} bytes)
        </div>
      )}
    </div>
  );
};

export const WithValidation: Story = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>();

  const handleFileChange = async (selectedFile: File | null) => {
    setFile(selectedFile);

    if (!selectedFile) {
      setError(undefined);
      return;
    }

    try {
      const inspection = await introspectFile(selectedFile);

      if (inspection.isEmpty) {
        setError('File is empty');
      } else if (!inspection.isZip) {
        setError('File must be a ZIP archive');
      } else {
        setError(undefined);
      }
    } catch (err) {
      setError('Failed to read file');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>File Upload with Validation</h2>
      <p>Select a file to validate it's a non-empty ZIP archive.</p>
      <FileUpload
        accept="application/zip"
        onChange={handleFileChange}
        error={error}
      />
      {file && !error && (
        <div style={{ marginTop: '1rem', color: 'green' }}>
          ✓ Valid ZIP file: {file.name}
        </div>
      )}
    </div>
  );
};

export const WithCustomStyling: Story = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>();

  const handleFileChange = async (selectedFile: File | null) => {
    setFile(selectedFile);

    if (!selectedFile) {
      setError(undefined);
      return;
    }

    // Simulate validation
    if (!selectedFile.name.toLowerCase().endsWith('.zip')) {
      setError('Please select a ZIP file');
    } else {
      setError(undefined);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Custom Styled File Upload</h2>
      <style>{`
        .custom-input {
          padding: 0.5rem;
          border: 2px solid #ccc;
          border-radius: 4px;
          cursor: pointer;
        }
        .custom-input:hover {
          border-color: #999;
        }
        .custom-input-error {
          border-color: #dc2626;
          background-color: #fef2f2;
        }
        .custom-error-message {
          color: #dc2626;
          margin-top: 0.5rem;
          font-size: 0.875rem;
        }
      `}</style>
      <FileUpload
        accept="application/zip"
        onChange={handleFileChange}
        error={error}
        className="custom-input"
        errorClassName="custom-input-error"
        errorMessageClassName="custom-error-message"
      />
      {file && !error && (
        <div style={{ marginTop: '1rem', color: '#059669' }}>
          Selected: {file.name}
        </div>
      )}
    </div>
  );
};

export const MultipleStates: Story = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>File Upload States</h2>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Default State</h3>
        <FileUpload accept="application/zip" />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Error State</h3>
        <FileUpload
          accept="application/zip"
          error="File must be a ZIP archive"
        />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Disabled State</h3>
        <FileUpload
          accept="application/zip"
          disabled
        />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>With Custom Styling</h3>
        <style>{`
          .styled-input {
            padding: 0.75rem;
            border: 2px dashed #3b82f6;
            border-radius: 8px;
            background: #eff6ff;
          }
          .styled-input-error {
            border-color: #dc2626;
            border-style: solid;
            background: #fef2f2;
          }
          .styled-error {
            color: #dc2626;
            margin-top: 0.5rem;
            padding: 0.5rem;
            background: #fee2e2;
            border-radius: 4px;
          }
        `}</style>
        <FileUpload
          accept="application/zip"
          error="Invalid file type"
          className="styled-input"
          errorClassName="styled-input-error"
          errorMessageClassName="styled-error"
        />
      </div>
    </div>
  );
};

/**
 * File Upload
 *
 * Drag & drop file upload with validation
 * Optional - never blocks progress
 */

import React, { useRef, useState } from 'react';
import { clsx } from 'clsx';
import { RiUploadCloudLine, RiCloseCircleLine, RiAttachmentLine, RiCloseLine } from 'react-icons/ri';

export interface FileUploadProps {
  value?: File[];
  onChange: (files: File[]) => void;
  accept?: string; // e.g., ".pdf,.doc,.docx,.jpg,.png"
  maxSize?: number; // in bytes
  maxFiles?: number;
  helperText?: string;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  value = [],
  onChange,
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png",
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 5,
  helperText,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(0)}MB`;
    }

    // Check file type
    if (accept) {
      const acceptedTypes = accept.split(',').map((t) => t.trim());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

      if (!acceptedTypes.some((type) => fileExtension === type.toLowerCase())) {
        return `File type not accepted. Allowed: ${accept}`;
      }
    }

    return null;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || disabled) return;

    setError(null);

    const newFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validationError = validateFile(file);

      if (validationError) {
        setError(validationError);
        return;
      }

      newFiles.push(file);
    }

    // Check max files
    const totalFiles = value.length + newFiles.length;
    if (totalFiles > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    onChange([...value, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (index: number) => {
    const newFiles = [...value];
    newFiles.splice(index, 1);
    onChange(newFiles);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={clsx(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200',
          isDragging
            ? 'border-primary bg-primary-subtle'
            : 'border-gray-300 hover:border-primary hover:bg-gray-50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary-subtle flex items-center justify-center">
            <RiUploadCloudLine className="w-6 h-6 text-[#7C3AED]" />
          </div>

          <div>
            <p className="text-base font-medium text-charcoal mb-1">
              {isDragging ? 'Drop files here' : 'Upload files'}
            </p>
            <p className="text-sm text-gray-600">
              Drag & drop or click to browse
            </p>
          </div>

          <p className="text-xs text-gray-500">
            Accepted: {accept.replace(/\./g, '').toUpperCase()} • Max size: {(maxSize / 1024 / 1024).toFixed(0)}MB
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <RiCloseCircleLine className="w-5 h-5 text-[#7C3AED] shrink-0 mt-0.5" />
          <p className="text-sm text-red-900">{error}</p>
        </div>
      )}

      {helperText && !error && (
        <p className="text-sm text-gray-600">{helperText}</p>
      )}

      {value.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-charcoal">Uploaded files:</p>
          {value.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <RiAttachmentLine className="w-5 h-5 text-[#7C3AED] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(index);
                }}
                className="ml-2 p-1 text-gray-400 hover:text-error transition-colors"
              >
                <RiCloseLine className="w-5 h-5 text-[#7C3AED]" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

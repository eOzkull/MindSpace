import React, { useCallback } from 'react';
import type { Accept, FileRejection } from 'react-dropzone';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import {
  CloudUpload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileSpreadsheet
} from 'lucide-react';

export interface FileDropzoneProps {
  onFileDrop: (file: File) => void;
  accept?: Accept;
  maxFiles?: number;
  disabled?: boolean;
  isLoading?: boolean;
  selectedFile?: File | null;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  icon?: React.ElementType;
  compact?: boolean;
  onReject?: (rejections: FileRejection[]) => void;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileDrop,
  accept = {
    'text/csv': ['.csv'],
    'application/vnd.ms-excel': ['.csv'],
  },
  maxFiles = 1,
  disabled = false,
  isLoading = false,
  selectedFile = null,
  title = 'Drag and drop your CSV',
  subtitle = 'or click to browse from your computer',
  buttonText = 'Analyze Data',
  icon: IconComponent,
  compact = false,
  onReject,
}) => {
  const handleDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0 && onReject) {
        onReject(fileRejections);
      }

      if (acceptedFiles.length > 0) {
        onFileDrop(acceptedFiles[0]);
      }
    },
    [onFileDrop, onReject]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop: handleDrop,
    accept,
    maxFiles,
    multiple: false,
    disabled: disabled || isLoading,
  });

  const getContainerClass = () => {
    const classes = ['upload-zone'];
    if (compact) classes.push('upload-zone-compact');
    if (isDragReject) classes.push('drag-reject');
    else if (isDragAccept || isDragActive) classes.push('drag-active');
    if (isLoading) classes.push('is-loading');
    if (disabled) classes.push('is-disabled');
    return classes.join(' ');
  };

  const IconToRender = IconComponent || CloudUpload;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{ width: '100%' }}
    >
      <div
        {...getRootProps()}
        className={getContainerClass()}
        style={{
          cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        }}
      >
        <input {...getInputProps()} id="file-upload" data-testid="dropzone-input" />
        <div className={compact ? 'upload-zone-content-compact' : 'upload-zone-content'}>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <Loader2
                size={compact ? 36 : 48}
                className="animate-spin"
                style={{ color: 'var(--brand-primary)' }}
              />
              <p style={{ color: 'var(--text-secondary)', fontWeight: 500, margin: 0 }}>
                Processing…
              </p>
            </div>
          ) : isDragReject ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={compact ? 36 : 52} style={{ color: 'var(--danger)', marginBottom: '0.25rem' }} />
              <h4 style={{ color: 'var(--danger)', margin: 0, fontSize: compact ? '1rem' : '1.15rem' }}>CSV files only</h4>
              <p className="text-secondary" style={{ fontSize: '0.875rem', margin: 0 }}>
                Please drop a single valid <strong>.csv</strong> file.
              </p>
            </div>
          ) : isDragActive ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <IconToRender size={compact ? 36 : 52} style={{ color: 'var(--brand-primary)', marginBottom: '0.25rem' }} />
              <h4 style={{ color: 'var(--brand-primary)', margin: 0, fontSize: compact ? '1rem' : '1.15rem' }}>Release to upload</h4>
              <p className="text-secondary" style={{ fontSize: '0.875rem', margin: 0 }}>
                Drop your CSV file to begin analysis immediately
              </p>
            </div>
          ) : (
            <>
              <IconToRender
                className="upload-icon"
                size={compact ? 36 : 52}
                style={{
                  color: compact ? 'var(--brand-secondary)' : 'var(--brand-primary)',
                }}
              />
              <h3 style={{ marginBottom: '6px', fontSize: compact ? '1.05rem' : '1.25rem', fontWeight: 600 }}>{title}</h3>
              <p className="text-secondary" style={{ fontSize: compact ? '0.85rem' : '0.925rem', margin: compact ? '0 0 0.75rem 0' : '0 0 1.25rem 0' }}>{subtitle}</p>

              {buttonText && !compact && (
                <div
                  role="button"
                  tabIndex={0}
                  className="btn btn-primary"
                  style={{
                    borderRadius: '9999px',
                    padding: '10px 24px',
                    margin: '0 auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={16} /> {buttonText}
                </div>
              )}

              {selectedFile && (
                <div
                  style={{
                    marginTop: compact ? '0.75rem' : '1.25rem',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--success)',
                    fontWeight: 500,
                    fontSize: '0.85rem',
                  }}
                >
                  <FileSpreadsheet size={16} />
                  <CheckCircle2 size={16} />
                  <span>{selectedFile.name}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FileDropzone;


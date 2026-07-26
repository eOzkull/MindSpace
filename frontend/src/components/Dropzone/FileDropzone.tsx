import React, { useCallback } from 'react';
import { useDropzone, type Accept, type FileRejection } from 'react-dropzone';
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
    <div
      {...getRootProps()}
      className={getContainerClass()}
      style={{
        padding: compact ? '2.5rem 1.5rem' : 0,
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
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
              Uploading & Processing Dataset...
            </p>
          </div>
        ) : isDragReject ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={compact ? 36 : 54} style={{ color: 'var(--danger)', marginBottom: '0.5rem' }} />
            <h4 style={{ color: 'var(--danger)', margin: 0 }}>Invalid File Format</h4>
            <p className="text-secondary" style={{ fontSize: '0.9rem', margin: 0 }}>
              Please drop a single <strong>.csv</strong> file.
            </p>
          </div>
        ) : isDragActive ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <IconToRender size={compact ? 36 : 54} style={{ color: 'var(--brand-primary)', marginBottom: '0.5rem' }} />
            <h4 style={{ color: 'var(--brand-primary)', margin: 0 }}>Drop your CSV file here</h4>
            <p className="text-secondary" style={{ fontSize: '0.9rem', margin: 0 }}>
              Release to start processing immediately
            </p>
          </div>
        ) : (
          <>
            <IconToRender
              className="upload-icon"
              size={compact ? 44 : 64}
              style={{ color: compact ? 'var(--brand-secondary)' : 'var(--brand-primary)', marginBottom: compact ? '0.75rem' : '1.5rem' }}
            />
            <h3 style={{ marginBottom: '8px', fontSize: compact ? '1.15rem' : '1.35rem' }}>{title}</h3>
            <p className="text-secondary" style={{ marginBottom: compact ? '1rem' : '1.5rem' }}>{subtitle}</p>

            {buttonText && !compact && (
              <span className="btn btn-primary" style={{ margin: '0 auto' }}>
                <Sparkles size={16} /> {buttonText}
              </span>
            )}

            {selectedFile && (
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--card-border)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--success)',
                  fontWeight: 500,
                  fontSize: '0.9rem',
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
  );
};

export default FileDropzone;

import React, { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { toast } from "sonner";
// import { Button } from './ui/button';

interface FileItem {
  file: File;
  id: string;
}

interface FileDropZoneProps {
  files: FileItem[];
  onFilesChange: (files: FileItem[]) => void;
  onFileValidation?: (file: File) => boolean;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  files,
  onFilesChange,
  // onFileValidation is kept for API compatibility but marked as unused
}) => {
  const [error, setError] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    setError('');

    // Handle rejected files
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        toast.error('File too large', {
          description: "Maximum size is 4.5MB",
          duration: 4000,
        });
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file type. Please upload PDF, DOC, IMG, or ZIP files.');
      }
      return;
    }

    // Add new files
    const newFiles: FileItem[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9)
    }));

    onFilesChange([...files, ...newFiles]);
  }, [files, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar']
    },
    maxSize: 4.5 * 1024 * 1024, // 4.5MB
    multiple: true
  });

  const removeFile = (fileId: string) => {
    onFilesChange(files.filter(f => f.id !== fileId));
  };

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        📎 Attach Files
        <span className="text-xs text-muted-foreground">
          (Max 4.5MB each)
        </span>
      </label>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`drop-zone rounded-lg p-3 min-h-[100px] flex flex-col items-center justify-center transition-all ${
          isDragActive ? 'drag-over' : ''
        }`}
      >
        <input {...getInputProps()} />

        {files.length > 0 ? (
          <div className="w-full space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Upload className="h-4 w-4" />
              <span>Drop files or click to upload</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 p-2 rounded-md glass text-xs"
                >
                  <File className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate flex-1">{file.file.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full glass">
              <Upload className="h-8 w-8 text-gradient-start" />
            </div>
            <div>
              <p className="text-lg font-medium text-glass-highlight">
                {isDragActive ? 'Drop files here...' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                PDF, DOC, IMG, ZIP (MAX 4.5MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive">{error}</span>
        </div>
      )}
    </div>
  );
};
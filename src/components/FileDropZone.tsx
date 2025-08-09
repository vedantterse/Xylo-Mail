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
  onFileValidation: (file: File) => boolean;
  maxTotalSize?: number; // New prop
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  files,
  onFilesChange,
  onFileValidation,
  maxTotalSize = 4.5 * 1024 * 1024 // 4.5MB default
}) => {
  const [error, setError] = useState<string>('');

  const calculateTotalSize = (currentFiles: FileItem[], newFiles?: File[]): number => {
    const existingSize = currentFiles.reduce((sum, item) => sum + item.file.size, 0);
    const newSize = newFiles?.reduce((sum, file) => sum + file.size, 0) || 0;
    return existingSize + newSize;
  };

  const isDuplicateFile = useCallback((newFile: File) => {
    return files.some(existingFile => 
      existingFile.file.name === newFile.name && 
      existingFile.file.size === newFile.size
    );
  }, [files]);

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
        setError('Invalid file type. Please upload PDF, DOC, IMG, TXT, or ZIP files.');
      }
      return;
    }

    const newFiles = [...files];
    let hasRejections = false;

    // Process each file individually
    acceptedFiles.forEach(file => {
      // First check individual file size
      if (file.size > maxTotalSize) {
        toast.error(`File "${file.name}" exceeds 4.5MB limit`, {
          description: "Individual file size cannot exceed 4.5MB",
          duration: 3000,
        });
        hasRejections = true;
        return; // Skip this file
      }

      // Check for duplicates
      if (isDuplicateFile(file)) {
        toast.warning(`File "${file.name}" already added`, {
          description: "Duplicate files are not allowed",
          duration: 3000,
        });
        hasRejections = true;
        return; // Skip this file
      }

      // Calculate total size including this file
      const potentialTotalSize = newFiles.reduce((sum, item) => sum + item.file.size, 0) + file.size;

      // Check if adding this file would exceed total limit
      if (potentialTotalSize > maxTotalSize) {
        toast.error(`Cannot add "${file.name}"`, {
          description: "Adding this file would exceed the total size limit",
          duration: 3000,
        });
        hasRejections = true;
        return; // Skip this file
      }

      // If all checks pass, add the file
      if (onFileValidation(file)) {
        newFiles.push({
          file,
          id: crypto.randomUUID()
        });
      }
    });

    // Update files state with all valid files
    if (newFiles.length > files.length) {
      onFilesChange(newFiles);
      
      // Show success message if some files were added (even if others were rejected)
      if (hasRejections) {
        toast.info('Some files were added', {
          description: 'Files that fit within limits were uploaded successfully',
          duration: 3000,
        });
      }
    } else if (hasRejections && newFiles.length === files.length) {
      // Show message if all files were rejected
      toast.error('No files were added', {
        description: 'All selected files were rejected due to size limits or duplicates',
        duration: 3000,
      });
    }
  }, [files, onFilesChange, onFileValidation, maxTotalSize, isDuplicateFile]);

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

  const totalSize = calculateTotalSize(files);
  const remainingSize = maxTotalSize - totalSize;
  const isAtLimit = remainingSize <= 0;

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
        } ${isAtLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
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

      {/* Size indicator */}
      <div className="text-xs text-white/70 flex justify-between items-center px-2">
        <span>
          Total: {(totalSize / (1024 * 1024)).toFixed(1)}MB / {(maxTotalSize / (1024 * 1024)).toFixed(1)}MB
        </span>
        {isAtLimit ? (
          <span className="text-red-400">No space remaining</span>
        ) : (
          <span>Remaining: {(remainingSize / (1024 * 1024)).toFixed(1)}MB</span>
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
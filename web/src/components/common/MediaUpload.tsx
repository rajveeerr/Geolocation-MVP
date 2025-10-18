import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  File, 
  Image as ImageIcon, 
  X, 
  Check, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { toast } from 'sonner';

interface MediaUploadProps {
  onFileUploaded?: (fileUrl: string, fileName: string) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  className?: string;
  multiple?: boolean;
}

export const MediaUpload = ({ 
  onFileUploaded, 
  acceptedTypes = ['image/*', 'application/pdf', 'text/*'],
  maxSize = 10,
  className,
  multiple = false
}: MediaUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    file: File;
    preview?: string;
    uploaded?: boolean;
    url?: string;
  }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mediaUploadMutation = useMediaUpload();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter(file => {
      // Check file type
      const isValidType = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });

      if (!isValidType) {
        toast.error(`File type not supported: ${file.name}`);
        return false;
      }

      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`File too large: ${file.name} (max ${maxSize}MB)`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    // Add files to state
    const newFiles = validFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      uploaded: false,
    }));

    if (multiple) {
      setUploadedFiles(prev => [...prev, ...newFiles]);
    } else {
      setUploadedFiles(newFiles);
    }

    // Upload files
    for (const fileData of newFiles) {
      try {
        const result = await mediaUploadMutation.mutateAsync(fileData.file);
        if (result.success) {
          setUploadedFiles(prev => prev.map(f => 
            f.file === fileData.file 
              ? { ...f, uploaded: true, url: result.fileUrl }
              : f
          ));
          onFileUploaded?.(result.fileUrl, result.fileName);
          toast.success(`File uploaded: ${result.fileName}`);
        }
      } catch (error) {
        toast.error(`Failed to upload: ${fileData.file.name}`);
        setUploadedFiles(prev => prev.filter(f => f.file !== fileData.file));
      }
    }
  };

  const removeFile = (file: File) => {
    setUploadedFiles(prev => prev.filter(f => f.file !== file));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={className}>
      <Card>
        <CardContent className="p-6">
          {uploadedFiles.length > 0 ? (
            <div className="space-y-4">
              {uploadedFiles.map((fileData, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                  {fileData.preview ? (
                    <img
                      src={fileData.preview}
                      alt={fileData.file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                      {getFileIcon(fileData.file)}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{fileData.file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(fileData.file.size)}</p>
                    {fileData.uploaded && (
                      <Badge variant="default" className="mt-1">
                        <Check className="h-3 w-3 mr-1" />
                        Uploaded
                      </Badge>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(fileData.file)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <div className="text-center">
                <Button variant="outline" onClick={openFileDialog}>
                  <Upload className="h-4 w-4 mr-2" />
                  {multiple ? 'Add More Files' : 'Change File'}
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Upload className="h-6 w-6 text-gray-400" />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Upload Files
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Drag and drop files here, or click to select
                  </p>
                </div>

                <Button onClick={openFileDialog} disabled={mediaUploadMutation.isPending}>
                  {mediaUploadMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Select Files
                    </>
                  )}
                </Button>

                <div className="text-xs text-gray-400 space-y-1">
                  <p>Accepted types: {acceptedTypes.join(', ')}</p>
                  <p>Max file size: {maxSize}MB</p>
                  {multiple && <p>Multiple files allowed</p>}
                </div>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileInput}
            multiple={multiple}
            className="hidden"
          />

          {mediaUploadMutation.isError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">
                Failed to upload file. Please try again.
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

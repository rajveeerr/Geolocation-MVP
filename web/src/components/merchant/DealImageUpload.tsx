import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Check, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useDealImageUpload } from '@/hooks/useDealImageUpload';
import { toast } from 'sonner';

interface DealImageUploadProps {
  onImageUploaded?: (imageUrl: string) => void;
  currentImageUrl?: string;
  className?: string;
}

export const DealImageUpload = ({ 
  onImageUploaded, 
  currentImageUrl, 
  className 
}: DealImageUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dealImageUploadMutation = useDealImageUpload();

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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    try {
      const result = await dealImageUploadMutation.mutateAsync(file);
      if (result.success && result.imageUrl) {
        setPreviewUrl(result.imageUrl);
        onImageUploaded?.(result.imageUrl);
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      toast.error('Failed to upload image');
      setPreviewUrl(null);
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <Card>
        <CardContent className="p-6">
          {previewUrl ? (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Deal preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
                {dealImageUploadMutation.isPending && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
                {dealImageUploadMutation.isSuccess && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="default" className="bg-green-500">
                      <Check className="h-3 w-3 mr-1" />
                      Uploaded
                    </Badge>
                  </div>
                )}
              </div>
              <div className="text-center">
                <Button variant="outline" onClick={openFileDialog}>
                  <Upload className="h-4 w-4 mr-2" />
                  Change Image
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
                  <ImageIcon className="h-6 w-6 text-gray-400" />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Upload Deal Image
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Drag and drop an image here, or click to select
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button onClick={openFileDialog} disabled={dealImageUploadMutation.isPending}>
                    {dealImageUploadMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Select Image
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-xs text-gray-400 space-y-1">
                  <p>Supported formats: JPG, PNG, GIF</p>
                  <p>Max file size: 5MB</p>
                  <p>Recommended size: 800x600px</p>
                </div>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />

          {dealImageUploadMutation.isError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">
                Failed to upload image. Please try again.
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

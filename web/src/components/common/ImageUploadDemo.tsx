import { useState } from 'react';
import { ImageUpload } from './ImageUpload';
import { Button } from './Button';

interface UploadedImage {
  id: string;
  url: string;
  publicId: string;
  name: string;
}

export const ImageUploadDemo = () => {
  const [images, setImages] = useState<UploadedImage[]>([]);

  const handleImagesChange = (newImages: UploadedImage[]) => {
    setImages(newImages);
    console.log('Images updated:', newImages);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Image Upload Demo</h2>
        <p className="text-neutral-600">
          Test the image upload component with drag & drop functionality.
        </p>
      </div>

      <ImageUpload
        images={images}
        onImagesChange={handleImagesChange}
        maxImages={5}
        maxSizeInMB={5}
        context="demo"
      />

      {images.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Uploaded Images ({images.length})</h3>
          <div className="grid grid-cols-2 gap-4">
            {images.map((image) => (
              <div key={image.id} className="border rounded-lg p-4">
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <p className="text-sm font-medium">{image.name}</p>
                <p className="text-xs text-neutral-500">ID: {image.id}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <Button onClick={() => setImages([])} variant="secondary">
          Clear All Images
        </Button>
        <Button onClick={() => console.log('Current images:', images)}>
          Log Images to Console
        </Button>
      </div>
    </div>
  );
};

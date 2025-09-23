import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import multer from 'multer';
import { Readable } from 'stream';

// Configure Cloudinary with credentials from environment variables
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Configure multer to handle file uploads in memory.
// This prevents saving files to the server's disk.
const storage = multer.memoryStorage();
export const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

/**
 * Upload an in‑memory image buffer to Cloudinary.
 *
 * If you supply a publicId we will attempt to overwrite the existing asset (idempotent updates).
 * If you omit it, Cloudinary auto-generates one.
 *
 * @param buffer   Raw image buffer (e.g. from multer memory storage)
 * @param options  Optional overrides
 */
export const uploadToCloudinary = (
  buffer: Buffer,
  options?: { publicId?: string; folder?: string }
): Promise<UploadApiResponse> => {
  const { publicId, folder = 'deals' } = options || {};

  return new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadOptions: Record<string, any> = {
      folder,
      // Only set overwrite if caller provided a deterministic publicId
      overwrite: !!publicId,
      transformation: [
        { width: 1024, height: 1024, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    };
    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Cloudinary upload failed without a result.'));
        resolve(result);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};
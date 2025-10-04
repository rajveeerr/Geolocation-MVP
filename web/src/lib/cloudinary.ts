/**
 * Cloudinary utility functions for image optimization and transformation
 */

export interface CloudinaryUrl {
  url: string;
  publicId: string;
}

/**
 * Cloudinary URL transformation options
 */
export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | 'best' | 'good' | 'eco' | 'low' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png' | 'gif';
  crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb' | 'pad';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
  radius?: number | 'max';
  effect?: string;
}

/**
 * Validates if a URL is a Cloudinary URL
 */
export const isCloudinaryUrl = (url: string): boolean => {
  return url.includes('res.cloudinary.com') || url.includes('cloudinary.com');
};

/**
 * Extracts public ID from a Cloudinary URL
 */
export const extractPublicId = (url: string): string | null => {
  if (!isCloudinaryUrl(url)) return null;
  
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  return match ? match[1] : null;
};

/**
 * Transforms a Cloudinary URL with the specified options
 */
export const transformCloudinaryUrl = (
  url: string, 
  options: CloudinaryTransformOptions = {}
): string => {
  if (!isCloudinaryUrl(url)) return url;

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
    radius,
    effect
  } = options;

  // Find the upload part in the URL
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;

  const baseUrl = url.substring(0, uploadIndex + 8); // Include '/upload/'
  const restOfUrl = url.substring(uploadIndex + 8);

  // Build transformation string
  const transformations: string[] = [];

  if (width || height) {
    const size = width && height ? `${width}x${height}` : 
                 width ? `${width}` : 
                 height ? `x${height}` : '';
    if (size) transformations.push(size);
  }

  if (crop) transformations.push(crop);
  if (gravity) transformations.push(gravity);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);
  if (radius) transformations.push(`r_${radius}`);
  if (effect) transformations.push(effect);

  const transformString = transformations.length > 0 ? transformations.join(',') + '/' : '';
  
  return `${baseUrl}${transformString}${restOfUrl}`;
};

/**
 * Gets optimized image URL for different use cases
 */
export const getOptimizedImageUrl = (url: string, useCase: 'thumbnail' | 'card' | 'detail' | 'logo'): string => {
  if (!isCloudinaryUrl(url)) return url;

  const options: CloudinaryTransformOptions = {
    quality: 'auto',
    format: 'auto'
  };

  switch (useCase) {
    case 'thumbnail':
      return transformCloudinaryUrl(url, {
        ...options,
        width: 100,
        height: 100,
        crop: 'fill',
        gravity: 'face'
      });
    
    case 'card':
      return transformCloudinaryUrl(url, {
        ...options,
        width: 300,
        height: 200,
        crop: 'fill',
        gravity: 'auto'
      });
    
    case 'detail':
      return transformCloudinaryUrl(url, {
        ...options,
        width: 800,
        height: 600,
        crop: 'fit',
        gravity: 'auto'
      });
    
    case 'logo':
      return transformCloudinaryUrl(url, {
        ...options,
        width: 200,
        height: 200,
        crop: 'fill',
        gravity: 'center',
        radius: 8
      });
    
    default:
      return url;
  }
};

/**
 * Gets responsive image URLs for different screen sizes
 */
export const getResponsiveImageUrls = (url: string): {
  small: string;
  medium: string;
  large: string;
  original: string;
} => {
  if (!isCloudinaryUrl(url)) {
    return {
      small: url,
      medium: url,
      large: url,
      original: url
    };
  }

  return {
    small: transformCloudinaryUrl(url, { width: 400, height: 300, crop: 'fill', quality: 'auto' }),
    medium: transformCloudinaryUrl(url, { width: 800, height: 600, crop: 'fill', quality: 'auto' }),
    large: transformCloudinaryUrl(url, { width: 1200, height: 900, crop: 'fill', quality: 'auto' }),
    original: url
  };
};

/**
 * Validates Cloudinary upload response
 */
export const validateCloudinaryResponse = (response: any): response is CloudinaryUrl => {
  return response && 
         typeof response.url === 'string' && 
         typeof response.publicId === 'string' &&
         isCloudinaryUrl(response.url);
};

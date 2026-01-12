import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export interface UploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

export function validateImage(file: Express.Multer.File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return { valid: false, error: 'نوع الملف غير مسموح. الأنواع المسموحة: JPG, PNG, WebP' };
  }
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'حجم الملف يتجاوز 10MB' };
  }
  return { valid: true };
}

export async function uploadToCloudinary(file: Express.Multer.File, folder: string = 'mutflex'): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
          });
        } else {
          reject(new Error('No result from Cloudinary'));
        }
      }
    );
    
    uploadStream.end(file.buffer);
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
}

export default cloudinary;

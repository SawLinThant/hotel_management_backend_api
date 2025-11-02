import { v2 as cloudinary } from 'cloudinary';
import config from '../config/index.js';
// Configure Cloudinary
cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
});
/**
 * Upload a single image file to Cloudinary
 * @param fileBuffer - Image file buffer
 * @param fileName - Original file name
 * @returns Promise with upload result containing secure_url
 */
export async function uploadImage(fileBuffer, fileName) {
    if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
        throw new Error('Cloudinary credentials not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env file');
    }
    try {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({
                folder: 'hotel-rooms',
                resource_type: 'image',
                allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            }, (error, result) => {
                if (error) {
                    reject(new Error(`Cloudinary upload failed: ${error.message}`));
                    return;
                }
                if (!result) {
                    reject(new Error('Cloudinary upload returned no result'));
                    return;
                }
                resolve({
                    secure_url: result.secure_url,
                    public_id: result.public_id,
                    width: result.width || 0,
                    height: result.height || 0,
                    bytes: result.bytes || 0,
                });
            });
            uploadStream.end(fileBuffer);
        });
    }
    catch (error) {
        throw new Error(`Failed to upload image: ${error.message}`);
    }
}
/**
 * Upload multiple images to Cloudinary
 * @param files - Array of file objects with buffer and originalname
 * @returns Promise with array of secure URLs
 */
export async function uploadImages(files) {
    const uploadPromises = files.map((file) => uploadImage(file.buffer, file.originalname));
    const results = await Promise.all(uploadPromises);
    return results.map((result) => result.secure_url);
}
/**
 * Delete an image from Cloudinary by URL
 * @param imageUrl - Cloudinary image URL
 */
export async function deleteImage(imageUrl) {
    if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
        throw new Error('Cloudinary credentials not configured');
    }
    try {
        // Extract public_id from URL
        // Cloudinary URLs format: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}.{ext}
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        if (!fileName) {
            throw new Error('Invalid image URL: could not extract filename');
        }
        const publicId = fileName.split('.')[0]; // Remove extension
        if (!publicId) {
            throw new Error('Invalid image URL: could not extract public ID');
        }
        // Handle folder structure
        if (imageUrl.includes('/hotel-rooms/')) {
            const fullPublicId = `hotel-rooms/${publicId}`;
            await cloudinary.uploader.destroy(fullPublicId);
        }
        else {
            await cloudinary.uploader.destroy(publicId);
        }
    }
    catch (error) {
        throw new Error(`Failed to delete image: ${error.message}`);
    }
}
//# sourceMappingURL=cloudinary.js.map
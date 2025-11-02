export interface UploadResult {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
    bytes: number;
}
/**
 * Upload a single image file to Cloudinary
 * @param fileBuffer - Image file buffer
 * @param fileName - Original file name
 * @returns Promise with upload result containing secure_url
 */
export declare function uploadImage(fileBuffer: Buffer, fileName: string): Promise<UploadResult>;
/**
 * Upload multiple images to Cloudinary
 * @param files - Array of file objects with buffer and originalname
 * @returns Promise with array of secure URLs
 */
export declare function uploadImages(files: Array<{
    buffer: Buffer;
    originalname: string;
}>): Promise<string[]>;
/**
 * Delete an image from Cloudinary by URL
 * @param imageUrl - Cloudinary image URL
 */
export declare function deleteImage(imageUrl: string): Promise<void>;
//# sourceMappingURL=cloudinary.d.ts.map
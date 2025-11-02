import multer from 'multer';
// Configure multer to store files in memory
const storage = multer.memoryStorage();
// File filter to only allow images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed'));
    }
};
// Multer configuration
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
        files: 10, // Max 10 files
    },
});
// Middleware for uploading multiple images
export const uploadImages = upload.array('images', 10); // 'images' is the field name, 10 is max files
// Middleware for uploading a single image
export const uploadSingleImage = upload.single('image');
export default upload;
//# sourceMappingURL=uploadMiddleware.js.map
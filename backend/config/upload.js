const multer = require('multer');

// Use memory storage so we have access to file buffers for Cloudinary streaming
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const galleryUpload = multer({
    storage,
    limits: { fileSize: 80 * 1024 * 1024 } // 80MB for gallery videos
});

module.exports = { upload, galleryUpload };

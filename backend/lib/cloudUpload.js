const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadBase64 = async (base64String) => {
    try {
        const result = await cloudinary.uploader.upload(base64String, {
            folder: 'traffcont_bukti',
            transformation: [
                { width: 800, crop: 'limit' },
                { quality: 'auto:low' },
                { fetch_format: 'auto' }
            ]
        });
        return result.secure_url;
    } catch (err) {
        console.error('Cloudinary upload error:', err);
        return null;
    }
};

module.exports = { uploadBase64 };

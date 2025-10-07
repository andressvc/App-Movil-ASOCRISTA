const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary from environment variables
// Required vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const isConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

/**
 * Upload a PDF buffer to Cloudinary as raw resource
 * @param {Buffer} buffer - PDF file content
 * @param {string} publicId - Desired public id (without extension)
 * @param {object} [options] - Extra Cloudinary options
 * @returns {Promise<import('cloudinary').UploadApiResponse>}
 */
async function uploadPdfBuffer(buffer, publicId, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw', // PDFs should be uploaded as raw
        public_id: publicId,
        format: 'pdf',
        folder: options.folder || 'reportes',
        overwrite: true,
        ...options
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}

module.exports = {
  cloudinary,
  uploadPdfBuffer,
  isConfigured
};



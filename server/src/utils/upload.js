// src/utils/upload.js
//
// Thin wrapper around Cloudinary's Node SDK.
// Swap the body of uploadToCloud() for AWS S3 / Google Cloud Storage
// without touching any controller code.
//
// Required env vars:
//   CLOUDINARY_CLOUD_NAME
//   CLOUDINARY_API_KEY
//   CLOUDINARY_API_SECRET

import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";


dotenv.config();

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
//   secure: true,
// });



cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a file buffer to Cloudinary.
 *
 * @param {Buffer} buffer        - Raw file buffer from multer memoryStorage
 * @param {Object} options       - Cloudinary upload options
 * @param {string} options.folder
 * @param {string} [options.publicId]
 * @param {boolean} [options.overwrite]
 * @param {string} [options.resourceType]  - "image" | "video" | "raw" | "auto"
 * @param {Array}  [options.transformation]
 *
 * @returns {Promise<{ url: string, publicId: string, format: string, bytes: number }>}
 */
export async function uploadToCloud(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder ?? "hriscloud/uploads",
      public_id: options.publicId ?? undefined,
      overwrite: options.overwrite ?? false,
      resource_type: options.resourceType ?? "auto",
      transformation: options.transformation ?? [],
    };

    // Cloudinary's upload_stream accepts a Buffer via a writable stream
    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          bytes: result.bytes,
        });
      },
    );

    stream.end(buffer);
  });
}

/**
 * Delete a file from Cloudinary by its public ID.
 * Useful when replacing a logo — remove the old asset.
 *
 * @param {string} publicId
 * @param {string} [resourceType]
 */
export async function deleteFromCloud(publicId, resourceType = "image") {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
}

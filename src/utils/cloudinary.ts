import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

/**
 * Upload a single file to Cloudinary
 * @param file - Express.Multer.File
 * @returns {Promise<{ public_id: string; url: string }>}
 */
export const uploadSingleToCloudinary = async (
  file: Express.Multer.File,
): Promise<{ public_id: string; url: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "blogs" }, // optional: specify a folder in Cloudinary
      (error, result: UploadApiResponse | undefined) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Upload failed"));
        resolve({
          public_id: result.public_id,
          url: result.secure_url,
        });
      },
    );

    stream.end(file.buffer);
  });
};

export const deleteFromCloudinary = async (public_id: string[]) => {
  const promises = public_id.map((id) => {
    return new Promise<void>((resolve, reject) => {
      cloudinary.uploader.destroy(id, (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });
  });
  await Promise.all(promises);
};

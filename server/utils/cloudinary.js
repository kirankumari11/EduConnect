import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config({});

cloudinary.config({
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  cloud_name: process.env.CLOUD_NAME,
});

// Upload image or video
export const uploadMedia = async (filePath) => {
  return await cloudinary.uploader.upload(filePath, {
    resource_type: "auto",
  });
};

// Delete image (course thumbnail)
export const deleteMediaFromCloudinary = async (publicId) => {
  return await cloudinary.uploader.destroy(publicId);
};

// Delete video (lectures)
export const deleteVideoFromCloudinary = async (publicId) => {
  return await cloudinary.uploader.destroy(publicId, {
    resource_type: "video",
  });
};

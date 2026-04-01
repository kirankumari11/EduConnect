import express from "express";
import { uploadVideo } from "../utils/multer.js";
import { uploadMedia } from "../utils/cloudinary.js";

const router = express.Router();

router.post(
  "/upload-video",
  uploadVideo.single("file"), // Frontend sends field name "file"
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const result = await uploadMedia(req.file.path);

      res.status(200).json({
        success: true,
        message: "File uploaded successfully",
        data: result, // result contains secure_url and public_id
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Error uploading file",
      });
    }
  }
);

export default router;
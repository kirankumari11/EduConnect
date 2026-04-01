import express from "express";
import { getUserProfile, login, logout, register, updateProfile } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { uploadImage } from "../utils/multer.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/profile", isAuthenticated, getUserProfile);

router.put(
  "/profile/update",
  isAuthenticated,
  uploadImage.single("profilePhoto"), // Expects field name "profilePhoto"
  updateProfile
);

export default router;
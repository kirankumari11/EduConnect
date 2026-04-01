import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  createCourse,
  createLecture,
  editCourse,
  editLecture,
  getCourseById,
  getCourseLecture,
  getCreatorCourses,
  getLectureById,
  getPublishedCourses,
  deleteCourse,
  removeLecture,
  searchCourse,
  togglePublishCourse,
} from "../controllers/course.controller.js";
import { updateCourseQuiz } from "../controllers/course.controller.js";

import { uploadImage, uploadVideo } from "../utils/multer.js";

const router = express.Router();

// ================= COURSE =================
router.post("/", isAuthenticated, createCourse);
router.get("/", isAuthenticated, getCreatorCourses);
router.get("/search", isAuthenticated, searchCourse);
router.get("/published-courses", getPublishedCourses);

router.get("/:courseId", isAuthenticated, getCourseById);

router.put(
  "/:courseId",
  isAuthenticated,
  uploadImage.single("courseThumbnail"), 
  editCourse
);

router.patch("/:courseId", isAuthenticated, togglePublishCourse);

// ================= LECTURE =================
router.post(
  "/:courseId/lecture",
  isAuthenticated,
  uploadVideo.single("video"), 
  createLecture
);

router.get("/:courseId/lecture", isAuthenticated, getCourseLecture);
router.get("/lecture/:lectureId", isAuthenticated, getLectureById);

router.put(
  "/lecture/:lectureId",
  isAuthenticated,
  uploadVideo.single("video"), 
  editLecture
);
router.delete("/:courseId", isAuthenticated, deleteCourse);
router.delete("/lecture/:lectureId", isAuthenticated, removeLecture);
router.post("/:courseId/quiz", isAuthenticated, updateCourseQuiz);

export default router;
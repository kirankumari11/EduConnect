import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { 
    createCheckoutSession, 
    getAllPurchasedCourse, 
    getCourseDetailWithPurchaseStatus,
    addReview, 
    deleteReview,
    getDashboardData,
} from "../controllers/coursePurchase.controller.js";

const router = express.Router();

// 1. Route to handle the Simulated Purchase (Unlock Course)
router.route("/checkout/create-checkout-session").post(isAuthenticated, createCheckoutSession);

// 2. Route to get course details and check if the user has already bought it
router.route("/course/:courseId/detail-with-status").get(isAuthenticated, getCourseDetailWithPurchaseStatus);

// 3. Route to get all courses purchased by the logged-in user
router.route("/").get(isAuthenticated, getAllPurchasedCourse);
router.route("/course/:courseId/review").post(isAuthenticated, addReview);
router.route("/review/:reviewId").delete(isAuthenticated, deleteReview);
router.route("/dashboard").get(isAuthenticated, getDashboardData);

export default router;
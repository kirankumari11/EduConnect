import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { User } from "../models/user.model.js";
import { Review } from "../models/review.model.js";

export const createCheckoutSession = async (req, res) => {
    try {
        const userId = req.id;
        const { courseId } = req.body;

        const existingPurchase = await CoursePurchase.findOne({ 
            courseId, 
            userId, 
            status: 'completed' 
        });

        if (existingPurchase) {
            return res.status(400).json({ 
                success: false, 
                message: "You have already purchased this course! Check 'My Learning'." 
            });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found!" });
        }

        const newPurchase = new CoursePurchase({
            courseId,
            userId,
            amount: course.coursePrice,
            status: 'completed',
            paymentId: `sim_pay_${Date.now()}_${Math.floor(Math.random() * 1000)}`
        });
        
        await newPurchase.save();

        await User.findByIdAndUpdate(userId, {
            $addToSet: { enrolledCourses: courseId }
        });

        await Course.findByIdAndUpdate(courseId, {
            $addToSet: { enrolledStudents: userId }
        });

        return res.status(200).json({
            success: true,
            message: "Payment Successful! Course Unlocked.",
        });
    } catch (error) {
        console.error("Purchase Error:", error);
        res.status(500).json({ message: "Failed to process simulated payment" });
    }
};

export const getCourseDetailWithPurchaseStatus = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;

        const course = await Course.findById(courseId)
            .populate({ path: "creator" })
            .populate({ path: "lectures" })
            .populate({
                path: 'reviews',
                populate: { path: 'userId', select: 'name' }
            });

        const purchased = await CoursePurchase.findOne({ userId, courseId, status: "completed" });

        return res.status(200).json({
            course,
            purchased: !!purchased,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching details" });
    }
};

export const getAllPurchasedCourse = async (req, res) => {
    try {
        const userId = req.id; 
        const purchasedCourses = await CoursePurchase.find({ 
            userId: userId, 
            status: 'completed' 
        }).populate('courseId');

        if (!purchasedCourses || purchasedCourses.length === 0) {
            return res.status(200).json({ purchasedCourse: [] });
        }

        const coursesWithStats = await Promise.all(purchasedCourses.map(async (purchase) => {
            const course = purchase.courseId;
            if (!course) return null; 

            const reviews = await Review.find({ courseId: course._id });
            const avgRating = reviews.length > 0 
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
                : 0;

            return {
                ...course._doc,
                averageRating: parseFloat(avgRating),
                isCompleted: purchase.status === 'completed' 
            };
        }));
        return res.status(200).json({ 
            purchasedCourse: coursesWithStats.filter(c => c !== null) 
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching purchased courses" });
    }
};

export const addReview = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.id;

        const existingReview = await Review.findOne({ userId, courseId });
        if (existingReview) {
            return res.status(400).json({ 
                message: "You have already rated this course." 
            });
        }

        const newReview = new Review({
            userId,
            courseId,
            rating,
            comment: comment || "" 
        });

        await newReview.save();

        // LINKING: Add review ID to the Course model's reviews array
        await Course.findByIdAndUpdate(courseId, {
            $push: { reviews: newReview._id }
        });

        return res.status(201).json({
            success: true,
            message: "Review submitted successfully!"
        });
    } catch (error) {
        console.error("Review Submission Error:", error);
        return res.status(500).json({ message: "Failed to submit review" });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.id;

        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ message: "Review not found" });

        if (review.userId.toString() !== userId) {
            return res.status(403).json({ message: "You can only delete your own reviews" });
        }

        // Remove from Review Collection
        await Review.findByIdAndDelete(reviewId);

        // Remove from Course reviews array
        await Course.findByIdAndUpdate(review.courseId, {
            $pull: { reviews: reviewId }
        });

        res.status(200).json({ success: true, message: "Review deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting review" });
    }
};

export const getDashboardData = async (req, res) => {
    try {
        // 1. Fetch all published courses to get enrollment counts
        const courses = await Course.find({ isPublished: true });

        // 2. Fetch all successful purchase records to calculate revenue
        const purchases = await CoursePurchase.find({ status: "completed" }).populate("courseId");

        // 3. Total Sales = Sum of all enrolled students in all courses
        const totalSales = courses.reduce((acc, course) => acc + (course.enrolledStudents?.length || 0), 0);

        // 4. Total Revenue = Sum of 'amount' from all purchase records
        const totalRevenue = purchases.reduce((acc, purchase) => acc + (purchase.amount || 0), 0);

        // 5. Chart Data: Prepare course names and their specific revenue/sales
        const courseData = courses.map((course) => ({
            name: course.courseTitle,
            price: course.coursePrice || 0,
            sales: course.enrolledStudents?.length || 0
        }));

        return res.status(200).json({
            success: true,
            totalSales,
            totalRevenue,
            courseData
        });
    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
};
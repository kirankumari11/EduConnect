import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import {deleteMediaFromCloudinary, deleteVideoFromCloudinary, uploadMedia} from "../utils/cloudinary.js";
import { Review } from "../models/review.model.js";
import { Quiz } from "../models/quiz.model.js";


export const createCourse = async (req, res) => {
    try {
        const { courseTitle, category } = req.body;
        if (!courseTitle || !category) {
            return res.status(400).json({
                message: "Course title and category is required."
            })
        }

        // ADDED DEFAULT VALUES HERE
        const course = await Course.create({
            courseTitle,
            category,
            creator: req.id,
            coursePrice: 0, // Default price
            courseLevel: "Beginner", // Default level
            courseThumbnail: "" // Empty string instead of undefined
        });

        return res.status(201).json({
            course,
            message: "Course created."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to create course"
        })
    }
}

export const searchCourse = async (req, res) => {
    try {
        // Use 'let' so we can overwrite categories if needed
        let { query = "", categories = [], sortByPrice = "" } = req.query;

        // FIX: Handle categories being sent as a string (e.g., "Frontend Development,HTML")
        if (typeof categories === 'string' && categories.trim() !== "") {
            categories = categories.split(',');
        }

        const searchCriteria = {
            isPublished: true,
            $or: [
                { courseTitle: { $regex: query, $options: "i" } },
                { subTitle: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } },
            ]
        };

        // FIX: Ensure categories is an array before using $in operator
        if (Array.isArray(categories) && categories.length > 0) {
            searchCriteria.category = { $in: categories };
        }

        const sortOptions = {};
        if (sortByPrice === "low") {
            sortOptions.coursePrice = 1;
        } else if (sortByPrice === "high") {
            sortOptions.coursePrice = -1;
        }

        const courses = await Course.find(searchCriteria)
            .populate({ path: "creator", select: "name photoUrl" })
            .sort(sortOptions);

        return res.status(200).json({
            success: true,
            courses: courses || []
        });

    } catch (error) {
        console.error("Search Error:", error);
        return res.status(500).json({ message: "Search failed" });
    }
};

export const getPublishedCourses = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true }).populate("creator");
        
        const coursesWithRatings = await Promise.all(courses.map(async (course) => {
            const reviews = await Review.find({ courseId: course._id });
            const avgRating = reviews.length > 0 
                ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length 
                : 0;
            
            return {
                ...course._doc,
                // Changed from avgRating to averageRating to match Course.jsx
                averageRating: parseFloat(avgRating.toFixed(1)) 
            };
        }));

        res.status(200).json({ courses: coursesWithRatings });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch courses" });
    }
};

export const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true }).populate("creator");
        
        // Fetch ratings for each course
        const coursesWithRatings = await Promise.all(courses.map(async (course) => {
            const reviews = await Review.find({ courseId: course._id });
            const avgRating = reviews.length > 0 ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length : 0;
            
            return {
                ...course._doc,
                averageRating: avgRating.toFixed(1),
                totalReviews: reviews.length
            };
        }));

        res.status(200).json({ courses: coursesWithRatings });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch courses" });
    }
};

export const getCreatorCourses = async (req,res) => {
    try {
        const userId = req.id;
        const courses = await Course.find({creator:userId});
        if(!courses){
            return res.status(404).json({
                courses:[],
                message:"Course not found"
            })
        };
        return res.status(200).json({
            courses,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to create course"
        })
    }
}

export const editCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { courseTitle, subTitle, description, category, courseLevel, coursePrice, quiz } = req.body;
    const thumbnail = req.file;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found!" });

    // Prepare update object
    const updateData = {
      courseTitle,
      subTitle,
      description,
      category,
      courseLevel,
      coursePrice: coursePrice ? Number(coursePrice) : 0,
    };

    // CRITICAL FIX: Parse the quiz string back into an Array for MongoDB
    if (quiz) {
        try {
            updateData.quiz = JSON.parse(quiz);
        } catch (err) {
            console.error("Quiz Parse Error:", err);
        }
    }

    // Thumbnail logic
    if (thumbnail) {
      if (course.courseThumbnail) {
        const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
        await deleteMediaFromCloudinary(publicId);
      }
      const uploadedImage = await uploadMedia(thumbnail.path);
      updateData.courseThumbnail = uploadedImage.secure_url;
    }

    const updatedCourse = await Course.findByIdAndUpdate(courseId, updateData, { new: true });

    return res.status(200).json({
      course: updatedCourse,
      message: "Course updated successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update course" });
  }
};

export const deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found!" });
        }
        if (course.courseThumbnail) {
            const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
            await deleteMediaFromCloudinary(publicId);
        }
        const lectures = await Lecture.find({ _id: { $in: course.lectures } });
        for (const lecture of lectures) {
            if (lecture.publicId) {
                await deleteVideoFromCloudinary(lecture.publicId);
            }
            await Lecture.findByIdAndDelete(lecture._id);
        }
        await Course.findByIdAndDelete(courseId);

        return res.status(200).json({
            success: true,
            message: "Course and associated lectures deleted successfully."
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to delete course" });
    }
};

export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
      .populate("lectures")
      .populate("creator", "name photoUrl");

    if (!course) {
      return res.status(404).json({
        message: "Course not found!",
      });
    }

    return res.status(200).json({
      course,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get course by id",
    });
  }
};
export const createLecture = async (req, res) => {
  try {
    console.log(req.body, req.file)
    const { courseId } = req.params;
    const lectureTitle = req.body.lectureTitle;
    const isPreviewFree = req.body.isPreviewFree === "true";

    if (!lectureTitle || lectureTitle.trim() === "") {
      return res.status(400).json({
        message: "Lecture title required",
      });
    }

    let videoUrl = "";
    if (req.file) {
      videoUrl = `/uploads/${req.file.filename}`;
    }

    const lecture = await Lecture.create({
      lectureTitle,
      videoUrl,
      isPreviewFree,
      courseId,
    });

    const course = await Course.findById(courseId);
    course.lectures.push(lecture._id);
    await course.save();

    res.status(201).json({
      success: true,
      lecture,
      message: "Lecture created successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCourseLecture = async (req,res) => {
    try {
        const {courseId} = req.params;
        const course = await Course.findById(courseId).populate("lectures");
        if(!course){
            return res.status(404).json({
                message:"Course not found"
            })
        }
        return res.status(200).json({
            lectures: course.lectures
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get lectures"
        })
    }
}

export const editLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { lectureTitle, isPreviewFree, videoInfo } = req.body;

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    // Update fields
    if (lectureTitle) lecture.lectureTitle = lectureTitle;
    
    // Convert string "true"/"false" to actual Boolean
    if (isPreviewFree !== undefined) {
        lecture.isPreviewFree = isPreviewFree === "true" || isPreviewFree === true;
    }
    
    // Handle Video Update
    if (req.file) {
      // If direct upload via Multer
      lecture.videoUrl = `/uploads/${req.file.filename}`;
    } else if (videoInfo && videoInfo.videoUrl) {
      // If via separate Media API
      lecture.videoUrl = videoInfo.videoUrl;
      lecture.publicId = videoInfo.publicId;
    }

    await lecture.save();

    res.status(200).json({
      success: true,
      message: "Lecture updated successfully",
      lecture,
    });
  } catch (error) {
    console.error("Edit Lecture Error:", error);
    res.status(500).json({ message: "Failed to update lecture" });
  }
};

export const removeLecture = async (req,res) => {
    try {
        const {lectureId} = req.params;
        const lecture = await Lecture.findByIdAndDelete(lectureId);
        if(!lecture){
            return res.status(404).json({
                message:"Lecture not found!"
            });
        }
        // delete the lecture from couldinary as well
        if(lecture.publicId){
            await deleteVideoFromCloudinary(lecture.publicId);
        }

        // Remove the lecture reference from the associated course
        await Course.updateOne(
            {lectures:lectureId}, // find the course that contains the lecture
            {$pull:{lectures:lectureId}} // Remove the lectures id from the lectures array
        );

        return res.status(200).json({
            message:"Lecture removed successfully."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to remove lecture"
        })
    }
}
export const getLectureById = async (req,res) => {
    try {
        const {lectureId} = req.params;
        const lecture = await Lecture.findById(lectureId);
        if(!lecture){
            return res.status(404).json({
                message:"Lecture not found!"
            });
        }
        return res.status(200).json({
            lecture
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get lecture by id"
        })
    }
}

export const togglePublishCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { publish } = req.query; 

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found!" });

        // Logic check: Bina lectures ke publish nahi hone dena
        if (publish === "true" && course.lectures.length === 0) {
            return res.status(400).json({ 
                message: "You cannot publish a course without lectures." 
            });
        }

        course.isPublished = publish === "true";
        await course.save();

        const statusMessage = course.isPublished ? "Published" : "Unpublished";
        return res.status(200).json({
            message: `Course is ${statusMessage}`,
            course // Updated course wapas bhejein
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to update status" });
    }
}

export const createOrUpdateQuiz = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { questions, passingScore } = req.body;

        let quiz = await Quiz.findOne({ courseId });

        if (quiz) {
            quiz.questions = questions;
            quiz.passingScore = passingScore;
            await quiz.save();
        } else {
            quiz = await Quiz.create({ courseId, questions, passingScore });
            // Link quiz to the course
            await Course.findByIdAndUpdate(courseId, { quiz: quiz._id });
        }

        res.status(200).json({ message: "Quiz saved successfully", quiz });
    } catch (error) {
        res.status(500).json({ message: "Failed to save quiz" });
    }
};

export const getQuizByCourseId = async (req, res) => {
    try {
        const { courseId } = req.params;
        const quiz = await Quiz.findOne({ courseId });
        if (!quiz) return res.status(404).json({ message: "No quiz found for this course" });
        res.status(200).json(quiz);
    } catch (error) {
        res.status(500).json({ message: "Error fetching quiz" });
    }
};

export const updateCourseQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { quizQuestions } = req.body; // Array of {question, options[], correct}

    const course = await Course.findByIdAndUpdate(
      courseId,
      { quiz: quizQuestions }, 
      { new: true }
    );

    res.status(200).json({ message: "Quiz updated successfully", course });
  } catch (error) {
    res.status(500).json({ message: "Failed to update quiz" });
  }
};
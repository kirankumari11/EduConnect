import { CourseProgress } from "../models/courseProgress.js";
import { Course } from "../models/course.model.js";

export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    let userProgress = await CourseProgress.findOne({ courseId, userId }).populate("courseId");
    const courseDetails = await Course.findById(courseId).populate("lectures");

    if (!courseDetails) return res.status(404).json({ message: "Course not found" });

    return res.status(200).json({
      data: {
        courseDetails,
        progress: userProgress?.lectureProgress || [],
        completed: userProgress?.completed || false,
        quizCompleted: userProgress?.quizCompleted || false,
        quizScore: userProgress?.quizScore || 0
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { score } = req.body;
    const userId = req.id;

    let courseProgress = await CourseProgress.findOne({ courseId, userId });

    if (!courseProgress) {
      return res.status(404).json({ message: "Course progress not found" });
    }

    courseProgress.quizCompleted = true;
    courseProgress.quizScore = score;
    
    await courseProgress.save();

    return res.status(200).json({
      success: true,
      message: "Quiz score saved successfully!",
      quizScore: score
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error saving quiz score" });
  }
};

export const updateLectureProgress = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.id;

    let courseProgress = await CourseProgress.findOne({ courseId, userId });

    if (!courseProgress) {
      courseProgress = new CourseProgress({
        userId,
        courseId,
        completed: false,
        lectureProgress: [],
      });
    }

    const lectureIndex = courseProgress.lectureProgress.findIndex(
      (lecture) => lecture.lectureId === lectureId
    );

    if (lectureIndex !== -1) {
      courseProgress.lectureProgress[lectureIndex].viewed = true;
    } else {
      courseProgress.lectureProgress.push({ lectureId, viewed: true });
    }

    const course = await Course.findById(courseId);
    
    const viewedLecturesCount = courseProgress.lectureProgress.filter(
      (lp) => lp.viewed
    ).length;

    if (course.lectures.length === viewedLecturesCount) {
      courseProgress.completed = true;
    }

    await courseProgress.save();

    return res.status(200).json({
      message: "Lecture progress updated.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating progress" });
  }
};

export const markAsCompleted = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const courseProgress = await CourseProgress.findOne({ courseId, userId });
    if (!courseProgress) return res.status(404).json({ message: "Progress not found" });

    courseProgress.lectureProgress.forEach(lp => lp.viewed = true);
    
    courseProgress.completed = true;
    await courseProgress.save();
    
    return res.status(200).json({ message: "Course marked as completed." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markAsInCompleted = async (req, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.id;
  
      const courseProgress = await CourseProgress.findOne({ courseId, userId });
      if (!courseProgress)
        return res.status(404).json({ message: "Course progress not found" });
  
      courseProgress.lectureProgress.map(
        (lectureProgress) => (lectureProgress.viewed = false)
      );
      courseProgress.completed = false;
      await courseProgress.save();
      return res.status(200).json({ message: "Course marked as incompleted." });
    } catch (error) {
      console.log(error);
    }
  };

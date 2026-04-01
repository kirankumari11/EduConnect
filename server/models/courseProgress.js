import mongoose from "mongoose"

const lectureProgressSchema = new mongoose.Schema({
    lectureId:{type:String},
    viewed:{type:Boolean}
});

const courseProgressSchema = new mongoose.Schema({
    userId:{type:String},
    courseId:{type:String},
    completed:{type:Boolean},
    lectureProgress:[lectureProgressSchema],
    quizCompleted: { type: Boolean, default: false },
    quizScore: { type: Number, default: 0 },
});

export const CourseProgress = mongoose.model("CourseProgress", courseProgressSchema);
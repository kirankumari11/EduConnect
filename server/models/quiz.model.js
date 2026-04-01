import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    questions: [
        {
            questionText: { type: String, required: true },
            options: [{ type: String, required: true }],
            correctOptionIndex: { type: Number, required: true } // 0, 1, 2, or 3
        }
    ],
    passingScore: {
        type: Number,
        default: 80 // Percentage required to pass
    }
}, { timestamps: true });

export const Quiz = mongoose.model("Quiz", quizSchema);
import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    lectureTitle: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      default: "",
    },
    publicId: {
      type: String,
      default: "",
    },
    isPreviewFree: {
      type: Boolean,
      default: false,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
  },
  { timestamps: true }
);

export const Lecture = mongoose.model("Lecture", lectureSchema);

import mongoose from "mongoose"

const courseSchema = new mongoose.Schema({
    courseTitle:{
        type:String,
        required:true
    },
    subTitle: {type:String}, 
    description:{ type:String},
    category:{
        type:String,
        required:true
    },
    courseLevel:{
        type:String,
        enum:["Beginner", "Medium", "Advance"]
    },
    coursePrice:{
        type:Number
    },
    courseThumbnail:{
        type:String
    },
    enrolledStudents:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    ],
    lectures:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Lecture"
        }
    ],
    creator:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    isPublished:{
        type:Boolean,
        default:false
    },
    quiz: [
            {
                question: { type: String },
                options: [{ type: String }],
                correct: { type: Number } // Index 0-3
            }
    ],

}, {timestamps:true});

courseSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'courseId'
});

courseSchema.set('toObject', { virtuals: true });
courseSchema.set('toJSON', { virtuals: true });

export const Course = mongoose.model("Course", courseSchema);
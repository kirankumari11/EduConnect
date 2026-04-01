import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import { Link } from "react-router-dom";
import { Star, CheckCircle } from "lucide-react"; 

const Course = ({ course, isMyLearning = false }) => {
    // Placeholder image if thumbnail is missing
    const placeholderThumbnail = "https://img.freepik.com/free-vector/online-education-concept-illustration_114360-8414.jpg";

    return (
        <Link to={`/course-detail/${course?._id}`}>
            <Card className="overflow-hidden rounded-lg dark:bg-gray-800 bg-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 h-full">
                <div className="relative">
                    <img
                        src={course?.courseThumbnail || placeholderThumbnail}
                        alt="course"
                        className="w-full h-36 object-cover rounded-t-lg"
                    />
                </div>
                <CardContent className="px-5 py-4 space-y-3">
                    <h1 className="hover:underline font-bold text-lg truncate">
                        {course?.courseTitle}
                    </h1>

                    {/* UPDATED: Star Rating Section */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center text-orange-400">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={16}
                                    // Uses averageRating from backend logic
                                    fill={i < Math.floor(course?.averageRating || 0) ? "currentColor" : "none"}
                                />
                            ))}
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            ({course?.averageRating?.toFixed(1) || "0.0"})
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={course?.creator?.photoUrl || "https://github.com/shadcn.png"} alt="creator" />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <h1 className="font-medium text-sm">{course?.creator?.name || "Instructor"}</h1>
                        </div>
                        <Badge className={'bg-blue-600 text-white px-2 py-1 text-[10px] rounded-full'}>
                            {course?.courseLevel || "Beginner"}
                        </Badge>
                    </div>

                    {/* UPDATED: Status vs Price Logic */}
                    <div className="flex items-center justify-between mt-2">
                        {isMyLearning ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 flex items-center gap-1">
                                <CheckCircle size={14} />
                                <span>Completed</span>
                            </Badge>
                        ) : (
                            <div className="text-lg font-bold">
                                <span>₹{course?.coursePrice !== undefined ? course.coursePrice : "0"}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};

export default Course;
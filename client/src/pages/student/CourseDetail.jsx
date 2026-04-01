const BACKEND_URL = "http://localhost:5000";

import BuyCourseButton from "@/components/BuyCourseButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import { BadgeInfo, Lock, PlayCircle, Users } from "lucide-react";
import React from "react";
import CourseReviewSection from "@/components/CourseReviewSection";
import ReactPlayer from "react-player";
import { useNavigate, useParams } from "react-router-dom";

const CourseDetail = () => {
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetCourseDetailWithStatusQuery(courseId);

  if (isLoading) return <h1 className="p-10 text-center">Loading...</h1>;
  if (isError || !data) return <h1 className="p-10 text-center text-red-500">Failed to load course details</h1>;

  const { course, purchased } = data;

  const handleContinueCourse = () => {
    if (purchased) {
      navigate(`/course-progress/${courseId}`);
    }
  };

  const lectures = course?.lectures || [];
  const firstLecture = lectures.length > 0 ? lectures[0] : null;
  const canPlay = firstLecture?.isPreviewFree || purchased;

  return (
    <div className="space-y-5 pb-10">
      {/* Header Section */}
      <div className="bg-[#2D2F31] text-white">
        <div className="max-w-7xl mx-auto py-10 px-4 md:px-8 flex flex-col gap-3">
          <h1 className="font-bold text-3xl md:text-4xl">
            {course?.courseTitle || "Course Title"}
          </h1>
          {/* FIXED: Added fallback for subTitle */}
          <p className="text-base md:text-lg text-gray-300">
            {course?.subTitle || "Learn the fundamentals and advanced concepts in this comprehensive guide."}
          </p>
          <p>
            Created By{" "}
            <span className="text-[#C0C4FC] underline italic">
              {course?.creator?.name || "Instructor"}
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm mt-2">
            <div className="flex items-center gap-1">
              <BadgeInfo size={16} />
              <p>Last updated {course?.createdAt?.split("T")[0] || "Recently"}</p>
            </div>
            <div className="flex items-center gap-1">
              <Users size={16} />
              <p>{course?.enrolledStudents?.length || 0} students enrolled</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto my-5 px-4 md:px-8 flex flex-col lg:flex-row justify-between gap-10">
        <div className="w-full lg:w-2/3 space-y-8">
          {/* Description Section */}
          <section>
            <h1 className="font-bold text-2xl mb-4">Description</h1>
            <div
              className="text-gray-700 dark:text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: course?.description || "No description available for this course." 
              }}
            />
          </section>

          {/* Course Content List */}
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>{lectures.length} lectures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {lectures.length > 0 ? (
                lectures.map((lecture, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                    <PlayCircle size={16} className="text-gray-500" />
                    <p className="font-medium">{lecture.lectureTitle}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No lectures added yet</p>
              )}
            </CardContent>
          </Card>
          <section className="pt-5 border-t">
            <CourseReviewSection 
              courseId={courseId} 
              purchased={false} 
              reviews={course?.reviews || []} 
            />
          </section>
        </div>

        {/* Sidebar Card */}
        <div className="w-full lg:w-1/3">
          <Card className="sticky top-24 shadow-xl border-gray-200 dark:border-gray-800">
            <CardContent className="p-4 flex flex-col">
              <div className="w-full aspect-video mb-4 rounded-lg overflow-hidden border bg-black shadow-inner">
                {firstLecture?.videoUrl ? (
                  canPlay ? (
                    <ReactPlayer
                      width="100%"
                      height="100%"
                      url={
                        firstLecture.videoUrl.startsWith("http") 
                          ? firstLecture.videoUrl 
                          : `${BACKEND_URL}${firstLecture.videoUrl.startsWith('/') ? '' : '/'}${firstLecture.videoUrl}`
                      }
                      controls
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white gap-3 p-4 text-center">
                      <Lock size={40} className="text-gray-400" />
                      <p className="font-semibold">This lecture is locked</p>
                      <p className="text-xs text-gray-400">Purchase the course to start learning</p>
                    </div>
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white text-sm">
                    Preview video not available
                  </div>
                )}
              </div>

              <h1 className="font-bold text-lg mb-1 truncate">
                {firstLecture ? firstLecture.lectureTitle : "Start Learning Today"}
              </h1>
              <p className="text-xs text-gray-500 mb-2">Free preview available for the first lecture</p>
              
              <Separator className="my-3" />
              
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-extrabold">₹{course?.coursePrice || "0"}</span>
                {course?.coursePrice > 0 && <span className="text-sm text-gray-500 line-through">₹{Math.round(course.coursePrice * 1.5)}</span>}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center p-4 pt-0">
              {purchased ? (
                <Button onClick={handleContinueCourse} className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700">
                  Continue to Course
                </Button>
              ) : (
                <BuyCourseButton courseId={courseId} />
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
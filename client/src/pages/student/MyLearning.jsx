import React from "react";
import Course from "./Course";
import { useGetPurchasedCoursesQuery } from "@/features/api/purchaseApi"; 

const MyLearning = () => { 
  // Use the dedicated purchase API instead of general user data
  const { data, isLoading, isError } = useGetPurchasedCoursesQuery();

  // Accessing the array from the new response structure
  const myLearning = data?.purchasedCourse || [];

  return (
    <div className="max-w-4xl mx-auto my-10 px-4 md:px-0">
      <h1 className="font-bold text-2xl uppercase tracking-wider">My Learning</h1>
      <div className="my-5">
        {isLoading ? (
          <MyLearningSkeleton />
        ) : isError ? (
          <p className="text-red-500">Failed to load your courses. Please try again.</p>
        ) : myLearning.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 dark:bg-gray-900 rounded-lg">
             <p className="text-gray-500">You haven't enrolled in any courses yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {myLearning.map((course) => (
              <Course key={course._id} course={course} isMyLearning={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLearning;

const MyLearningSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {[...Array(3)].map((_, index) => (
      <div
        key={index}
        className="bg-gray-200 dark:bg-gray-800 rounded-xl h-64 animate-pulse"
      ></div>
    ))}
  </div>
);
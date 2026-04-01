import React from "react";
import { Button } from "./ui/button";
import { useCreateCheckoutSessionMutation, useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const BuyCourseButton = ({ courseId }) => {
  const [createCheckoutSession, { isLoading, isSuccess }] = useCreateCheckoutSessionMutation();
  
  // Refetch helper to update the CourseDetail page immediately
  const { refetch } = useGetCourseDetailWithStatusQuery(courseId);

  const purchaseCourseHandler = async () => {
    try {
      const response = await createCheckoutSession({ courseId }).unwrap();
      
      if (response.success) {
        // Simulate a 1.5s delay to make "Processing" feel like a real bank communication
        setTimeout(async () => {
          await refetch(); // Update 'purchased' status in parent component
          toast.success("Course Unlocked Successfully!");
        }, 1500);
      }
    } catch (error) {
      toast.error(error?.data?.message || "Payment gateway connection failed");
    }
  };

  return (
    <Button 
      disabled={isLoading || isSuccess} 
      onClick={purchaseCourseHandler} 
      className={`w-full font-bold transition-all ${isSuccess ? "bg-green-600 hover:bg-green-600" : "bg-blue-600 hover:bg-blue-700"}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Verifying Payment...
        </>
      ) : isSuccess ? (
        <>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Unlocked
        </>
      ) : (
        "Purchase Course"
      )}
    </Button>
  );
};

export default BuyCourseButton;
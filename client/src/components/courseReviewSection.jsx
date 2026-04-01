import React, { useState } from "react";
import { Star, Trash2 } from "lucide-react"; // Changed Send to Trash2 for the delete icon
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { 
  useCreateReviewMutation, 
  useDeleteReviewMutation // 1. Added this missing mutation
} from "@/features/api/purchaseApi";
import { toast } from "sonner";
import { useSelector } from "react-redux";

const CourseReviewSection = ({ courseId, purchased, reviews = [] }) => {
  const { user } = useSelector((store) => store.auth);
  const currentUserId = user?._id;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  
  const [createReview, { isLoading: isPosting }] = useCreateReviewMutation();
  const [deleteReview] = useDeleteReviewMutation(); 

  const handleSubmitReview = async () => {
    if (rating === 0) return toast.error("Please select a star rating");

    try {
      await createReview({ courseId, rating, comment }).unwrap();
      toast.success("Review submitted!");
      setComment("");
      setRating(0);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to submit review");
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      await deleteReview(reviewId).unwrap();
      toast.success("Review deleted successfully");
    } catch (err) {
      toast.error("Failed to delete review");
    }
  };

  return (
    <div className="mt-10 border-t pt-8">
      <h2 className="text-2xl font-bold mb-6">Learner Reviews & Suggestions</h2>

      {purchased ? (
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-8">
          <h3 className="font-semibold mb-2">Rate this course</h3>
          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={24}
                onClick={() => setRating(star)}
                className={`cursor-pointer transition ${
                  star <= rating ? "text-orange-500 fill-orange-500" : "text-gray-400"
                }`}
              />
            ))}
          </div>
          <Textarea
            placeholder="How was the course? Any suggestions for improvement?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mb-4"
          />
          <Button onClick={handleSubmitReview} disabled={isPosting}>
            {isPosting ? "Submitting..." : "Post Review"}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic mb-8">
          Only enrolled students can leave a review.
        </p>
      )}

      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((rev) => (
            <div key={rev._id} className="border-b pb-4 relative group"> {/* Added relative & group */}
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                  {rev.userId?.name?.charAt(0) || "U"}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{rev.userId?.name || "Anonymous"}</p>
                  <div className="flex text-orange-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill={i < rev.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                </div>

                {/* 4. FIXED DELETE BUTTON POSITIONING */}
                {rev.userId?._id === currentUserId && (
                  <button
                    onClick={() => handleDelete(rev._id)}
                    className="text-red-500 hover:text-red-700 p-1 transition-colors"
                    title="Delete review"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm">{rev.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No reviews yet. Be the first to rate!</p>
        )}
      </div>
    </div>
  );
};

export default CourseReviewSection;
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateLectureMutation,
  useGetCourseLectureQuery,
} from "@/features/api/courseApi";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Lecture from "./Lecture";

const CreateLecture = () => {
  const [lectureTitle, setLectureTitle] = useState("");
  const [video, setVideo] = useState(null);
  const [isPreviewFree, setIsPreviewFree] = useState(false);

  const { courseId } = useParams();
  const navigate = useNavigate();

  const [createLecture, { data, isLoading, isSuccess, error }] =
    useCreateLectureMutation();

  const {
    data: lectureData,
    isLoading: lectureLoading,
    isError: lectureError,
    refetch,
  } = useGetCourseLectureQuery(courseId);

  const createLectureHandler = async () => {
    if (!lectureTitle.trim()) {
      toast.error("Lecture title cannot be empty");
      return;
    }
    if (!video) {
      toast.error("Please select a video to upload");
      return;
    }

    const formData = new FormData();
    formData.append("lectureTitle", lectureTitle);
    formData.append("video", video);
    formData.append("isPreviewFree", isPreviewFree);

    await createLecture({ courseId, formData });
  };

  useEffect(() => {
    if (isSuccess) {
      refetch();
      toast.success(data?.message || "Lecture created successfully!");
      setLectureTitle("");
      setVideo(null);
      setIsPreviewFree(false);
    }
    if (error) {
      toast.error(error?.data?.message || "Something went wrong");
    }
  }, [isSuccess, error, data, refetch]);

  return (
    <div className="flex-1 mx-10">
      <div className="mb-4">
        <h1 className="font-bold text-xl">
          Add a new lecture with video
        </h1>
        <p className="text-sm">
          Fill in the details below to add a lecture to your course.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Lecture Title</Label>
          <Input
            type="text"
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            placeholder="Enter lecture title"
          />
        </div>

        <div>
          <Label>Upload Video</Label>
          <Input
            type="file"
            accept="video/*"
            onChange={(e) => setVideo(e.target.files[0])}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isPreviewFree}
            onChange={(e) => setIsPreviewFree(e.target.checked)}
            id="freePreview"
          />
          <label htmlFor="freePreview">Free Preview</label>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/course/${courseId}`)}
          >
            Back to course
          </Button>
          <Button
            disabled={isLoading || !lectureTitle.trim() || !video}
            onClick={createLectureHandler}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Create lecture"
            )}
          </Button>
        </div>

        <div className="mt-10">
          {lectureLoading ? (
            <p>Loading lectures...</p>
          ) : lectureError ? (
            <p>Failed to load lectures.</p>
          ) : !lectureData?.lectures || lectureData.lectures.length === 0 ? (
            <p>No lectures available</p>
          ) : (
            lectureData.lectures.map((lecture, index) => (
              <Lecture
                key={lecture._id}
                lecture={lecture}
                courseId={courseId}
                index={index}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateLecture;

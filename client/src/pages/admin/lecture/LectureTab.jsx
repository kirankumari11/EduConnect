import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { 
  useEditLectureMutation, 
  useGetLectureByIdQuery, 
  useRemoveLectureMutation 
} from "@/features/api/courseApi";
import axios from "axios";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const MEDIA_API = "http://localhost:5000/api/v1/media";

const LectureTab = () => {
  const [lectureTitle, setLectureTitle] = useState("");
  const [uploadVideInfo, setUploadVideoInfo] = useState(null);
  const [isFree, setIsFree] = useState(false);
  const [mediaProgress, setMediaProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [btnDisable, setBtnDisable] = useState(true);
  
  const params = useParams();
  const navigate = useNavigate();
  const { courseId, lectureId } = params;

  // 1. Hook Definitions (Must be at the top)
  const { data: lectureData } = useGetLectureByIdQuery(lectureId);
  const lecture = lectureData?.lecture;

  const [editLecture, { 
    data: editData, 
    isLoading: editLoading, 
    error: editError, 
    isSuccess: editIsSuccess 
  }] = useEditLectureMutation();

  const [removeLecture, { 
    data: removeData, 
    isLoading: removeLoading, 
    isSuccess: removeIsSuccess 
  }] = useRemoveLectureMutation();

  // 2. Lifecycle Effects
  
  // Initialize form with existing data
  useEffect(() => {
    if (lecture) {
      setLectureTitle(lecture.lectureTitle);
      setIsFree(lecture.isPreviewFree);
      setUploadVideoInfo(lecture.videoInfo);
    }
  }, [lecture]);

  // Handle Edit Mutation Feedback
  useEffect(() => {
    if (editIsSuccess) {
      toast.success(editData?.message || "Lecture updated");
    }
    if (editError) {
      toast.error(editError?.data?.message || "Failed to update lecture");
    }
  }, [editIsSuccess, editError, editData]);

  // Handle Remove Mutation Feedback
  useEffect(() => {
    if (removeIsSuccess) {
      toast.success(removeData?.message || "Lecture removed");
      navigate(`/admin/course/${courseId}/lecture`);
    }
  }, [removeIsSuccess, removeData, navigate, courseId]);

  // 3. Handlers
  const fileChangeHandler = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      setMediaProgress(true);
      try {
        const res = await axios.post(`${MEDIA_API}/upload-video`, formData, {
          onUploadProgress: ({ loaded, total }) => {
            setUploadProgress(Math.round((loaded * 100) / total));
          },
        });

        if (res.data.success) {
          setUploadVideoInfo({
            videoUrl: res.data.data.url,
            publicId: res.data.data.public_id,
          });
          setBtnDisable(false);
          toast.success(res.data.message);
        }
      } catch (error) {
        console.error(error);
        toast.error("Video upload failed");
      } finally {
        setMediaProgress(false);
      }
    }
  };

const editLectureHandler = async () => {
  await editLecture({
    lectureId,
    lectureTitle,
    videoInfo: uploadVideInfo, 
    isPreviewFree: isFree,
  });
};

  const removeLectureHandler = async () => {
    await removeLecture(lectureId);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Edit Lecture</CardTitle>
          <CardDescription>
            Make changes and click save when done.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button disabled={removeLoading} variant="destructive" onClick={removeLectureHandler}>
            {removeLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Remove Lecture"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={lectureTitle}
              onChange={(e) => setLectureTitle(e.target.value)}
              type="text"
              placeholder="Ex. Introduction to Javascript"
            />
          </div>
          <div className="my-5">
            <Label>
              Video <span className="text-red-500">*</span>
            </Label>
            <Input
              type="file"
              accept="video/*"
              onChange={fileChangeHandler}
              className="w-fit"
            />
          </div>
          <div className="flex items-center space-x-2 my-5">
            <Switch checked={isFree} onCheckedChange={setIsFree} id="free-mode" />
            <Label htmlFor="free-mode">Is this video FREE</Label>
          </div>

          {mediaProgress && (
            <div className="my-4">
              <Progress value={uploadProgress} />
              <p>{uploadProgress}% uploaded</p>
            </div>
          )}

          <div className="mt-4">
            <Button disabled={editLoading} onClick={editLectureHandler}>
              {editLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Update Lecture"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LectureTab;
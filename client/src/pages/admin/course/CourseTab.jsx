import RichTextEditor from "@/components/RichTextEditor";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useEditCourseMutation,
  useGetCourseByIdQuery,
  usePublishCourseMutation,
  useRemoveCourseMutation,
} from "@/features/api/courseApi";
import { Loader2, Trash2, PlusCircle } from "lucide-react"; // Added icons
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const CourseTab = () => {
  const [input, setInput] = useState({
    courseTitle: "",
    subTitle: "",
    description: "",
    category: "",
    courseLevel: "",
    coursePrice: "",
    courseThumbnail: "",
  });

  const params = useParams();
  const courseId = params.courseId;
  const { data: courseByIdData, isLoading: courseByIdLoading, refetch } = useGetCourseByIdQuery(courseId);
  const [publishCourse] = usePublishCourseMutation();
  const [quizQuestions, setQuizQuestions] = useState([]);

  useEffect(() => {
    if (courseByIdData?.course) {
      const course = courseByIdData?.course;
      setInput({
        courseTitle: course.courseTitle || "",
        subTitle: course.subTitle || "",
        description: course.description || "",
        category: course.category || "",
        courseLevel: course.courseLevel || "",
        coursePrice: course.coursePrice || "",
        courseThumbnail: "",
      });
      // Load existing quiz questions from database into state
      if (course.quiz && Array.isArray(course.quiz)) {
        setQuizQuestions(course.quiz);
      }
    }
  }, [courseByIdData]);

  const [previewThumbnail, setPreviewThumbnail] = useState("");
  const [removeCourse, { isLoading: isRemoving }] = useRemoveCourseMutation();
  const navigate = useNavigate();
  const [editCourse, { data, isLoading, isSuccess, error }] = useEditCourseMutation();

  const addQuestion = () => {
    setQuizQuestions([...quizQuestions, { question: "", options: ["", "", "", ""], correct: 0 }]);
  };

  // NEW: Function to remove a specific question
  const removeQuestion = (index) => {
    const updatedQuestions = quizQuestions.filter((_, i) => i !== index);
    setQuizQuestions(updatedQuestions);
  };

  const changeEventHandler = (e) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  };

  const selectCategory = (value) => setInput({ ...input, category: value });
  const selectCourseLevel = (value) => setInput({ ...input, courseLevel: value });

  const selectThumbnail = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput({ ...input, courseThumbnail: file });
      const fileReader = new FileReader();
      fileReader.onloadend = () => setPreviewThumbnail(fileReader.result);
      fileReader.readAsDataURL(file);
    }
  };

  const updateCourseHandler = async () => {
    const formData = new FormData();
    formData.append("courseTitle", input.courseTitle);
    formData.append("subTitle", input.subTitle);
    formData.append("description", input.description);
    formData.append("category", input.category);
    formData.append("courseLevel", input.courseLevel);
    formData.append("coursePrice", input.coursePrice === "" ? 0 : Number(input.coursePrice));
    
    // Stringify quiz array so it can be sent via FormData
    formData.append("quiz", JSON.stringify(quizQuestions));

    if (input.courseThumbnail instanceof File) {
      formData.append("courseThumbnail", input.courseThumbnail);
    }
    await editCourse({ courseId, formData });
  };

  const publishStatusHandler = async (action) => {
    try {
      const response = await publishCourse({ courseId, query: action });
      if (response.data) {
        refetch();
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to publish or unpublish course");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message || "Course updated successfully.");
      refetch(); // Ensure UI stays synced with DB
    }
    if (error) {
      toast.error(error.data?.message || "Failed to update course");
    }
  }, [isSuccess, error]);

  if (courseByIdLoading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-2xl">Course Information</CardTitle>
          <CardDescription>Update your course details and assessment questions.</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            disabled={!courseByIdData?.course?.lectures?.length}
            variant="outline"
            onClick={() => publishStatusHandler(courseByIdData?.course.isPublished ? "false" : "true")}
          >
            {courseByIdData?.course.isPublished ? "Unpublish" : "Publish"}
          </Button>
          <Button variant="destructive" disabled={isRemoving} onClick={() => {
            if(window.confirm("Delete this course permanently?")) removeCourse(courseId).then(() => navigate("/admin/course"));
          }}>
            {isRemoving ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Basic Info Inputs */}
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Course Title</Label>
            <Input name="courseTitle" value={input.courseTitle} onChange={changeEventHandler} placeholder="MERN Stack Bootcamp" />
          </div>
          <div className="grid gap-2">
            <Label>Subtitle</Label>
            <Input name="subTitle" value={input.subTitle} onChange={changeEventHandler} placeholder="Master full-stack development in 12 weeks" />
          </div>
          <div className="grid gap-2">
            <Label>Description</Label>
            <RichTextEditor input={input} setInput={setInput} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={input.category} onValueChange={selectCategory}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Next JS">Next JS</SelectItem>
                  <SelectItem value="Frontend Development">Frontend</SelectItem>
                  <SelectItem value="Fullstack Development">Fullstack</SelectItem>
                  <SelectItem value="MERN Stack Development">MERN Stack</SelectItem>
                  <SelectItem value="IOT">IOT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Level</Label>
              <Select value={input.courseLevel} onValueChange={selectCourseLevel}>
                <SelectTrigger><SelectValue placeholder="Level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Advance">Advance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Price (INR)</Label>
              <Input type="number" name="coursePrice" value={input.coursePrice} onChange={changeEventHandler} placeholder="499" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Course Thumbnail</Label>
            <Input type="file" onChange={selectThumbnail} accept="image/*" />
            {previewThumbnail && <img src={previewThumbnail} className="w-64 h-auto rounded-md mt-2 border" alt="Preview" />}
          </div>
        </div>

        {/* QUIZ SECTION */}
        <div className="pt-8 border-t space-y-4">
          <div>
            <CardTitle className="text-xl">Course Quiz</CardTitle>
            <CardDescription>Questions will be visible to students after 100% completion.</CardDescription>
          </div>

          {quizQuestions.map((q, qIdx) => (
            <div key={qIdx} className="p-5 border rounded-xl bg-gray-50/50 dark:bg-gray-900/50 space-y-4 relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => removeQuestion(qIdx)}
              >
                <Trash2 size={18} />
              </Button>
              
              <div className="grid gap-2 pr-10">
                <Label className="font-bold">Question {qIdx + 1}</Label>
                <Input 
                  value={q.question} 
                  onChange={(e) => {
                    const newQuestions = [...quizQuestions];
                    newQuestions[qIdx].question = e.target.value;
                    setQuizQuestions(newQuestions);
                  }}
                  placeholder="What does 'M' stand for in MERN?"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">{String.fromCharCode(65 + oIdx)}</span>
                    <Input 
                      placeholder={`Option ${oIdx + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const newQuestions = [...quizQuestions];
                        newQuestions[qIdx].options[oIdx] = e.target.value;
                        setQuizQuestions(newQuestions);
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <Label className="text-sm">Correct Answer:</Label>
                <Select 
                  value={q.correct?.toString()} 
                  onValueChange={(val) => {
                    const newQuestions = [...quizQuestions];
                    newQuestions[qIdx].correct = parseInt(val);
                    setQuizQuestions(newQuestions);
                  }}
                >
                  <SelectTrigger className="w-40 bg-white">
                    <SelectValue placeholder="Select correct" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Option A</SelectItem>
                    <SelectItem value="1">Option B</SelectItem>
                    <SelectItem value="2">Option C</SelectItem>
                    <SelectItem value="3">Option D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" className="w-full border-dashed py-6" onClick={addQuestion}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Question
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 border-t">
          <Button onClick={() => navigate("/admin/course")} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button disabled={isLoading} onClick={updateCourseHandler} className="flex-1 bg-blue-600 hover:bg-blue-700">
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseTab;
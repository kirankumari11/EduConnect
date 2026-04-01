import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  useCompleteCourseMutation,
  useGetCourseProgressQuery,
  useInCompleteCourseMutation,
  useUpdateLectureProgressMutation,
  useSubmitQuizMutation,
} from "@/features/api/courseProgressApi";
import { CheckCircle, CheckCircle2, CirclePlay, Trophy, Star, HelpCircle, FileText, RotateCcw, ChevronLeft } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import CourseReviewSection from "@/components/courseReviewSection";
import { jsPDF } from "jspdf";

const CourseProgress = () => {
  const params = useParams();
  const courseId = params.courseId;
  const BACKEND_URL = "http://localhost:5000";
  const videoRef = useRef(null);

  const { data, isLoading, isError, refetch } = useGetCourseProgressQuery(courseId);

  const [updateLectureProgress] = useUpdateLectureProgressMutation();
  const [completeCourse] = useCompleteCourseMutation();
  const [inCompleteCourse] = useInCompleteCourseMutation();
  const [submitQuiz] = useSubmitQuizMutation();

  const [currentLecture, setCurrentLecture] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Quiz States
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (data?.data?.quizCompleted) {
      setQuizResult({
        percentage: data.data.quizScore,
        persisted: true
      });
    }
  }, [data]);

  if (isLoading) return <p className="p-10 text-center">Loading course progress...</p>;
  if (isError || !data?.data) return <p className="p-10 text-center text-red-500">Failed to load course details.</p>;

  const { courseDetails, progress, completed } = data.data;
  const { courseTitle, lectures = [], quiz = [] } = courseDetails;
  const quizQuestions = quiz;
  
  const initialLecture = currentLecture || (lectures.length > 0 ? lectures[0] : null);
  const completedLecturesCount = progress?.filter(p => p.viewed).length || 0;
  const progressPercentage = lectures.length > 0 ? Math.round((completedLecturesCount / lectures.length) * 100) : 0;

  const isLectureCompleted = (lectureId) => progress?.some((prog) => prog.lectureId === lectureId && prog.viewed);

  const handleVideoProgress = async () => {
    const video = videoRef.current;
    if (!video || isUpdating) return;
    const lectureId = currentLecture?._id || initialLecture?._id;
    if (video.currentTime >= video.duration - 2 && !isLectureCompleted(lectureId)) {
      setIsUpdating(true);
      try {
        await updateLectureProgress({ courseId, lectureId }).unwrap();
        refetch();
        toast.success("Lecture marked as watched!");
      } catch (err) { console.error(err); } finally { setIsUpdating(false); }
    }
  };

  const handleSelectLecture = (lecture) => {
    setCurrentLecture(lecture);
    setIsUpdating(false);
  };

  const getVideoUrl = (url) => {
    if (!url) return "";
    const normalizedPath = url.replace(/\\/g, '/');
    return normalizedPath.startsWith("http") ? normalizedPath : `${BACKEND_URL}${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`;
  };

  const handleAnswerSelect = (questionIdx, optionIdx) => setSelectedAnswers({ ...selectedAnswers, [questionIdx]: optionIdx });

  const handleSubmitQuiz = async () => {
    let scoreCount = 0;
    quizQuestions.forEach((q, idx) => { if (selectedAnswers[idx] === q.correct) scoreCount += 1; });
    const percentage = Math.round((scoreCount / quizQuestions.length) * 100);
    try {
      await submitQuiz({ courseId, score: percentage }).unwrap();
      setQuizResult({ score: scoreCount, total: quizQuestions.length, percentage });
      toast.success("Quiz score saved!");
    } catch (err) { setQuizResult({ score: scoreCount, total: quizQuestions.length, percentage }); }
  };

  const resetQuiz = () => {
    setQuizResult(null);
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);
    setShowQuiz(false);
    setShowReview(false);
  };

   const downloadCertificate = () => {
    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
    });

    const userName = "Kiran Kumari"; // Asli user name Redux state se lein agar available ho
    const instructorName = courseDetails?.creator?.name || userName;
    const courseName = courseTitle;
    const date = new Date().toLocaleDateString();

    // 1. TOP LIGHT BLUE STRIPS (Bina space ke)
    doc.setFillColor(109, 234, 254); // Light blue color (blue-100)
    doc.rect(10, 10, 1, 10, 'F'); 
    doc.rect(14, 10, 1, 10, 'F'); 
    doc.rect(18, 10, 1, 10, 'F'); 
    doc.rect(22, 10, 1, 10, 'F'); 
    doc.rect(26, 10, 1, 10, 'F'); 
    doc.rect(30, 10, 1, 10, 'F');

    // 2. MAIN HEADER (Sample ki tarah color aur align)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(28);
    doc.setTextColor(37, 99, 235); // Blue color (blue-600)
    doc.text("COURSE COMPLETION CERTIFICATE", 150, 18, { align: "center" });

    // 3. TOP RIGHT STRIPS
    doc.setFillColor(109, 234, 254);
    doc.rect(260, 10, 1, 10, 'F');
    doc.rect(264, 10, 1, 10, 'F');
    doc.rect(268, 10, 1, 10, 'F');
    doc.rect(272, 10, 1, 10, 'F');
    doc.rect(276, 10, 1, 10, 'F');
    doc.rect(280, 10, 1, 10, 'F');

    // 4. CERTIFICATE BODY TEXT
    doc.setTextColor(0, 0, 0); 
    doc.setFont("helvetica", "normal");
    doc.setFontSize(18);
    doc.text("The certificate is awarded to", 148, 60, { align: "center" });

    // Learner Name (Bold and Blue)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(32);
    doc.setTextColor(37, 99, 235);
    doc.text(userName, 148, 80, { align: "center" });

    // Course Name (Bold)
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(18);
    doc.text("for successfully completing the course", 148, 105, { align: "center" });
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text(courseName, 148, 125, { align: "center" });

    // Date
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.text(`on ${date}`, 148, 145, { align: "center" });

    // 5. LMSEduconnect Branding (Center bottom)
    doc.setFont("courier", "normal"); // Alag font style platform name ke liye
    doc.setFontSize(22);
    doc.setTextColor(100, 100, 100); // Light gray
    doc.text("Powered by: LMSEduconnect", 148, 165, { align: "center" });

    // --- INSTRUCTOR SIGNATURE SECTION (Bottom Right) ---

    const sigX = 220; // Bottom right start position
    const sigY = 185; // Bottom position

    doc.setTextColor(0, 0, 0); // Black color
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    // Signature Line
    doc.setLineWidth(0.5);
    doc.line(sigX, sigY, sigX + 60, sigY); // Line length 60mm

    // Instructor Details (Aligned with line)
    doc.setFont("helvetica", "bold");
    doc.text(instructorName, sigX + 30, sigY + 6, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Course Instructor", sigX + 30, sigY + 11, { align: "center" });

    // Final Save
    doc.save(`${courseName}_Certificate.pdf`);
    toast.success("Design certificate downloaded!");
};


  return (
    <div className="max-w-7xl mx-auto p-4 pb-20">
      <div className="mb-8 p-6 bg-blue-600 rounded-xl text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-300" />
            <div>
              <h1 className="text-2xl font-bold">{courseTitle}</h1>
              <p className="text-blue-100 text-sm">{progressPercentage}% Course Completed</p>
            </div>
          </div>
          <Button
            onClick={completed ? () => inCompleteCourse(courseId) : () => completeCourse(courseId)}
            className={completed ? "bg-white text-blue-600 hover:bg-gray-100" : "bg-green-500 hover:bg-green-600 text-white"}
          >
            {completed ? <div className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" /> Completed</div> : "Mark as completed"}
          </Button>
        </div>
        <Progress value={progressPercentage} className="h-3 bg-blue-800" />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 md:w-3/5 h-fit rounded-lg shadow-lg p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            {initialLecture?.videoUrl ? (
              <video
                ref={videoRef}
                key={currentLecture?._id || initialLecture?._id}
                src={getVideoUrl(currentLecture?.videoUrl || initialLecture?.videoUrl)}
                controls
                onTimeUpdate={handleVideoProgress}
                className="w-full h-full"
              />
            ) : <div className="w-full h-full flex items-center justify-center text-white">No video available</div>}
          </div>
        </div>

        <div className="flex flex-col w-full md:w-2/5 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800 md:pl-6 pt-4 md:pt-0">
          <h2 className="font-semibold text-xl mb-4">Course Content</h2>
          <div className="flex-1 overflow-y-auto max-h-[70vh] pr-2">
            {lectures.map((lecture) => (
              <Card 
                key={lecture._id} 
                className={`mb-3 hover:cursor-pointer transition-all border ${
                  lecture._id === (currentLecture?._id || initialLecture?._id) 
                  ? "border-blue-500 bg-blue-50 text-blue-900 font-bold shadow-md" 
                  : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-100 dark:border-gray-800"
                }`} 
                onClick={() => handleSelectLecture(lecture)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {isLectureCompleted(lecture._id) ? <CheckCircle2 size={22} className="text-green-500" /> : <CirclePlay size={22} className={lecture._id === (currentLecture?._id || initialLecture?._id) ? "text-blue-600" : "text-gray-400"} />}
                    <CardTitle className="text-sm font-semibold">{lecture.lectureTitle}</CardTitle>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {progressPercentage === 100 && (
        <div className="mt-12 space-y-10">
          <div className="p-8 border-2 border-blue-500 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="text-blue-600 dark:text-blue-400" size={32} />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Final Assessment</h2>
              
              {!showQuiz && !quizResult ? (
                <>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Test your knowledge to earn your certificate.</p>
                  <Button onClick={() => setShowQuiz(true)} size="lg" className="bg-blue-600 hover:bg-blue-700">Start Final Quiz</Button>
                </>
              ) : showQuiz && !quizResult ? (
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg text-left border border-gray-100 dark:border-gray-800">
                   {quizQuestions.length > 0 ? (
                    <div className="space-y-6">
                      <span className="text-sm font-medium text-blue-600 uppercase">Question {currentQuestionIdx + 1} of {quizQuestions.length}</span>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{quizQuestions[currentQuestionIdx]?.question}</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {quizQuestions[currentQuestionIdx].options.map((option, oIdx) => (
                          <button 
                            key={oIdx} 
                            onClick={() => handleAnswerSelect(currentQuestionIdx, oIdx)} 
                            className={`p-4 rounded-lg border text-left transition-all font-semibold ${
                                selectedAnswers[currentQuestionIdx] === oIdx 
                                ? "border-blue-600 bg-blue-100 text-blue-900 ring-2 ring-blue-500" 
                                : "border-gray-200 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-between">
                        <Button variant="outline" disabled={currentQuestionIdx === 0} onClick={() => setCurrentQuestionIdx(prev => prev - 1)}>Previous</Button>
                        {currentQuestionIdx === quizQuestions.length - 1 
                          ? <Button className="bg-green-600" onClick={handleSubmitQuiz} disabled={selectedAnswers[currentQuestionIdx] === undefined}>Submit Quiz</Button>
                          : <Button onClick={() => setCurrentQuestionIdx(prev => prev + 1)} disabled={selectedAnswers[currentQuestionIdx] === undefined}>Next Question</Button>}
                      </div>
                    </div>
                  ) : <p className="text-gray-500 italic">No questions found.</p>}
                </div>
              ) : quizResult && !showReview ? (
                <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-xl border-t-4 border-blue-500">
                  <Trophy className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
                  <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Quiz Results</h2>
                  <p className="text-5xl font-black text-blue-600 mb-4">{quizResult.percentage}%</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button variant="outline" onClick={() => setShowReview(true)}>Review Answers</Button>
                    <Button variant="outline" onClick={resetQuiz}><RotateCcw className="mr-2 h-4" /> Retake</Button>
                    {quizResult.percentage >= 70 && (
                      <Button className="bg-green-600 text-white col-span-2" onClick={downloadCertificate}>
                        <FileText className="mr-2 h-4" /> Download Certificate
                      </Button>
                    )}
                  </div>
                </div>
              ) : quizResult && showReview ? (
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg text-left border border-gray-100 dark:border-gray-800">
                   <div className="flex items-center gap-2 mb-6 cursor-pointer text-blue-600 hover:text-blue-700 transition-colors" onClick={() => setShowReview(false)}>
                      <ChevronLeft size={20} /> <span className="font-bold uppercase text-sm tracking-widest">Back to Results</span>
                   </div>
                   <div className="space-y-6">
                      {quizQuestions.map((q, idx) => (
                        <div key={idx} className={`p-5 rounded-xl border-l-4 shadow-sm ${selectedAnswers[idx] === q.correct ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-red-500 bg-red-50 dark:bg-red-950/20"}`}>
                           <p className="font-bold text-gray-900 dark:text-white mb-3">{idx + 1}. {q.question}</p>
                           <div className="space-y-1">
                             <p className={`${selectedAnswers[idx] === q.correct ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"} font-semibold`}>
                               Your Answer: <span className="underline">{q.options[selectedAnswers[idx]] || "Not Answered"}</span>
                             </p>
                             {selectedAnswers[idx] !== q.correct && (
                               <p className="text-green-800 dark:text-green-300 font-bold">
                                 Correct Answer: {q.options[q.correct]}
                               </p>
                             )}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              ) : null}
            </div>
          </div>
          <CourseReviewSection courseId={courseId} purchased={true} reviews={courseDetails.reviews || []} />
        </div>
      )}
    </div>
  );
};

export default CourseProgress;

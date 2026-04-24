import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/axios";
import { FiCheck, FiPlay, FiLock, FiAward, FiArrowLeft } from "react-icons/fi";

const LearnCourse = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [certificateEarned, setCertificateEarned] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [courseRes, lessonsRes, enrollRes] = await Promise.all([
        API.get(`/courses/${id}`),
        API.get(`/lessons/course/${id}`),
        API.get("/enrollments/my-courses"),
      ]);

      setCourse(courseRes.data);
      setLessons(lessonsRes.data);

      const enrollment = enrollRes.data.find((e) => e.courseId === parseInt(id));
      if (enrollment) {
        const completed = JSON.parse(enrollment.completedLessons || "[]");
        setCompletedLessons(completed);
        setProgress(parseFloat(enrollment.progress));
        setCertificateEarned(enrollment.isCompleted);
      }

      if (lessonsRes.data.length > 0) {
        setActiveLesson(lessonsRes.data[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async () => {
    try {
      const { data } = await API.put("/enrollments/complete-lesson", {
        courseId: parseInt(id),
        lessonId: activeLesson.id,
      });

      setCompletedLessons((prev) => [...prev, activeLesson.id]);
      setProgress(parseFloat(data.enrollment.progress));
      setCertificateEarned(data.enrollment.isCompleted);

      // Auto move to next lesson
      const currentIndex = lessons.findIndex((l) => l.id === activeLesson.id);
      if (currentIndex < lessons.length - 1) {
        setActiveLesson(lessons[currentIndex + 1]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleGetCertificate = async () => {
    try {
      const { data } = await API.post(`/certificates/${id}`);
      alert(`Certificate earned for "${data.courseName}"! +50 XP`);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to generate certificate");
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!course) return <div className="text-center py-10">Course not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to={`/courses/${id}`} className="text-gray-500 hover:text-indigo-600">
            <FiArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">{course.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            {Math.round(progress)}% complete
          </div>
          <div className="w-40 bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          {certificateEarned && (
            <button
              onClick={handleGetCertificate}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
            >
              <FiAward /> Get Certificate
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Video & Content */}
        <div className="lg:col-span-3">
          {activeLesson && (
            <>
              {/* Video */}
              {activeLesson.videoUrl && getYouTubeEmbedUrl(activeLesson.videoUrl) && (
                <div className="bg-black rounded-xl overflow-hidden mb-6 aspect-video">
                  <iframe
                    src={getYouTubeEmbedUrl(activeLesson.videoUrl)}
                    title={activeLesson.title}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              )}

              {/* Lesson Info */}
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">{activeLesson.title}</h2>
                  {!completedLessons.includes(activeLesson.id) ? (
                    <button
                      onClick={handleCompleteLesson}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      <FiCheck /> Mark Complete
                    </button>
                  ) : (
                    <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-600 rounded-lg">
                      <FiCheck /> Completed
                    </span>
                  )}
                </div>
                {activeLesson.duration > 0 && (
                  <p className="text-sm text-gray-400 mb-4">{activeLesson.duration} min</p>
                )}
                <div className="text-gray-600 whitespace-pre-line leading-relaxed">
                  {activeLesson.content}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sidebar - Lesson List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-20">
            <div className="p-4 bg-indigo-600 text-white">
              <h3 className="font-bold">Course Content</h3>
              <p className="text-sm text-indigo-200">{lessons.length} lessons</p>
            </div>
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
              {lessons.map((lesson, i) => {
                const isCompleted = completedLessons.includes(lesson.id);
                const isActive = activeLesson?.id === lesson.id;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full text-left p-3 flex items-center gap-3 border-b hover:bg-gray-50 transition ${
                      isActive ? "bg-indigo-50 border-l-4 border-l-indigo-600" : ""
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {isCompleted ? <FiCheck /> : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${isActive ? "font-semibold text-indigo-600" : "text-gray-700"}`}>
                        {lesson.title}
                      </p>
                      {lesson.duration > 0 && (
                        <p className="text-xs text-gray-400">{lesson.duration} min</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnCourse;

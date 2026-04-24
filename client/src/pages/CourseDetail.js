import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { FiStar, FiUsers, FiPlay, FiBookmark } from "react-icons/fi";

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const { data } = await API.get(`/courses/${id}`);
      setCourse(data);
      if (user) {
        try {
          const { data: enrollments } = await API.get("/enrollments/my-courses");
          setEnrolled(enrollments.some((e) => e.courseId === parseInt(id)));
        } catch {}
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      await API.post(`/enrollments/${id}`);
      setEnrolled(true);
    } catch (error) {
      alert(error.response?.data?.message || "Enrollment failed");
    }
  };

  const handleBookmark = async () => {
    try {
      await API.post(`/bookmarks/${id}`);
      alert("Bookmark toggled!");
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!course) return <div className="text-center py-10">Course not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-8 mb-8">
        <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">{course.category}</span>
        <h1 className="text-3xl font-bold mt-3">{course.title}</h1>
        <p className="mt-2 text-indigo-100">by {course.instructor?.name}</p>
        <div className="flex items-center gap-6 mt-4">
          <span className="flex items-center gap-1"><FiStar /> {course.rating}</span>
          <span className="flex items-center gap-1"><FiUsers /> {course.totalStudents} students</span>
          <span className="capitalize">{course.level}</span>
        </div>
        <div className="flex gap-3 mt-6">
          {user && !enrolled && (
            <button onClick={handleEnroll} className="px-6 py-2 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100">
              Enroll Now {course.price > 0 ? `- $${course.price}` : "- Free"}
            </button>
          )}
          {enrolled && (
            <Link to={`/learn/${id}`} className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-green-600">
              <FiPlay /> Start Learning
            </Link>
          )}
          {user && (
            <button onClick={handleBookmark} className="px-4 py-2 border border-white text-white rounded-lg hover:bg-white hover:text-indigo-600">
              <FiBookmark />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Description */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">About this course</h2>
          <p className="text-gray-600 whitespace-pre-line">{course.description}</p>

          {/* Lessons */}
          <h2 className="text-xl font-bold mt-8 mb-4">Lessons ({course.lessons?.length || 0})</h2>
          <div className="space-y-2">
            {course.lessons?.map((lesson, i) => (
              <div key={lesson.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold text-sm">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <h3 className="font-medium">{lesson.title}</h3>
                  {lesson.duration > 0 && <span className="text-sm text-gray-400">{lesson.duration} min</span>}
                </div>
                {lesson.videoUrl && <FiPlay className="text-gray-400" />}
              </div>
            ))}
          </div>

          {/* Reviews */}
          <h2 className="text-xl font-bold mt-8 mb-4">Reviews</h2>
          {course.reviews?.length === 0 ? (
            <p className="text-gray-500">No reviews yet</p>
          ) : (
            <div className="space-y-4">
              {course.reviews?.map((review) => (
                <div key={review.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{review.User?.name}</span>
                    <span className="text-yellow-500 flex items-center gap-1">
                      <FiStar /> {review.rating}
                    </span>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <div className="bg-white p-6 rounded-xl shadow-md sticky top-24">
            <h3 className="font-bold text-lg mb-4">Instructor</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                {course.instructor?.name?.charAt(0)}
              </div>
              <div>
                <p className="font-semibold">{course.instructor?.name}</p>
                <p className="text-sm text-gray-500">{course.instructor?.bio || "Instructor"}</p>
              </div>
            </div>
            <div className="border-t pt-4 mt-4">
              <p className="text-sm text-gray-500">Level: <span className="capitalize font-medium">{course.level}</span></p>
              <p className="text-sm text-gray-500 mt-1">Lessons: <span className="font-medium">{course.lessons?.length || 0}</span></p>
              <p className="text-sm text-gray-500 mt-1">Students: <span className="font-medium">{course.totalStudents}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;

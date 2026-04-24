import { Link } from "react-router-dom";
import { FiStar, FiUsers, FiBookOpen } from "react-icons/fi";

const SERVER_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

const CourseCard = ({ course }) => {
  return (
    <Link to={`/courses/${course.id}`} className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden">
      <div className="h-40 bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
        {course.thumbnail ? (
          <img src={`${SERVER_URL}${course.thumbnail}`} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <FiBookOpen size={48} className="text-white" />
        )}
      </div>
      <div className="p-4">
        <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">{course.category}</span>
        <h3 className="font-semibold text-lg mt-2 text-gray-800 line-clamp-2">{course.title}</h3>
        <p className="text-sm text-gray-500 mt-1">by {course.instructor?.name || "Unknown"}</p>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1 text-yellow-500">
            <FiStar /> <span className="text-sm">{course.rating || "0.0"}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <FiUsers /> <span className="text-sm">{course.totalStudents}</span>
          </div>
          <span className="text-sm font-semibold text-indigo-600">
            {course.price > 0 ? `$${course.price}` : "Free"}
          </span>
        </div>
        <span className="text-xs text-gray-400 mt-2 block capitalize">{course.level}</span>
      </div>
    </Link>
  );
};

export default CourseCard;

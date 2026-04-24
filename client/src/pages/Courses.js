import { useState, useEffect } from "react";
import API from "../api/axios";
import CourseCard from "../components/CourseCard";
import { FiSearch } from "react-icons/fi";

const categories = ["All", "Web Development", "Data Science", "AI & ML", "Mobile Development", "DevOps", "Design"];

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, [category]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category !== "All") params.category = category;
      if (search) params.search = search;
      const { data } = await API.get("/courses", { params });
      setCourses(data.courses);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Explore Courses</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search courses..."
          />
        </div>
        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Search
        </button>
      </form>

      {/* Categories */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              category === cat ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading courses...</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No courses found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;

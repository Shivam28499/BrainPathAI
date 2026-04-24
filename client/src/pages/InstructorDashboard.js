import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { FiPlus, FiBookOpen, FiUsers, FiEdit } from "react-icons/fi";

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "Web Development", level: "beginner", price: 0 });
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await API.get("/courses/instructor/my-courses");
      setCourses(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post("/courses", form);
      setShowForm(false);
      setForm({ title: "", description: "", category: "Web Development", level: "beginner", price: 0 });
      fetchCourses();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create course");
    }
  };

  const generateDescription = async () => {
    if (!form.title) return alert("Enter a title first");
    setAiLoading(true);
    try {
      const { data } = await API.post("/ai/generate-description", {
        title: form.title, category: form.category, level: form.level,
      });
      setForm({ ...form, description: data.description });
    } catch (error) {
      alert("AI generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Instructor Dashboard</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <FiPlus /> New Course
        </button>
      </div>

      {/* Create Course Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4">Create New Course</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <input
              type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg" placeholder="Course Title" required
            />
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <button
                  type="button" onClick={generateDescription} disabled={aiLoading}
                  className="text-sm text-indigo-600 hover:underline disabled:opacity-50"
                >
                  {aiLoading ? "Generating..." : "Generate with AI"}
                </button>
              </div>
              <textarea
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg" rows={4} placeholder="Course description" required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-4 py-2 border rounded-lg">
                <option>Web Development</option>
                <option>Data Science</option>
                <option>AI & ML</option>
                <option>Mobile Development</option>
                <option>DevOps</option>
                <option>Design</option>
              </select>
              <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="px-4 py-2 border rounded-lg">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <input
                type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="px-4 py-2 border rounded-lg" placeholder="Price (0 = free)"
              />
            </div>
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Create Course
            </button>
          </form>
        </div>
      )}

      {/* My Courses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-start mb-3">
              <span className={`text-xs px-2 py-1 rounded-full ${
                course.status === "approved" ? "bg-green-100 text-green-600" :
                course.status === "pending" ? "bg-yellow-100 text-yellow-600" : "bg-red-100 text-red-600"
              }`}>
                {course.status}
              </span>
              <Link to={`/courses/${course.id}`}><FiEdit className="text-gray-400 hover:text-indigo-600" /></Link>
            </div>
            <h3 className="font-bold text-lg">{course.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{course.category}</p>
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
              <span className="flex items-center gap-1"><FiUsers /> {course.Enrollments?.length || 0}</span>
              <span className="flex items-center gap-1"><FiBookOpen /> {course.level}</span>
            </div>
          </div>
        ))}
        {courses.length === 0 && (
          <p className="text-gray-400 col-span-3 text-center py-10">No courses yet. Create your first course!</p>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;

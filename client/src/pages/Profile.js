import { useState, useEffect } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { FiUser, FiBookOpen, FiAward, FiTrendingUp } from "react-icons/fi";

const Profile = () => {
  const { user, dispatch } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [skills, setSkills] = useState(user?.skills || "");
  const [enrollments, setEnrollments] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const { data } = await API.get("/enrollments/my-courses");
      setEnrollments(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.put("/profile", { name, bio, skills });
      dispatch({ type: "UPDATE_USER", payload: data });
      setMessage("Profile updated!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Update failed");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stats */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-2xl font-bold mx-auto mb-4">
              {user?.name?.charAt(0)}
            </div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-gray-500 capitalize">{user?.role}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-md text-center">
              <FiAward className="mx-auto text-indigo-600 mb-2" size={24} />
              <p className="text-2xl font-bold text-indigo-600">{user?.xpPoints || 0}</p>
              <p className="text-xs text-gray-500">XP Points</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md text-center">
              <FiTrendingUp className="mx-auto text-green-500 mb-2" size={24} />
              <p className="text-2xl font-bold text-green-500">{user?.streak || 0}</p>
              <p className="text-xs text-gray-500">Day Streak</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-md text-center">
            <FiBookOpen className="mx-auto text-purple-500 mb-2" size={24} />
            <p className="text-2xl font-bold text-purple-500">{enrollments.length}</p>
            <p className="text-xs text-gray-500">Enrolled Courses</p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            {message && <div className="bg-green-100 text-green-600 p-3 rounded-lg mb-4">{message}</div>}
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Tell us about yourself"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                <input
                  type="text" value={skills} onChange={(e) => setSkills(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="React, Node.js, Python..."
                />
              </div>
              <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Save Changes
              </button>
            </form>
          </div>

          {/* My Courses */}
          <div className="bg-white p-6 rounded-xl shadow-md mt-6">
            <h2 className="text-xl font-bold mb-4">My Courses</h2>
            {enrollments.length === 0 ? (
              <p className="text-gray-400">No courses enrolled yet</p>
            ) : (
              <div className="space-y-3">
                {enrollments.map((e) => (
                  <div key={e.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{e.Course?.title}</p>
                      <p className="text-sm text-gray-400">by {e.Course?.instructor?.name}</p>
                    </div>
                    <div className="text-right">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${e.progress}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{Math.round(e.progress)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

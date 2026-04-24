import { useState, useEffect } from "react";
import API from "../api/axios";
import { FiUsers, FiBookOpen, FiCheckCircle, FiClock } from "react-icons/fi";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [pendingCourses, setPendingCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, pendingRes, usersRes] = await Promise.all([
        API.get("/admin/stats"),
        API.get("/admin/courses/pending"),
        API.get("/admin/users"),
      ]);
      setStats(statsRes.data);
      setPendingCourses(pendingRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleApprove = async (courseId, status) => {
    try {
      await API.put(`/admin/courses/${courseId}/approve`, { status });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <FiUsers className="mx-auto text-indigo-600 mb-2" size={28} />
          <p className="text-3xl font-bold">{stats.totalUsers || 0}</p>
          <p className="text-sm text-gray-500">Total Users</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <FiBookOpen className="mx-auto text-green-500 mb-2" size={28} />
          <p className="text-3xl font-bold">{stats.approvedCourses || 0}</p>
          <p className="text-sm text-gray-500">Active Courses</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <FiClock className="mx-auto text-yellow-500 mb-2" size={28} />
          <p className="text-3xl font-bold">{stats.pendingCourses || 0}</p>
          <p className="text-sm text-gray-500">Pending Courses</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <FiCheckCircle className="mx-auto text-purple-500 mb-2" size={28} />
          <p className="text-3xl font-bold">{stats.totalEnrollments || 0}</p>
          <p className="text-sm text-gray-500">Total Enrollments</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button onClick={() => setTab("overview")} className={`px-4 py-2 rounded-lg ${tab === "overview" ? "bg-indigo-600 text-white" : "bg-gray-100"}`}>
          Pending Courses
        </button>
        <button onClick={() => setTab("users")} className={`px-4 py-2 rounded-lg ${tab === "users" ? "bg-indigo-600 text-white" : "bg-gray-100"}`}>
          All Users
        </button>
      </div>

      {/* Pending Courses */}
      {tab === "overview" && (
        <div className="space-y-4">
          {pendingCourses.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No pending courses</p>
          ) : (
            pendingCourses.map((course) => (
              <div key={course.id} className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{course.title}</h3>
                  <p className="text-sm text-gray-500">by {course.instructor?.name} | {course.category}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(course.id, "approved")} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                    Approve
                  </button>
                  <button onClick={() => handleApprove(course.id, "rejected")} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Users */}
      {tab === "users" && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Email</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Role</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">XP</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-4">{u.name}</td>
                  <td className="p-4 text-gray-500">{u.email}</td>
                  <td className="p-4 capitalize">{u.role}</td>
                  <td className="p-4">{u.xpPoints}</td>
                  <td className="p-4">
                    {u.role !== "admin" && (
                      <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:underline text-sm">
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

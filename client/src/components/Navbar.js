import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiBook, FiLogOut, FiUser, FiHome, FiAward, FiMessageSquare, FiBookOpen, FiFileText } from "react-icons/fi";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          BrainPath AI
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-1 text-gray-600 hover:text-indigo-600">
            <FiHome /> Home
          </Link>
          <Link to="/courses" className="flex items-center gap-1 text-gray-600 hover:text-indigo-600">
            <FiBook /> Courses
          </Link>

          {user ? (
            <>
              <Link to="/ai-tutor" className="flex items-center gap-1 text-gray-600 hover:text-indigo-600">
                <FiMessageSquare /> AI Tutor
              </Link>
              <Link to="/documents" className="flex items-center gap-1 text-gray-600 hover:text-indigo-600">
                <FiFileText /> Chat with PDF
              </Link>
              <Link to="/leaderboard" className="flex items-center gap-1 text-gray-600 hover:text-indigo-600">
                <FiAward /> Leaderboard
              </Link>
              <Link to="/certificates" className="flex items-center gap-1 text-gray-600 hover:text-indigo-600">
                <FiBookOpen /> Certificates
              </Link>

              {user.role === "instructor" && (
                <Link to="/instructor/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium">
                  Instructor Panel
                </Link>
              )}
              {user.role === "admin" && (
                <Link to="/admin/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium">
                  Admin Panel
                </Link>
              )}

              <div className="flex items-center gap-3">
                <span className="text-sm text-indigo-600 font-semibold">{user.xpPoints || 0} XP</span>
                <Link to="/profile" className="text-gray-600 hover:text-indigo-600">
                  <FiUser size={20} />
                </Link>
                <button onClick={handleLogout} className="text-gray-600 hover:text-red-500">
                  <FiLogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50">
                Login
              </Link>
              <Link to="/register" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

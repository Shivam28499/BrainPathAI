import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import LearnCourse from "./pages/LearnCourse";
import AITutor from "./pages/AITutor";
import Documents from "./pages/Documents";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import MyCertificates from "./pages/MyCertificates";
import InstructorDashboard from "./pages/InstructorDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/learn/:id" element={<ProtectedRoute><LearnCourse /></ProtectedRoute>} />
            <Route path="/ai-tutor" element={<ProtectedRoute><AITutor /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/certificates" element={<ProtectedRoute><MyCertificates /></ProtectedRoute>} />
            <Route path="/instructor/dashboard" element={<ProtectedRoute roles={["instructor"]}><InstructorDashboard /></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

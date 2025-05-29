import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { getUserRole, clearToken } from "./services/auth";

import AuthLogin from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import ForgotPassword from "./components/Auth/ForgotPassword";
import Home from "./components/Home/Home";

import InstructorDashboard from "./components/Instructor/Dashboard";
import UploadCourse from "./components/Instructor/UploadCourse";
import UploadAssessment from "./components/Instructor/UploadAssessment";
import InstructorCoursesList from "./components/Instructor/CoursesList";
import InstructorAssessments from "./components/Instructor/InstructorAssessments";
import ViewStudentResults from "./components/Instructor/ViewStudentResults";

import StudentDashboard from "./components/Student/Dashboard";
import StudentAssessmentPage from "./components/Student/StudentAssessmentPage";
import ViewResults from "./components/Student/ViewResults";
import TakeAssessment from "./components/Student/TakeAssessment";
import StudentCourseList from "./components/Student/CourseList";

import Navbar from "./components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";

// ✅ PrivateRoute outside component
const PrivateRoute = ({ children, role }) => {
  const userRole = getUserRole();
  const isLoggedIn = !!userRole;

  if (!isLoggedIn) return <Navigate to="/login" />;
  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!allowed.includes(userRole)) {
      return <Navigate to="/login" />;
    }
  }

  return children;
};

function App() {
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const role = getUserRole();
    const id = localStorage.getItem("userId");

    if (role) {
      setUserRole(role);
      setUserId(id);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
      setUserId(null);

      if (!["/", "/login", "/register", "/forgot-password"].includes(location.pathname)) {
        navigate("/login");
      }
    }
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    clearToken();
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    setUserRole(null);
    setUserId(null);
    navigate("/login");
  };

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              userRole === "Instructor" ? (
                <Navigate to="/instructor" />
              ) : (
                <Navigate to="/student" />
              )
            ) : (
              <AuthLogin
                onLogin={(role) => {
                  setUserRole(role);
                  setIsLoggedIn(true);
                  const id = localStorage.getItem("userId");
                  setUserId(id);
                }}
              />
            )
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Instructor Routes */}
        <Route
          path="/instructor"
          element={
            <PrivateRoute role="Instructor">
              <InstructorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/instructor/upload-course"
          element={
            <PrivateRoute role="Instructor">
              <UploadCourse />
            </PrivateRoute>
          }
        />
        <Route
          path="/instructor/upload-assessment"
          element={
            <PrivateRoute role="Instructor">
              <UploadAssessment />
            </PrivateRoute>
          }
        />
        <Route
          path="/instructor/instructor-assessment-list"
          element={
            <PrivateRoute role="Instructor">
              <InstructorAssessments instructorId={userId} />
            </PrivateRoute>
          }
        />

        {/* Instructor-only Courses View */}
        <Route
          path="/instructor/courses-list"
          element={
            <PrivateRoute role="Instructor">
              <InstructorCoursesList />
            </PrivateRoute>
          }
        />

        <Route
          path="/instructor/view-results"
          element={
            <PrivateRoute role="Instructor">
              <ViewStudentResults />
            </PrivateRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <PrivateRoute role="Student">
              <StudentDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/student/assessments-list"
          element={
            <PrivateRoute role="Student">
              <StudentAssessmentPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/student/results"
          element={
            <PrivateRoute role="Student">
              <ViewResults userId={userId} />
            </PrivateRoute>
          }
        />
        <Route
          path="/student/take-assessment/:id"
          element={
            <PrivateRoute role="Student">
              <TakeAssessment userId={userId} />
            </PrivateRoute>
          }
        />        

        {/* Student-only Courses View */}
        <Route
          path="/student/courses-list"
          element={
            <PrivateRoute role="Student">
              <StudentCourseList />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;

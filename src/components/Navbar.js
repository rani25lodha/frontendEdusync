import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getUserRole } from "../services/auth";

function Navbar({ isLoggedIn, handleLogout }) {
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState("");
  const location = useLocation();

  useEffect(() => {
    if (isLoggedIn) {
      const storedUsername = localStorage.getItem("username");
      const role = getUserRole();
      setUsername(storedUsername);
      setUserRole(role);
    } else {
      setUsername("");
      setUserRole("");
    }
  }, [isLoggedIn]);

  const getNavLinks = () => {
    if (userRole === "Student") {
      return [
        { to: "/student", text: "Dashboard", icon: "bi-house" },
        { to: "/student/assessments-list", text: "Assessments", icon: "bi-pencil-square" },
        { to: "/student/courses-list", text: "Courses", icon: "bi-journal-text" },
        { to: "/student/results", text: "Results", icon: "bi-graph-up" },
      ];
    } else if (userRole === "Instructor") {
      return [
        { to: "/instructor", text: "Dashboard", icon: "bi-house" },
        { to: "/instructor/upload-course", text: "Upload Course", icon: "bi-cloud-upload" },
        { to: "/instructor/upload-assessment", text: "Upload Assessment", icon: "bi-file-earmark-plus" },
        { to: "/instructor/courses-list", text: "Courses", icon: "bi-journal-text" },
        { to: "/instructor/instructor-assessment-list", text: "Assessments", icon: "bi-list-check" },
      ];
    }
    return [];
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <i className="bi bi-book"></i>
          EduSync
        </Link>

        {isLoggedIn ? (
          <>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                {getNavLinks().map((link) => (
                  <li className="nav-item" key={link.to}>
                    <Link
                      className={`nav-link d-flex align-items-center gap-2 ${
                        location.pathname === link.to ? "active" : ""
                      }`}
                      to={link.to}
                    >
                      <i className={`bi ${link.icon}`}></i>
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="d-flex align-items-center gap-3">
                <span className="text-white d-flex align-items-center gap-2">
                  <i className="bi bi-person-circle"></i>
                  {username}
                </span>
                <button
                  className="btn btn-outline-light d-flex align-items-center gap-2"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right"></i>
                  Logout
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="d-flex gap-3">
            <Link to="/login" className="btn btn-outline-light">
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Login
            </Link>
            <Link to="/register" className="btn btn-light">
              <i className="bi bi-person-plus me-2"></i>
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

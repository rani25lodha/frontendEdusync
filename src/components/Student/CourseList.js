import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { API_CONFIG } from '../../config/api.config';

const CourseList = ({ onSelectCourse }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get(API_CONFIG.ENDPOINTS.COURSES.BASE);
        console.log("📘 Fetched courses:", res.data);
        setCourses(res.data);
      } catch (err) {
        console.error(
          "❌ Error fetching courses:",
          err.response?.data || err.message
        );
        setError("Failed to load courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Function to convert text to PascalCase
  const toPascalCase = (text) => {
    if (!text) return "";
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="d-flex justify-content-center mt-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  if (error) return <div className="alert alert-danger mt-5">{error}</div>;
  if (filteredCourses.length === 0 && !loading)
    return <div className="alert alert-info mt-5">No Courses Found</div>;

  return (
    <div className="container py-5">
      <style>
        {`
          .pascal-case {
            text-transform: capitalize;
          }
          .course-title {
            font-size: 1.1rem;
            font-weight: 600;
          }
        `}
      </style>

      <div className="text-center mb-5">
        <h1 className="text-primary fw-bold">Choose A Course</h1>
        <p className="lead text-muted">Select a Course to view the material</p>
      </div>

      <div className="row justify-content-center mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text bg-white">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search Courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="row g-4">
        {filteredCourses.map((course) => (
          <div key={course.courseId} className="col-lg-4 col-md-6">
            <div
              className={`card h-100 border-0 shadow-sm transition-all hover-shadow${
                onSelectCourse ? " clickable" : ""
              }`}
              onClick={() => onSelectCourse && onSelectCourse(course)}
            >
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                    <i className="bi bi-book text-primary fs-4"></i>
                  </div>
                  <h5 className="card-title mb-0 text-dark course-title pascal-case">
                    {toPascalCase(course.title)}
                  </h5>
                </div>
                <p className="card-text text-muted mb-4 pascal-case">
                  {toPascalCase(course.description) || "No Description Provided"}
                </p>
                {course.mediaUrl && (
                  <a
                    href={course.mediaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline-primary d-inline-flex align-items-center"
                  >
                    <i className="bi bi-play-circle me-2"></i>
                    View Media
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseList;
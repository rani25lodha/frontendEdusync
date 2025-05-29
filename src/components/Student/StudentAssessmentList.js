import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";

const toPascalCase = (text) =>
  text
    .replace(/[^a-zA-Z0-9 ]/g, "") // remove symbols
    .replace(/\w+/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());

const StudentAssessmentList = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [assessments, setAssessments] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/CourseTables");
        setCourses(res.data);
        setFilteredCourses(res.data);
      } catch {
        alert("Failed to load courses.");
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    const fetchAssessments = async () => {
      try {
        const res = await api.get("/AssessmentTables");
        const filtered = res.data.filter(
          (a) => a.courseId === selectedCourse.courseId
        );
        setAssessments(filtered);
      } catch {
        alert("Failed to load assessments.");
      }
    };
    fetchAssessments();
  }, [selectedCourse]);

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    setFilteredCourses(
      courses.filter((c) => c.title.toLowerCase().includes(lower))
    );
  }, [searchTerm, courses]);

  return (
    <div className="container py-4">
      <h3 className="text-center mb-4 fw-bold text-primary">
        Choose a Course to View Assessments
      </h3>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="input-group">
          <span className="input-group-text">🔍</span>
          <input
            type="text"
            className="form-control"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="row">
        {/* Courses List */}
        <div className="col-md-5 mb-4">
          <div className="list-group shadow-sm">
            {filteredCourses.map((course) => (
              <button
                key={course.courseId}
                className={`list-group-item list-group-item-action ${
                  selectedCourse?.courseId === course.courseId ? "active" : ""
                }`}
                onClick={() => setSelectedCourse(course)}
              >
                {toPascalCase(course.title)}
              </button>
            ))}
          </div>
        </div>

        {/* Assessments Display */}
        <div className="col-md-7">
          {selectedCourse ? (
            <>
              <h5 className="mb-3">
                Assessments for{" "}
                <span className="text-primary">
                  {toPascalCase(selectedCourse.title)}
                </span>
              </h5>
              {assessments.length > 0 ? (
                <div className="row">
                  {assessments.map((assessment) => (
                    <div className="col-12 mb-3" key={assessment.assessmentId}>
                      <div className="card shadow-sm border-0">
                        <div className="card-body d-flex justify-content-between align-items-center">
                          <h6 className="mb-0">
                            {toPascalCase(assessment.title)}
                          </h6>
                          <Link
                            to={`/student/take-assessment/${assessment.assessmentId}`}
                            className="btn btn-sm btn-outline-success"
                          >
                            Take
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">
                  No assessments available for this course.
                </p>
              )}
            </>
          ) : (
            <p className="text-muted">Select a course to view assessments.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAssessmentList;

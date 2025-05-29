import React, { useEffect, useState } from "react";
import api from "../../services/api";

const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (
      payload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] || null
    );
  } catch (e) {
    console.error("Token decode failed:", e);
    return null;
  }
};

const toPascalCase = (text) => {
  if (!text) return "";
  return text
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/\w+/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .trim();
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getScoreColor = (score, maxScore) => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) return "text-success";
  if (percentage >= 60) return "text-warning";
  return "text-danger";
};

const ViewResults = () => {
  const [results, setResults] = useState([]);
  const [assessments, setAssessments] = useState({});
  const [courses, setCourses] = useState({});
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUserId(getUserIdFromToken());
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      setLoading(true);

      try {
        const [resultsRes, assessmentsRes, coursesRes] = await Promise.all([
          api.get("/ResultTables"),
          api.get("/AssessmentTables"),
          api.get("/CourseTables"),
        ]);

        const userResults = resultsRes.data.filter(
          (r) => String(r.userId) === String(userId)
        );

        const assessmentMap = {};
        assessmentsRes.data.forEach((a) => (assessmentMap[a.assessmentId] = a));

        const courseMap = {};
        coursesRes.data.forEach((c) => (courseMap[c.courseId] = c));

        setResults(userResults);
        setAssessments(assessmentMap);
        setCourses(courseMap);
      } catch (err) {
        console.error("Data fetch failed:", err);
        alert("Failed to load results.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div
        className="container mt-4 d-flex justify-content-center align-items-center"
        style={{ height: "50vh" }}
      >
        <div className="spinner-border text-primary" role="status" />
        <span className="ms-3">Loading your results...</span>
      </div>
    );
  }

  const totalPoints = results.reduce((sum, r) => sum + r.score, 0);
  const possiblePoints = results.reduce((sum, r) => {
    const a = assessments[r.assessmentId];
    return sum + (a ? a.maxScore : 0);
  }, 0);
  const average =
    possiblePoints > 0 ? Math.round((totalPoints / possiblePoints) * 100) : 0;

  return (
    <div className="container mt-4">
      <div className="text-center mb-5">
        <h2 className="fw-bold text-primary">Your Assessment Results</h2>
        <p className="text-muted">
          Track your performance across all assessments
        </p>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-4">
            <div
              className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center"
              style={{ width: "100px", height: "100px" }}
            >
              <i className="fas fa-clipboard-list fa-3x text-muted"></i>
            </div>
          </div>
          <h4 className="text-muted mb-3">No Results Found</h4>
          <p className="text-muted">
            You haven't taken any assessments yet. Start learning today!
          </p>
          <button
            className="btn btn-primary mt-3"
            onClick={() => (window.location.href = "/student/assessments")}
          >
            <i className="fas fa-play me-2"></i> Take Your First Assessment
          </button>
        </div>
      ) : (
        <>
          <div className="row">
            {results.map((result) => {
              const assessment = assessments[result.assessmentId];
              const course = assessment ? courses[assessment.courseId] : null;
              const maxScore = assessment ? assessment.maxScore : 0;
              const percentage = maxScore
                ? Math.round((result.score / maxScore) * 100)
                : 0;

              return (
                <div key={result.resultId} className="col-md-6 col-lg-4 mb-4">
                  <div className="card h-100 shadow-sm border-0">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="text-primary fw-bold mb-0">
                          {toPascalCase(
                            assessment
                              ? assessment.title
                              : `Assessment ${result.assessmentId}`
                          )}
                        </h5>
                        <span
                          className={`badge ${
                            percentage >= 80
                              ? "bg-success"
                              : percentage >= 60
                              ? "bg-warning"
                              : "bg-danger"
                          }`}
                        >
                          {percentage}%
                        </span>
                      </div>

                      {course && (
                        <div className="mb-3">
                          <span className="badge bg-light text-dark">
                            <i className="fas fa-book me-1"></i>{" "}
                            {toPascalCase(course.title)}
                          </span>
                        </div>
                      )}

                      <div className="mb-3">
                        <div className="d-flex justify-content-between small text-muted">
                          <span>Score:</span>
                          <strong
                            className={`fs-5 ${getScoreColor(
                              result.score,
                              maxScore
                            )}`}
                          >
                            {result.score}/{maxScore}
                          </strong>
                        </div>
                        <div
                          className="progress mt-2"
                          style={{ height: "10px" }}
                        >
                          <div
                            className={`progress-bar ${
                              percentage >= 80
                                ? "bg-success"
                                : percentage >= 60
                                ? "bg-warning"
                                : "bg-danger"
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <small className="text-muted">
                        <i className="fas fa-clock me-1"></i>Completed:{" "}
                        {formatDate(result.attemptDate)}
                      </small>
                    </div>

                    <div className="card-footer bg-transparent border-0 text-muted small">
                      <i className="fas fa-trophy me-1"></i>
                      {percentage >= 90
                        ? "Excellent!"
                        : percentage >= 80
                        ? "Great Job!"
                        : percentage >= 70
                        ? "Good Work!"
                        : percentage >= 60
                        ? "Keep Improving!"
                        : "Need More Practice"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mt-5">
            <div className="card border-0 shadow-sm">
              <div
                className="card-body text-white"
                style={{
                  backgroundColor: "#007bff", // Solid Bootstrap Blue
                }}
              >
                <div className="row text-center">
                  <div className="col-md-3 mb-3 mb-md-0">
                    <i className="fas fa-chart-line fa-2x mb-2 text-white-50"></i>
                    <h4 className="fw-bold">{results.length}</h4>
                    <small className="text-white-50">Total Attempts</small>
                  </div>
                  <div className="col-md-3 mb-3 mb-md-0">
                    <i className="fas fa-star fa-2x mb-2 text-white-50"></i>
                    <h4 className="fw-bold">{totalPoints}</h4>
                    <small className="text-white-50">Total Points</small>
                  </div>
                  <div className="col-md-3 mb-3 mb-md-0">
                    <i className="fas fa-bullseye fa-2x mb-2 text-white-50"></i>
                    <h4 className="fw-bold">{possiblePoints}</h4>
                    <small className="text-white-50">Possible Points</small>
                  </div>
                  <div className="col-md-3 mb-3 mb-md-0">
                    <i className="fas fa-percentage fa-2x mb-2 text-white-50"></i>
                    <h4 className="fw-bold">{average}%</h4>
                    <small className="text-white-50">Average</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewResults;

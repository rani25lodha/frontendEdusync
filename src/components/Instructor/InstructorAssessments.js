import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { API_CONFIG } from '../../config/api.config';

const InstructorAssessments = () => {
  const instructorId = localStorage.getItem("userId");
  const [assessments, setAssessments] = useState([]);

  // Utility function to convert string to Pascal case
  const toPascalCase = (str) => {
    if (!str) return str;

    return str
      .toLowerCase()
      .split(/[\s\-_]+/) // Split on spaces, hyphens, or underscores
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
  };

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const response = await api.get(
          `${API_CONFIG.ENDPOINTS.ASSESSMENTS.BY_INSTRUCTOR}/${instructorId}`
        );
        setAssessments(response.data);
      } catch (error) {
        console.error("Failed to fetch assessments:", error);
      }
    };

    fetchAssessments();
  }, [instructorId]);

  return (
    <div className="container mt-5">
      <h3 className="mb-4 text-primary">Assessments Uploaded by You</h3>
      {assessments.length === 0 ? (
        <p>No assessments found.</p>
      ) : (
        <div className="row">
          {assessments.map((assessment) => (
            <div key={assessment.assessmentId} className="col-md-6 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">
                    {toPascalCase(assessment.title)}
                  </h5>
                  <p className="card-text">
                    <strong>Max Score:</strong> {assessment.maxScore}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorAssessments;

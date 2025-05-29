// src/components/student/StudentAssessmentPage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import AssessmentList from "./StudentAssessmentList";

const StudentAssessmentPage = () => {
  const navigate = useNavigate();

  const handleSelectAssessment = (assessment) => {
    // Navigate to the TakeAssessment page using the assessment ID
    navigate(`/take-assessment/${assessment.id}`);
  };

  return (
    <div>
      <AssessmentList onSelectAssessment={handleSelectAssessment} />
    </div>
  );
};

export default StudentAssessmentPage;

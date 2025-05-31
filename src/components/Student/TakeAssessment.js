import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { API_CONFIG } from '../../config/api.config';

// Helper to extract user ID from token
const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);
    const userIdClaim =
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
    return payload[userIdClaim] || null;
  } catch (err) {
    console.error("Invalid token format:", err);
    return null;
  }
};

const TakeAssessment = () => {
  const { id: assessmentId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const res = await api.get(`${API_CONFIG.ENDPOINTS.ASSESSMENTS.BASE}/${assessmentId}`);
        const parsedQuestions =
          typeof res.data.questions === "string"
            ? JSON.parse(res.data.questions)
            : res.data.questions;

        console.log("Fetched assessment:", res.data);
        console.log("Parsed questions:", parsedQuestions);

        setAssessment(res.data);
        setQuestions(parsedQuestions || []);
      } catch (error) {
        console.error("Error fetching assessment:", error);
        alert("Failed to load assessment.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [assessmentId, navigate]);

  const handleChange = (questionIndex, selectedOption) => {
    console.log(
      `Question ${questionIndex}: Selected option "${selectedOption}"`
    );
    setAnswers((prev) => ({ ...prev, [questionIndex]: selectedOption }));
  };

  const handleSubmit = async () => {
    const userId = getUserIdFromToken();
    if (!userId) {
      alert("User ID missing. Please log in.");
      navigate("/login");
      return;
    }

    console.log("User answers:", answers);
    console.log("Questions for scoring:", questions);

    let score = 0;

    // Calculate score by comparing selected answers with correct answers
    // and adding the marks for each correct answer
    questions.forEach((q, idx) => {
      const userAnswer = answers[idx]; // This is the selected option text
      const correctAnswer = q.answer; // This should be the correct option text
      const questionMarks = parseInt(q.marks) || 1; // Get marks for this question

      console.log(`Question ${idx + 1}:`);
      console.log(`  User selected: "${userAnswer}"`);
      console.log(`  Correct answer: "${correctAnswer}"`);
      console.log(`  Question marks: ${questionMarks}`);
      console.log(`  Match: ${userAnswer === correctAnswer}`);

      if (userAnswer === correctAnswer) {
        score += questionMarks; // Add the marks for this question
        console.log(
          `  ✓ Correct! Added ${questionMarks} marks. Total score: ${score}`
        );
      } else {
        console.log(`  ✗ Incorrect - no marks added`);
      }
    });

    // Calculate total possible marks
    const totalPossibleMarks = questions.reduce(
      (sum, q) => sum + (parseInt(q.marks) || 1),
      0
    );

    console.log(`Final score: ${score}/${totalPossibleMarks}`);

    const resultDto = {
      assessmentId,
      userId,
      score,
      attemptDate: new Date().toISOString(),
    };

    console.log("Submitting result:", resultDto);

    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.RESULTS.BASE, resultDto);
      console.log("Result submitted successfully:", response.data);
      alert(
        `Assessment submitted successfully! Your score: ${score}/${totalPossibleMarks} (${Math.round(
          (score / totalPossibleMarks) * 100
        )}%)`
      );
      navigate("/results");
    } catch (error) {
      console.error("Error submitting result:", error);
      alert("Failed to submit assessment.");
    }
  };

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "60vh" }}
      >
        <div className="spinner-border text-primary" role="status" />
        <span className="ms-3">Loading assessment...</span>
      </div>
    );

  if (!assessment) return <p>Assessment not found.</p>;

  // Calculate total possible marks for display
  const totalPossibleMarks = questions.reduce(
    (sum, q) => sum + (parseInt(q.marks) || 1),
    0
  );

  return (
    <div className="container my-5">
      <div className="mb-4 text-center">
        <h2 className="fw-bold">{assessment.title}</h2>
        <p className="text-muted">
          Please select the best answers to the following questions:
        </p>
        <div className="alert alert-info">
          <strong>Total Marks: {totalPossibleMarks}</strong>
        </div>
      </div>
      <form>
        {Array.isArray(questions) && questions.length > 0 ? (
          questions.map((q, index) => (
            <div key={index} className="card mb-4 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h5 className="card-title">{`Q${index + 1}: ${
                    q.question
                  }`}</h5>
                  <span className="badge bg-primary">
                    {parseInt(q.marks) || 1}{" "}
                    {parseInt(q.marks) === 1 ? "mark" : "marks"}
                  </span>
                </div>
                {q.options.map((opt, optIndex) => (
                  <div key={optIndex} className="form-check mt-2">
                    <input
                      className="form-check-input"
                      type="radio"
                      name={`question-${index}`}
                      id={`question-${index}-option-${optIndex}`}
                      value={opt} // Use the option text as value
                      checked={answers[index] === opt} // Compare with option text
                      onChange={() => handleChange(index, opt)} // Pass option text
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`question-${index}-option-${optIndex}`}
                    >
                      {opt}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p>No questions available.</p>
        )}
        <div className="text-center">
          <button
            type="button"
            className="btn btn-success px-4 py-2"
            onClick={handleSubmit}
            disabled={Object.keys(answers).length === 0}
          >
            Submit Assessment ({Object.keys(answers).length}/{questions.length}{" "}
            answered)
          </button>
        </div>
      </form>
    </div>
  );
};

export default TakeAssessment;
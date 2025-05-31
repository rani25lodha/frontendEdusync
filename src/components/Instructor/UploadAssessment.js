import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { API_CONFIG } from '../../config/api.config';

const UploadAssessment = () => {
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", ""], answer: "", marks: 1 },
  ]);
  const [maxScore, setMaxScore] = useState(0);
  const [courses, setCourses] = useState([]);
  const instructorId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get(API_CONFIG.ENDPOINTS.COURSES.BASE);
        setCourses(response.data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      }
    };
    fetchCourses();
  }, [instructorId]);

  useEffect(() => {
    const total = questions.reduce(
      (sum, q) => sum + (parseInt(q.marks) || 0),
      0
    );
    setMaxScore(total);
  }, [questions]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", ""], answer: "", marks: 1 },
    ]);
  };

  const removeQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!courseId) {
      alert("❌ Please select a course.");
      return;
    }

    for (const q of questions) {
      if (
        !q.question ||
        !q.answer ||
        q.options.some((opt) => !opt) ||
        !q.marks
      ) {
        alert("❌ Please complete all fields in each question.");
        return;
      }
    }

    const numberedQuestions = questions.map((q, index) => ({
      ...q,
      number: `Q${index + 1}`,
    }));

    const payload = {
      title: title.trim(),
      courseId,
      questions: JSON.stringify(numberedQuestions),
      maxScore,
    };

    try {
      await api.post(API_CONFIG.ENDPOINTS.ASSESSMENTS.BASE, payload);
      alert("✅ Assessment uploaded successfully.");
      setTitle("");
      setCourseId("");
      setQuestions([
        { question: "", options: ["", "", ""], answer: "", marks: 1 },
      ]);
      setMaxScore(0);
    } catch (error) {
      console.error("❌ Upload failed:", error.response?.data || error.message);
      alert("❌ Failed to upload assessment. See console for details.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center mt-5 mb-5">
      <div
        className="card p-4 shadow-lg"
        style={{ maxWidth: "800px", width: "100%" }}
      >
        <h3 className="text-center text-primary mb-4">Upload Assessment</h3>
        <form onSubmit={handleUpload}>
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter assessment title"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Course</label>
            <select
              className="form-control"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.courseId} value={course.courseId}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Questions</label>
            {questions.map((q, index) => (
              <div key={index} className="card p-3 mb-3 shadow-sm">
                <h5>Question {index + 1}</h5>
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Question text"
                  value={q.question}
                  onChange={(e) =>
                    updateQuestion(index, "question", e.target.value)
                  }
                />

                {q.options.map((opt, optIdx) => (
                  <input
                    key={optIdx}
                    type="text"
                    className="form-control mb-1"
                    placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                    value={opt}
                    onChange={(e) =>
                      updateOption(index, optIdx, e.target.value)
                    }
                  />
                ))}

                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Correct answer (e.g., A, B, C)"
                  value={q.answer}
                  onChange={(e) =>
                    updateQuestion(index, "answer", e.target.value)
                  }
                />

                <input
                  type="number"
                  className="form-control mb-2"
                  placeholder="Marks"
                  value={q.marks}
                  onChange={(e) =>
                    updateQuestion(
                      index,
                      "marks",
                      parseInt(e.target.value) || 0
                    )
                  }
                />

                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => removeQuestion(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={addQuestion}
            >
              Add Question
            </button>
          </div>

          <div className="mb-3">
            <label className="form-label">Max Score</label>
            <input
              type="number"
              className="form-control"
              value={maxScore}
              readOnly
              placeholder="Auto-calculated"
            />
          </div>

          <div className="d-grid">
            <button className="btn btn-primary" type="submit">
              Upload Assessment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadAssessment;

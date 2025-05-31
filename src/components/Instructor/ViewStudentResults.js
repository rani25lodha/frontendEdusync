import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { API_CONFIG } from '../../config/api.config';
import Layout from '../shared/Layout';

const ViewStudentResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const instructorId = localStorage.getItem('instructorId');
        const response = await api.get(`${API_CONFIG.ENDPOINTS.RESULTS.INSTRUCTOR}/${instructorId}`);
        setResults(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching results:', error);
        setError('Failed to load results. Please try again later.');
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) {
    return (
      <Layout title="Student Results">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Student Results">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </Layout>
    );
  }

  // Group results by assessment
  const groupedResults = results.reduce((acc, result) => {
    const key = result.assessmentTitle;
    if (!acc[key]) {
      acc[key] = {
        title: result.assessmentTitle,
        courseTitle: result.courseTitle,
        maxScore: result.maxScore,
        attempts: []
      };
    }
    acc[key].attempts.push(result);
    return acc;
  }, {});

  return (
    <Layout title="Student Results">
      <div className="container">
        {Object.keys(groupedResults).length === 0 ? (
          <div className="alert alert-info">
            No results available yet.
          </div>
        ) : (
          Object.values(groupedResults).map((assessment, index) => (
            <div key={index} className="card shadow-sm mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">{assessment.title}</h5>
                <small>Course: {assessment.courseTitle}</small>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Student Name</th>
                        <th>Email</th>
                        <th>Score</th>
                        <th>Status</th>
                        <th>Attempt Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assessment.attempts.map((result, idx) => (
                        <tr key={idx}>
                          <td>{result.studentName}</td>
                          <td>{result.studentEmail}</td>
                          <td>
                            {result.score}/{result.maxScore}
                            <div className="progress mt-1" style={{ height: '4px' }}>
                              <div
                                className={`progress-bar ${
                                  (result.score / result.maxScore) >= 0.6 
                                    ? 'bg-success' 
                                    : 'bg-danger'
                                }`}
                                style={{ width: `${(result.score / result.maxScore) * 100}%` }}
                              />
                            </div>
                          </td>
                          <td>
                            <span 
                              className={`badge ${
                                (result.score / result.maxScore) >= 0.6 
                                  ? 'bg-success' 
                                  : 'bg-danger'
                              }`}
                            >
                              {(result.score / result.maxScore) >= 0.6 ? 'Pass' : 'Fail'}
                            </span>
                          </td>
                          <td>{new Date(result.attemptDate).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default ViewStudentResults; 
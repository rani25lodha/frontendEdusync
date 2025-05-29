import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email form, 2: Reset form

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/Auth/forgot-password', { email });
      setToken(response.data.token);
      setMessage(response.data.message);
      setStep(2);
    } catch (error) {
      setMessage(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/Auth/reset-password', {
        token,
        newPassword,
      });
      setMessage(response.data.message);
      // Clear form
      setEmail('');
      setToken('');
      setNewPassword('');
      setStep(1);
    } catch (error) {
      setMessage(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '90vh' }}>
      <div className="card shadow p-4 w-100" style={{ maxWidth: '400px', borderRadius: '1rem' }}>
        <h2 className="text-center text-primary mb-4">
          {step === 1 ? 'Forgot Password' : 'Reset Password'}
        </h2>
        
        {step === 1 ? (
          <form onSubmit={handleForgotPassword}>
            <div className="mb-3">
              <label className="form-label">
                <i className="bi bi-envelope me-2"></i>Email
              </label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              <i className="bi bi-key me-2"></i>Send Reset Link
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="mb-3">
              <label className="form-label">
                <i className="bi bi-key me-2"></i>New Password
              </label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              <i className="bi bi-check-lg me-2"></i>Reset Password
            </button>
          </form>
        )}

        {message && (
          <div className={`alert alert-info mt-3 mb-0`} role="alert">
            {message}
          </div>
        )}

        <div className="mt-3 text-center">
          <Link to="/login" className="text-decoration-none">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 
import React, { useState } from "react";
import api from "../../services/api";
import { useNavigate, Link } from "react-router-dom";


function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [passwordHash, setPassword] = useState("");
  const [role, setRole] = useState("Student");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post("/UserTables", {
        name,
        email,
        passwordHash,
        role,
      });
      alert("Registration successful! You can now log in.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ minHeight: "90vh" }}
    >
      <div
        className="card shadow p-4 w-100"
        style={{ maxWidth: "450px", borderRadius: "1rem" }}
      >
        <h2 className="text-center text-primary mb-4">
          Register for EduSync LMS
        </h2>
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label">
              <i className="bi bi-person me-2"></i>Name
            </label>
            <input
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="mb-3">
            <label className="form-label">
              <i className="bi bi-envelope me-2"></i>Email
            </label>
            <input
              className="form-control"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">
              <i className="bi bi-lock me-2"></i>Password
            </label>
            <input
              className="form-control"
              type="password"
              value={passwordHash}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label">
              <i className="bi bi-briefcase me-2"></i>Role
            </label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Student">Student</option>
              <option value="Instructor">Instructor</option>
            </select>
          </div>
          <button className="btn btn-primary w-100" type="submit">
            <i className="bi bi-person-plus me-2"></i>Register
          </button>
        </form>
        <p className="text-center mt-3 mb-0">
          Already have an account?{" "}
          <Link to="/login" className="text-decoration-none">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;

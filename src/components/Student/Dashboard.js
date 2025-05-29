import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../shared/Layout";

const StudentDashboard = () => {
  const navigate = useNavigate();

  const dashboardItems = [
    {
      title: "Take Assessment",
      icon: "bi-pencil-square",
      description: "Start a new assessment or continue an existing one",
      path: "/student/assessments-list",
      buttonClass: "btn-primary"
    },
    {
      title: "View Results",
      icon: "bi-graph-up",
      description: "Check your assessment results and progress",
      path: "/student/results",
      buttonClass: "btn-success"
    },
    {
      title: "Browse Courses",
      icon: "bi-journals",
      description: "Explore available courses and learning materials",
      path: "/student/courses-list",
      buttonClass: "btn-info"
    }
  ];

  return (
    <Layout title="Student Dashboard">
      <div className="row g-4">
        {dashboardItems.map((item, index) => (
          <div key={index} className="col-md-6 col-lg-4">
            <div className="card h-100 border-0">
              <div className="card-body d-flex flex-column">
                <div className="text-center mb-3">
                  <i className={`bi ${item.icon} fs-1 text-primary`}></i>
                </div>
                <h3 className="card-title h5 text-center mb-3">{item.title}</h3>
                <p className="card-text text-muted text-center mb-4">
                  {item.description}
                </p>
                <button
                  className={`btn ${item.buttonClass} mt-auto w-100`}
                  onClick={() => navigate(item.path)}
                >
                  <i className={`bi ${item.icon} me-2`}></i>
                  {item.title}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default StudentDashboard;

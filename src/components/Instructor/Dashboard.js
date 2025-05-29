import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../shared/Layout";

const InstructorDashboard = () => {
  const navigate = useNavigate();

  const dashboardItems = [
    {
      title: "Upload Course",
      icon: "bi-cloud-arrow-up-fill",
      description: "Create and upload new course materials",
      path: "/instructor/upload-course",
      buttonClass: "btn-primary"
    },
    {
      title: "Upload Assessment",
      icon: "bi-journal-plus",
      description: "Create new assessments for students",
      path: "/instructor/upload-assessment",
      buttonClass: "btn-success"
    },
    {
      title: "View Courses",
      icon: "bi-journals",
      description: "Manage your uploaded courses",
      path: "/instructor/courses-list",
      buttonClass: "btn-info"
    },
    {
      title: "View Assessments",
      icon: "bi-list-check",
      description: "Monitor and manage student assessments",
      path: "/instructor/instructor-assessment-list",
      buttonClass: "btn-warning"
    },
    {
      title: "View Results",
      icon: "bi-graph-up",
      description: "View student assessment results",
      path: "/instructor/view-results",
      buttonClass: "btn-secondary"
    }
  ];

  return (
    <Layout title="Instructor Dashboard">
      <div className="row g-4">
        {dashboardItems.map((item, index) => (
          <div key={index} className="col-md-6 col-lg-3">
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

export default InstructorDashboard;

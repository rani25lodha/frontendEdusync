import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const features = [
    {
      icon: 'bi-book',
      title: 'Interactive Courses',
      description: 'Access a wide range of courses designed by expert instructors'
    },
    {
      icon: 'bi-pencil-square',
      title: 'Smart Assessments',
      description: 'Test your knowledge with adaptive assessments and get instant feedback'
    },
    {
      icon: 'bi-graph-up',
      title: 'Progress Tracking',
      description: 'Monitor your learning journey with detailed performance analytics'
    },
    {
      icon: 'bi-people',
      title: 'Expert Instructors',
      description: 'Learn from industry professionals and experienced educators'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero bg-primary text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">Welcome to EduSync</h1>
              <p className="lead mb-4">
                Transform your learning experience with our comprehensive educational platform.
                Access quality courses, take assessments, and track your progress all in one place.
              </p>
              <div className="d-flex gap-3">
                <Link to="/register" className="btn btn-light btn-lg">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-outline-light btn-lg">
                  Sign In
                </Link>
              </div>
            </div>
            <div className="col-lg-6 d-none d-lg-block text-center">
              <i className="bi bi-mortarboard-fill display-1"></i>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features py-5">
        <div className="container">
          <h2 className="text-center mb-5">Why Choose EduSync?</h2>
          <div className="row g-4">
            {features.map((feature, index) => (
              <div key={index} className="col-md-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm text-center">
                  <div className="card-body">
                    <div className="feature-icon mb-3">
                      <i className={`bi ${feature.icon} fs-1 text-primary`}></i>
                    </div>
                    <h3 className="h5 mb-3">{feature.title}</h3>
                    <p className="text-muted mb-0">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5">How It Works</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="text-center">
                <div className="step-number mb-3">1</div>
                <h3 className="h5">Create an Account</h3>
                <p className="text-muted">Sign up as a student or instructor</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center">
                <div className="step-number mb-3">2</div>
                <h3 className="h5">Choose Your Path</h3>
                <p className="text-muted">Browse courses or create content</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center">
                <div className="step-number mb-3">3</div>
                <h3 className="h5">Start Learning</h3>
                <p className="text-muted">Access materials and track progress</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta py-5">
        <div className="container text-center">
          <h2 className="mb-4">Ready to Start Learning?</h2>
          <p className="lead mb-4">Join thousands of students already learning on EduSync</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home; 
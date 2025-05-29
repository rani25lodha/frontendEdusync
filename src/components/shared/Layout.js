import React from 'react';
import { useLocation } from 'react-router-dom';

const Layout = ({ children, title }) => {
  const location = useLocation();
  
  // Generate breadcrumb items based on current path
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    return paths.map((path, index) => {
      const formattedPath = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
      return (
        <li key={path} className="breadcrumb-item">
          {index === paths.length - 1 ? (
            <span>{formattedPath}</span>
          ) : (
            <span className="text-primary">{formattedPath}</span>
          )}
        </li>
      );
    });
  };

  return (
    <div className="page-container">
      <div className="content-card">
        {/* Breadcrumbs */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <i className="bi bi-house-door text-primary"></i>
            </li>
            {getBreadcrumbs()}
          </ol>
        </nav>

        {/* Page Title */}
        {title && <h1 className="page-title">{title}</h1>}

        {/* Main Content */}
        {children}
      </div>
    </div>
  );
};

export default Layout; 
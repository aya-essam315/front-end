import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectDetails.css';

const ProjectDetails = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const navigate = useNavigate();

  // ignore: mock data, will be replaced by API response
  const mockProjects = {
    project01: {
      name: "Project 01",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum.",
    },
    project02: {
      name: "Project 02",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean ut purus libero, a tempus ligula.",
    },
    project03: {
      name: "Project 03",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce a velit nec odio cursus aliquet.",
    }
  };

  const handleProjectSelect = (projectId) => {
    setSelectedProject(projectId);
  };

  
  const handleSubmit = () => {
    if (selectedProject) {
      // الانتقال إلى صفحة التفاصيل الثابتة بعد اختيار المشروع
      navigate('/selected-project-details');
    }
  };

  return (
    <div className="container-project">
      <h2 className="title">Choose a Project</h2>
      
      {/* Rendering project options */}
      <div className="project-options">
        {Object.keys(mockProjects).map((projectId) => (
          <div key={projectId} className="project-option">
            <input
              type="radio"
              id={projectId}
              name="project"
              value={projectId}
              checked={selectedProject === projectId}
              onChange={() => handleProjectSelect(projectId)}
            />
            <label htmlFor={projectId}>{mockProjects[projectId].name}</label>
            <p>{mockProjects[projectId].description}</p>
          </div>
        ))}
      </div>

      {/* Submit button */}
      <button 
        className="submit-btn" 
        onClick={handleSubmit} 
        disabled={!selectedProject}
      >
        Submit
      </button>
    </div>
  );
};

export default ProjectDetails;

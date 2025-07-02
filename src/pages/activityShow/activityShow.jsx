import React, { useState, useEffect } from "react";
import "./activityShow.css";
import axios from "axios";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
const ActivityShow = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dataContent = location.state[0].projects;
  const courseId = location.state[1];
  const [projects, setProjects] = useState([]);
  const [editedProjects, setEditedProjects] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setProjects(dataContent);
    setEditedProjects(dataContent);
  }, [dataContent]);

  const handleToggleEdit = () => {
    if (isEditing) {
      setProjects(editedProjects);
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (index, field, value) => {
    const updated = [...editedProjects];
    updated[index][field] = value;
    setEditedProjects(updated);
  };

  const handleSaveAllToDatabase = async () => {
    try {
      Swal.fire({
        title: "Saving...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:3000/course/${courseId}/save-activities/`,
        { activities: { projects: editedProjects } },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Saved successfully",
        showConfirmButton: false,
        timer: 1500,
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Error saving:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Something went wrong.",
      });
    }
  };

  return (
    <div className="course-content-container">
      <div className="content-header">
        <h2>🧠 Project-Based Activities</h2>
        <button className="edit-button" onClick={handleToggleEdit}>
          {isEditing ? "Save Changes" : "Edit"}
        </button>
      </div>

      <div className="project-list">
        {(isEditing ? editedProjects : projects).map((project, index) => (
          <div className="project-card" key={index}>
            <h3>
              {isEditing ? (
                <input
                  type="text"
                  value={project.name}
                  onChange={(e) => handleChange(index, "name", e.target.value)}
                  className="project-input"
                />
              ) : (
                project.name
              )}
            </h3>
            <p>
              {isEditing ? (
                <textarea
                  value={project.description}
                  onChange={(e) =>
                    handleChange(index, "description", e.target.value)
                  }
                  className="project-textarea"
                  rows={6}
                />
              ) : (
                project.description
              )}
            </p>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <button className="edit-button" onClick={handleSaveAllToDatabase}>
          💾 Save All in Database
        </button>
      </div>
    </div>
  );
};

export default ActivityShow;

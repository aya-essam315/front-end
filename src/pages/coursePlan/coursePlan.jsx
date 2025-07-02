import React, { useState } from "react";
import "./coursePlan.css";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
const CoursePlanPage = () => {
  const [_, setIsLoggedIn] = useState(true);
  const location = useLocation();
  const coursePlan = location.state[0];

  const courseId = location.state[1];
  const navigate = useNavigate();
  const [rows, setRows] = useState(coursePlan);

  const swapSubtopics = (weekIndex1, subIndex1, weekIndex2, subIndex2) => {
    const updated = [...rows];
    const temp = updated[weekIndex1].Subtopics[subIndex1];
    updated[weekIndex1].Subtopics[subIndex1] =
      updated[weekIndex2].Subtopics[subIndex2];
    updated[weekIndex2].Subtopics[subIndex2] = temp;
    setRows(updated);
  };

  const moveSubtopicAcrossWeeks = (
    fromWeekIdx,
    fromSubIdx,
    toWeekIdx,
    toSubIdx
  ) => {
    const updated = [...rows];
    const movedItem = updated[fromWeekIdx].Subtopics.splice(fromSubIdx, 1)[0];
    updated[toWeekIdx].Subtopics.splice(toSubIdx, 0, movedItem);
    setRows(updated);
  };

  const handlePrint = () => {
    console.log(rows);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");

    Swal.fire({
      title: "Saving Plan...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await axios.put(
        `http://localhost:3000/course/${courseId}/savePlan`,
        { teachingPlan: rows },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Plan saved successfully!",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        setIsLoggedIn(true);
        navigate("/dashboard");
      });
    } catch (error) {
      console.error("Error saving plan:", error);

      Swal.fire({
        icon: "error",
        title: "Failed to save plan",
        text: error?.response?.data?.message || "Please try again later.",
      });
    }
  };

  const handleActionClick = async (type, weekIndex) => {
    // console.log(`${type} clicked for week ${rows[weekIndex].week}`);
    // console.log(type, rows[weekIndex].Week);
    const token = localStorage.getItem("token");
    try {
      Swal.fire({
        title: "Generating lesson content...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.post(
        `http://localhost:3000/course/${courseId}/createLessonContent`,
        rows[weekIndex],
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Lesson content created successfully!",
        text: "The lesson content has been saved.",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        navigate("/course-content", {
          state: [
            response.data.data,
            rows[weekIndex].LectureName,
            response.data._id,
          ],
        });
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to create content",
        text: error?.response?.data?.message || "Please try again later.",
      });

      console.error("❌ Error:", error);
    }

    // يمكن هنا تفعيل مودال أو انتقال حسب الزر
  };

  const handleActionClick1 = async (type, weekIndex) => {
    const token = localStorage.getItem("token");

    try {
      Swal.fire({
        title: "Generating assignment...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.post(
        `http://localhost:3000/course/${courseId}/create-assignment`,
        rows[weekIndex],
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Assignment created successfully!",
        text: "The assignment has been saved.",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        navigate("/assignment", {
          state: [response.data.data, courseId],
        });
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to create assignment",
        text: error?.response?.data?.message || "Please try again later.",
      });
      console.error("❌ Error:", error);
    }
  };

  return (
    <div className="course-plan-container">
      <h1 className="course-plan-title">Course Plan</h1>

      <div className="table-wrapper">
        <table className="course-plan-table">
          <thead>
            <tr>
              <th>Week</th>
              <th>Lecture</th>
              <th>Topics</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td className="week-cell">Week {row.Week}</td>
                <td>{row.LectureName}</td>

                <td className="subtopic-cell">
                  {row.Subtopics.map((subtopic, subIdx) => (
                    <div key={subIdx} className="subtopic-row">
                      <div className="subtopic-text">{subtopic}</div>
                      <div className="subtopic-buttons">
                        {(subIdx > 0 || idx > 0) && (
                          <button
                            onClick={() => {
                              if (subIdx > 0) {
                                swapSubtopics(idx, subIdx, idx, subIdx - 1);
                              } else if (idx > 0) {
                                moveSubtopicAcrossWeeks(
                                  idx,
                                  subIdx,
                                  idx - 1,
                                  rows[idx - 1].Subtopics.length
                                );
                              }
                            }}
                            className="move-up-btn"
                          >
                            ↑
                          </button>
                        )}
                        {(subIdx < row.Subtopics.length - 1 ||
                          idx < rows.length - 1) && (
                          <button
                            onClick={() => {
                              if (subIdx < row.Subtopics.length - 1) {
                                swapSubtopics(idx, subIdx, idx, subIdx + 1);
                              } else if (idx < rows.length - 1) {
                                moveSubtopicAcrossWeeks(
                                  idx,
                                  subIdx,
                                  idx + 1,
                                  0
                                );
                              }
                            }}
                            className="move-down-btn"
                          >
                            ↓
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </td>

                <td>
                  <div className="actions-buttons">
                    <button
                      className="btn-content"
                      onClick={() => handleActionClick("content", idx)}
                    >
                      Content
                    </button>
                    <button
                      className="btn-assignment"
                      onClick={() => handleActionClick1("assignment", idx)}
                    >
                      Assignment
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="button-group">
        <button className="next-button" onClick={handleSave}>
          Save
        </button>
        <button className="next-button" onClick={handlePrint}>
          Print
        </button>
      </div>
    </div>
  );
};

export default CoursePlanPage;

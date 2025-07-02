import React, { useState, useEffect } from "react";
import "./SyllabusPage.css";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

function SyllabusPage() {
  const location = useLocation();
  const syllabusData = location.state[0];

  const [syllabus, setSyllabus] = useState([]);
  const [expandedTopics, setExpandedTopics] = useState([]);
  const [newMainTopic, setNewMainTopic] = useState("");
  const [newSubTopic, setNewSubTopic] = useState("");

  useEffect(() => {
    if (syllabusData && syllabusData.topics) {
      // تحويل الداتا إلى التنسيق المناسب
      const formatted = syllabusData.topics.map((topic) => ({
        "main-topic": topic["main-topic"], // تحويل key من "main-topic" إلى main_topic
        subtopics: topic.subtopics.map((sub) => ({ subtopic: sub })), // تحويل من array of strings إلى array of objects
      }));

      setSyllabus(formatted);
    }
  }, [syllabusData]);

  const addMainTopic = () => {
    if (newMainTopic.trim()) {
      setSyllabus([...syllabus, { "main-topic": newMainTopic, subtopics: [] }]);
      setNewMainTopic("");
    }
  };

  const addSubTopic = (index) => {
    if (newSubTopic.trim()) {
      const updated = [...syllabus];
      updated[index].subtopics.push({ subtopic: newSubTopic });
      setSyllabus(updated);
      setNewSubTopic("");
    }
  };

  const deleteSubTopic = (mainIndex, subIndex) => {
    const updated = [...syllabus];
    updated[mainIndex].subtopics.splice(subIndex, 1);
    setSyllabus(updated);
  };

  const editSubTopic = (mainIndex, subIndex) => {
    const newSub = prompt(
      "Edit subtopic",
      syllabus[mainIndex].subtopics[subIndex].subtopic
    );
    if (newSub !== null) {
      const updated = [...syllabus];
      updated[mainIndex].subtopics[subIndex].subtopic = newSub;
      setSyllabus(updated);
    }
  };

  const toggleMainTopic = (index) => {
    if (expandedTopics.includes(index)) {
      setExpandedTopics(expandedTopics.filter((i) => i !== index));
    } else {
      setExpandedTopics([...expandedTopics, index]);
    }
  };

  const swapSubtopics = (mainIndex, subIndex, direction) => {
    const updated = [...syllabus];
    const subtopics = updated[mainIndex].subtopics;

    const targetIndex = direction === "up" ? subIndex - 1 : subIndex + 1;
    if (targetIndex >= 0 && targetIndex < subtopics.length) {
      [subtopics[subIndex], subtopics[targetIndex]] = [
        subtopics[targetIndex],
        subtopics[subIndex],
      ];
      setSyllabus(updated);
    }
  };

  const navigate = useNavigate();

  const submitData = async () => {
    const token = localStorage.getItem("token");
    const syllabusDataID = location.state[1];

    // ✨ إظهار سبينر التحميل
    Swal.fire({
      title: "Saving Syllabus...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await axios.post(
        `http://localhost:3000/course/${syllabusDataID}/savesyllabus`,
        {
          syllabus: {
            topics: syllabus.map((data) => ({
              "main-topic": data["main-topic"],
              subtopics: data.subtopics.map((sub) => {
                return sub.subtopic;
              }),
            })),
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ✅ بعد نجاح الحفظ
      Swal.fire({
        icon: "success",
        title: "Syllabus saved successfully!",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => navigate("/dashboard"));
    } catch (error) {
      console.error("Error saving syllabus:", error);

      // ❌ في حالة فشل
      Swal.fire({
        icon: "error",
        title: "Failed to save syllabus",
        text: error?.response?.data?.message || "Please try again later",
      });
    }
  };

  return (
    <div className="syllabus-page">
      <div className="syllabus-container">
        <h2>Edit Syllabus for Math for Beginners</h2>

        <div className="add-main-section">
          <input
            className="input-box"
            type="text"
            value={newMainTopic}
            onChange={(e) => setNewMainTopic(e.target.value)}
            placeholder="Add main topic"
          />
          <button className="add-button" onClick={addMainTopic}>
            <FaPlus />
          </button>
        </div>

        {syllabus.map((main, i) => (
          <div key={i} className="main-topic">
            <h3 onClick={() => toggleMainTopic(i)}>{main["main-topic"]}</h3>

            {expandedTopics.includes(i) && (
              <>
                <div className="add-sub-section">
                  <input
                    className="input-box"
                    type="text"
                    value={newSubTopic}
                    onChange={(e) => setNewSubTopic(e.target.value)}
                    placeholder="Add subtopic"
                  />
                  <button className="add-button" onClick={() => addSubTopic(i)}>
                    <FaPlus />
                  </button>
                </div>

                <ul className="subtopic-list">
                  {main.subtopics.map((sub, j) => (
                    <li key={j} className="subtopic-item">
                      <span>{sub.subtopic}</span>

                      <div className="actions">
                        <FaArrowUp
                          onClick={() => swapSubtopics(i, j, "up")}
                          className="icon"
                        />
                        <FaArrowDown
                          onClick={() => swapSubtopics(i, j, "down")}
                          className="icon"
                        />
                        <FaEdit
                          onClick={() => editSubTopic(i, j)}
                          className="icon edit"
                        />
                        <FaTrash
                          onClick={() => deleteSubTopic(i, j)}
                          className="icon delete"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ))}

        <button className="submit-button" onClick={submitData}>
          Submit
        </button>
      </div>
    </div>
  );
}

export default SyllabusPage;

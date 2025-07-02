import React, { useState, useEffect } from "react";
import "./CourseContentPage.css";
import { FaFilePowerpoint, FaVideo, FaVolumeUp } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

const CourseContentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const DataContent = location.state;
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synth = window.speechSynthesis;
  const role = localStorage.getItem("role");

  useEffect(() => {
    const courseContent = DataContent[0].content;
    setContent(courseContent);
    setEditedContent(courseContent);
  }, [DataContent]);

  const handleToggleEdit = () => {
    if (isEditing) setContent(editedContent);
    setIsEditing(!isEditing);
  };

  const applyInlineStyles = (text) => {
    let styledText = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    styledText = styledText.replace(/\*(.*?)\*/g, "<em>$1</em>");
    return styledText;
  };

  const renderContent = () => {
    return content.split("\n").map((line, i) => {
      const trimmed = line.trim();

      if (trimmed === "") return null;

      if (trimmed.startsWith("# ")) {
        return (
          <p key={i} className="main-title">
            {trimmed.replace("# ", "")}
          </p>
        );
      }
      if (trimmed.startsWith("## ")) {
        return (
          <p key={i} className="subheading">
            {trimmed.replace("## ", "")}
          </p>
        );
      }
      if (trimmed.startsWith("### ")) {
        return (
          <p key={i} className="sub-subheading">
            {trimmed.replace("### ", "")}
          </p>
        );
      }
      if (trimmed.startsWith("#### ")) {
        return (
          <p key={i} className="activity">
            {trimmed.replace("#### ", "")}
          </p>
        );
      }
      if (trimmed === "---") return <hr key={i} />;

      if (trimmed.startsWith("*")) {
        return (
          <ul key={i} className="list">
            <li
              dangerouslySetInnerHTML={{
                __html: applyInlineStyles(trimmed.replace(/^\*\s*/, "")),
              }}
            />
          </ul>
        );
      }

      return (
        <p
          key={i}
          className="paragraph"
          dangerouslySetInnerHTML={{ __html: applyInlineStyles(trimmed) }}
        />
      );
    });
  };

  const handleSpeak = () => {
    if (synth.speaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }

    const plainText = content.replace(/[#*_\-]/g, "").replace(/\n/g, " ");
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = "en-US"; // استخدمي "ar-EG" لو المحتوى بالعربي
    utterance.rate = 1;

    synth.speak(utterance);
    setIsSpeaking(true);

    utterance.onend = () => {
      setIsSpeaking(false);
    };
  };

  const handleSave = () => {
    const token = localStorage.getItem("token");
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to save this lesson content?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, save it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Saving...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        axios
          .put(
            `http://localhost:3000/course/${DataContent[0].courseId}/save-lesson-content/${DataContent[0]._id}`,
            { content: editedContent },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          )
          .then(() => {
            Swal.fire("Saved!", "Lesson content has been saved.", "success");
            navigate("/dashboard");
          })
          .catch((error) => {
            Swal.fire(
              "Error!",
              error.response?.data?.message || "Something went wrong.",
              "error"
            );
          });
      }
    });
  };

  return (
    <div className="course-content-container">
      <div className="content-header">
        <h2 className="content-topic">{DataContent[1]}</h2>
        <button
          className="icon-button"
          style={{ display: role === "teacher" ? "block" : "none" }}
          onClick={handleToggleEdit}
        >
          {isEditing ? "Save" : "Edit"}
        </button>
      </div>

      {isEditing ? (
        <textarea
          className="content-editor"
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          rows={30}
        />
      ) : (
        <div className="content-box">{renderContent()}</div>
      )}

      <div className="media-buttons">
        <button className="btn-ppt" onClick={() => console.log("ppt")}>
          <FaFilePowerpoint className="btn-icon" /> PPT
        </button>
        <button className="btn-video" onClick={() => console.log("video")}>
          <FaVideo className="btn-icon" /> Video
        </button>
        <button className="btn-audio" onClick={handleSpeak}>
          <FaVolumeUp className="btn-icon" />
          {isSpeaking ? "Stop Reading" : "Read Content"}
        </button>
      </div>

      <button
        className="save-all-button"
        style={{
          display: role === "teacher" ? "block" : "none",
          margin: "20px auto",
        }}
        onClick={handleSave}
      >
        Save In DataBase
      </button>

      <button
        className="save-all-button"
        style={{
          display: role === "student" ? "block" : "none",
          margin: "20px auto",
        }}
        onClick={() => navigate("/STdashboard")}
      >
        Back To Dashboard
      </button>
    </div>
  );
};

export default CourseContentPage;

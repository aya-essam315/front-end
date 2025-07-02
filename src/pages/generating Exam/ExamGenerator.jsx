import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles.css";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const ExamGenerator = () => {
  const navigator = useNavigate();
  const location = useLocation();
  const questiondata = location.state[0];
  const courseId = location.state[1];
  const [questions, setQuestions] = useState([]);
  const [finalQuestions, setFinalQuestions] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState(null);

  useEffect(() => {
    setQuestions(questiondata.questions);
    setFinalQuestions(questiondata.questions);
  }, [questiondata]);

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditedQuestion({ ...questions[index] });
  };

  const handleSave = (index) => {
    const updated = [...questions];
    updated[index] = editedQuestion;
    setQuestions(updated);

    const finalUpdated = [...finalQuestions];
    finalUpdated[index] = editedQuestion;
    setFinalQuestions(finalUpdated);

    setEditIndex(null);
    setEditedQuestion(null);
  };

  const handleChange = (field, value) => {
    setEditedQuestion((prev) => ({ ...prev, [field]: value }));
  };

  const renderMCQ = (q, index) => (
    <div className="question-box" key={index}>
      <p>
        <strong>{index + 1}. </strong>
        {editIndex === index ? (
          <input
            value={editedQuestion.question}
            onChange={(e) => handleChange("question", e.target.value)}
          />
        ) : (
          <strong>{q.question}</strong>
        )}
      </p>

      <ul>
        {(editIndex === index ? editedQuestion.options : q.options).map(
          (opt, i) => (
            <li key={i}>
              {editIndex === index ? (
                <input
                  value={opt}
                  onChange={(e) => {
                    const newOptions = [...editedQuestion.options];
                    newOptions[i] = e.target.value;
                    handleChange("options", newOptions);
                  }}
                />
              ) : (
                <span>{opt}</span>
              )}
            </li>
          )
        )}
      </ul>

      {editIndex === index ? (
        <button onClick={() => handleSave(index)}>💾 Save</button>
      ) : (
        <button onClick={() => handleEdit(index)}>✏️ Edit</button>
      )}
    </div>
  );

  const renderFill = (q, index) => (
    <div className="question-box" key={index}>
      <p>
        <strong>{index + 1}. </strong>
        {editIndex === index ? (
          <input
            value={editedQuestion.question}
            onChange={(e) => handleChange("question", e.target.value)}
          />
        ) : (
          q.question
        )}
      </p>

      <input disabled placeholder="_________" className="blank-input" />

      {editIndex === index ? (
        <button onClick={() => handleSave(index)}>💾 Save</button>
      ) : (
        <button onClick={() => handleEdit(index)}>✏️ Edit</button>
      )}
    </div>
  );

  const renderEssay = (q, index) => (
    <div className="question-box" key={index}>
      <p>
        <strong>{index + 1}. </strong>
        {editIndex === index ? (
          <input
            value={editedQuestion.question}
            onChange={(e) => handleChange("question", e.target.value)}
          />
        ) : (
          q.question
        )}
      </p>

      <textarea
        disabled
        placeholder="Your answer here..."
        className="essay-box"
      />

      {editIndex === index ? (
        <button onClick={() => handleSave(index)}>💾 Save</button>
      ) : (
        <button onClick={() => handleEdit(index)}>✏️ Edit</button>
      )}
    </div>
  );

  const handleSaveAll = async () => {
    const token = localStorage.getItem("token");
    Swal.fire({
      title: "Saving...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      await axios.put(
        `http://localhost:3000/course/${courseId}/save-exam`,
        { questions: finalQuestions },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Saved successfully!",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        navigator("/dashboard");
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to save",
        text: err?.response?.data?.message || "Please try again later.",
      });
    }
  };

  return (
    <div className="questions-page">
      <h2>📋 Exam Questions</h2>
      {questions.map((q, i) => {
        if (q.type === "MCQ") return renderMCQ(q, i);
        if (q.type === "Fill the blank") return renderFill(q, i);
        if (q.type === "Essay") return renderEssay(q, i);
        return null;
      })}

      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <button className="save-all-button" onClick={handleSaveAll}>
          💾 Save All Questions
        </button>
      </div>
    </div>
  );
};

export default ExamGenerator;

import React, { useState } from "react";
import Swal from "sweetalert2";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import "./ExamPage.css";
import Navbar from "../../components/Navbar";
import "../output-student/output.css";
import { useLocation, useNavigate } from "react-router-dom";

export default function ExamPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const location = useLocation();
  const { serviceName, courseName, coursCode, topic, lesson, result } =
    location.state || {};

  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (index, value) => {
    if (!isSubmitted) {
      setAnswers({ ...answers, [index]: value });
    }
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < result.drill.length) {
      Swal.fire("⚠️", "Please answer all questions.", "warning");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
      Swal.fire(
        "✅ Submitted!",
        "Your answers have been submitted.",
        "success"
      );
    }, 1000);
  };

  const getServiceTitle = (name) => {
    if (!name) return "Service Output";
    const n = name.toLowerCase();
    if (n.includes("drill")) return "🅰️ Drill";
    return name;
  };

  return (
    <div className="output-page">
      {/* Sidebar */}
      <div className="sidebar" style={{ maxWidth: "400px" }}>
        <h2 style={{ color: "black" }}>📌 Selected:</h2>
        <button
          style={{ display: "block" }}
          onClick={() => navigate("/STdashboard")}
        >
          Back to Services
        </button>
        {serviceName && (
          <p>
            <span>Service:</span> {getServiceTitle(serviceName)}
          </p>
        )}
        {courseName && (
          <p>
            <span>Course:</span> {`${courseName} (${coursCode})`}
          </p>
        )}
        {topic && (
          <p>
            <span>Topic:</span> {topic}
          </p>
        )}
        {lesson && (
          <p>
            <span>Subtopic:</span> {lesson}
          </p>
        )}
      </div>

      {/* Main Content */}
      <div className="main-content">
        <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

        <div className="output-section">
          <h1>{getServiceTitle(serviceName)}</h1>
          {result.drill.map((q, index) => {
            const selected = answers[index];
            const isCorrect = selected === q.answer;

            return (
              <div key={index} className="question-card">
                <div className="question-text">
                  {index + 1}. {q.question}
                  {isSubmitted &&
                    (isCorrect ? (
                      <FaCheckCircle className="icon-correct" />
                    ) : (
                      <FaTimesCircle className="icon-wrong" />
                    ))}
                </div>
                <div className="options">
                  {q.options.map((opt, i) => {
                    const isSelected = selected === opt;
                    const isAnswer = q.answer === opt;

                    let className = "option";
                    if (isSubmitted) {
                      if (isAnswer) className += " correct";
                      else if (isSelected && !isAnswer)
                        className += " incorrect";
                    } else if (isSelected) {
                      className += " selected";
                    }

                    return (
                      <label key={i} className={className}>
                        <input
                          type="radio"
                          name={`q-${index}`}
                          value={opt}
                          checked={isSelected}
                          onChange={() => handleChange(index, opt)}
                          disabled={isSubmitted}
                        />
                        {opt}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={loading || isSubmitted}
          >
            {loading ? <div className="spinner"></div> : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

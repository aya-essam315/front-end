import Navbar from "../../components/Navbar";
import "./home.css";
import robotImage from "/src/assets/ui (1).png";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();
  return (
    <>
      <Navbar />
      <div className="container">
        {/* Main Content */}
        <div className="content">
          <div className="text-section">
            <h1>
              <span className="highlight">Intelligent</span> Elearning Platform
            </h1>
            <p>
              using <span className="highlight-box">Generative AI</span>
            </p>
            <div className="buttons">
              <button
                className="teacher-btn"
                onClick={() => navigate("/signupasTeacher")}
              >
                Teacher
              </button>
              <button
                className="student-btn"
                onClick={() => navigate("/signupasStudent")}
              >
                Student
              </button>
            </div>
          </div>

          {/* Image Section */}
          <div className="image-section">
            <img src={robotImage} alt="Chatbot" className="robot-image" />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

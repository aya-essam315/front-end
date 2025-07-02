import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home/home";
import Login from "./pages/Login/login";
import Dashboard from "./pages/dashboard/dashboard"; // تأكد من المسار
import SyllabusPage from "./pages/SyllabusPage/SyllabusPage"; // استيراد صفحة السيلابز
import CoursePlan from "./pages/coursePlan/coursePlan"; // استيراد الصفحة الجديدة
import CourseContentPage from "./pages/coursePageContent/CourseContentPage";
import ProjectDetails from "./pages/ProjectDetails/ProjectDetails";
import SelectedProjectDetails from "./pages/SelectedProjectDetails/SelectedProjectDetails";
import Student from "./pages/Signup/student";
import TsignUp from "./pages/Signup/Tsignup";
import Exam from "./pages/generating Exam/ExamGenerator";
import ActivityShow from "./pages/activityShow/activityShow";
import Assignment from "./pages/generate Assignment/assignment";
import StudentDashboard from "./pages/dashboard/studentDashoard";
import OutputPage from "./pages/output-student/output";
import ExamPage from "./pages/drill/ExamPage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={<Login setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route path="/signupasTeacher" element={<TsignUp />} />
        <Route path="/signupasStudent" element={<Student />} />
        <Route
          path="/dashboard"
          element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />}
        />

        <Route
          path="/STdashboard"
          element={isLoggedIn ? <StudentDashboard /> : <Navigate to="/login" />}
        />

        <Route path="/syllabus" element={<SyllabusPage />} />
        <Route path="/plan" element={<CoursePlan />} />
        <Route path="/course-content" element={<CourseContentPage />} />
        <Route path="/project-details" element={<ProjectDetails />} />
        <Route
          path="/selected-project-details"
          element={<SelectedProjectDetails />}
        />
        <Route path="/exam" element={<Exam />} />
        <Route path="/assignment" element={<Assignment />} />
        <Route path="/activityShow" element={<ActivityShow />} />
        <Route path="/output" element={<OutputPage />} />
        <Route path="/output-drill" element={<ExamPage />} />
      </Routes>
    </Router>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import "./dashboard.css";
import Navbar from "../../components/Navbar";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [courses, setCourses] = useState([]);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(null);
  const [selectedSubTopicIndex, setSelectedSubTopicIndex] = useState(null);
  const [lesson, setLesson] = useState([]);
  const [title, setTitle] = useState([]);
  const [indexCourse, setIndexCourse] = useState();
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get("http://localhost:3000/course", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const formattedCourses = response.data.data.map((course) => ({
          courseName: course.courseName,
          courseCode: course.courseCode,
          courseId: course._id,
        }));
        setCourses(formattedCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  const toggleCourse = async (courseId, index) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
      setSelectedCourseId(null);
      setExpandedTopic(null);
      setSelectedTopicIndex(null);
      setSelectedSubTopicIndex(null);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:3000/course/${courseId}/coursePlan`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTitle(response.data.data.teachingPlan);
      setIndexCourse(index);
      const lessonResponse = await axios.get(
        `http://localhost:3000/course/lessons/${courseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLesson(lessonResponse.data.data);
      setExpandedCourse(courseId);
      setSelectedCourseId(courseId);
      setExpandedTopic(null);
      setSelectedTopicIndex(null);
      setSelectedSubTopicIndex(null);
    } catch (error) {
      console.error("Error fetching course plan:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to fetch course plan",
        text: error?.response?.data?.message || "Please try again later.",
      });
      setExpandedCourse(null);
      setSelectedCourseId(null);
      setSelectedSubTopicIndex(null);
      setSelectedTopicIndex(null);
      setTitle([]);
    }
  };

  const toggleTopic = (index) => {
    if (expandedTopic === index) {
      setExpandedTopic(null);
      setSelectedTopicIndex(null);
      setSelectedSubTopicIndex(null);
    } else {
      setExpandedTopic(index);
      setSelectedTopicIndex(index);
      setSelectedSubTopicIndex(null);
    }
  };

  const handleSubtopicClick = (topicIndex, subIndex) => {
    setSelectedSubTopicIndex(`${subIndex}`);
  };

  const fetchEachRequest = async (serviceName, url, body) => {
    try {
      Swal.fire({
        title: "Service is processing ...",
        text: "please , wait ...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      const token = localStorage.getItem("token");
      const courseName = courses[indexCourse]?.courseName;
      const coursCode = courses[indexCourse]?.courseCode;
      const topic = title[selectedTopicIndex]?.LectureName;
      const lesson =
        title[selectedTopicIndex]?.Subtopics[selectedSubTopicIndex];

      // إرسال البيانات للسيرفر
      const response = await axios.post(url, body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // عرض SweetAlert للنجاح
      Swal.fire({
        icon: "success",
        title: "Completed Successfully",
        text: "Now will navigate to applicable page ...",
        timer: 1500,
        showConfirmButton: false,
      });
      // التنقل بعد نجاح الإرسال
      if (serviceName === "✏️ Drill") {
        console.log(response.data.data);

        navigate("/output-drill", {
          state: {
            serviceName,
            courseName,
            coursCode,
            topic,
            lesson,
            result: response.data.data || "No result returned.",
          },
        });
      } else {
        console.log(response.data.data);
        navigate("/output", {
          state: {
            serviceName,
            courseName,
            coursCode,
            topic,
            lesson,
            result: response.data.data || "No result returned.",
          },
        });
      }
    } catch (error) {
      // عرض SweetAlert للخطأ
      Swal.fire({
        icon: "error",
        title: "Failed process",
        text: error?.response?.data?.message || "something go wrong...",
      });
    }
  };
  const handleServiceClick = (serviceName) => {
    if (serviceName === "📖 Personalized Content") {
      fetchEachRequest(
        serviceName,
        `http://localhost:3000/student/${selectedCourseId}/personalized-content`,
        {
          lectureName: title[indexCourse]?.LectureName,
          content: lesson[selectedTopicIndex].content,
        }
      );
    } else if (serviceName === "✏️ Drill") {
      fetchEachRequest(
        serviceName,
        `http://localhost:3000/student/${selectedCourseId}/drill`,
        {
          lectureName: title[indexCourse]?.LectureName,
          content: lesson[selectedTopicIndex].content,
        }
      );
    } else if (serviceName === "📄 Summary") {
      fetchEachRequest(
        serviceName,
        `http://localhost:3000/student/${selectedCourseId}/summery`,
        {
          lectureName: title[indexCourse]?.LectureName,
          content: lesson[selectedTopicIndex].content,
        }
      );
    } else if (serviceName === "✅ Test with Short Practice Questions") {
      fetchEachRequest(
        serviceName,
        `http://localhost:3000/student/${selectedCourseId}/test-knowledge`,
        {
          lectureName: title[indexCourse]?.LectureName,
          content: lesson[selectedTopicIndex].content,
        }
      );
    } else if (serviceName === "⚗️ Examples and Application") {
      fetchEachRequest(
        serviceName,
        `http://localhost:3000/student/${selectedCourseId}/examples-and-applications`,
        {
          lectureName: title[indexCourse]?.LectureName,
          content: lesson[selectedTopicIndex].content,
        }
      );
    } else if (serviceName === "👥 Key Concepts") {
      fetchEachRequest(
        serviceName,
        `http://localhost:3000/student/${selectedCourseId}/review`,
        {
          lectureName: title[indexCourse]?.LectureName,
          content: lesson[selectedTopicIndex].content,
        }
      );
    }
  };

  const handleServiceClick1 = async (serviceName) => {
    try {
      Swal.fire({
        title: "Service is processing ...",
        text: "please , wait ...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      const token = localStorage.getItem("token");
      const courseName = courses[indexCourse]?.courseName;
      const coursCode = courses[indexCourse]?.courseCode;
      const topic = title[selectedTopicIndex]?.LectureName;
      const lesson =
        title[selectedTopicIndex]?.Subtopics[selectedSubTopicIndex];

      // إرسال البيانات للسيرفر
      const response = await axios.post(
        `http://localhost:3000/student/${selectedCourseId}/test-knowledge`,
        {
          serviceName,
          courseName,
          coursCode,
          topic,
          lesson,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // عرض SweetAlert للنجاح
      Swal.fire({
        icon: "success",
        title: "Completed Successfully",
        text: "Now will navigate to applicable page ...",
        timer: 1500,
        showConfirmButton: false,
      });

      // التنقل بعد نجاح الإرسال
      navigate("/output", {
        state: {
          serviceName,
          courseName,
          coursCode,
          topic,
          lesson,
          result: response.data.data || "No result returned.",
        },
      });
    } catch (error) {
      // عرض SweetAlert للخطأ
      Swal.fire({
        icon: "error",
        title: "Failed process",
        text: error?.response?.data?.message || "something go wrong...",
      });
    }
  };

  const handleServiceClick3 = (serviceName) => {
    if (serviceName === "✏️ Drill") {
      fetchEachRequest(
        serviceName,
        `http://localhost:3000/student/${selectedCourseId}/drill`,
        {
          lectureName: title[indexCourse]?.LectureName,
          Subtopics: title[indexCourse]?.Subtopics,
        }
      );
    } else if (serviceName === "⚗️ Examples and Application") {
      fetchEachRequest(
        serviceName,
        `http://localhost:3000/student/${selectedCourseId}/examples-and-applications`,
        {
          lectureName: title[indexCourse]?.LectureName,
          Subtopics: title[indexCourse]?.Subtopics,
        }
      );
    } else if (serviceName === "✅ Test with Short Practice Questions") {
      fetchEachRequest(
        serviceName,
        `http://localhost:3000/student/${selectedCourseId}/test-knowledge`,
        {
          lectureName: title[indexCourse]?.LectureName,
          Subtopics: title[indexCourse]?.Subtopics,
        }
      );
    } else if (serviceName === "👥 Key Concepts") {
      fetchEachRequest(
        serviceName,
        `http://localhost:3000/student/${selectedCourseId}/review`,
        {
          lectureName: title[indexCourse]?.LectureName,
          Subtopics: title[indexCourse]?.Subtopics,
        }
      );
    }
  };
  const getAvailableServices = () => {
    if (selectedSubTopicIndex !== null) {
      return (
        <>
          <h3 className="section-title">📘 Study</h3>
          <div className="services-grid">
            {/* <div className="service-card">
              📖 <p>Personalized Content</p>
            </div> */}
            <div
              className="service-card"
              onClick={() => handleServiceClick3("✏️ Drill")}
            >
              ✏️ <p>Drill</p>
            </div>
          </div>

          <h3 className="section-title">📚 Review</h3>
          <div className="services-grid">
            {/* <div className="service-card">
              📄 <p>Summary</p>
            </div> */}
            <div
              className="service-card"
              onClick={() => handleServiceClick3("⚗️ Examples and Application")}
            >
              ⚗️ <p>Examples and Application</p>
            </div>
            <div
              className="service-card"
              onClick={() => handleServiceClick3("👥 Key Concepts")}
            >
              👥 <p>Key Concepts</p>
            </div>
            <div
              className="service-card"
              onClick={() =>
                handleServiceClick3("✅ Test with Short Practice Questions")
              }
            >
              ✅ <p>Test with Short Practice Questions</p>
            </div>
          </div>
        </>
      );
    } else if (selectedTopicIndex !== null) {
      return (
        <>
          <h3 className="section-title">📘 Study</h3>
          <div className="services-grid">
            <div
              className="service-card"
              onClick={() => handleServiceClick("📖 Personalized Content")}
            >
              📖 <p>Personalized Content</p>
            </div>
            <div
              className="service-card"
              onClick={() => handleServiceClick("✏️ Drill")}
            >
              ✏️ <p>Drill</p>
            </div>
          </div>

          <h3 className="section-title">📚 Review</h3>
          <div className="services-grid">
            <div
              className="service-card"
              onClick={() => handleServiceClick("📄 Summary")}
            >
              📄 <p>Summary</p>
            </div>
            <div
              className="service-card"
              onClick={() => handleServiceClick("⚗️ Examples and Application")}
            >
              ⚗️ <p>Examples and Application</p>
            </div>
            <div
              className="service-card"
              onClick={() => handleServiceClick("👥 Key Concepts")}
            >
              👥 <p>Key Concepts</p>
            </div>
            <div
              className="service-card"
              onClick={() =>
                handleServiceClick("✅ Test with Short Practice Questions")
              }
            >
              ✅ <p>Test with Short Practice Questions</p>
            </div>
          </div>
        </>
      );
    } else if (selectedCourseId !== null) {
      return (
        <>
          <div className="services-grid">
            <div
              className="service-card"
              onClick={() =>
                handleServiceClick1("✅ Test with Short Practice Questions")
              }
            >
              ✅ <p>Test with Short Practice Questions</p>
            </div>
          </div>
        </>
      );
    }
    return null;
  };

  const handleViewCourse = (index) => {
    const data = lesson.filter((item) => {
      return item.LectureName == title[index].LectureName;
    });

    if (data.length != 0) navigate("/course-content", { state: [data[0]] });
    else
      Swal.fire({
        icon: "info",
        title: "No Lesson Content",
        text: "There is no lesson content for this course yet.",
        confirmButtonText: "OK",
      });
  };

  return (
    <>
      <div className="dashboard-container">
        <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        <div className="sidebar">
          <div className="logo">Dashboard</div>
          <nav>
            <p className="courses-title">My courses</p>
            {courses.length === 0 ? (
              <p className="empty-message">No courses available</p>
            ) : (
              <ul>
                {courses.map((course, index) => (
                  <li
                    key={course.courseId}
                    onClick={() => toggleCourse(course.courseId, index)}
                    // className={
                    //   selectedCourseId === course.courseId
                    //     ? "selected-title"
                    //     : ""
                    // }
                  >
                    <span>
                      {course.courseName} ({course.courseCode.slice(0, 6)})
                    </span>

                    {expandedCourse === course.courseId && (
                      <ul>
                        {title.map((topic, index) => (
                          <li
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTopic(index);
                            }}
                            // className={
                            //   selectedTopicIndex === index
                            //     ? "selected-title"
                            //     : ""
                            // }
                          >
                            <span>{topic.LectureName}</span>
                            <svg
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewCourse(index);
                              }}
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                              style={{
                                cursor: "pointer",
                                marginLeft: "25px",
                                color: "#dcdcdc",
                              }}
                              title="عرض"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            {expandedTopic === index &&
                              Array.isArray(topic.Subtopics) && (
                                <ul>
                                  {topic.Subtopics.map((sub, subIndex) => {
                                    const subKey = `${subIndex}`;
                                    return (
                                      <li
                                        key={subKey}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSubtopicClick(index, subIndex);
                                        }}
                                        className={
                                          selectedSubTopicIndex === subKey
                                            ? "selected-title"
                                            : ""
                                        }
                                        style={{
                                          marginLeft:
                                            sub.length >= 40 ? "0" : "20px",
                                          cursor: "pointer",
                                          maxWidth: "500px",
                                          textAlign:
                                            sub.length >= 40 ? "center" : "",
                                        }}
                                      >
                                        📌 {sub}
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </nav>
        </div>

        <div className="main-content">
          <section className="services">
            <h2>Services</h2>
            {getAvailableServices()}
          </section>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import Navbar from "../../components/Navbar";
import axios from "axios";
import Swal from "sweetalert2";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [courses, setCourses] = useState([]);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [title, setTitle] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [lesson, setlesson] = useState([]);
  const [index, setIndex] = useState(0);
  const [contentModal, setContentModal] = useState("");
  const [newCourse, setNewCourse] = useState({
    courseName: "",
    courseCode: "",
    domain: "",
    subdomain: "",
    level: "",
  });
  const [idCourseFirst, setIdCourseFirst] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planData, setPlanData] = useState({
    numberOfWeeks: "",
    lecsPerWeek: "",
  });

  const [showExamModal, setShowExamModal] = useState(false);
  const [examData, setExamData] = useState({
    // lessons: [],
    allowedTime: "",
    score: "",
    easy: "",
    median: "",
    hard: "",
    questionType: [],
    percentages: {},
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get("http://localhost:3000/course", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // افترض إن الاستجابة عبارة عن مصفوفة من الكورسات
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
  }, [idCourseFirst]);

  // const toggleCourse = (index) => {
  //   setExpandedCourse(expandedCourse === index ? null : index);
  //   setExpandedTopic(null);
  // };

  const toggleCourse = async (index) => {
    if (expandedCourse === index) {
      setExpandedCourse(null);
      setExpandedTopic(null);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:3000/course/${index}/coursePlan`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Fetched course plan:", response.data.data.teachingPlan);
      setTitle(response.data.data.teachingPlan);

      const lessonResponse = await axios.get(
        `http://localhost:3000/course/lessons/${index}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setlesson(lessonResponse.data.data);
      setExpandedCourse(index);
      setExpandedTopic(null);
      // optional: store coursePlan in state
    } catch (error) {
      console.error("Error fetching course plan:", error);
      // Swal.fire({
      //   icon: "error",
      //   title: "Failed to fetch course plan",
      //   text: error?.response?.data?.message || "Please try again later.",
      // });
      setExpandedCourse(index);
      setExpandedTopic(null);
      setTitle([]);
    }
  };

  const toggleTopic = (index) => {
    setExpandedTopic(expandedTopic === index ? null : index);
    setSelectedTitle(expandedTopic === index ? null : index);
    setIndex(index);
  };

  const handleServiceClick1 = async (path) => {
    const token = localStorage.getItem("token");

    // ✅ إظهار سبينر التحميل قبل الطلب
    Swal.fire({
      title: "Creating Syllabus...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await axios.post(
        `http://localhost:3000/course/${expandedCourse}/createSyllabus`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ✅ لو الطلب نجح، غيّر الرسالة إلى نجاح
      Swal.fire({
        icon: "success",
        title: "Syllabus created!",
        showConfirmButton: false,
        timer: 1500,
      }).then(() =>
        navigate(`${path}`, { state: [response.data.data, expandedCourse] })
      ); // تقدر تمرر courseId في المسار لو عايز
    } catch (error) {
      console.error("Error creating syllabus:", error);

      Swal.fire({
        icon: "error",
        title: "Failed to create syllabus",
        text: error?.response?.data?.message || "Please try again later",
      });
    }
  };

  const handleServiceClickContent = async () => {
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
        `http://localhost:3000/course/${expandedCourse}/createLessonContent`,
        title[index],
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
            title[index].LectureName,
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
  };

  const handleServiceClickAssignment = async () => {
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
        `http://localhost:3000/course/${expandedCourse}/create-assignment`,
        title[index], // نفس شكل body اللي بتبعت بيه في createLessonContent
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
          state: [response.data.data, expandedCourse],
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

  const openModel = (content) => {
    setShowExamModal(true);
    setContentModal(content);
  };
  const getAvailableServices = () => {
    if (expandedTopic !== null) {
      return (
        <>
          <div
            className="service-card"
            onClick={() => handleServiceClickContent()}
          >
            👥<p>Generate a lesson content</p>
          </div>
          <div
            className="service-card"
            onClick={() => handleServiceClickAssignment()}
          >
            📄<p>Generate an Assignment</p>
          </div>
        </>
      );
    } else if (expandedCourse !== null) {
      return (
        <>
          <div
            className="service-card"
            onClick={() => handleServiceClick1("/syllabus")}
          >
            📖<p>Generate a course syllabus</p>
          </div>
          <div className="service-card" onClick={() => setShowPlanModal(true)}>
            ✏️<p>Generate a course plan</p>
          </div>

          <div className="service-card" onClick={() => openModel("exam")}>
            📄<p>Generate an exam</p>
          </div>

          <div className="service-card" onClick={() => handleCreateActivity()}>
            ⚗️<p>Generate course activities</p>
          </div>
        </>
      );
    }
    return null;
  };

  const handleCreateActivity = async () => {
    const token = localStorage.getItem("token");
    Swal.fire({
      title: "Generating Activity...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await axios.post(
        `http://localhost:3000/course/${expandedCourse}/create-activities`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Activity generated successfully!",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        navigate("/activityShow", {
          state: [response.data.data, expandedCourse],
        });
      });
    } catch (error) {
      console.error("Error generating activity:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to generate activity",
        text: error?.response?.data?.message || "Please try again later.",
      });
    }
  };
  const handleMakePlan = async () => {
    if (!planData.numberOfWeeks || !planData.lecsPerWeek) {
      Swal.fire({
        icon: "warning",
        title: "Please fill all fields",
      });
      return;
    }

    setShowPlanModal(false);

    Swal.fire({
      title: "Generating Plan...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:3000/course/${expandedCourse}/createPlan`,
        planData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Plan created successfully!",
        showConfirmButton: false,
        timer: 1500,
      });
      navigate("/plan", {
        state: [response.data.data.teachingPlan, expandedCourse],
      }); // send the generated plan to next page
    } catch (error) {
      console.error("Error generating plan:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to generate plan",
        text: error?.response?.data?.message || "Please try again later.",
      });
    }
  };

  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setNewCourse({ ...newCourse, [name]: value });
  };

  const handleAddCourse = async () => {
    setShowModal(false);

    if (newCourse.courseName && newCourse.courseCode) {
      // إظهار سبينر التحميل
      Swal.fire({
        title: "Adding Course...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const token = localStorage.getItem("token");

        const response = await axios.post(
          "http://localhost:3000/course/add-course",
          newCourse,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200 || response.status === 201) {
          setCourses([...courses, newCourse]);
          setNewCourse({
            courseName: "",
            courseCode: "",
            domain: "",
            subdomain: "",
            level: "",
          });
          setShowModal(false);
          setIdCourseFirst(response.data.data._id);
          Swal.fire({
            icon: "success",
            title: "Course added successfully!",
            showConfirmButton: false,
            timer: 500,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Something went wrong",
            text: "Please try again.",
          });
        }
      } catch (error) {
        console.error("Error adding course:", error);
        Swal.fire({
          icon: "error",
          title: "Failed to add course",
          text: "Course added before",
        });
      }
    } else {
      Swal.fire({
        icon: "warning",
        title: "Missing data",
        text: "Please fill in course name and code.",
      });
    }
  };

  const handleDeleteCourse = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/course/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setCourses((prevCourses) =>
        prevCourses.filter((course) => course.courseId !== id)
      );
    } catch (err) {
      console.error("Error deleting course", err);
    }
  };

  const handleShowCoursePlan = async () => {
    Swal.fire({
      title: "Showing Plan...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3000/course/${expandedCourse}/coursePlan`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "processing successfully!",
        showConfirmButton: false,
        timer: 1500,
      });

      navigate("/plan", {
        state: [response.data.data.teachingPlan, expandedCourse],
      }); // send the generated plan to next page
    } catch (error) {
      console.error("Error show plan:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to show plan",
        text: error?.response?.data?.message || "Please try again later.",
      });
    }
  };

  const handleGenerateExam = async () => {
    setShowExamModal(false);
    const totalQuestions = Object.values(examData.percentages).reduce(
      (acc, prev) => acc + parseInt(prev),
      0
    );
    const finalExamData = {
      ...examData,
      numOfQuestions: totalQuestions,
    };

    if (contentModal == "exam") {
      Swal.fire({
        title: "Generating Exam...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `http://localhost:3000/course/${expandedCourse}/create-exam`,
          finalExamData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        Swal.fire({
          icon: "success",
          title: "Exam generated successfully!",
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          navigate("/exam", { state: [response.data.data, expandedCourse] });
        });
      } catch (error) {
        console.error("Error generating exam:", error);
        Swal.fire({
          icon: "error",
          title: "Failed to generate exam",
          text: error?.response?.data?.message || "Please try again later.",
        });
      }
    }
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
              {courses.map((course) => (
                <li
                  key={course.courseId}
                  onClick={() => toggleCourse(course.courseId)}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>
                      {course.courseName} ({course.courseCode.slice(0, 6)})
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <svg
                        onClick={(e) => {
                          e.stopPropagation();
                          return handleShowCoursePlan();
                        }}
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="white"
                        viewBox="0 0 24 24"
                        style={{ cursor: "pointer" }}
                        title="الخطة"
                      >
                        <path d="M3 4v16h18V4H3zm16 14H5V6h14v12zM7 8h10v2H7V8zm0 4h7v2H7v-2z" />
                      </svg>

                      <svg
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCourse(course.courseId);
                        }}
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="white"
                        viewBox="0 0 16 16"
                        style={{ cursor: "pointer" }}
                        title="حذف"
                      >
                        <path d="M5.5 5.5a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0v-6a.5.5 0 0 1 .5-.5zm2.5.5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0v-6zm1.5-.5a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0v-6a.5.5 0 0 1 .5-.5z" />
                        <path
                          fillRule="evenodd"
                          d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1 0-2h3.086a1 1 0 0 1 .707.293l.707.707h2.586l.707-.707A1 1 0 0 1 9.414 1H12.5a1 1 0 0 1 1 1v1h1a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11z"
                        />
                      </svg>
                    </span>
                  </span>

                  {expandedCourse === course.courseId && (
                    <ul>
                      {title.map((topic, j) =>
                        title.length > 0 ? (
                          <li
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                            key={j}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTopic(j);
                            }}
                            className={
                              selectedTitle === j ? "selected-title" : ""
                            }
                          >
                            {topic.LectureName}
                            <svg
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewCourse(j);
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
                                marginLeft: "8px",
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
                          </li>
                        ) : (
                          <li
                            key={j}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTopic(j);
                            }}
                            className={
                              selectedTitle === j ? "selected-title" : ""
                            }
                          ></li>
                        )
                      )}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
          <div className="new-course" onClick={() => setShowModal(true)}>
            New course +
          </div>
        </nav>
      </div>

      <div className="main-content">
       <section className="services">
  {expandedCourse === null && expandedTopic === null ? (
    <div className="welcome-box">
      <h2>  Welcome! Ready to get started?  </h2>
      <p> Select a course from the list to explore its services.</p>
    </div>
  ) : (
    <>
      <h2>Services</h2>
      <div className="services-grid">{getAvailableServices()}</div>
    </>
  )}
</section>

      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="form-title">Add New Course</h2>

            <div className="form-group">
              <label className="form-label">Course Name</label>
              <input
                type="text"
                name="courseName"
                onChange={handleCourseChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Course Code</label>
              <input
                type="text"
                name="courseCode"
                onChange={handleCourseChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Domain</label>
              <input type="text" name="domain" onChange={handleCourseChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Subdomain</label>
              <input
                type="text"
                name="subdomain"
                onChange={handleCourseChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Level</label>
              <div className="level-options">
                {["Beginner", "Median", "Advanced"].map((level) => (
                  <label
                    key={level}
                    className={`check-radio ${
                      newCourse.level === level ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="level"
                      value={level}
                      checked={newCourse.level === level}
                      onChange={handleCourseChange}
                    />
                    {level}
                  </label>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button className="gold-button" onClick={handleAddCourse}>
                Save
              </button>
              <button
                className="gold-button"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showPlanModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="form-title">Generate Course Plan</h2>

            <div className="form-group">
              <label className="form-label">Number of Weeks</label>
              <input
                type="number"
                min={0}
                name="numberOfWeeks"
                value={planData.numberOfWeeks}
                onChange={(e) =>
                  setPlanData({ ...planData, numberOfWeeks: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lectures per Week</label>
              <input
                type="number"
                min={0}
                name="lecsPerWeek"
                value={planData.lecsPerWeek}
                onChange={(e) =>
                  setPlanData({ ...planData, lecsPerWeek: e.target.value })
                }
              />
            </div>

            <div className="modal-actions">
              <button className="gold-button" onClick={() => handleMakePlan()}>
                Generate
              </button>

              <button
                className="gold-button"
                onClick={() => setShowPlanModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showExamModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="form-title">Generate {contentModal}</h2>

            {/* Lessons (multi-select) */}
            {/* <div className="form-group">
              <label className="form-label">Lessons</label>
              <select
                multiple
                onChange={(e) =>
                  setExamData((prev) => ({
                    ...prev,
                    lessons: Array.from(
                      e.target.selectedOptions,
                      (opt) => opt.value
                    ),
                  }))
                }
              >
                {title.map((lesson, index) => (
                  <option key={index} value={lesson.LectureName}>
                    {lesson.LectureName}
                  </option>
                ))}
              </select>
            </div> */}

            {/* Time */}
            <div className="form-group">
              <label className="form-label">Time (minutes)</label>
              <input
                type="number"
                min={0}
                value={examData.allowedTime}
                onChange={(e) =>
                  setExamData({ ...examData, allowedTime: e.target.value })
                }
              />
            </div>

            {/* Score */}
            <div className="form-group">
              <label className="form-label">Score</label>
              <input
                type="number"
                min={0}
                value={examData.score}
                onChange={(e) =>
                  setExamData({ ...examData, score: e.target.value })
                }
              />
            </div>

            {/* Degree of difficulty */}
            <div className="form-group">
              <label className="form-label">Degree of Difficulty (%)</label>
              <input
                type="number"
                min={0}
                placeholder="Easy"
                value={examData.easy}
                onChange={(e) =>
                  setExamData({ ...examData, easy: e.target.value })
                }
              />
              <input
                type="number"
                min={0}
                placeholder="Medium"
                value={examData.medium}
                onChange={(e) =>
                  setExamData({ ...examData, median: e.target.value })
                }
              />
              <input
                type="number"
                min={0}
                placeholder="Hard"
                value={examData.hard}
                onChange={(e) =>
                  setExamData({ ...examData, hard: e.target.value })
                }
              />
            </div>

            {/* Type of questions */}
            <div className="form-group">
              <label className="form-label">Type of Questions</label>
              {["MCQ", "Fill the blank", "Essay"].map((type) => (
                <label key={type} className="check-radio">
                  <input
                    style={{ width: "50px" }}
                    type="checkbox"
                    checked={examData.questionType.includes(type)}
                    onChange={(e) => {
                      e.preventDefault();
                      const updatedTypes = examData.questionType.includes(type)
                        ? examData.questionType.filter((t) => t !== type)
                        : [...examData.questionType, type];
                      setExamData({ ...examData, questionType: updatedTypes });
                    }}
                  />
                  {type}
                  <input
                    style={{ width: "50%" }}
                    type="number"
                    min={0}
                    placeholder=""
                    value={examData.percentages[type] || ""}
                    onChange={(e) =>
                      setExamData({
                        ...examData,
                        percentages: {
                          ...examData.percentages,
                          [type]: e.target.value,
                        },
                      })
                    }
                    className="inline-percentage-input"
                  />
                </label>
              ))}
            </div>

            <div className="modal-actions">
              <button
                className="gold-button"
                onClick={() => {
                  handleGenerateExam();
                }}
              >
                Generate
              </button>

              <button
                className="gold-button"
                onClick={() => setShowExamModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

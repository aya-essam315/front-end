import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TsignUp.css";
import Navbar from "../../components/Navbar";
import axios from "axios";
import Swal from "sweetalert2";

export default function TsignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    DOB: "",
    gender: "",
    role: "teacher",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    Swal.fire({
      title: "Signing up...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await axios.post("http://localhost:3000/auth/signup", formData);

      Swal.fire({
        icon: "success",
        title: "Account created successfully!",
        showConfirmButton: false,
        timer: 1500,
      });

      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error);

      Swal.fire({
        icon: "error",
        title: "Signup failed",
        text: error?.response?.data?.message || "Please try again later.",
      });
    }
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   console.log(formData);
  // };
  return (
    <div className="signup-container">
      <Navbar />
      <h2 className="signup-title">Teacher Sign Up</h2>
      <form onSubmit={handleSubmit} className="signup-form">
        <input
          type="text"
          name="firstName"
          placeholder="first Name"
          required
          onChange={handleChange}
        />
        <input
          type="text"
          name="lastName"
          placeholder="last Name"
          required
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          onChange={handleChange}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          required
          onChange={handleChange}
        />
        <input type="date" name="DOB" required onChange={handleChange} />
        <div className="gender-group">
          <label>
            <input
              type="radio"
              name="gender"
              value="male"
              onChange={handleChange}
            />{" "}
            Male
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="female"
              onChange={handleChange}
            />{" "}
            Female
          </label>
        </div>
        <button type="submit" className="signup-button">
          Sign Up
        </button>
      </form>
    </div>
  );
}

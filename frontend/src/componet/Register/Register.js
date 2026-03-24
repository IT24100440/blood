import React, { useState } from 'react';
import axios from 'axios';
import './Register.css'; 

function Register() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { name, email, password } = user;

  const onInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/user", user);
      alert("Registered Successfully");
      
      // Clear form
      setUser({
        name: "",
        email: "",
        password: "",
      });
      
      // Redirect
      window.location.href = '/login';

    } catch (error) {
      console.error(error);
      alert("Registration Failed");
    }
  };

  return (
    <div className="register-page"> {/* Wrapper for centering */}
      <div className="register-container">
        
        {/* Header Section */}
        <div className="register-header">
            <h2>Create Account</h2>
            <p>Join the Inventory Management System</p>
        </div>

        <form onSubmit={onSubmit}>
          
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your full name"
              value={name}
              onChange={onInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={onInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Create a password"
              value={password}
              onChange={onInputChange}
              required
            />
          </div>

          <button type="submit" className="register-btn">Register</button>
        </form>

        {/* Helper Link */}
        <div className="login-link">
            <p>Already have an account? <a href="/login">Login here</a></p>
        </div>

      </div>
    </div>
  );
}

export default Register;
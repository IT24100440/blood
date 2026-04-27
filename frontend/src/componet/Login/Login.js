import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; 

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    const loginData = { email, password };
    try {
      const response = await axios.post("http://localhost:8080/login", loginData);
      if (response.data.id) {
        localStorage.setItem("userId", response.data.id);
        alert("Login Successful");
        window.location.href = "/displayItem";
      } else {
        alert("Invalid Credentials");
      }
    } catch (error) {
      alert("Login Failed");
      window.location.reload();
    }
  };

  return (
    <div className="login-page"> {/* Wrapper for centering */}
      <div className="login-container">
        
        {/* Added a Header for professional look */}
        <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Inventory Management System</p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;

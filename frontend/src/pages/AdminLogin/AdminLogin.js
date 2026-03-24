import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { adminLogin, createAdmin } from '../../services/api';
import { validators, validateForm } from '../../utils/validators';
import './AdminLogin.css';

function AdminLogin() {
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validateLoginForm = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailError = validators.email(email);
      if (emailError) errors.email = emailError;
    }
    
    if (!password.trim()) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = () => {
    const errors = {};
    if (!fullName.trim()) errors.fullName = 'Full name is required';
    else if (fullName.trim().length < 3) errors.fullName = 'Full name must be at least 3 characters';
    
    if (!email.trim()) errors.email = 'Email is required';
    else {
      const emailError = validators.email(email);
      if (emailError) errors.email = emailError;
    }
    
    if (!password.trim()) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
    
    if (!confirmPassword.trim()) errors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLoginForm()) {
      setError('Please fix all errors in the form');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await adminLogin(email, password);
      localStorage.setItem('adminId', res.data.adminId);
      localStorage.setItem('adminEmail', res.data.email);
      localStorage.setItem('adminName', res.data.fullName);
      alert('Login successful!');
      window.location.href = '/admin/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegisterForm()) {
      setError('Please fix all errors in the form');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await createAdmin({ fullName, email, password, role: 'Admin' });
      setSuccess('Registration successful! Please login with your credentials.');
      setTimeout(() => {
        setIsRegister(false);
        setFullName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setSuccess('');
        setFieldErrors({});
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Header />
      
      <div className="login-container">
        <div className="login-box">
          <div className="tabs">
            <button 
              className={`tab-btn ${!isRegister ? 'active' : ''}`}
              onClick={() => { setIsRegister(false); setError(''); setSuccess(''); }}
            >
              🔐 Login
            </button>
            <button 
              className={`tab-btn ${isRegister ? 'active' : ''}`}
              onClick={() => { setIsRegister(true); setError(''); setSuccess(''); }}
            >
              📝 Register
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {!isRegister ? (
            <>
              <h1>🔐 Admin Login</h1>
              <form onSubmit={handleLogin} className="login-form">
                <div className="form-group">
                  <label>Email Address:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldErrors({}); }}
                    placeholder="admin@example.com"
                    required
                    className={`form-input ${fieldErrors.email ? 'input-error' : ''}`}
                  />
                  {fieldErrors.email && <span className="error-text">{fieldErrors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Password:</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors({}); }}
                    placeholder="Enter your password"
                    required
                    className={`form-input ${fieldErrors.password ? 'input-error' : ''}`}
                  />
                  {fieldErrors.password && <span className="error-text">{fieldErrors.password}</span>}
                </div>

                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              <div className="login-footer">
                <p>Don't have an account? Click the <strong>Register</strong> tab above.</p>
              </div>
            </>
          ) : (
            <>
              <h1>📝 Register New Admin</h1>
              <form onSubmit={handleRegister} className="login-form">
                <div className="form-group">
                  <label>Full Name:</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); setFieldErrors({}); }}
                    placeholder="Admin Full Name"
                    required
                    className={`form-input ${fieldErrors.fullName ? 'input-error' : ''}`}
                  />
                  {fieldErrors.fullName && <span className="error-text">{fieldErrors.fullName}</span>}
                </div>

                <div className="form-group">
                  <label>Email Address:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldErrors({}); }}
                    placeholder="admin@example.com"
                    required
                    className={`form-input ${fieldErrors.email ? 'input-error' : ''}`}
                  />
                  {fieldErrors.email && <span className="error-text">{fieldErrors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Password:</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors({}); }}
                    placeholder="Create a password (min 6 characters)"
                    required
                    className={`form-input ${fieldErrors.password ? 'input-error' : ''}`}
                  />
                  {fieldErrors.password && <span className="error-text">{fieldErrors.password}</span>}
                </div>

                <div className="form-group">
                  <label>Confirm Password:</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors({}); }}
                    placeholder="Confirm your password"
                    required
                    className={`form-input ${fieldErrors.confirmPassword ? 'input-error' : ''}`}
                  />
                  {fieldErrors.confirmPassword && <span className="error-text">{fieldErrors.confirmPassword}</span>}
                </div>

                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </form>

              <div className="login-footer">
                <p>Already have an account? Click the <strong>Login</strong> tab above.</p>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default AdminLogin;

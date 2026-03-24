import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './UpdateProfile.css'; 

function UpdateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/user/${id}`);
        setFormData({
          name: res.data.name || "",
          email: res.data.email || "",
          password: ""
        });
      } catch (error) {
        console.error("Fetch Error:", error.response?.data || error.message);
        alert("Failed to load user data");
      }
    };

    fetchUser();
  }, [id]);

  const onInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const updatedUser = {
      name: formData.name,
      email: formData.email,
    };

    if (formData.password.trim() !== "") {
      updatedUser.password = formData.password;
    }

    try {
      await axios.put(`http://localhost:8080/user/${id}`, updatedUser);
      alert("Profile Updated Successfully");
      navigate('/userProfile');
    } catch (error) {
      console.error("Update Error:", error.response?.data || error.message);
      alert("Profile Update Failed");
    }
  };

  return (
    <div className="update-page">
      <div className="update-container">
        <div className="update-header">
          <h2>Edit Profile</h2>
          <p>Update your account information</p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Update name"
              value={formData.name}
              onChange={onInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Update email"
              value={formData.email}
              onChange={onInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>New Password (leave blank to keep current)</label>
            <input
              type="password"
              name="password"
              placeholder="Enter new password"
              value={formData.password}
              onChange={onInputChange}
            />
          </div>

          <div className="button-group">
            <button type="submit" className="save-btn">Save Changes</button>
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={() => navigate('/userProfile')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateProfile;
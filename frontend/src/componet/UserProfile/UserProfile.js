import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './UserProfile.css'; 

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('User not logged in');
      setLoading(false);
      return;
    }

    axios.get(`http://localhost:8080/user/${userId}`)
      .then((response) => {
        setUser(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Error fetching user data');
        setLoading(false);
      });
  }, []);

  const UpdateNavigate = (id) => {
    window.location.href = `/updateProfile/${id}`;
  };

  const deleteAccount = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:8080/user/${id}`);
        alert('Account deleted successfully');
        localStorage.removeItem('userId');
        window.location.href = '/register';
      } catch (err) {
        alert('Error deleting account');
      }
    }
  };

  if (loading) return <div className="status-message">Loading Profile...</div>;
  if (error) return <div className="status-message" style={{color: 'red'}}>{error}</div>;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <h2>User Profile</h2>
          <p>Manage your account settings</p>
        </div>

        {user ? (
          <div className="profile-body">
            <div className="info-item">
              <span className="label">User ID:</span>
              <span className="value">#{user.id}</span>
            </div>
            <div className="info-item">
              <span className="label">Full Name:</span>
              <span className="value">{user.name}</span>
            </div>
            <div className="info-item">
              <span className="label">Email:</span>
              <span className="value">{user.email}</span>
            </div>
            <div className="info-item">
              <span className="label">Password:</span>
              <span className="value">********</span> 
            </div>

            <div className="profile-actions">
              <button className="btn-update" onClick={() => UpdateNavigate(user.id)}>
                Update Profile
              </button>
              <button className="btn-delete" onClick={() => deleteAccount(user.id)}>
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-body">
            <p>No user found. Please log in again.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
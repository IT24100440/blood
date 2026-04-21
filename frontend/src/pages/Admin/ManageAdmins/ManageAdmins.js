// Import React hooks
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Footer from '../../../components/Footer/Footer';
import { getAllAdmins, createAdmin, deleteAdmin } from '../../../services/api';
import { exportRowsToPdf, includesQuery } from '../../../utils/adminExport';
import { validators } from '../../../utils/validators';

function ManageAdmins() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', role: 'Admin'
  });

  useEffect(() => {
    const adminId = localStorage.getItem('adminId');
    if (!adminId) navigate('/admin-login');
    else fetchAdmins();
  }, [navigate]);

  // Fetch all admins from backend
  const fetchAdmins = async () => {
    try {
      const res = await getAllAdmins();
      setAdmins(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validate admin input fields before submit
    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      alert('Full name must be at least 3 characters');
      return;
    }

    // Validate email
    const emailError = validators.email(formData.email);
    if (emailError) {
      alert(emailError);
      return;
    }

    // Validate password
    if (!formData.password || formData.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    // Validate role
    if (!formData.role) {
      alert('Please select a role');
      return;
    }

    try {
      // Create admin using API
      await createAdmin(formData);
      alert('Admin created successfully!');
      setFormData({ fullName: '', email: '', password: '', role: 'Admin' });
      setShowForm(false);
      fetchAdmins();
    } catch (error) {
      alert('Error: ' + error.response?.data?.message);
    }
  };

  // Handle delete admin
  const handleDelete = async (id) => {
    
    // Confirm before delete
    if (window.confirm('Delete this admin?')) {
      try {
        await deleteAdmin(id);
        fetchAdmins();
      } catch (error) {
        alert('Error');
      }
    }
  };

  const filteredAdmins = admins.filter((a) => includesQuery([
    a.fullName,
    a.email,
    a.role,
  ], searchTerm));

  const handleExportPdf = () => {
    const rows = filteredAdmins.map((a) => ([
      a.fullName,
      a.email,
      a.role,
      new Date(a.createdAt).toLocaleDateString(),
    ]));
    exportRowsToPdf('Admin Users Report', ['Name', 'Email', 'Role', 'Created'], rows);
  };

  return (
    <div className="admin-page">
      <Header />
      <div className="admin-content">
        <Sidebar />
        <main className="admin-main">
          <div className="page-header">
            <h1>👨‍💼 Manage Admins</h1>
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : '➕ New Admin'}
            </button>
          </div>

          {showForm && (
            <div className="form-container">
              <form onSubmit={handleSubmit} className="admin-form">
                <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleInputChange} minLength="3" required />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} minLength="6" required />
                <select name="role" value={formData.role} onChange={handleInputChange}>
                  <option>Admin</option><option>Super Admin</option>
                </select>
                <button type="submit" className="btn btn-primary">Create Admin</button>
              </form>
            </div>
          )}

          <div className="filters" style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search admin name, email, role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
            <button type="button" className="btn btn-primary" onClick={handleExportPdf}>📄 Generate PDF</button>
          </div>

          {loading ? <p className="loading">Loading...</p> : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th><th>Email</th><th>Role</th><th>Created</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>

            {/* Display filtered admins */}
                  {filteredAdmins.map(a => (
                    <tr key={a.adminId}>
                      <td>{a.fullName}</td>
                      <td>{a.email}</td>
                      <td>{a.role}</td>
                      <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                      <td>

                    {/* Delete button */}
                        <button className="btn-small btn-delete" onClick={() => handleDelete(a.adminId)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}

// Export component
export default ManageAdmins;

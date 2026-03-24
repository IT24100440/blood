import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Footer from '../../../components/Footer/Footer';
import { getAllHospitals, createHospital, updateHospital, deleteHospital } from '../../../services/api';
import { exportRowsToPdf, includesQuery } from '../../../utils/adminExport';
import './ManageHospitals.css';

function ManageHospitals() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    hospitalName: '',
    hospitalCode: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    timePeriod: '9AM-5PM',
    status: 'Active',
  });
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const adminId = localStorage.getItem('adminId');
    if (!adminId) navigate('/admin-login');
    else fetchHospitals();
  }, [navigate]);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const res = await getAllHospitals();
      setHospitals(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      alert('Failed to load hospitals: ' + error.message);
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    // validate hospital input fields 
    const errors = {};
    if (!formData.hospitalName.trim()) errors.hospitalName = 'Hospital name is required';
    if (!formData.hospitalCode.trim()) errors.hospitalCode = 'Hospital code is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.phone.trim()) errors.phone = 'Phone is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (formData.email && !formData.email.includes('@')) errors.email = 'Valid email is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      hospitalName: '',
      hospitalCode: '',
      address: '',
      city: '',
      phone: '',
      email: '',
      timePeriod: '9AM-5PM',
      status: 'Active',
    });
    setFormErrors({});
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingId) {
        await updateHospital(editingId, formData);
        alert('Hospital updated successfully');
      } else {
        await createHospital(formData);
        alert('Hospital added successfully');
      }
      resetForm();
      fetchHospitals();
    } catch (error) {
      console.error('Error saving hospital:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete hospital "${name}"?`)) return;
    try {
      await deleteHospital(id);
      fetchHospitals();
    } catch (error) {
      console.error('Error deleting hospital:', error);
      alert('Error deleting hospital: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (hospital) => {
    setFormData({
      hospitalName: hospital.hospitalName || '',
      hospitalCode: hospital.hospitalCode || '',
      address: hospital.address || '',
      city: hospital.city || '',
      phone: hospital.phone || '',
      email: hospital.email || '',
      timePeriod: hospital.timePeriod || '9AM-5PM',
      status: hospital.status || 'Active',
    });
    setEditingId(hospital.hospitalId);
    setShowForm(true);
  };

  const filteredHospitals = hospitals.filter((h) =>
    includesQuery([
      h.hospitalName,
      h.hospitalCode,
      h.address,
      h.city,
      h.phone,
      h.email,
      h.status,
    ], searchTerm)
  );

  const handleExportPdf = () => {
    const rows = filteredHospitals.map((h) => [
      h.hospitalName,
      h.hospitalCode,
      h.city,
      h.phone,
      h.email,
      h.status,
    ]);
    exportRowsToPdf('Admin Hospitals Report', ['Hospital', 'Code', 'City', 'Phone', 'Email', 'Status'], rows);
  };

  const activeCount = hospitals.filter((h) => h.status === 'Active').length;
  const inactiveCount = hospitals.filter((h) => h.status === 'Inactive').length;

  return (
    <div className="admin-page">
      <Header />
      <div className="admin-content">
        <Sidebar />
        <main className="admin-main">
          <div className="page-header">
            <h1>🏥 Manage Hospitals</h1>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search hospitals, code, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-input"
              />
              <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
                {showForm ? '✕ Cancel' : '➕ Add New Hospital'}
              </button>
              <button className="btn btn-secondary" onClick={handleExportPdf}>📄 Generate PDF</button>
            </div>
          </div>

          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-icon">🏥</div>
              <div className="summary-info">
                <h3>{hospitals.length}</h3>
                <p>Total Hospitals</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon" style={{ color: '#28a745' }}>✓</div>
              <div className="summary-info">
                <h3>{activeCount}</h3>
                <p>Active Hospitals</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon" style={{ color: '#ffc107' }}>○</div>
              <div className="summary-info">
                <h3>{inactiveCount}</h3>
                <p>Inactive Hospitals</p>
              </div>
            </div>
          </div>

          {showForm && (
            <div className="form-container">
              <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-row">
                  <div>
                    <label>Hospital Name: *</label>
                    <input type="text" name="hospitalName" value={formData.hospitalName} onChange={handleInputChange} className={formErrors.hospitalName ? 'input-error' : ''} required />
                    {formErrors.hospitalName && <span className="error-text">{formErrors.hospitalName}</span>}
                  </div>
                  <div>
                    <label>Hospital Code: *</label>
                    <input type="text" name="hospitalCode" value={formData.hospitalCode} onChange={handleInputChange} className={formErrors.hospitalCode ? 'input-error' : ''} required />
                    {formErrors.hospitalCode && <span className="error-text">{formErrors.hospitalCode}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div>
                    <label>Address: *</label>
                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} className={formErrors.address ? 'input-error' : ''} required />
                    {formErrors.address && <span className="error-text">{formErrors.address}</span>}
                  </div>
                  <div>
                    <label>City: *</label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} className={formErrors.city ? 'input-error' : ''} required />
                    {formErrors.city && <span className="error-text">{formErrors.city}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div>
                    <label>Phone: *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={formErrors.phone ? 'input-error' : ''} required />
                    {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
                  </div>
                  <div>
                    <label>Email: *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={formErrors.email ? 'input-error' : ''} required />
                    {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div>
                    <label>Operating Hours:</label>
                    <input type="text" name="timePeriod" value={formData.timePeriod} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label>Status:</label>
                    <select name="status" value={formData.status} onChange={handleInputChange}>
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">{editingId ? '💾 Update Hospital' : '➕ Add Hospital'}</button>
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <p className="loading">⏳ Loading hospitals...</p>
          ) : filteredHospitals.length === 0 ? (
            <div className="no-data-message">
              <p>📭 No hospitals found.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Hospital Name</th>
                    <th>Code</th>
                    <th>City</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Hours</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHospitals.map((hospital) => (
                    <tr key={hospital.hospitalId}>
                      <td><strong>{hospital.hospitalName}</strong></td>
                      <td><code>{hospital.hospitalCode}</code></td>
                      <td>{hospital.city}</td>
                      <td><a href={`tel:${hospital.phone}`}>{hospital.phone}</a></td>
                      <td><a href={`mailto:${hospital.email}`}>{hospital.email}</a></td>
                      <td>{hospital.timePeriod}</td>
                      <td><span className={`badge ${hospital.status.toLowerCase()}`}>{hospital.status}</span></td>
                      <td>
                        <button className="btn-small btn-edit" onClick={() => handleEdit(hospital)}>✏️ Edit</button>
                        <button className="btn-small btn-delete" onClick={() => handleDelete(hospital.hospitalId, hospital.hospitalName)}>🗑️ Delete</button>
                        <button className="btn-small btn-view" onClick={() => navigate(`/admin/hospitals/${hospital.hospitalId}`)}>📊 Dashboard</button>
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

export default ManageHospitals;

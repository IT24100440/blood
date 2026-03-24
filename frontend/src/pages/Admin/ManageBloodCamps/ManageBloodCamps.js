import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Footer from '../../../components/Footer/Footer';
import { getAllBloodCamps, createBloodCamp, updateBloodCamp, deleteBloodCamp, getAllHospitals } from '../../../services/api';
import { exportRowsToPdf, includesQuery } from '../../../utils/adminExport';
import './ManageBloodCamps.css';

function ManageBloodCamps() {
  const navigate = useNavigate();
  const [camps, setCamps] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', date: '', time: '', location: '', hospitalId: '', description: '', maxDonors: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const adminId = localStorage.getItem('adminId');
    if (!adminId) navigate('/admin-login');
    else fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [campRes, hosRes] = await Promise.all([getAllBloodCamps(), getAllHospitals()]);
      console.log('Camps response:', campRes.data);
      console.log('Hospitals response:', hosRes.data);
      // Ensure camps is always an array
      const campsData = Array.isArray(campRes.data) ? campRes.data : [];
      const hospitalsData = Array.isArray(hosRes.data) ? hosRes.data : [];
      setCamps(campsData);
      setHospitals(hospitalsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setCamps([]);
      setHospitals([]);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // validate blood camp input fields before submit
    if (!formData.title.trim()) {
      alert('Please enter camp title');
      return;
    }
    if (!formData.date) {
      alert('Please select camp date');
      return;
    }
    if (!formData.time) {
      alert('Please select camp time');
      return;
    }
    if (new Date(`${formData.date}T${formData.time}`) < new Date()) {
      alert('Camp date/time must be in the future');
      return;
    }
    if (!formData.location.trim()) {
      alert('Please enter location');
      return;
    }
    if (!formData.hospitalId) {
      alert('Please select a hospital');
      return;
    }
    if (!formData.maxDonors || parseInt(formData.maxDonors) < 1) {
      alert('Please enter valid maximum donors (minimum 1)');
      return;
    }
    if (!formData.description.trim()) {
      alert('Please enter camp description');
      return;
    }
    
    try {
      // Convert string values to proper types
      const submitData = {
        ...formData,
        hospitalId: parseInt(formData.hospitalId),
        maxDonors: parseInt(formData.maxDonors)
      };

      if (editingId) {
        await updateBloodCamp(editingId, submitData);
        alert('✅ Camp updated successfully!');
      } else {
        await createBloodCamp(submitData);
        alert('✅ Camp created successfully!');
      }
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Full error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert('❌ Error: ' + errorMsg);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this blood camp?')) {
      try {
        await deleteBloodCamp(id);
        alert('Blood camp deleted successfully!');
        fetchData();
      } catch (error) {
        console.error('Delete error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete camp';
        alert('Error: ' + errorMessage);
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', date: '', time: '', location: '', hospitalId: '', description: '', maxDonors: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredCamps = camps.filter((c) => includesQuery([
    c.title,
    c.location,
    c.hospital?.hospitalName,
    c.hospital?.city,
    c.time,
  ], searchTerm));

  const handleExportPdf = () => {
    const rows = filteredCamps.map((c) => ([
      c.title,
      new Date(c.date).toLocaleDateString(),
      c.time,
      c.location,
      c.hospital?.hospitalName || 'N/A',
      c.maxDonors,
    ]));
    exportRowsToPdf('Admin Blood Camps Report', ['Title', 'Date', 'Time', 'Location', 'Hospital', 'Max Donors'], rows);
  };

  return (
    <div className="admin-page">
      <Header />
      <div className="admin-content">
        <Sidebar />
        <main className="admin-main">
          <div className="page-header">
            <h1>🏕️ Manage Blood Camps</h1>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search camps, hospitals, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-input"
              />
              <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Cancel' : '➕ New Camp'}
              </button>
              <button className="btn btn-secondary" onClick={handleExportPdf}>📄 Generate PDF</button>
            </div>
          </div>

          {showForm && (
            <div className="form-container">
              <div className="form-info">
                <h2>📝 {editingId ? 'Edit Blood Camp' : 'Create New Blood Camp'}</h2>
                <p>Fill in all details to {editingId ? 'update' : 'create'} a blood donation camp and attract donors.</p>
              </div>
              <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-group">
                  <label>Camp Title *</label>
                  <input type="text" name="title" placeholder="e.g., Blood Camp – Kurunegala Town Hall" value={formData.title} onChange={handleInputChange} required />
                </div>
                
                <div className="form-row">
                  <div className="form-group" style={{flex: 1}}>
                    <label>Date *</label>
                    <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group" style={{flex: 1}}>
                    <label>Time *</label>
                    <input type="time" name="time" value={formData.time} onChange={handleInputChange} required />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Location *</label>
                  <input type="text" name="location" placeholder="e.g., Town Hall, Main Street" value={formData.location} onChange={handleInputChange} required />
                </div>
                
                <div className="form-group">
                  <label>Hospital *</label>
                  <select name="hospitalId" value={formData.hospitalId} onChange={handleInputChange} required>
                    <option value="">Select Hospital</option>
                    {hospitals.map(h => <option key={h.hospitalId} value={h.hospitalId}>{h.hospitalName} - {h.city}</option>)}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Description *</label>
                  <textarea name="description" placeholder="Provide details about the camp, eligibility, and what donors should bring..." value={formData.description} onChange={handleInputChange} rows="4" required></textarea>
                </div>
                
                <div className="form-group">
                  <label>Maximum Donors *</label>
                  <input type="number" name="maxDonors" placeholder="e.g., 100" value={formData.maxDonors} onChange={handleInputChange} min="1" required />
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">{editingId ? '✏️ Update Camp' : '➕ Create Camp'}</button>
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {loading ? <p className="loading">Loading...</p> : (
            <div className="camps-grid">
              {Array.isArray(camps) && camps.length > 0 ? (
                filteredCamps.map(c => (
                  <div key={c.campId} className="camp-card">
                    <h3>{c.title}</h3>
                    <p><strong>Date:</strong> {new Date(c.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {c.time}</p>
                    <p><strong>Location:</strong> {c.location}</p>
                    <p><strong>Hospital:</strong> {c.hospital.hospitalName}</p>
                    <p><strong>Max Donors:</strong> {c.maxDonors}</p>
                    <div className="actions">
                      <button className="btn-small btn-edit" onClick={() => { setFormData(c); setEditingId(c.campId); setShowForm(true); }}>Edit</button>
                      <button className="btn-small btn-delete" onClick={() => handleDelete(c.campId)}>Delete</button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">No blood camps found. Create one to get started!</p>
              )}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default ManageBloodCamps;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Footer from '../../../components/Footer/Footer';
import { getAllEmergencyRequests, createEmergencyRequest, updateEmergencyRequest, deleteEmergencyRequest, getAllHospitals } from '../../../services/api';
import { exportRowsToPdf, includesQuery } from '../../../utils/adminExport';
import { validators } from '../../../utils/validators';

function ManageEmergencyRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [matchedDonors, setMatchedDonors] = useState([]);
  const [creationResult, setCreationResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [formData, setFormData] = useState({
    title: '', bloodTypeNeeded: 'O+', requiredUnits: '', hospitalId: '', city: '', urgencyLevel: 'High', description: '', contactNumber: '', createdDate: new Date().toISOString().split('T')[0]
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
      const [reqRes, hosRes] = await Promise.all([getAllEmergencyRequests(), getAllHospitals()]);
      
      console.log('EmergencyRequests Response:', reqRes);
      console.log('Hospitals Response:', hosRes);
      
      // Ensure data is an array
      const requestsData = Array.isArray(reqRes.data) ? reqRes.data : [];
      const hospitalsData = Array.isArray(hosRes.data) ? hosRes.data : [];
      
      console.log('Requests Data:', requestsData);
      console.log('Hospitals Data:', hospitalsData);
      
      setRequests(requestsData);
      setHospitals(hospitalsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert('Failed to load data: ' + (error.response?.data?.message || error.message || 'Unknown error'));
      setRequests([]);
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

    // validate emergency request input fields 
    if (!formData.title.trim() || formData.title.trim().length < 3) {
      alert('Title must be at least 3 characters');
      return;
    }

    const units = Number(formData.requiredUnits);
    if (!Number.isInteger(units) || units < 1) {
      alert('Units needed must be a whole number greater than 0');
      return;
    }

    if (!formData.hospitalId) {
      alert('Please select a hospital');
      return;
    }

    if (!formData.city.trim() || formData.city.trim().length < 2) {
      alert('City must be at least 2 characters');
      return;
    }

    const phoneError = validators.phone(formData.contactNumber);
    if (phoneError) {
      alert(phoneError);
      return;
    }

    if (formData.description && formData.description.length > 500) {
      alert('Description must not exceed 500 characters');
      return;
    }

    try {
      if (editingId) {
        await updateEmergencyRequest(editingId, formData);
        alert('Request updated!');
      } else {
        const response = await createEmergencyRequest(formData);
        console.log('Creation response:', response.data);
        
        // Display matched donors
        setCreationResult(response.data);
        setMatchedDonors(response.data.matchingDonors || []);
        setShowResult(true);
        setShowForm(false);
      }
      
      setFormData({ 
        title: '', bloodTypeNeeded: 'O+', requiredUnits: '', hospitalId: '', 
        city: '', urgencyLevel: 'High', description: '', contactNumber: '', 
        createdDate: new Date().toISOString().split('T')[0] 
      });
      setEditingId(null);
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this request?')) {
      try {
        await deleteEmergencyRequest(id);
        alert('Emergency request deleted successfully!');
        fetchData();
      } catch (error) {
        console.error('Delete error:', error);
        alert('Error: ' + (error.response?.data?.message || error.message || 'Failed to delete request'));
      }
    }
  };

  const filteredRequests = requests.filter((r) => includesQuery([
    r.title,
    r.bloodTypeNeeded,
    r.hospital?.hospitalName,
    r.urgencyLevel,
    r.city,
    r.contactNumber,
  ], searchTerm));

  const handleExportPdf = () => {
    const rows = filteredRequests.map((r) => ([
      r.title,
      r.bloodTypeNeeded,
      r.requiredUnits,
      r.hospital?.hospitalName || 'N/A',
      r.urgencyLevel,
      r.city,
    ]));
    exportRowsToPdf('Admin Emergency Requests Report', ['Title', 'Blood Type', 'Units', 'Hospital', 'Urgency', 'City'], rows);
  };

  return (
    <div className="admin-page">
      <Header />
      <div className="admin-content">
        <Sidebar />
        <main className="admin-main">
          <div className="page-header">
            <h1>🚨 Manage Emergency Requests</h1>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search title, blood type, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-input"
              />
              <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Cancel' : '➕ New Request'}
              </button>
              <button className="btn btn-secondary" onClick={handleExportPdf}>📄 Generate PDF</button>
            </div>
          </div>

          {showForm && (
            <div className="form-container">
              <form onSubmit={handleSubmit} className="admin-form">
                <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleInputChange} minLength="3" required />
                <select name="bloodTypeNeeded" value={formData.bloodTypeNeeded} onChange={handleInputChange}>
                  <option>O+</option><option>O-</option><option>A+</option><option>A-</option>
                  <option>B+</option><option>B-</option><option>AB+</option><option>AB-</option>
                </select>
                <input type="number" name="requiredUnits" placeholder="Units Needed" value={formData.requiredUnits} onChange={handleInputChange} min="1" step="1" required />
                <select name="hospitalId" value={formData.hospitalId} onChange={handleInputChange} required>
                  <option value="">Select Hospital</option>
                  {hospitals.map(h => <option key={h.hospitalId} value={h.hospitalId}>{h.hospitalName}</option>)}
                </select>
                <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleInputChange} minLength="2" required />
                <select name="urgencyLevel" value={formData.urgencyLevel} onChange={handleInputChange}>
                  <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
                </select>
                <textarea name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} rows="3" maxLength="500"></textarea>
                <input type="tel" name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={handleInputChange} minLength="7" required />
                <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Create'} Request</button>
              </form>
            </div>
          )}

          {showResult && creationResult && (
            <div className="result-modal-overlay" onClick={() => setShowResult(false)}>
              <div className="result-modal" onClick={e => e.stopPropagation()}>
                <div className="result-header success">
                  <h2>✅ Emergency Request Created Successfully!</h2>
                  <button className="close-btn" onClick={() => setShowResult(false)}>✕</button>
                </div>
                
                <div className="result-content">
                  <div className="request-summary">
                    <h3>Request Details</h3>
                    <p><strong>Title:</strong> {creationResult.request.title}</p>
                    <p><strong>Blood Type:</strong> {creationResult.request.bloodTypeNeeded}</p>
                    <p><strong>Units Needed:</strong> {creationResult.request.requiredUnits}</p>
                    <p><strong>Hospital:</strong> {creationResult.request.hospital.hospitalName}</p>
                    <p><strong>City:</strong> {creationResult.request.city}</p>
                    <p><strong>Urgency:</strong> {creationResult.request.urgencyLevel}</p>
                  </div>

                  <div className="notification-summary">
                    <h3>� Notification Status</h3>
                    <div className="summary-stats">
                      <div className="stat-box success">
                        <div className="stat-number">{creationResult.notificationsSent || 0}</div>
                        <div className="stat-label">Notifications Created</div>
                      </div>
                      <div className="stat-box info">
                        <div className="stat-number">{creationResult.smsSent || 0}</div>
                        <div className="stat-label">SMS Sent</div>
                      </div>
                      <div className="stat-box warning">
                        <div className="stat-number">{creationResult.totalDonorsMatched || 0}</div>
                        <div className="stat-label">Eligible Donors Found</div>
                      </div>
                    </div>
                  </div>

                  {matchedDonors.length > 0 && (
                    <div className="matched-donors-section">
                      <h3>👥 Matched Donors ({matchedDonors.length})</h3>
                      <div className="donors-list">
                        {matchedDonors.map((donor, index) => (
                          <div key={index} className={`donor-card ${donor.smsSent ? 'sms-sent' : 'sms-failed'}`}>
                            <div className="donor-badge">{donor.bloodType}</div>
                            <div className="donor-info">
                              <h4>{donor.name}</h4>
                              <p className="donor-phone">📱 {donor.phone}</p>
                              <p className="donor-location">📍 {donor.city}</p>
                            </div>
                            <div className="sms-status">
                              {donor.smsSent ? (
                                <span className="badge-success">✓ SMS Sent</span>
                              ) : (
                                <span className="badge-warning">⚠ SMS Failed</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchedDonors.length === 0 && (
                    <div className="no-donors">
                      <p>⚠️ No donors found with blood type {creationResult.request.bloodTypeNeeded}</p>
                      <p>The request has been created, but no matching donors are currently registered in the system.</p>
                    </div>
                  )}
                </div>

                <div className="result-footer">
                  <button className="btn btn-primary" onClick={() => setShowResult(false)}>Close</button>
                </div>
              </div>
            </div>
          )}

          {loading ? <p className="loading">Loading...</p> : (
            <>
              {filteredRequests.length === 0 ? (
                <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '5px', border: '1px solid #ddd' }}>
                  <p style={{ color: '#666', fontSize: '16px' }}>No emergency requests yet.</p>
                  <p style={{ color: '#999', fontSize: '14px' }}>Create a new emergency request to get started. Check browser console for debugging info.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Title</th><th>Blood Type</th><th>Units</th><th>Hospital</th><th>Urgency</th><th>City</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map(r => (
                        <tr key={r.requestId}>
                          <td>{r.title}</td>
                          <td><span className="badge-urgent">{r.bloodTypeNeeded}</span></td>
                          <td>{r.requiredUnits}</td>
                          <td>{r.hospital.hospitalName}</td>
                          <td><span className={`badge ${r.urgencyLevel.toLowerCase()}`}>{r.urgencyLevel}</span></td>
                          <td>{r.city}</td>
                          <td>
                            <button className="btn-small btn-edit" onClick={() => { setFormData(r); setEditingId(r.requestId); setShowForm(true); }}>Edit</button>
                            <button className="btn-small btn-delete" onClick={() => handleDelete(r.requestId)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default ManageEmergencyRequests;

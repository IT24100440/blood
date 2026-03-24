import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Footer from '../../../components/Footer/Footer';
import { getHospitalById, getAppointmentsByHospital, getBloodCampsByHospital, getBloodUnitsByHospital, getEmergencyRequestsByHospital } from '../../../services/api';
import { exportRowsToPdf, includesQuery } from '../../../utils/adminExport';
import './HospitalDashboard.css';

function HospitalDashboard() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [hospital, setHospital] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [camps, setCamps] = useState([]);
  const [units, setUnits] = useState([]);
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const adminId = localStorage.getItem('adminId');
    if (!adminId) navigate('/admin-login');
    else fetchData();
  }, [navigate, id]);

  const fetchData = async () => {
    try {
      const [hosRes, appRes, campRes, unitsRes, emergRes] = await Promise.all([
        getHospitalById(id),
        getAppointmentsByHospital(id),
        getBloodCampsByHospital(id),
        getBloodUnitsByHospital(id),
        getEmergencyRequestsByHospital(id)
      ]);
      
      setHospital(hosRes.data);
      setAppointments(appRes.data);
      setCamps(campRes.data);
      setUnits(unitsRes.data);
      setEmergencyRequests(emergRes.data);
      setLoading(false);
      console.log('Hospital Dashboard Data Loaded:', { hosRes: hosRes.data, appRes: appRes.data, campRes: campRes.data, unitsRes: unitsRes.data, emergRes: emergRes.data });
    } catch (error) {
      console.error('Error fetching hospital data:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="page loading">Loading...</div>;
  if (!hospital) return <div className="page">Hospital not found</div>;

  const filteredAppointments = appointments.filter((a) => includesQuery([
    a.donor?.name,
    a.donor?.bloodType,
    a.timePeriod,
    a.eligibilityStatus,
  ], searchTerm));

  const filteredCamps = camps.filter((c) => includesQuery([
    c.title,
    c.location,
    c.time,
    c.maxDonors,
  ], searchTerm));

  const filteredEmergencies = emergencyRequests.filter((e) => includesQuery([
    e.title,
    e.bloodTypeNeeded,
    e.urgencyLevel,
    e.city,
    e.contactNumber,
  ], searchTerm));

  const filteredUnits = units.filter((u) => includesQuery([
    u.bloodType,
    u.unitsAvailable,
  ], searchTerm));

  const handleExportPdf = () => {
    if (activeTab === 'appointments') {
      exportRowsToPdf('Hospital Appointments Report', ['Donor', 'Blood Type', 'Date', 'Time', 'Eligibility'],
        filteredAppointments.map((a) => ([
          a.donor?.name || 'N/A',
          a.donor?.bloodType || 'N/A',
          new Date(a.appointmentDate).toLocaleDateString(),
          a.timePeriod,
          a.eligibilityStatus,
        ])));
      return;
    }
    if (activeTab === 'camps') {
      exportRowsToPdf('Hospital Camps Report', ['Title', 'Date', 'Time', 'Location', 'Max Donors'],
        filteredCamps.map((c) => ([
          c.title,
          new Date(c.date).toLocaleDateString(),
          c.time,
          c.location,
          c.maxDonors,
        ])));
      return;
    }
    if (activeTab === 'emergencies') {
      exportRowsToPdf('Hospital Emergency Requests Report', ['Title', 'Blood Type', 'Units', 'Urgency', 'City'],
        filteredEmergencies.map((e) => ([
          e.title,
          e.bloodTypeNeeded,
          e.requiredUnits,
          e.urgencyLevel,
          e.city,
        ])));
      return;
    }
    if (activeTab === 'units') {
      exportRowsToPdf('Hospital Blood Units Report', ['Blood Type', 'Units Available', 'Last Updated'],
        filteredUnits.map((u) => ([
          u.bloodType,
          u.unitsAvailable,
          new Date(u.updatedAt).toLocaleDateString(),
        ])));
    }
  };

  return (
    <div className="admin-page">
      <Header />
      <div className="admin-content">
        <Sidebar />
        <main className="admin-main">
          <div className="hospital-header">
            <button className="btn btn-secondary" onClick={() => navigate('/admin/hospitals')}>← Back</button>
            <h1>{hospital.hospitalName}</h1>
            <p>{hospital.address}, {hospital.city}</p>
            {activeTab !== 'overview' && (
              <div className="filters" style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search current tab..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="filter-input"
                />
                <button type="button" className="btn btn-primary" onClick={handleExportPdf}>📄 Generate PDF</button>
              </div>
            )}
          </div>

          <div className="hospital-tabs">
            <button 
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📋 Overview
            </button>
            <button 
              className={`tab ${activeTab === 'appointments' ? 'active' : ''}`}
              onClick={() => setActiveTab('appointments')}
            >
              📅 Appointments ({appointments.length})
            </button>
            <button 
              className={`tab ${activeTab === 'camps' ? 'active' : ''}`}
              onClick={() => setActiveTab('camps')}
            >
              🏕️ Blood Camps ({camps.length})
            </button>
            <button 
              className={`tab ${activeTab === 'emergencies' ? 'active' : ''}`}
              onClick={() => setActiveTab('emergencies')}
            >
              🚨 Emergency Requests ({emergencyRequests.length})
            </button>
            <button 
              className={`tab ${activeTab === 'units' ? 'active' : ''}`}
              onClick={() => setActiveTab('units')}
            >
              🩸 Blood Units ({units.length})
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="tab-content overview-tab">
              <div className="info-grid">
                <div className="info-card">
                  <label>Hospital Code:</label>
                  <p>{hospital.hospitalCode}</p>
                </div>
                <div className="info-card">
                  <label>Phone:</label>
                  <p><a href={`tel:${hospital.phone}`}>{hospital.phone}</a></p>
                </div>
                <div className="info-card">
                  <label>Email:</label>
                  <p><a href={`mailto:${hospital.email}`}>{hospital.email}</a></p>
                </div>
                <div className="info-card">
                  <label>Operating Hours:</label>
                  <p>{hospital.timePeriod}</p>
                </div>
                <div className="info-card">
                  <label>Status:</label>
                  <p><span className={`badge ${hospital.status.toLowerCase()}`}>{hospital.status}</span></p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="tab-content">
              {filteredAppointments.length === 0 ? (
                <p className="no-data">No appointments for this hospital.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Donor Name</th>
                      <th>Blood Type</th>
                      <th>Appointment Date</th>
                      <th>Time Period</th>
                      <th>Eligibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map(a => (
                      <tr key={a.appointmentId}>
                        <td>{a.donor.name}</td>
                        <td>{a.donor.bloodType}</td>
                        <td>{new Date(a.appointmentDate).toLocaleDateString()}</td>
                        <td>{a.timePeriod}</td>
                        <td><span className={a.eligibilityStatus.startsWith('ELIGIBLE') ? 'status-green' : 'status-red'}>{a.eligibilityStatus}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'camps' && (
            <div className="tab-content">
              {filteredCamps.length === 0 ? (
                <p className="no-data">No blood camps for this hospital.</p>
              ) : (
                <div className="cards-list">
                  {filteredCamps.map(c => (
                    <div key={c.campId} className="card">
                      <h3>{c.title}</h3>
                      <p><strong>Date:</strong> {new Date(c.date).toLocaleDateString()}</p>
                      <p><strong>Time:</strong> {c.time}</p>
                      <p><strong>Location:</strong> {c.location}</p>
                      <p><strong>Max Donors:</strong> {c.maxDonors}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'emergencies' && (
            <div className="tab-content">
              {filteredEmergencies.length === 0 ? (
                <p className="no-data">No emergency requests for this hospital.</p>
              ) : (
                <div className="emergency-list">
                  {filteredEmergencies.map(e => (
                    <div key={e.requestId} className="emergency-card">
                      <div className="emergency-header">
                        <h3>{e.title}</h3>
                        <span className={`urgency-badge ${e.urgencyLevel.toLowerCase()}`}>{e.urgencyLevel}</span>
                      </div>
                      <p><strong>Blood Type:</strong> <span className="blood-type-badge">{e.bloodTypeNeeded}</span></p>
                      <p><strong>Units Needed:</strong> {e.requiredUnits}</p>
                      <p><strong>City:</strong> {e.city}</p>
                      <p><strong>Contact:</strong> <a href={`tel:${e.contactNumber}`}>{e.contactNumber}</a></p>
                      <p><strong>Status:</strong> Posted on {new Date(e.createdDate).toLocaleDateString()}</p>
                      {e.description && <p><strong>Description:</strong> {e.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'units' && (
            <div className="tab-content">
              {filteredUnits.length === 0 ? (
                <p className="no-data">No blood units recorded for this hospital.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Blood Type</th>
                      <th>Units Available</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUnits.map(u => (
                      <tr key={u.unitId}>
                        <td><span className="blood-type-badge">{u.bloodType}</span></td>
                        <td>{u.unitsAvailable}</td>
                        <td>{new Date(u.updatedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default HospitalDashboard;

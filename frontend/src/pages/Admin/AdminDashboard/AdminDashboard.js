import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import Sidebar from '../../../components/Sidebar/Sidebar';
import { getAllHospitals, getAllAppointments, getAllDonors, getAllBloodCamps, getAllEmergencyRequests, getAllBloodUnits, getPendingAppointments } from '../../../services/api';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    hospitals: 0,
    appointments: 0,
    donors: 0,
    camps: 0,
    emergencyRequests: 0,
    bloodUnits: 0,
    pendingAppointments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminId = localStorage.getItem('adminId');
    if (!adminId) {
      navigate('/admin-login');
      return;
    }
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const [hosRes, appRes, donRes, campRes, emirRes, unitsRes, pendingRes] = await Promise.allSettled([
        getAllHospitals(),
        getAllAppointments(),
        getAllDonors(),
        getAllBloodCamps(),
        getAllEmergencyRequests(),
        getAllBloodUnits(),
        getPendingAppointments()
      ]);

      const getCount = (result) => {
        if (result.status !== 'fulfilled') return 0;
        return Array.isArray(result.value?.data) ? result.value.data.length : 0;
      };

      setStats({
        hospitals: getCount(hosRes),
        appointments: getCount(appRes),
        donors: getCount(donRes),
        camps: getCount(campRes),
        emergencyRequests: getCount(emirRes),
        bloodUnits: getCount(unitsRes),
        pendingAppointments: getCount(pendingRes)
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      console.error('Error details:', error.response?.data || error.message);
      setLoading(false);
    }
  };

  const adminName = localStorage.getItem('adminName') || 'Admin';

  const quickActions = [
    { label: 'Add Hospital', icon: '➕', to: '/admin/hospitals' },
    { label: 'Create Blood Camp', icon: '➕', to: '/admin/blood-camps' },
    { label: 'Manage Camp Bookings', icon: '📝', to: '/admin/camp-bookings' },
    { label: 'Create Emergency Request', icon: '➕', to: '/admin/emergency-requests' },
    { label: 'Review Appointment Requests', icon: '📋', to: '/admin/appointment-requests' },
    { label: 'Add Blood Units', icon: '➕', to: '/admin/blood-units' },
  ];

  const viewActions = [
    { label: 'View Hospitals', icon: '👁️', to: '/admin/hospitals' },
    { label: 'View Appointments', icon: '👁️', to: '/admin/appointments' },
    { label: 'View Donors', icon: '👁️', to: '/admin/donors' },
    { label: 'View Emergency Requests', icon: '👁️', to: '/admin/emergency-requests' },
    { label: 'Manage Admins', icon: '👁️', to: '/admin/admins' },
  ];

  return (
    <div className="admin-page">
      <Header />
      <div className="admin-content">
        <Sidebar />
        <main className="admin-main">
          <div className="admin-header">
            <h1>📊 Welcome, {adminName}!</h1>
            <p>Blood Donation System Administration Dashboard</p>
          </div>

          {loading ? (
            <p className="loading">Loading dashboard...</p>
          ) : (
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon">🏥</div>
                <div className="stat-content">
                  <h3>{stats.hospitals}</h3>
                  <p>Hospitals</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <h3>{stats.donors}</h3>
                  <p>Registered Donors</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-content">
                  <h3>{stats.appointments}</h3>
                  <p>Appointments</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🏕️</div>
                <div className="stat-content">
                  <h3>{stats.camps}</h3>
                  <p>Blood Camps</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🚨</div>
                <div className="stat-content">
                  <h3>{stats.emergencyRequests}</h3>
                  <p>Emergency Requests</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🩸</div>
                <div className="stat-content">
                  <h3>{stats.bloodUnits}</h3>
                  <p>Blood Units</p>
                </div>
              </div>

              <div className="stat-card highlight">
                <div className="stat-icon">📋</div>
                <div className="stat-content">
                  <h3>{stats.pendingAppointments}</h3>
                  <p>Pending Requests</p>
                </div>
              </div>
            </div>
          )}

          <div className="dashboard-actions">
            <div className="action-section">
              <h2>Quick Actions</h2>
              <div className="action-buttons">
                {quickActions.map((a) => (
                  <button key={a.label} className="btn btn-primary" onClick={() => navigate(a.to)}>
                    {a.icon} {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="action-section">
              <h2>View Information</h2>
              <div className="action-buttons">
                {viewActions.map((a) => (
                  <button key={a.label} className="btn btn-secondary" onClick={() => navigate(a.to)}>
                    {a.icon} {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default AdminDashboard;

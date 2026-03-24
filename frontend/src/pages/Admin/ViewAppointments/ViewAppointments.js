import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Footer from '../../../components/Footer/Footer';
import { getAllAppointments, deleteAppointment } from '../../../services/api';
import { exportRowsToPdf, includesQuery } from '../../../utils/adminExport';

function ViewAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const adminId = localStorage.getItem('adminId');
    if (!adminId) navigate('/admin-login');
    else fetchAppointments();
  }, [navigate]);

  const fetchAppointments = async () => {
    try {
      const res = await getAllAppointments();
      setAppointments(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this appointment?')) {
      try {
        await deleteAppointment(id);
        fetchAppointments();
      } catch (error) {
        alert('Error');
      }
    }
  };

  const filteredAppointments = appointments
    .filter(a => !filterStatus || (a.eligibilityStatus || '').includes(filterStatus))
    .filter(a => includesQuery([
      a.donor?.name,
      a.hospital?.hospitalName,
      a.timePeriod,
      a.eligibilityStatus,
    ], searchTerm));

  const handleExportPdf = () => {
    const rows = filteredAppointments.map((a) => ([
      a.donor?.name || 'Unknown Donor',
      a.hospital?.hospitalName || 'N/A',
      formatDate(a.appointmentDate),
      a.timePeriod || 'N/A',
      a.eligibilityStatus || 'Unknown',
    ]));
    exportRowsToPdf('Admin Appointments Report', ['Donor', 'Hospital', 'Date', 'Time', 'Eligibility'], rows);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    const parsed = new Date(dateValue);
    return Number.isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleDateString();
  };

  return (
    <div className="admin-page">
      <Header />
      <div className="admin-content">
        <Sidebar />
        <main className="admin-main">
          <h1>📅 View Appointments</h1>

          <div className="filters" style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search donor, hospital, eligibility..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
              <option value="">All Appointments</option>
              <option value="ELIGIBLE">Eligible</option>
              <option value="NOT_ELIGIBLE">Not Eligible</option>
            </select>
            <button type="button" className="btn btn-primary" onClick={handleExportPdf}>📄 Generate PDF</button>
          </div>

          {loading ? <p className="loading">Loading...</p> : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Donor</th><th>Hospital</th><th>Date</th><th>Time Period</th><th>Eligibility</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map(a => (
                    <tr key={a.appointmentId}>
                      <td>{a.donor?.name || 'Unknown Donor'}</td>
                      <td>{a.hospital?.hospitalName || 'N/A'}</td>
                      <td>{formatDate(a.appointmentDate)}</td>
                      <td>{a.timePeriod || 'N/A'}</td>
                      <td><span style={{ color: (a.eligibilityStatus || '').startsWith('ELIGIBLE') ? '#28a745' : '#dc3545' }}>{a.eligibilityStatus || 'Unknown'}</span></td>
                      <td>
                        <button className="btn-small btn-delete" onClick={() => handleDelete(a.appointmentId)}>Delete</button>
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

export default ViewAppointments;

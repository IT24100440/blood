import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Footer from '../../../components/Footer/Footer';
import { getPendingAppointments, approveAppointment, rejectAppointment, completeAppointment } from '../../../services/api';
import { exportRowsToPdf, includesQuery } from '../../../utils/adminExport';
import './ManageAppointmentRequests.css';

function ManageAppointmentRequests() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve', 'reject', 'complete'
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionOptions] = useState([
    'Donor not eligible',
    'Hospital unavailable',
    'Time slot full',
    'Invalid information',
    'Duplicate appointment',
    'False or mismatched information',
    'Blood camp full',
    'Donor marked unavailable/blocked',
    'Medical eligibility failed',
    'Admin verification failed'
  ]);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, completed
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const adminId = localStorage.getItem('adminId');
    if (!adminId) navigate('/admin-login');
    else fetchAppointments();
  }, [navigate, filter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      let res;
      if (filter === 'pending') {
        res = await getPendingAppointments();
      } else {
        // For other filters, fetch all and filter client-side
        const { getAllAppointments } = require('../../../services/api');
        const allRes = await getAllAppointments();
        res = {
          data: allRes.data.filter(a => a.status === filter.charAt(0).toUpperCase() + filter.slice(1))
        };
      }
      setAppointments(res.data || []);
      console.log('Appointments loaded:', res.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      alert('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedAppointment) return;
    try {
      const adminId = localStorage.getItem('adminId');
      await approveAppointment(selectedAppointment.appointmentId, parseInt(adminId));
      alert('✅ Appointment approved successfully!');
      setShowDetailsModal(false);
      setActionType(null);
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error) {
      console.error('Error approving appointment:', error);
      alert('❌ Error approving appointment: ' + error.response?.data?.message);
    }
  };

  const handleReject = async () => {
    if (!selectedAppointment || !rejectionReason) {
      alert('Please select a rejection reason');
      return;
    }
    try {
      const adminId = localStorage.getItem('adminId');
      await rejectAppointment(selectedAppointment.appointmentId, parseInt(adminId), rejectionReason);
      alert('✅ Appointment rejected successfully!');
      setShowDetailsModal(false);
      setActionType(null);
      setRejectionReason('');
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      alert('❌ Error rejecting appointment: ' + error.response?.data?.message);
    }
  };

  const handleComplete = async () => {
    if (!selectedAppointment) return;
    try {
      await completeAppointment(selectedAppointment.appointmentId);
      alert('✅ Appointment marked as completed! Donor record updated.');
      setShowDetailsModal(false);
      setActionType(null);
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error) {
      console.error('Error completing appointment:', error);
      alert('❌ Error completing appointment: ' + error.response?.data?.message);
    }
  };

  const openDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#ffc107';
      case 'Approved':
        return '#28a745';
      case 'Rejected':
        return '#dc3545';
      case 'Completed':
        return '#17a2b8';
      default:
        return '#6c757d';
    }
  };

  const statCounts = {
    pending: appointments.filter(a => a.status === 'Pending').length,
    approved: appointments.filter(a => a.status === 'Approved').length,
    rejected: appointments.filter(a => a.status === 'Rejected').length,
    completed: appointments.filter(a => a.status === 'Completed').length
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    const parsed = new Date(dateValue);
    return Number.isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleDateString();
  };

  const isEligible = (status) => (status || '').startsWith('ELIGIBLE');

  const filteredAppointments = appointments.filter((apt) => includesQuery([
    apt.donor?.name,
    apt.donor?.nic,
    apt.hospital?.hospitalName,
    apt.hospital?.city,
    apt.status,
    apt.eligibilityStatus,
  ], searchTerm));

  const handleExportPdf = () => {
    const rows = filteredAppointments.map((apt) => ([
      apt.donor?.name || 'Unknown Donor',
      apt.donor?.nic || 'N/A',
      apt.hospital?.hospitalName || 'N/A',
      formatDate(apt.appointmentDate),
      apt.timePeriod || 'N/A',
      apt.status || 'Unknown',
      apt.eligibilityStatus || 'Unknown',
    ]));
    exportRowsToPdf('Admin Appointment Requests Report', ['Donor', 'NIC', 'Hospital', 'Date', 'Time', 'Status', 'Eligibility'], rows);
  };

  return (
    <div className="admin-page">
      <Header />
      <div className="admin-content">
        <Sidebar />
        <main className="admin-main">
          <h1>📋 Appointment Requests Management</h1>
          <div className="filters" style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search donor, NIC, hospital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
            <button type="button" className="btn btn-primary" onClick={handleExportPdf}>📄 Generate PDF</button>
          </div>

          {/* Status Cards */}
          <div className="status-cards">
            <div className="status-card pending-card" onClick={() => setFilter('pending')}>
              <div className="status-icon">⏳</div>
              <div className="status-info">
                <h3>{statCounts.pending}</h3>
                <p>Pending</p>
              </div>
            </div>
            <div className="status-card approved-card" onClick={() => setFilter('approved')}>
              <div className="status-icon">✅</div>
              <div className="status-info">
                <h3>{statCounts.approved}</h3>
                <p>Approved</p>
              </div>
            </div>
            <div className="status-card rejected-card" onClick={() => setFilter('rejected')}>
              <div className="status-icon">❌</div>
              <div className="status-info">
                <h3>{statCounts.rejected}</h3>
                <p>Rejected</p>
              </div>
            </div>
            <div className="status-card completed-card" onClick={() => setFilter('completed')}>
              <div className="status-icon">🎉</div>
              <div className="status-info">
                <h3>{statCounts.completed}</h3>
                <p>Completed</p>
              </div>
            </div>
          </div>

          {loading ? (
            <p className="loading">⏳ Loading appointments...</p>
          ) : filteredAppointments.length === 0 ? (
            <div className="no-data-message">
              <p>📭 No {filter} appointments found.</p>
            </div>
          ) : (
            <div className="appointments-list">
              {filteredAppointments.map(apt => (
                <div key={apt.appointmentId} className="appointment-card">
                  <div className="app-header">
                    <div className="donor-info">
                          <h3>{apt.donor?.name || 'Unknown Donor'}</h3>
                          <p className="nic">NIC: {apt.donor?.nic || 'N/A'}</p>
                    </div>
                    <span className="status-badge" style={{ backgroundColor: getStatusBadgeColor(apt.status) }}>
                          {apt.status || 'Unknown'}
                    </span>
                  </div>

                  <div className="app-details">
                    <div className="detail-row">
                      <span className="label">🏥 Hospital:</span>
                      <span className="value">{apt.hospital?.hospitalName || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">📅 Date:</span>
                      <span className="value">{formatDate(apt.appointmentDate)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">⏰ Time:</span>
                      <span className="value">{apt.timePeriod || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">🩸 Blood Type:</span>
                      <span className="blood-badge">{apt.donor?.bloodType || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">✓ Eligible:</span>
                      <span className={isEligible(apt.eligibilityStatus) ? 'eligible-yes' : 'eligible-no'}>
                        {apt.eligibilityStatus || 'Unknown'}
                      </span>
                    </div>
                  </div>

                  <button className="btn-details" onClick={() => openDetails(apt)}>
                    👁️ View & Action
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Appointment Details</h2>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="donor-details">
                <h3>👤 Donor Information</h3>
                <div className="detail-grid">
                  <div className="detail">
                    <label>Name:</label>
                    <p>{selectedAppointment.donor?.name || 'Unknown Donor'}</p>
                  </div>
                  <div className="detail">
                    <label>NIC:</label>
                    <p>{selectedAppointment.donor?.nic || 'N/A'}</p>
                  </div>
                  <div className="detail">
                    <label>Age:</label>
                    <p>{selectedAppointment.donor?.age ?? 'N/A'} years</p>
                  </div>
                  <div className="detail">
                    <label>Weight:</label>
                    <p>{selectedAppointment.donor?.weight ?? 'N/A'} kg</p>
                  </div>
                  <div className="detail">
                    <label>Blood Type:</label>
                    <p>{selectedAppointment.donor?.bloodType || 'N/A'}</p>
                  </div>
                  <div className="detail">
                    <label>Phone:</label>
                    <p>{selectedAppointment.donor?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="appointment-details">
                <h3>📅 Appointment Information</h3>
                <div className="detail-grid">
                  <div className="detail">
                    <label>Hospital:</label>
                    <p>{selectedAppointment.hospital?.hospitalName || 'N/A'}</p>
                  </div>
                  <div className="detail">
                    <label>City:</label>
                    <p>{selectedAppointment.hospital?.city || 'N/A'}</p>
                  </div>
                  <div className="detail">
                    <label>Date:</label>
                    <p>{formatDate(selectedAppointment.appointmentDate)}</p>
                  </div>
                  <div className="detail">
                    <label>Time Period:</label>
                    <p>{selectedAppointment.timePeriod || 'N/A'}</p>
                  </div>
                  <div className="detail">
                    <label>Eligibility:</label>
                    <p style={{color: isEligible(selectedAppointment.eligibilityStatus) ? '#28a745' : '#dc3545'}}>
                      {selectedAppointment.eligibilityStatus || 'Unknown'}
                    </p>
                  </div>
                  {selectedAppointment.rejectionReason && (
                    <div className="detail">
                      <label>Rejection Reason:</label>
                      <p style={{color: '#dc3545'}}>{selectedAppointment.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedAppointment.status === 'Pending' && (
                <div className="action-section">
                  {!actionType ? (
                    <div className="action-buttons">
                      <button className="btn btn-approve" onClick={() => setActionType('approve')}>
                        ✅ Approve Appointment
                      </button>
                      <button className="btn btn-reject" onClick={() => setActionType('reject')}>
                        ❌ Reject Appointment
                      </button>
                    </div>
                  ) : actionType === 'approve' ? (
                    <div className="confirm-action">
                      <p>Are you sure you want to <strong>approve</strong> this appointment?</p>
                      <div className="confirm-buttons">
                        <button className="btn btn-confirm" onClick={handleApprove}>✅ Confirm Approval</button>
                        <button className="btn btn-cancel" onClick={() => setActionType(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : actionType === 'reject' ? (
                    <div className="confirm-action">
                      <label>Select rejection reason: *</label>
                      <select value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className="rejection-select">
                        <option value="">-- Choose a reason --</option>
                        {rejectionOptions.map((reason, idx) => (
                          <option key={idx} value={reason}>{reason}</option>
                        ))}
                      </select>
                      <div className="confirm-buttons">
                        <button className="btn btn-confirm" onClick={handleReject} disabled={!rejectionReason}>
                          ❌ Confirm Rejection
                        </button>
                        <button className="btn btn-cancel" onClick={() => { setActionType(null); setRejectionReason(''); }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {selectedAppointment.status === 'Approved' && (
                <div className="action-section">
                  <p className="info-text">✅ This appointment is approved. Mark as completed when donation is done.</p>
                  <button className="btn btn-complete" onClick={handleComplete}>
                    🎉 Mark As Completed
                  </button>
                </div>
              )}

              {selectedAppointment.status === 'Rejected' && (
                <div className="action-section rejected-section">
                  <p className="rejection-text">❌ This appointment has been rejected.</p>
                  <p><strong>Reason:</strong> {selectedAppointment.rejectionReason}</p>
                </div>
              )}

              {selectedAppointment.status === 'Completed' && (
                <div className="action-section completed-section">
                  <p className="completion-text">🎉 This appointment has been completed!</p>
                  <p>Donor record and last donation date have been updated.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default ManageAppointmentRequests;

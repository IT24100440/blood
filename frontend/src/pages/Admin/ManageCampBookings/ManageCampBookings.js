import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Sidebar from '../../../components/Sidebar/Sidebar';
import { getAllBloodCamps, getCampBookings, updateCampBooking } from '../../../services/api';
import { exportRowsToPdf, includesQuery } from '../../../utils/adminExport';
import './ManageCampBookings.css';

function ManageCampBookings() {
  const navigate = useNavigate();
  const [camps, setCamps] = useState([]);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filter, setFilter] = useState('REGISTERED'); // REGISTERED, ATTENDED, CANCELLED, NO_SHOW
  const [marking, setMarking] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const adminId = localStorage.getItem('adminId');
    if (!adminId) navigate('/admin-login');
    else fetchCamps();
  }, [navigate]);

  const fetchCamps = async () => {
    try {
      setLoading(true);
      const res = await getAllBloodCamps();
      console.log('Blood camps response:', res.data);
      // Ensure camps is always an array
      const campsData = Array.isArray(res.data) ? res.data : [];
      const futureOrCurrentCamps = campsData.filter(camp => {
        const campDate = new Date(camp.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return campDate >= today;
      });
      setCamps(futureOrCurrentCamps);
    } catch (error) {
      console.error('Error fetching camps:', error);
      console.error('Error details:', error.response?.data || error.message);
      setCamps([]);
      alert('Failed to load blood camps: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCamp = async (camp) => {
    try {
      setLoading(true);
      setSelectedCamp(camp);
      const res = await getCampBookings(camp.campId);
      setBookings(res.data.bookings || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      alert('Failed to load bookings for this camp');
      setLoading(false);
    }
  };

  const handleMarkAsAttended = async (booking) => {
    if (window.confirm(`Mark ${booking.donor.name} as attended?`)) {
      try {
        setMarking(true);
        await updateCampBooking(booking.bookingId, { status: 'ATTENDED' });
        alert('✅ Booking marked as ATTENDED! Pending appointments automatically completed.');
        setShowDetailsModal(false);
        setSelectedBooking(null);
        if (selectedCamp) {
          handleSelectCamp(selectedCamp);
        }
      } catch (error) {
        console.error('Error updating booking:', error);
        alert('❌ Error marking booking as attended: ' + error.response?.data?.message);
      } finally {
        setMarking(false);
      }
    }
  };

  const handleCancelBooking = async (booking) => {
    if (window.confirm(`Cancel booking for ${booking.donor.name}?`)) {
      try {
        setMarking(true);
        await updateCampBooking(booking.bookingId, { status: 'CANCELLED' });
        alert('✅ Booking cancelled successfully');
        setShowDetailsModal(false);
        setSelectedBooking(null);
        if (selectedCamp) {
          handleSelectCamp(selectedCamp);
        }
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('❌ Error cancelling booking: ' + error.response?.data?.message);
      } finally {
        setMarking(false);
      }
    }
  };

  const handleNoShow = async (booking) => {
    if (window.confirm(`Mark ${booking.donor.name} as NO_SHOW?`)) {
      try {
        setMarking(true);
        await updateCampBooking(booking.bookingId, { status: 'NO_SHOW' });
        alert('✅ Donor marked as NO_SHOW');
        setShowDetailsModal(false);
        setSelectedBooking(null);
        if (selectedCamp) {
          handleSelectCamp(selectedCamp);
        }
      } catch (error) {
        console.error('Error updating booking:', error);
        alert('❌ Error updating booking: ' + error.response?.data?.message);
      } finally {
        setMarking(false);
      }
    }
  };

  const openDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'REGISTERED':
        return '#ffc107';
      case 'ATTENDED':
        return '#28a745';
      case 'CANCELLED':
        return '#dc3545';
      case 'NO_SHOW':
        return '#6c757d';
      default:
        return '#0d6efd';
    }
  };

  const filteredBookings = bookings
    .filter(b => b.status === filter)
    .filter(b => includesQuery([
      b.donor?.name,
      b.donor?.nic,
      b.donor?.bloodType,
      b.donor?.phone,
    ], searchTerm));

  const filteredCamps = camps.filter((camp) => includesQuery([
    camp.title,
    camp.hospital?.hospitalName,
    camp.location,
    camp.time,
  ], searchTerm));

  const handleExportPdf = () => {
    if (!selectedCamp) {
      const rows = filteredCamps.map((camp) => ([
        camp.title,
        new Date(camp.date).toLocaleDateString(),
        camp.time,
        camp.hospital?.hospitalName || 'N/A',
        camp.location,
      ]));
      exportRowsToPdf('Admin Camp List Report', ['Camp', 'Date', 'Time', 'Hospital', 'Location'], rows);
      return;
    }

    const rows = filteredBookings.map((b) => ([
      b.donor?.name || 'N/A',
      b.donor?.nic || 'N/A',
      b.donor?.bloodType || 'N/A',
      b.donor?.phone || 'N/A',
      b.status,
      new Date(b.bookingDate).toLocaleDateString(),
    ]));
    exportRowsToPdf(`Camp Bookings ${selectedCamp.title}`, ['Donor', 'NIC', 'Blood Type', 'Phone', 'Status', 'Booked On'], rows);
  };
  const statusCounts = {
    REGISTERED: bookings.filter(b => b.status === 'REGISTERED').length,
    ATTENDED: bookings.filter(b => b.status === 'ATTENDED').length,
    CANCELLED: bookings.filter(b => b.status === 'CANCELLED').length,
    NO_SHOW: bookings.filter(b => b.status === 'NO_SHOW').length
  };

  return (
    <div className="admin-page">
      <Header />
      <div className="admin-content">
        <Sidebar />
        <main className="admin-main">
          <h1>🏕️ Manage Camp Bookings</h1>
          <div className="filters" style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder={selectedCamp ? 'Search donor, NIC, blood type...' : 'Search camp, hospital, location...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleExportPdf}
            >
              📄 Generate PDF
            </button>
          </div>

          {!selectedCamp ? (
            <>
              <p className="subtitle">Select a blood camp to view its bookings</p>
              {loading ? (
                <p className="loading">⏳ Loading camps...</p>
              ) : filteredCamps.length === 0 ? (
                <div className="no-data-message">
                  <p>📭 No upcoming blood camps found.</p>
                </div>
              ) : (
                <div className="camps-grid">
                  {filteredCamps.map(camp => (
                    <div key={camp.campId} className="camp-card" onClick={() => handleSelectCamp(camp)}>
                      <div className="camp-header">
                        <h3>{camp.title}</h3>
                        <span className="camp-date">{new Date(camp.date).toLocaleDateString()}</span>
                      </div>
                      <div className="camp-details">
                        <p><strong>🏥 Hospital:</strong> {camp.hospital.hospitalName}</p>
                        <p><strong>📍 Location:</strong> {camp.location}</p>
                        <p><strong>⏰ Time:</strong> {camp.time}</p>
                        <p><strong>👥 Max Donors:</strong> {camp.maxDonors}</p>
                      </div>
                      <button className="btn-view">View Bookings →</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="camp-header-section">
                <button className="btn-back" onClick={() => {
                  setSelectedCamp(null);
                  setBookings([]);
                  setFilter('REGISTERED');
                }}>← Back to Camps</button>
                <h2>{selectedCamp.title}</h2>
                <p>{selectedCamp.hospital.hospitalName}, {selectedCamp.location}</p>
              </div>

              {/* Status Cards */}
              <div className="status-cards">
                <div 
                  className="status-card registered-card" 
                  onClick={() => setFilter('REGISTERED')}
                  style={{borderColor: filter === 'REGISTERED' ? '#ffc107' : '#ccc'}}
                >
                  <div className="status-icon">📝</div>
                  <div className="status-info">
                    <h3>{statusCounts.REGISTERED}</h3>
                    <p>Registered</p>
                  </div>
                </div>
                <div 
                  className="status-card attended-card"
                  onClick={() => setFilter('ATTENDED')}
                  style={{borderColor: filter === 'ATTENDED' ? '#28a745' : '#ccc'}}
                >
                  <div className="status-icon">✅</div>
                  <div className="status-info">
                    <h3>{statusCounts.ATTENDED}</h3>
                    <p>Attended</p>
                  </div>
                </div>
                <div 
                  className="status-card cancelled-card"
                  onClick={() => setFilter('CANCELLED')}
                  style={{borderColor: filter === 'CANCELLED' ? '#dc3545' : '#ccc'}}
                >
                  <div className="status-icon">❌</div>
                  <div className="status-info">
                    <h3>{statusCounts.CANCELLED}</h3>
                    <p>Cancelled</p>
                  </div>
                </div>
                <div 
                  className="status-card noshow-card"
                  onClick={() => setFilter('NO_SHOW')}
                  style={{borderColor: filter === 'NO_SHOW' ? '#6c757d' : '#ccc'}}
                >
                  <div className="status-icon">🚫</div>
                  <div className="status-info">
                    <h3>{statusCounts.NO_SHOW}</h3>
                    <p>No Show</p>
                  </div>
                </div>
              </div>

              {loading ? (
                <p className="loading">⏳ Loading bookings...</p>
              ) : filteredBookings.length === 0 ? (
                <div className="no-data-message">
                  <p>📭 No {filter} bookings found for this camp.</p>
                </div>
              ) : (
                <div className="bookings-list">
                  {filteredBookings.map(booking => (
                    <div key={booking.bookingId} className="booking-card">
                      <div className="booking-header">
                        <div className="donor-info">
                          <h3>{booking.donor.name}</h3>
                          <p className="nic">NIC: {booking.donor.nic}</p>
                        </div>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusBadgeColor(booking.status) }}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <div className="booking-details">
                        <div className="detail-row">
                          <span className="label">🩸 Blood Type:</span>
                          <span className="blood-badge">{booking.donor.bloodType}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">📱 Phone:</span>
                          <span className="value">{booking.donor.phone}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">📅 Booked On:</span>
                          <span className="value">{new Date(booking.bookingDate).toLocaleDateString()}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">👤 Age:</span>
                          <span className="value">{booking.donor.age} years</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">⚖️ Weight:</span>
                          <span className="value">{booking.donor.weight} kg</span>
                        </div>
                      </div>

                      <button 
                        className="btn-details"
                        onClick={() => openDetails(booking)}
                        disabled={marking}
                      >
                        👁️ View & Action
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Booking Details</h2>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="donor-section">
                <h3>👤 Donor Information</h3>
                <div className="detail-grid">
                  <div className="detail">
                    <label>Name:</label>
                    <p>{selectedBooking.donor.name}</p>
                  </div>
                  <div className="detail">
                    <label>NIC:</label>
                    <p>{selectedBooking.donor.nic}</p>
                  </div>
                  <div className="detail">
                    <label>Blood Type:</label>
                    <p className="blood-type">{selectedBooking.donor.bloodType}</p>
                  </div>
                  <div className="detail">
                    <label>Age:</label>
                    <p>{selectedBooking.donor.age} years</p>
                  </div>
                  <div className="detail">
                    <label>Weight:</label>
                    <p>{selectedBooking.donor.weight} kg</p>
                  </div>
                  <div className="detail">
                    <label>Phone:</label>
                    <p>{selectedBooking.donor.phone}</p>
                  </div>
                </div>
              </div>

              <div className="booking-section">
                <h3>🏕️ Camp Booking Details</h3>
                <div className="detail-grid">
                  <div className="detail">
                    <label>Camp:</label>
                    <p>{selectedCamp.title}</p>
                  </div>
                  <div className="detail">
                    <label>Hospital:</label>
                    <p>{selectedCamp.hospital.hospitalName}</p>
                  </div>
                  <div className="detail">
                    <label>Camp Date:</label>
                    <p>{new Date(selectedCamp.date).toLocaleDateString()}</p>
                  </div>
                  <div className="detail">
                    <label>Camp Time:</label>
                    <p>{selectedCamp.time}</p>
                  </div>
                  <div className="detail">
                    <label>Status:</label>
                    <p style={{color: getStatusBadgeColor(selectedBooking.status)}}>
                      <strong>{selectedBooking.status}</strong>
                    </p>
                  </div>
                  <div className="detail">
                    <label>Booked On:</label>
                    <p>{new Date(selectedBooking.bookingDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              {selectedBooking.status === 'REGISTERED' && (
                <>
                  <button 
                    className="btn btn-success"
                    onClick={() => handleMarkAsAttended(selectedBooking)}
                    disabled={marking}
                  >
                    {marking ? '⏳ Processing...' : '✅ Mark as Attended'}
                  </button>
                  <button 
                    className="btn btn-warning"
                    onClick={() => handleNoShow(selectedBooking)}
                    disabled={marking}
                  >
                    {marking ? '⏳ Processing...' : '🚫 Mark as No Show'}
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleCancelBooking(selectedBooking)}
                    disabled={marking}
                  >
                    {marking ? '⏳ Processing...' : '❌ Cancel Booking'}
                  </button>
                </>
              )}
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDetailsModal(false)}
                disabled={marking}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageCampBookings;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authHelper, formatDate, getStatusColor, bloodGroups, urgencyLevels } from '../../utils/helpers';
import {
  hospitalService,
  bloodRequestService,
  notificationService,
  bloodInventoryService
} from '../../services/api';
import './HospitalDashboard.css';

function HospitalDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
 
  
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileForm, setProfileForm] = useState({
    hospitalName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    registrationNumber: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [formStep, setFormStep] = useState(1);
  const [phoneValidated, setPhoneValidated] = useState(false);
  
  // View, Update, Delete states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // Blood Request Update/Cancel states
  const [showUpdateRequestModal, setShowUpdateRequestModal] = useState(false);
  const [showCancelRequestModal, setShowCancelRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updateRequestForm, setUpdateRequestForm] = useState({
    bloodGroup: '',
    quantity: '',
    urgencyLevel: '',
    patientName: '',
    reason: ''
  });
  const [requestLoading, setRequestLoading] = useState(false);
  
  const [requestForm, setRequestForm] = useState({
    bloodGroup: 'A_POSITIVE',
    quantity: '',
    urgencyLevel: 'MEDIUM',
    patientName: '',
    reason: ''
  });

  const user = authHelper.getCurrentUser();

  useEffect(() => {
    if (!authHelper.isLoggedIn() || !authHelper.hasRole('HOSPITAL')) {
      navigate('/login');
      return;
    }
    loadHospitalData();
  }, [navigate]);

  const loadHospitalData = async () => {
    setLoading(true);
    try {
      const hospitalRes = await hospitalService.getHospitalByUserId(user.userId);
      
      if (hospitalRes.data) {
        setHospitalProfile(hospitalRes.data);
        
        const [requestsRes, notificationsRes, stockRes] = await Promise.all([
          bloodRequestService.getRequestsByHospital(hospitalRes.data.id),
          notificationService.getUserNotifications(user.userId),
          bloodInventoryService.getBloodStockSummary()
        ]);

        const appointmentsRes = await hospitalService.getHospitalAppointments(hospitalRes.data.id);

        setBloodRequests(requestsRes.data);
        setNotifications(notificationsRes.data);
        setBloodStock(stockRes.data);
        setHospitalAppointments(appointmentsRes.data || []);
      } else {
        setShowProfileForm(true);
      }
    } catch (error) {  console.error('Error loading hospital data:', error);
      if (error.response?.status === 404) {
        setShowProfileForm(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authHelper.logout();
    navigate('/login');
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const validateStep = (step) => {
    const errors = {};
    if (step === 1) {
      if (!profileForm.hospitalName) errors.hospitalName = 'Hospital name is required';
      if (!profileForm.registrationNumber) errors.registrationNumber = 'Registration number is required';
      if (!profileForm.phone) {
        errors.phone = 'Phone number is required';
      } else if (!validatePhone(profileForm.phone)) {
        errors.phone = 'Please enter a valid 10-digit phone number';
      }
    } else if (step === 2) {
      if (!profileForm.address) errors.address = 'Address is required';
      if (!profileForm.city) errors.city = 'City is required';
      if (!profileForm.state) errors.state = 'State is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(formStep)) {
      setFormStep(formStep + 1);
    }
  };

  const handlePrevStep = () => {
    setFormStep(formStep - 1);
    setFormErrors({});
  };

  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm({ ...profileForm, [name]: value });
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
    // Validate phone in real-time
    if (name === 'phone') {
      setPhoneValidated(validatePhone(value));
    }
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    if (!validateStep(2)) return;
    
    try {
      await hospitalService.createHospital({
        userId: user.userId,
        ...profileForm
      });
      alert('Profile created successfully! Waiting for admin verification.');
      setShowProfileForm(false);
      setFormStep(1);
      loadHospitalData();
    } catch (error) {
      alert('Error creating profile: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  // View Profile Modal
  const handleViewProfile = () => {
    setShowViewModal(true);
  };

  // Edit Profile Functions
  const handleEditProfile = () => {
    setEditForm({
      hospitalName: hospitalProfile.hospitalName,
      phone: hospitalProfile.phone,
      address: hospitalProfile.address,
      city: hospitalProfile.city,
      state: hospitalProfile.state,
      registrationNumber: hospitalProfile.registrationNumber
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
    if (editErrors[name]) {
      setEditErrors({ ...editErrors, [name]: '' });
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    // Validation
    const errors = {};
    if (!editForm.hospitalName) errors.hospitalName = 'Hospital name is required';
    if (!editForm.phone) {
      errors.phone = 'Phone number is required';
    } else if (!validatePhone(editForm.phone)) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!editForm.address) errors.address = 'Address is required';
    if (!editForm.city) errors.city = 'City is required';
    if (!editForm.state) errors.state = 'State is required';
    
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setUpdateLoading(true);
    try {
      await hospitalService.updateHospital(hospitalProfile.id, editForm);
      alert('Profile updated successfully!');
      setShowEditModal(false);
      setEditErrors({});
      loadHospitalData();
    } catch (error) {
      alert('Error updating profile: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setUpdateLoading(false);
    }
  };

  // Delete Profile Functions
  const handleDeleteProfile = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteProfile = async () => {
    setUpdateLoading(true);
    try {
      await hospitalService.deleteHospital(hospitalProfile.id);
      alert('Profile deleted successfully!');
      setShowDeleteModal(false);
      authHelper.logout();
      navigate('/login');
    } catch (error) {
      alert('Error deleting profile: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    if (!hospitalProfile.verified) {
      alert('Your hospital must be verified before submitting requests.');
      return;
    }
    
    try {
      await bloodRequestService.createRequest({
        hospitalId: hospitalProfile.id,
        ...requestForm
      });
      alert('Blood request submitted successfully!');
      setRequestForm({
        bloodGroup: 'A_POSITIVE',
        quantity: '',
        urgencyLevel: 'MEDIUM',
        patientName: '',
        reason: ''
      });
      loadHospitalData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting request');
    }
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      loadHospitalData();
    } catch (error) {
      console.error('Error marking notification as read');
    }
  };

  // Blood Request Update/Cancel Handlers
  const handleUpdateRequestClick = (request) => {
    if (request.status !== 'PENDING') {
      alert('Only pending requests can be updated.');
      return;
    }
    setSelectedRequest(request);
    setUpdateRequestForm({
      bloodGroup: request.bloodGroup,
      quantity: request.quantity.toString(),
      urgencyLevel: request.urgencyLevel,
      patientName: request.patientName,
      reason: request.reason || ''
    });
    setShowUpdateRequestModal(true);
  };

  const handleUpdateRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestLoading(true);
    
    try {
      await bloodRequestService.updateRequest(selectedRequest.id, {
        ...updateRequestForm,
        hospitalId: hospitalProfile.id
      });
      alert('Blood request updated successfully!');
      setShowUpdateRequestModal(false);
      setSelectedRequest(null);
      loadHospitalData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating request');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleCancelRequestClick = (request) => {
    if (request.status !== 'PENDING') {
      alert('Only pending requests can be cancelled.');
      return;
    }
    setSelectedRequest(request);
    setShowCancelRequestModal(true);
  };

  const confirmCancelRequest = async () => {
    setRequestLoading(true);
    
    try {
      await bloodRequestService.cancelRequest(selectedRequest.id);
      alert('Blood request cancelled successfully!');
      setShowCancelRequestModal(false);
      setSelectedRequest(null);
      loadHospitalData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error cancelling request');
    } finally {
      setRequestLoading(false);
    }
  };

  if (showProfileForm) {
    return (
      <div className="hospital-dashboard">
        <div className="profile-setup-modern">
          <div className="profile-setup-header">
            <div className="header-icon hospital">🏥</div>
            <h2>Complete Your Hospital Profile</h2>
            <p>Register your hospital to request blood and manage inventory</p>
          </div>

          {/* Progress Indicator */}
          <div className="form-progress">
            <div className={`progress-step ${formStep >= 1 ? 'active' : ''} ${formStep > 1 ? 'completed' : ''}`}>
              <div className="step-circle">1</div>
              <div className="step-label">Hospital Info</div>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${formStep >= 2 ? 'active' : ''} ${formStep > 2 ? 'completed' : ''}`}>
              <div className="step-circle">2</div>
              <div className="step-label">Location</div>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${formStep >= 3 ? 'active' : ''}`}>
              <div className="step-circle">3</div>
              <div className="step-label">Review</div>
            </div>
          </div>

          <form onSubmit={handleCreateProfile} className="profile-form-modern">
            {/* Step 1: Hospital Information */}
            {formStep === 1 && (
              <div className="form-step animate-slide-in">
                <h3 className="step-title">
                  <span className="step-icon">🏥</span>
                  Hospital Information
                </h3>
                
                <div className="form-group-modern">
                  <label>
                    <span className="label-icon">🏭</span>
                    Hospital Name *
                  </label>
                  <input
                    type="text"
                    name="hospitalName"
                    placeholder="Enter hospital name"
                    value={profileForm.hospitalName}
                    onChange={handleProfileFormChange}
                    className={`form-input-modern ${formErrors.hospitalName ? 'error' : ''}`}
                  />
                  {formErrors.hospitalName && <span className="error-text">{formErrors.hospitalName}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group-modern">
                    <label>
                      <span className="label-icon">📋</span>
                      Registration Number *
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      placeholder="Hospital registration no."
                      value={profileForm.registrationNumber}
                      onChange={handleProfileFormChange}
                      className={`form-input-modern ${formErrors.registrationNumber ? 'error' : ''}`}
                    />
                    {formErrors.registrationNumber && <span className="error-text">{formErrors.registrationNumber}</span>}
                  </div>

                  <div className="form-group-modern">
                    <label>
                      <span className="label-icon">📱</span>
                      Phone Number *
                    </label>
                    <div className="input-with-icon">
                      <input
                        type="tel"
                        name="phone"
                        placeholder="10-digit contact number"
                        value={profileForm.phone}
                        onChange={handleProfileFormChange}
                        maxLength="10"
                        className={`form-input-modern ${formErrors.phone ? 'error' : phoneValidated && profileForm.phone ? 'success' : ''}`}
                      />
                      {profileForm.phone && (
                        <span className="validation-icon">
                          {phoneValidated ? '✓' : '✗'}
                        </span>
                      )}
                    </div>
                    {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
                  </div>
                </div>

                <div className="info-banner">
                  <span className="info-icon">ℹ️</span>
                  <p>Your hospital profile will be verified by our admin team before you can submit blood requests.</p>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={handleNextStep} className="btn-modern btn-primary">
                    Continue <span className="btn-arrow">→</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Location Information */}
            {formStep === 2 && (
              <div className="form-step animate-slide-in">
                <h3 className="step-title">
                  <span className="step-icon">📍</span>
                  Location Information
                </h3>

                <div className="form-group-modern">
                  <label>
                    <span className="label-icon">🏠</span>
                    Hospital Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Complete hospital address"
                    value={profileForm.address}
                    onChange={handleProfileFormChange}
                    className={`form-input-modern ${formErrors.address ? 'error' : ''}`}
                  />
                  {formErrors.address && <span className="error-text">{formErrors.address}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group-modern">
                    <label>
                      <span className="label-icon">🏙️</span>
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={profileForm.city}
                      onChange={handleProfileFormChange}
                      className={`form-input-modern ${formErrors.city ? 'error' : ''}`}
                    />
                    {formErrors.city && <span className="error-text">{formErrors.city}</span>}
                  </div>

                  <div className="form-group-modern">
                    <label>
                      <span className="label-icon">🗺️</span>
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={profileForm.state}
                      onChange={handleProfileFormChange}
                      className={`form-input-modern ${formErrors.state ? 'error' : ''}`}
                    />
                    {formErrors.state && <span className="error-text">{formErrors.state}</span>}
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={handlePrevStep} className="btn-modern btn-secondary">
                    <span className="btn-arrow">←</span> Back
                  </button>
                  <button type="button" onClick={handleNextStep} className="btn-modern btn-primary">
                    Continue <span className="btn-arrow">→</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {formStep === 3 && (
              <div className="form-step animate-slide-in">
                <h3 className="step-title">
                  <span className="step-icon">✓</span>
                  Review Your Information
                </h3>

                <div className="profile-review">
                  <div className="review-section">
                    <h4>Hospital Details</h4>
                    <div className="review-grid">
                      <div className="review-item">
                        <span className="review-label">Hospital Name:</span>
                        <span className="review-value">{profileForm.hospitalName}</span>
                      </div>
                      <div className="review-item">
                        <span className="review-label">Registration No:</span>
                        <span className="review-value">{profileForm.registrationNumber}</span>
                      </div>
                      <div className="review-item">
                        <span className="review-label">Phone:</span>
                        <span className="review-value">{profileForm.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="review-section">
                    <h4>Location</h4>
                    <div className="review-grid">
                      <div className="review-item">
                        <span className="review-label">Address:</span>
                        <span className="review-value">{profileForm.address}</span>
                      </div>
                      <div className="review-item">
                        <span className="review-label">City:</span>
                        <span className="review-value">{profileForm.city}</span>
                      </div>
                      <div className="review-item">
                        <span className="review-label">State:</span>
                        <span className="review-value">{profileForm.state}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="warning-banner">
                  <span className="warning-icon">⚠️</span>
                  <p>Please ensure all information is correct. Your profile will be sent for admin verification.</p>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={handlePrevStep} className="btn-modern btn-secondary">
                    <span className="btn-arrow">←</span> Back
                  </button>
                  <button type="submit" className="btn-modern btn-success" disabled={loading}>
                    {loading ? (
                      <><span className="spinner"></span> Creating...</>
                    ) : (
                      <><span>Create Profile</span> ✓</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="dashboard-content">
      <h2>Hospital Dashboard</h2>
      
      {hospitalProfile && (
        <div className="profile-card">
          <div className="profile-header">
            <div>
              <h3>{hospitalProfile.hospitalName}</h3>
              <p>{hospitalProfile.city}, {hospitalProfile.state}</p>
            </div>
            <div className="profile-actions-row">
              <div className="verification-status">
                {hospitalProfile.verified ? (
                  <span className="status-badge verified">✓ Verified</span>
                ) : (
                  <span className="status-badge unverified">⏳ Pending Verification</span>
                )}
              </div>
              <div className="profile-actions">
                <button onClick={handleViewProfile} className="action-btn view-btn" title="View Details">
                  👁️ View
                </button>
                <button onClick={handleEditProfile} className="action-btn edit-btn" title="Edit Profile">
                  ✏️ Edit
                </button>
                <button onClick={handleDeleteProfile} className="action-btn delete-btn" title="Delete Profile">
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
          <div className="profile-info">
            <div className="info-item">
              <strong>Registration No:</strong> {hospitalProfile.registrationNumber}
            </div>
            <div className="info-item">
              <strong>Phone:</strong> {hospitalProfile.phone}
            </div>
            <div className="info-item">
              <strong>Address:</strong> {hospitalProfile.address}
            </div>
          </div>
        </div>
      )}

      {!hospitalProfile?.verified && (
        <div className="warning-banner">
          <strong>⚠️ Account Pending Verification</strong>
          <p>Your hospital account is pending admin verification. You will be able to submit blood requests once verified.</p>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>{bloodRequests.filter(r => r.status === 'PENDING').length}</h3>
          <p>Pending Requests</p>
        </div>
        <div className="stat-card">
          <h3>{bloodRequests.filter(r => r.status === 'APPROVED').length}</h3>
          <p>Approved Requests</p>
        </div>
        <div className="stat-card">
          <h3>{bloodRequests.filter(r => r.status === 'DELIVERED').length}</h3>
          <p>Delivered</p>
        </div>
        <div className="stat-card">
          <h3>{notifications.filter(n => !n.read).length}</h3>
          <p>Unread Notifications</p>
        </div>
        <div className="stat-card">
          <h3>{hospitalAppointments.length}</h3>
          <p>Booked Appointments</p>
        </div>
      </div>

      <div className="form-card" style={{ marginTop: '20px' }}>
        <h3>Need to book donor appointments?</h3>
        <p>Use the home page appointment form with NIC search and blood camp support.</p>
        <button className="btn-primary" onClick={() => navigate('/#book-appointment')}>Book Appointment</button>
      </div>

      <div className="blood-stock-section">
        <h3>Available Blood Stock</h3>
        <div className="blood-stock-grid">
          {Object.entries(bloodStock).map(([bloodGroup, quantity]) => (
            <div key={bloodGroup} className="blood-stock-card">
              <div className="blood-group">{bloodGroup}</div>
              <div className="quantity">{quantity} units</div>
              <div className={`status ${quantity < 10 ? 'low' : 'good'}`}>
                {quantity === 0 ? 'Out of Stock' : quantity < 10 ? 'Low Stock' : 'Available'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRequests = () => (
    <div className="section-content">
      <h2>Blood Requests</h2>
      
      <div className="form-card">
        <h3>Submit New Blood Request</h3>
        {!hospitalProfile?.verified ? (
          <div className="warning-message">
            Your hospital must be verified by an administrator before you can submit blood requests.
          </div>
        ) : (
          <form onSubmit={handleSubmitRequest}>
            <div className="form-row">
              <div className="form-group">
                <label>Blood Group *</label>
                <select
                  value={requestForm.bloodGroup}
                  onChange={(e) => setRequestForm({ ...requestForm, bloodGroup: e.target.value })}
                  required
                >
                  {bloodGroups.map(bg => (
                    <option key={bg.value} value={bg.value}>{bg.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Quantity (units) *</label>
                <input
                  type="number"
                  value={requestForm.quantity}
                  onChange={(e) => setRequestForm({ ...requestForm, quantity: e.target.value })}
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Urgency Level *</label>
                <select
                  value={requestForm.urgencyLevel}
                  onChange={(e) => setRequestForm({ ...requestForm, urgencyLevel: e.target.value })}
                  required
                >
                  {urgencyLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Patient Name *</label>
              <input
                type="text"
                value={requestForm.patientName}
                onChange={(e) => setRequestForm({ ...requestForm, patientName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Reason for Request *</label>
              <textarea
                value={requestForm.reason}
                onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                rows="3"
                required
              />
            </div>
            <button type="submit" className="btn-primary">Submit Request</button>
          </form>
        )}
      </div>

      <div className="requests-list">
        <h3>Your Blood Requests</h3>
        {bloodRequests.length === 0 ? (
          <p>No blood requests submitted yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Blood Group</th>
                  <th>Quantity</th>
                  <th>Urgency</th>
                  <th>Patient</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bloodRequests.map((request) => (
                  <tr key={request.id}>
                    <td>{formatDate(request.createdAt)}</td>
                    <td><span className="blood-badge">{request.bloodGroup}</span></td>
                    <td>{request.quantity} units</td>
                    <td>
                      <span
                        className="urgency-badge"
                        style={{ backgroundColor: getStatusColor(request.urgencyLevel) }}
                      >
                        {request.urgencyLevel}
                      </span>
                    </td>
                    <td>{request.patientName}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(request.status) }}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td>{request.adminNotes || '-'}</td>
                    <td>
                      <div className="request-actions">
                        {request.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleUpdateRequestClick(request)}
                              className="btn-action btn-update"
                              title="Update Request"
                            >
                              ✏️ Update
                            </button>
                            <button
                              onClick={() => handleCancelRequestClick(request)}
                              className="btn-action btn-cancel"
                              title="Cancel Request"
                            >
                              ✕ Cancel
                            </button>
                          </>
                        )}
                        {request.status !== 'PENDING' && (
                          <span className="no-actions">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="section-content">
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-card ${notification.read ? 'read' : 'unread'}`}
              onClick={() => handleMarkNotificationRead(notification.id)}
            >
              <div className="notification-header">
                <span className="notification-type">{notification.type}</span>
                <span className="notification-date">{formatDate(notification.createdAt)}</span>
              </div>
              <h4>{notification.title}</h4>
              <p>{notification.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAppointments = () => (
    <div className="section-content">
      <h2>Hospital Appointments</h2>
      {hospitalAppointments.length === 0 ? (
        <p>No appointments booked for this hospital yet.</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Name</th>
                <th>NIC</th>
                <th>Blood Type</th>
                <th>City</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {hospitalAppointments.map((apt) => (
                <tr key={apt.id}>
                  <td>{formatDate(apt.appointmentDate)}</td>
                  <td>{apt.timePeriod || apt.appointmentTime}</td>
                  <td>{apt.fullName || apt?.donor?.user?.name || '-'}</td>
                  <td>{apt.nic || apt?.donor?.nic || '-'}</td>
                  <td>{apt.bloodType || apt?.donor?.bloodGroup || '-'}</td>
                  <td>{apt.city || apt?.donor?.city || '-'}</td>
                  <td>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(apt.status) }}>{apt.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="hospital-dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>🏥 Hospital Portal</h2>
          <p>{user?.name}</p>
          {hospitalProfile && (
            <span className="hospital-badge">{hospitalProfile.hospitalName}</span>
          )}
        </div>
        
        <nav className="sidebar-nav">
          <button
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={activeTab === 'requests' ? 'active' : ''}
            onClick={() => setActiveTab('requests')}
          >
            📋 Blood Requests
          </button>
          <button
            className={activeTab === 'notifications' ? 'active' : ''}
            onClick={() => setActiveTab('notifications')}
          >
            🔔 Notifications
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="notification-badge">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
          <button
            className={activeTab === 'appointments' ? 'active' : ''}
            onClick={() => setActiveTab('appointments')}
          >
            📅 Appointments
          </button>
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </nav>
      </div>

      <div className="dashboard-main">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'requests' && renderRequests()}
            {activeTab === 'notifications' && renderNotifications()}
            {activeTab === 'appointments' && renderAppointments()}
          </>
        )}
      </div>

      {/* View Profile Modal */}
      {showViewModal && hospitalProfile && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🏥 Hospital Profile Details</h2>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="profile-details-grid">
                <div className="detail-card">
                  <label>Hospital Name</label>
                  <p>{hospitalProfile.hospitalName}</p>
                </div>
                <div className="detail-card">
                  <label>Registration Number</label>
                  <p>{hospitalProfile.registrationNumber}</p>
                </div>
                <div className="detail-card">
                  <label>Verification Status</label>
                  <p>
                    {hospitalProfile.verified ? (
                      <span className="status-badge verified">✓ Verified</span>
                    ) : (
                      <span className="status-badge unverified">⏳ Pending</span>
                    )}
                  </p>
                </div>
                <div className="detail-card">
                  <label>Phone Number</label>
                  <p>{hospitalProfile.phone}</p>
                </div>
                <div className="detail-card">
                  <label>Email</label>
                  <p>{user?.email}</p>
                </div>
                <div className="detail-card full-width">
                  <label>Address</label>
                  <p>{hospitalProfile.address}</p>
                </div>
                <div className="detail-card">
                  <label>City</label>
                  <p>{hospitalProfile.city}</p>
                </div>
                <div className="detail-card">
                  <label>State</label>
                  <p>{hospitalProfile.state}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowViewModal(false)} className="btn-modern btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Edit Hospital Profile</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdateProfile}>
              <div className="modal-body">
                <div className="form-group-modern">
                  <label>
                    <span className="label-icon">🏥</span>
                    Hospital Name *
                  </label>
                  <input
                    type="text"
                    name="hospitalName"
                    value={editForm.hospitalName}
                    onChange={handleEditFormChange}
                    className={`form-input-modern ${editErrors.hospitalName ? 'error' : ''}`}
                  />
                  {editErrors.hospitalName && <span className="error-text">{editErrors.hospitalName}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group-modern">
                    <label>
                      <span className="label-icon">📋</span>
                      Registration Number *
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={editForm.registrationNumber}
                      onChange={handleEditFormChange}
                      className="form-input-modern"
                      readOnly
                      title="Registration number cannot be changed"
                    />
                  </div>

                  <div className="form-group-modern">
                    <label>
                      <span className="label-icon">📱</span>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleEditFormChange}
                      maxLength="10"
                      className={`form-input-modern ${editErrors.phone ? 'error' : ''}`}
                    />
                    {editErrors.phone && <span className="error-text">{editErrors.phone}</span>}
                  </div>
                </div>

                <div className="form-group-modern">
                  <label>
                    <span className="label-icon">🏠</span>
                    Hospital Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={editForm.address}
                    onChange={handleEditFormChange}
                    className={`form-input-modern ${editErrors.address ? 'error' : ''}`}
                  />
                  {editErrors.address && <span className="error-text">{editErrors.address}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group-modern">
                    <label>
                      <span className="label-icon">🏙️</span>
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={editForm.city}
                      onChange={handleEditFormChange}
                      className={`form-input-modern ${editErrors.city ? 'error' : ''}`}
                    />
                    {editErrors.city && <span className="error-text">{editErrors.city}</span>}
                  </div>

                  <div className="form-group-modern">
                    <label>
                      <span className="label-icon">🗺️</span>
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={editForm.state}
                      onChange={handleEditFormChange}
                      className={`form-input-modern ${editErrors.state ? 'error' : ''}`}
                    />
                    {editErrors.state && <span className="error-text">{editErrors.state}</span>}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-modern btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-modern btn-success" disabled={updateLoading}>
                  {updateLoading ? <><span className="spinner"></span> Updating...</> : <>💾 Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header danger">
              <h2>⚠️ Delete Hospital Profile</h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="warning-content">
                <div className="warning-icon-large">🗑️</div>
                <h3>Are you absolutely sure?</h3>
                <p>This action cannot be undone. This will permanently delete your hospital profile and all associated data.</p>
                <div className="warning-list">
                  <p>⚠️ All your blood request history will be removed</p>
                  <p>⚠️ Your pending requests will be cancelled</p>
                  <p>⚠️ You will need to register again and wait for verification</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowDeleteModal(false)} className="btn-modern btn-secondary">
                Cancel
              </button>
              <button onClick={confirmDeleteProfile} className="btn-modern btn-danger" disabled={updateLoading}>
                {updateLoading ? <><span className="spinner"></span> Deleting...</> : <>🗑️ Yes, Delete Profile</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Blood Request Modal */}
      {showUpdateRequestModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowUpdateRequestModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Update Blood Request</h2>
              <button className="modal-close" onClick={() => setShowUpdateRequestModal(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdateRequestSubmit}>
              <div className="modal-body">
                <div className="update-info">
                  <p className="info-text">
                    <strong>Request ID:</strong> #{selectedRequest.id} | <strong>Status:</strong> {selectedRequest.status}
                  </p>
                </div>

                <div className="form-group-modern">
                  <label>
                    <span className="label-icon">🩸</span>
                    Blood Group *
                  </label>
                  <select
                    value={updateRequestForm.bloodGroup}
                    onChange={(e) => setUpdateRequestForm({ ...updateRequestForm, bloodGroup: e.target.value })}
                    required
                    className="form-input-modern"
                  >
                    {bloodGroups.map((group) => (
                      <option key={group.value} value={group.value}>
                        {group.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group-modern">
                  <label>
                    <span className="label-icon">📦</span>
                    Quantity (units) *
                  </label>
                  <input
                    type="number"
                    value={updateRequestForm.quantity}
                    onChange={(e) => setUpdateRequestForm({ ...updateRequestForm, quantity: e.target.value })}
                    min="1"
                    required
                    className="form-input-modern"
                  />
                </div>

                <div className="form-group-modern">
                  <label>
                    <span className="label-icon">⚠️</span>
                    Urgency Level *
                  </label>
                  <select
                    value={updateRequestForm.urgencyLevel}
                    onChange={(e) => setUpdateRequestForm({ ...updateRequestForm, urgencyLevel: e.target.value })}
                    required
                    className="form-input-modern"
                  >
                    {urgencyLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group-modern">
                  <label>
                    <span className="label-icon">👤</span>
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    value={updateRequestForm.patientName}
                    onChange={(e) => setUpdateRequestForm({ ...updateRequestForm, patientName: e.target.value })}
                    required
                    className="form-input-modern"
                  />
                </div>

                <div className="form-group-modern">
                  <label>
                    <span className="label-icon">📝</span>
                    Reason
                  </label>
                  <textarea
                    value={updateRequestForm.reason}
                    onChange={(e) => setUpdateRequestForm({ ...updateRequestForm, reason: e.target.value })}
                    rows="3"
                    className="form-input-modern"
                    placeholder="Reason for blood requirement..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={() => setShowUpdateRequestModal(false)} 
                  className="btn-modern btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-modern btn-primary" 
                  disabled={requestLoading}
                >
                  {requestLoading ? <><span className="spinner"></span> Updating...</> : <>✏️ Update Request</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Blood Request Modal */}
      {showCancelRequestModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowCancelRequestModal(false)}>
          <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header danger">
              <h2>⚠️ Cancel Blood Request</h2>
              <button className="modal-close" onClick={() => setShowCancelRequestModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="warning-content">
                <div className="warning-icon-large">🚫</div>
                <h3>Confirm Cancellation</h3>
                <p>Are you sure you want to cancel this blood request?</p>
                <div className="request-details">
                  <p><strong>Request ID:</strong> #{selectedRequest.id}</p>
                  <p><strong>Blood Group:</strong> {selectedRequest.bloodGroup}</p>
                  <p><strong>Quantity:</strong> {selectedRequest.quantity} units</p>
                  <p><strong>Patient:</strong> {selectedRequest.patientName}</p>
                  <p><strong>Urgency:</strong> {selectedRequest.urgencyLevel}</p>
                </div>
                <div className="warning-list">
                  <p>⚠️ This action cannot be undone</p>
                  <p>⚠️ You will need to create a new request if needed</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowCancelRequestModal(false)} className="btn-modern btn-secondary">
                Go Back
              </button>
              <button onClick={confirmCancelRequest} className="btn-modern btn-danger" disabled={requestLoading}>
                {requestLoading ? <><span className="spinner"></span> Cancelling...</> : <>🚫 Yes, Cancel Request</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HospitalDashboard;

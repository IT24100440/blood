import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authHelper, formatDate, bloodGroups } from '../../utils/helpers';
import {
  donorService,
  appointmentService,
  notificationService,
  bloodInventoryService
} from '../../services/api';
import './DonorDashboard.css';

function DonorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
  const [donorProfile, setDonorProfile] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [bloodStock, setBloodStock] = useState({});
  
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileForm, setProfileForm] = useState({
    bloodGroup: 'A_POSITIVE',
    phone: '',
    address: '',
    city: '',
    state: '',
    dateOfBirth: '',
    lastDonationDate: ''
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
  
  const [appointmentForm, setAppointmentForm] = useState({
    appointmentDate: '',
    appointmentTime: '09:00',
    donationCenter: 'Main Blood Bank',
    notes: ''
  });

  // Reschedule appointment states
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    appointmentDate: '',
    appointmentTime: '09:00',
    donationCenter: '',
    notes: ''
  });
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  // Notification enhancement states
  const [previousNotificationCount, setPreviousNotificationCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);

  const user = authHelper.getCurrentUser();

  useEffect(() => {
    if (!authHelper.isLoggedIn() || !authHelper.hasRole('DONOR')) {
      navigate('/login');
      return;
    }
    loadDonorData();
  }, [navigate]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!donorProfile) return;

    const pollInterval = setInterval(async () => {
      try {
        const notificationsRes = await notificationService.getUserNotifications(user.userId);
        const newNotifications = notificationsRes.data;
        
        // Check for new unread notifications
        const newUnreadCount = newNotifications.filter(n => !n.read).length;
        const oldUnreadCount = previousNotificationCount;
        
        if (newUnreadCount > oldUnreadCount) {
          // New notification arrived!
          const latestNotification = newNotifications.find(n => !n.read && 
            !notifications.some(old => old.id === n.id));
          
          if (latestNotification) {
            playNotificationSound();
            showNotificationToast(latestNotification);
          }
        }
        
        setNotifications(newNotifications);
        setPreviousNotificationCount(newUnreadCount);
      } catch (error) {
        console.error('Error polling notifications:', error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(pollInterval);
  }, [donorProfile, notifications, previousNotificationCount, user.userId]);

  // Initialize notification count
  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length;
    setPreviousNotificationCount(unreadCount);
  }, [notifications.length]);

  const playNotificationSound = () => {
    // Create a simple notification beep using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800; // Frequency in Hz
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const showNotificationToast = (notification) => {
    setToastNotification(notification);
    setShowToast(true);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  const loadDonorData = async () => {
    setLoading(true);
    try {
      const donorRes = await donorService.getDonorByUserId(user.userId);
      
      if (donorRes.data) {
        setDonorProfile(donorRes.data);
        
        const [eligibilityRes, appointmentsRes, notificationsRes, stockRes] = await Promise.all([
          donorService.checkEligibility(donorRes.data.id),
          appointmentService.getAppointmentsByDonor(donorRes.data.id),
          notificationService.getUserNotifications(user.userId),
          bloodInventoryService.getBloodStockSummary()
        ]);

        setEligibility(eligibilityRes.data);
        setAppointments(appointmentsRes.data);
        setNotifications(notificationsRes.data);
        setBloodStock(stockRes.data);
      } else {
        setShowProfileForm(true);
      }
    } catch (error) {
      console.error('Error loading donor data:', error);
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
      if (!profileForm.bloodGroup) errors.bloodGroup = 'Blood group is required';
      if (!profileForm.phone) {
        errors.phone = 'Phone number is required';
      } else if (!validatePhone(profileForm.phone)) {
        errors.phone = 'Please enter a valid 10-digit phone number';
      }
      if (!profileForm.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
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
      await donorService.createDonor({
        userId: user.userId,
        ...profileForm
      });
      alert('Profile created successfully!');
      setShowProfileForm(false);
      setFormStep(1);
      loadDonorData();
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
      bloodGroup: donorProfile.bloodGroup,
      phone: donorProfile.phone,
      address: donorProfile.address,
      city: donorProfile.city,
      state: donorProfile.state,
      dateOfBirth: donorProfile.dateOfBirth,
      lastDonationDate: donorProfile.lastDonationDate || ''
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
      await donorService.updateDonor(donorProfile.id, editForm);
      alert('Profile updated successfully!');
      setShowEditModal(false);
      setEditErrors({});
      loadDonorData();
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
      await donorService.deleteDonor(donorProfile.id);
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

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      await appointmentService.createAppointment({
        donorId: donorProfile.id,
        ...appointmentForm
      });
      alert('Appointment booked successfully!');
      setAppointmentForm({
        appointmentDate: '',
        appointmentTime: '09:00',
        donationCenter: 'Main Blood Bank',
        notes: ''
      });
      loadDonorData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error booking appointment');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentService.cancelAppointment(appointmentId);
        alert('Appointment cancelled successfully!');
        loadDonorData();
      } catch (error) {
        alert('Error cancelling appointment');
      }
    }
  };

  const handleRescheduleClick = (appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleForm({
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      donationCenter: appointment.donationCenter,
      notes: appointment.notes || ''
    });
    setShowRescheduleModal(true);
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    setRescheduleLoading(true);
    
    try {
      await appointmentService.updateAppointment(selectedAppointment.id, rescheduleForm);
      alert('Appointment rescheduled successfully!');
      setShowRescheduleModal(false);
      setSelectedAppointment(null);
      loadDonorData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error rescheduling appointment');
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      loadDonorData();
    } catch (error) {
      console.error('Error marking notification as read');
    }
  };

  if (showProfileForm) {
    return (
      <div className="donor-dashboard">
        <div className="profile-setup-modern">
          <div className="profile-setup-header">
            <div className="header-icon">🩸</div>
            <h2>Complete Your Donor Profile</h2>
            <p>Join our community and start saving lives today</p>
          </div>

          {/* Progress Indicator */}
          <div className="form-progress">
            <div className={`progress-step ${formStep >= 1 ? 'active' : ''} ${formStep > 1 ? 'completed' : ''}`}>
              <div className="step-circle">1</div>
              <div className="step-label">Basic Info</div>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${formStep >= 2 ? 'active' : ''} ${formStep > 2 ? 'completed' : ''}`}>
              <div className="step-circle">2</div>
              <div className="step-label">Address</div>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${formStep >= 3 ? 'active' : ''}`}>
              <div className="step-circle">3</div>
              <div className="step-label">Review</div>
            </div>
          </div>

          <form onSubmit={handleCreateProfile} className="profile-form-modern">
            {/* Step 1: Basic Information */}
            {formStep === 1 && (
              <div className="form-step animate-slide-in">
                <h3 className="step-title">
                  <span className="step-icon">👤</span>
                  Basic Information
                </h3>
                
                <div className="form-group-modern">
                  <label>
                    <span className="label-icon">🩸</span>
                    Blood Group *
                  </label>
                  <div className="blood-group-selector">
                    {bloodGroups.map(bg => (
                      <div
                        key={bg.value}
                        className={`blood-option ${profileForm.bloodGroup === bg.value ? 'selected' : ''}`}
                        onClick={() => handleProfileFormChange({ target: { name: 'bloodGroup', value: bg.value } })}
                      >
                        {bg.label}
                      </div>
                    ))}
                  </div>
                  {formErrors.bloodGroup && <span className="error-text">{formErrors.bloodGroup}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group-modern">
                    <label>
                      <span className="label-icon">📱</span>
                      Phone Number *
                    </label>
                    <div className="input-with-icon">
                      <input
                        type="tel"
                        name="phone"
                        placeholder="10-digit mobile number"
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

                  <div className="form-group-modern">
                    <label>
                      <span className="label-icon">📅</span>
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={profileForm.dateOfBirth}
                      onChange={handleProfileFormChange}
                      max={new Date().toISOString().split('T')[0]}
                      className={`form-input-modern ${formErrors.dateOfBirth ? 'error' : ''}`}
                    />
                    {formErrors.dateOfBirth && <span className="error-text">{formErrors.dateOfBirth}</span>}
                  </div>
                </div>

                <div className="form-group-modern">
                  <label>
                    <span className="label-icon">📆</span>
                    Last Donation Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="lastDonationDate"
                    value={profileForm.lastDonationDate}
                    onChange={handleProfileFormChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="form-input-modern"
                  />
                  <small className="field-hint">Leave blank if this is your first donation</small>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={handleNextStep} className="btn-modern btn-primary">
                    Continue <span className="btn-arrow">→</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Address Information */}
            {formStep === 2 && (
              <div className="form-step animate-slide-in">
                <h3 className="step-title">
                  <span className="step-icon">📍</span>
                  Address Information
                </h3>

                <div className="form-group-modern">
                  <label>
                    <span className="label-icon">🏠</span>
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Street address"
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
                      placeholder="Your city"
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
                      placeholder="Your state"
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
                    <h4>Basic Information</h4>
                    <div className="review-grid">
                      <div className="review-item">
                        <span className="review-label">Blood Group:</span>
                        <span className="review-value blood-type">{profileForm.bloodGroup}</span>
                      </div>
                      <div className="review-item">
                        <span className="review-label">Phone:</span>
                        <span className="review-value">{profileForm.phone}</span>
                      </div>
                      <div className="review-item">
                        <span className="review-label">Date of Birth:</span>
                        <span className="review-value">{profileForm.dateOfBirth}</span>
                      </div>
                      {profileForm.lastDonationDate && (
                        <div className="review-item">
                          <span className="review-label">Last Donation:</span>
                          <span className="review-value">{profileForm.lastDonationDate}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="review-section">
                    <h4>Address</h4>
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
      <h2>Welcome, {user?.name}!</h2>
      
      {donorProfile && (
        <div className="profile-card">
          <div className="profile-card-header">
            <h3>Your Profile</h3>
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
          <div className="profile-info">
            <div className="info-item">
              <strong>Blood Group:</strong>
              <span className="blood-badge">{donorProfile.bloodGroup}</span>
            </div>
            <div className="info-item">
              <strong>Total Donations:</strong> {donorProfile.totalDonations}
            </div>
            <div className="info-item">
              <strong>Last Donation:</strong>
              {donorProfile.lastDonationDate ? formatDate(donorProfile.lastDonationDate) : 'Never'}
            </div>
            <div className="info-item">
              <strong>Eligibility Status:</strong>
              {eligibility && (
                <span className={`status-badge ${eligibility.isEligible ? 'eligible' : 'not-eligible'}`}>
                  {eligibility.isEligible ? 'Eligible to Donate' : 'Not Eligible'}
                </span>
              )}
            </div>
            {eligibility && !eligibility.isEligible && eligibility.daysUntilEligible && (
              <div className="info-item">
                <strong>Next Eligible Date:</strong> {eligibility.canDonateOn}
                <br />
                <small>({eligibility.daysUntilEligible} days remaining)</small>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="blood-stock-section">
        <h3>Current Blood Stock Levels</h3>
        <div className="blood-stock-grid">
          {Object.entries(bloodStock).map(([bloodGroup, quantity]) => (
            <div key={bloodGroup} className={`blood-stock-card ${bloodGroup === donorProfile?.bloodGroup ? 'highlight' : ''}`}>
              <div className="blood-group">{bloodGroup}</div>
              <div className="quantity">{quantity} units</div>
              <div className={`status ${quantity < 10 ? 'low' : 'good'}`}>
                {quantity === 0 ? 'Urgently Needed' : quantity < 10 ? 'Low Stock' : 'Available'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>{appointments.filter(a => a.status === 'SCHEDULED').length}</h3>
          <p>Upcoming Appointments</p>
        </div>
        <div className="stat-card">
          <h3>{donorProfile?.totalDonations || 0}</h3>
          <p>Total Donations</p>
        </div>
        <div className="stat-card">
          <h3>{notifications.filter(n => !n.read).length}</h3>
          <p>Unread Notifications</p>
        </div>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="section-content">
      <h2>My Appointments</h2>
      
      <div className="form-card">
        <h3>Book New Appointment</h3>
        {eligibility && !eligibility.isEligible ? (
          <div className="warning-message">
            You are not currently eligible to donate. You can donate again on {eligibility.canDonateOn}
          </div>
        ) : (
          <form onSubmit={handleBookAppointment}>
            <div className="form-row">
              <div className="form-group">
                <label>Appointment Date *</label>
                <input
                  type="date"
                  value={appointmentForm.appointmentDate}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, appointmentDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="form-group">
                <label>Appointment Time *</label>
                <select
                  value={appointmentForm.appointmentTime}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, appointmentTime: e.target.value })}
                  required
                >
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Donation Center *</label>
              <input
                type="text"
                value={appointmentForm.donationCenter}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, donationCenter: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea
                value={appointmentForm.notes}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
                rows="3"
              />
            </div>
            <button type="submit" className="btn-primary">Book Appointment</button>
          </form>
        )}
      </div>

      <div className="appointments-list">
        <h3>Your Appointments</h3>
        {appointments.length === 0 ? (
          <p>No appointments booked yet.</p>
        ) : (
          <div className="appointment-cards">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="appointment-card">
                <div className="appointment-header">
                  <span className={`status-badge ${appointment.status.toLowerCase()}`}>
                    {appointment.status}
                  </span>
                  <span className="appointment-date">{formatDate(appointment.appointmentDate)}</span>
                </div>
                <div className="appointment-details">
                  <p><strong>Time:</strong> {appointment.appointmentTime}</p>
                  <p><strong>Location:</strong> {appointment.donationCenter}</p>
                  {appointment.notes && <p><strong>Notes:</strong> {appointment.notes}</p>}
                </div>
                {appointment.status === 'SCHEDULED' && (
                  <div className="appointment-actions">
                    <button
                      className="btn-small btn-primary"
                      onClick={() => handleRescheduleClick(appointment)}
                    >
                      🔄 Reschedule
                    </button>
                    <button
                      className="btn-small btn-danger"
                      onClick={() => handleCancelAppointment(appointment.id)}
                    >
                      ❌ Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderNotifications = () => {
    const getNotificationIcon = (type) => {
      const icons = {
        'EMERGENCY_ALERT': '🚨',
        'LOW_STOCK': '🩸',
        'APPOINTMENT_REMINDER': '📅',
        'REQUEST_UPDATE': '📢',
        'GENERAL': 'ℹ️',
        // Fallback icons for any future types
        'APPOINTMENT_CONFIRMED': '✅',
        'APPOINTMENT_CANCELLED': '❌',
        'DONATION_COMPLETED': '🎉',
        'ELIGIBILITY_UPDATE': '✨',
        'BLOOD_REQUEST_URGENT': '🆘'
      };
      return icons[type] || 'ℹ️';
    };

    const getNotificationPriority = (priority) => {
      const priorities = {
        'URGENT': { label: 'Urgent', className: 'urgent', color: '#dc3545' },
        'HIGH': { label: 'High', className: 'high', color: '#ff6b6b' },
        'MEDIUM': { label: 'Medium', className: 'medium', color: '#ffc107' },
        'LOW': { label: 'Low', className: 'low', color: '#17a2b8' }
      };
      return priorities[priority] || priorities['MEDIUM'];
    };

    const getNotificationAction = (notification) => {
      if (notification.actionUrl) {
        return notification.actionUrl;
      }
      
      // Default actions based on type
      const actionMap = {
        'APPOINTMENT_REMINDER': '/donor/appointments',
        'LOW_STOCK': '/donor/appointments/new',
        'EMERGENCY_ALERT': '/donor/appointments/new',
        'REQUEST_UPDATE': '/donor/appointments',
        // Legacy mappings for backward compatibility
        'APPOINTMENT_CONFIRMED': '/donor/appointments',
        'APPOINTMENT_CANCELLED': '/donor/appointments/new',
        'DONATION_COMPLETED': '/donor/history',
        'ELIGIBILITY_UPDATE': '/donor/appointments/new'
      };
      return actionMap[notification.type];
    };

    const handleNotificationAction = (notification) => {
      const action = getNotificationAction(notification);
      if (action) {
        // Mark as read
        handleMarkNotificationRead(notification.id);
        // Navigate or perform action (for this demo, just show alert)
        alert(`Action: ${action}\nThis would navigate to: ${action}`);
      }
    };

    const handleMarkAllAsRead = async () => {
      try {
        await notificationService.markAllAsRead(user.userId);
        setNotifications(notifications.map(n => ({ ...n, read: true })));
      } catch (error) {
        console.error('Error marking all as read');
      }
    };

    const handleDeleteNotification = async (notificationId) => {
      try {
        await notificationService.deleteNotification(notificationId);
        setNotifications(notifications.filter(n => n.id !== notificationId));
      } catch (error) {
        console.error('Error deleting notification');
      }
    };

    const sortedNotifications = [...notifications].sort((a, b) => {
      // Sort by priority first, then by date
      const priorityOrder = { 'URGENT': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
      const aPriority = priorityOrder[a.priority] ?? 2;
      const bPriority = priorityOrder[b.priority] ?? 2;
      
      if (aPriority !== bPriority) return aPriority - bPriority;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
      <div className="section-content">
        <div className="notifications-header">
          <h2>Notifications</h2>
          <div className="notification-stats">
            <span className="unread-badge">{unreadCount} Unread</span>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read-btn"
                onClick={handleMarkAllAsRead}
              >
                Mark All as Read
              </button>
            )}
          </div>
        </div>
        
        {notifications.length === 0 ? (
          <div className="empty-notifications">
            <span className="empty-icon">🔔</span>
            <p>No notifications yet.</p>
            <p className="empty-subtitle">We'll notify you about appointments, emergencies, and updates.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {sortedNotifications.map((notification) => {
              const priorityInfo = getNotificationPriority(notification.priority);
              const hasAction = getNotificationAction(notification);
              
              return (
                <div
                  key={notification.id}
                  className={`notification-card ${notification.read ? 'read' : 'unread'} priority-${priorityInfo.className}`}
                >
                  <div className="notification-icon">
                    <span className="icon-large">{getNotificationIcon(notification.type)}</span>
                  </div>
                  
                  <div className="notification-content">
                    <div className="notification-meta">
                      <span className="notification-type-label">{notification.type.replace(/_/g, ' ')}</span>
                      <span 
                        className={`priority-badge priority-${priorityInfo.className}`}
                        style={{ backgroundColor: priorityInfo.color }}
                      >
                        {priorityInfo.label}
                      </span>
                      <span className="notification-date">{formatDate(notification.createdAt)}</span>
                    </div>
                    
                    <h4 className="notification-title">{notification.title}</h4>
                    <p className="notification-message">{notification.message}</p>
                    
                    <div className="notification-actions">
                      {hasAction && !notification.read && (
                        <button 
                          className="action-btn primary"
                          onClick={() => handleNotificationAction(notification)}
                        >
                          Take Action →
                        </button>
                      )}
                      {!notification.read && (
                        <button 
                          className="action-btn secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkNotificationRead(notification.id);
                          }}
                        >
                          Mark as Read
                        </button>
                      )}
                      <button 
                        className="action-btn danger-link"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {!notification.read && <div className="unread-indicator"></div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };


  const renderDonationHistory = () => {
    const completedAppointments = appointments.filter(a => a.status === 'COMPLETED');
    
    return (
      <div className="section-content">
        <h2>Donation History</h2>
        {completedAppointments.length === 0 ? (
          <div className="empty-state">
            <p>No donation history yet. Book an appointment to start donating!</p>
          </div>
        ) : (
          <>
            <div className="history-stats">
              <div className="stat-card">
                <h3>{donorProfile?.totalDonations || 0}</h3>
                <p>Total Donations</p>
              </div>
              <div className="stat-card">
                <h3>{donorProfile?.lastDonationDate ? formatDate(donorProfile.lastDonationDate) : 'N/A'}</h3>
                <p>Last Donation Date</p>
              </div>
              <div className="stat-card">
                <h3>{donorProfile?.bloodGroup}</h3>
                <p>Blood Group</p>
              </div>
            </div>
            
            <div className="history-timeline">
              <h3>Donation Timeline</h3>
              {completedAppointments.map((appointment) => (
                <div key={appointment.id} className="history-item">
                  <div className="history-marker"></div>
                  <div className="history-content">
                    <div className="history-date">{formatDate(appointment.appointmentDate)}</div>
                    <div className="history-details">
                      <p><strong>Location:</strong> {appointment.donationCenter}</p>
                      <p><strong>Time:</strong> {appointment.appointmentTime}</p>
                      <p><strong>Status:</strong> <span className="status-badge completed">Completed</span></p>
                      {appointment.notes && <p><strong>Notes:</strong> {appointment.notes}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="donor-dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Blood Donor</h2>
          <p>{user?.name}</p>
          {donorProfile && (
            <span className="blood-badge-large">{donorProfile.bloodGroup}</span>
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
            className={activeTab === 'appointments' ? 'active' : ''}
            onClick={() => setActiveTab('appointments')}
          >
            📅 Appointments
          </button>
          <button
            className={activeTab === 'history' ? 'active' : ''}
            onClick={() => setActiveTab('history')}
          >
            📋 Donation History
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
            {activeTab === 'appointments' && renderAppointments()}
            {activeTab === 'history' && renderDonationHistory()}
            {activeTab === 'notifications' && renderNotifications()}
          </>
        )}
      </div>

      {/* View Profile Modal */}
      {showViewModal && donorProfile && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👤 Donor Profile Details</h2>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="profile-details-grid">
                <div className="detail-card">
                  <label>Name</label>
                  <p>{user?.name}</p>
                </div>
                <div className="detail-card">
                  <label>Email</label>
                  <p>{user?.email}</p>
                </div>
                <div className="detail-card">
                  <label>Blood Group</label>
                  <p className="blood-badge-large">{donorProfile.bloodGroup}</p>
                </div>
                <div className="detail-card">
                  <label>Phone Number</label>
                  <p>{donorProfile.phone}</p>
                </div>
                <div className="detail-card">
                  <label>Date of Birth</label>
                  <p>{donorProfile.dateOfBirth ? formatDate(donorProfile.dateOfBirth) : 'N/A'}</p>
                </div>
                <div className="detail-card">
                  <label>Address</label>
                  <p>{donorProfile.address}</p>
                </div>
                <div className="detail-card">
                  <label>City</label>
                  <p>{donorProfile.city}</p>
                </div>
                <div className="detail-card">
                  <label>State</label>
                  <p>{donorProfile.state}</p>
                </div>
                <div className="detail-card">
                  <label>Total Donations</label>
                  <p className="highlight-text">{donorProfile.totalDonations}</p>
                </div>
                <div className="detail-card">
                  <label>Last Donation Date</label>
                  <p>{donorProfile.lastDonationDate ? formatDate(donorProfile.lastDonationDate) : 'Never'}</p>
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
              <h2>✏️ Edit Donor Profile</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdateProfile}>
              <div className="modal-body">
                <div className="form-group-modern">
                  <label>
                    <span className="label-icon">🩸</span>
                    Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={editForm.bloodGroup}
                    onChange={handleEditFormChange}
                    className="form-input-modern"
                  >
                    {bloodGroups.map(bg => (
                      <option key={bg.value} value={bg.value}>{bg.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
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

                  <div className="form-group-modern">
                    <label>
                      <span className="label-icon">📅</span>
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={editForm.dateOfBirth}
                      onChange={handleEditFormChange}
                      className="form-input-modern"
                    />
                  </div>
                </div>

                <div className="form-group-modern">
                  <label>
                    <span className="label-icon">🏠</span>
                    Address *
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

                <div className="form-group-modern">
                  <label>
                    <span className="label-icon">📆</span>
                    Last Donation Date
                  </label>
                  <input
                    type="date"
                    name="lastDonationDate"
                    value={editForm.lastDonationDate}
                    onChange={handleEditFormChange}
                    className="form-input-modern"
                  />
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
              <h2>⚠️ Delete Profile</h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="warning-content">
                <div className="warning-icon-large">🗑️</div>
                <h3>Are you absolutely sure?</h3>
                <p>This action cannot be undone. This will permanently delete your donor profile and all associated data.</p>
                <div className="warning-list">
                  <p>⚠️ All your donation history will be removed</p>
                  <p>⚠️ Your appointments will be cancelled</p>
                  <p>⚠️ You will need to register again to become a donor</p>
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

      {/* Reschedule Appointment Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className="modal-overlay" onClick={() => setShowRescheduleModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🔄 Reschedule Appointment</h2>
              <button className="modal-close" onClick={() => setShowRescheduleModal(false)}>✕</button>
            </div>
            <form onSubmit={handleRescheduleSubmit}>
              <div className="modal-body">
                <div className="reschedule-info">
                  <p className="info-text">
                    <strong>Current Appointment:</strong> {formatDate(selectedAppointment.appointmentDate)} at {selectedAppointment.appointmentTime}
                  </p>
                </div>

                <div className="form-group-modern">
                  <label>
                    <span className="label-icon">📅</span>
                    New Appointment Date *
                  </label>
                  <input
                    type="date"
                    value={rescheduleForm.appointmentDate}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, appointmentDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="form-input-modern"
                  />
                </div>

                <div className="form-group-modern">
                  <label>
                    <span className="label-icon">⏰</span>
                    New Appointment Time *
                  </label>
                  <select
                    value={rescheduleForm.appointmentTime}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, appointmentTime: e.target.value })}
                    required
                    className="form-input-modern"
                  >
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                  </select>
                </div>

                <div className="form-group-modern">
                  <label>
                    <span className="label-icon">🏥</span>
                    Donation Center *
                  </label>
                  <input
                    type="text"
                    value={rescheduleForm.donationCenter}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, donationCenter: e.target.value })}
                    required
                    className="form-input-modern"
                  />
                </div>

                <div className="form-group-modern">
                  <label>
                    <span className="label-icon">📝</span>
                    Notes (optional)
                  </label>
                  <textarea
                    value={rescheduleForm.notes}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, notes: e.target.value })}
                    rows="3"
                    className="form-input-modern"
                    placeholder="Any special instructions or notes..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={() => setShowRescheduleModal(false)} 
                  className="btn-modern btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-modern btn-primary" 
                  disabled={rescheduleLoading}
                >
                  {rescheduleLoading ? <><span className="spinner"></span> Updating...</> : <>🔄 Reschedule Appointment</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {showToast && toastNotification && (
        <div className={`notification-toast ${showToast ? 'show' : ''}`}>
          <div className="toast-content">
            <div className="toast-icon">
              {toastNotification.priority === 'URGENT' || toastNotification.priority === 'HIGH' ? '🚨' : '🔔'}
            </div>
            <div className="toast-body">
              <h4 className="toast-title">{toastNotification.title}</h4>
              <p className="toast-message">{toastNotification.message}</p>
            </div>
            <button className="toast-close" onClick={() => setShowToast(false)}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DonorDashboard;

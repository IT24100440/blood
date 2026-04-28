import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authHelper, formatDate, getStatusColor } from '../../utils/helpers';
import {
  authService,
  donorService,
  hospitalService,
  bloodInventoryService,
  bloodRequestService,
  appointmentService,
  notificationService,
  bloodCampService
} from '../../services/api';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
  // State for different sections
  const [donors, setDonors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [bloodStock, setBloodStock] = useState({});
  const [requests, setRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [bloodCamps, setBloodCamps] = useState([]);
  
  // Form states
  const [newInventory, setNewInventory] = useState({
    bloodGroup: 'A_POSITIVE',
    quantity: '',
    collectionDate: '',
    expiryDate: ''
  });
  
  const [emergencyAlert, setEmergencyAlert] = useState({
    bloodGroup: 'A_POSITIVE',
    message: '',
    location: ''
  });

  const [emergencyRequest, setEmergencyRequest] = useState({
    hospitalId: '',
    bloodGroup: 'A_POSITIVE',
    quantity: '',
    patientName: '',
    reason: '',
    location: ''
  });

  const [newCamp, setNewCamp] = useState({
    campName: '',
    city: '',
    address: '',
    hospitalName: '',
    timePeriod: '',
    campDate: ''
  });

  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [newHospital, setNewHospital] = useState({
    name: '',
    email: '',
    password: '',
    hospitalName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    registrationNumber: ''
  });
  
  const [matchingDonors, setMatchingDonors] = useState([]);
  const [showMatchingDonors, setShowMatchingDonors] = useState(false);

  const user = authHelper.getCurrentUser();

  useEffect(() => {
    if (!authHelper.isLoggedIn() || !authHelper.hasRole('ADMIN')) {
      navigate('/login');
      return;
    }
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [donorsRes, hospitalsRes, inventoryRes, stockRes, requestsRes, appointmentsRes, lowStockRes, campsRes] = await Promise.all([
        donorService.getAllDonors(),
        hospitalService.getAllHospitals(),
        bloodInventoryService.getAvailableInventory(),
        bloodInventoryService.getBloodStockSummary(),
        bloodRequestService.getPendingRequests(),
        appointmentService.getUpcomingAppointments(),
        bloodInventoryService.getLowStockAlerts(),
        bloodCampService.getAllCamps()
      ]);

      setDonors(donorsRes.data);
      setHospitals(hospitalsRes.data);
      setInventory(inventoryRes.data);
      setBloodStock(stockRes.data);
      setRequests(requestsRes.data);
      setAppointments(appointmentsRes.data);
      setLowStockAlerts(lowStockRes.data);
      setBloodCamps(campsRes.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      alert('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authHelper.logout();
    navigate('/login');
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    try {
      await bloodInventoryService.addBloodUnit(newInventory);
      alert('Blood unit added successfully!');
      setNewInventory({ bloodGroup: 'A_POSITIVE', quantity: '', collectionDate: '', expiryDate: '' });
      loadDashboardData();
    } catch (error) {
      alert('Error adding blood unit');
    }
  };

  const handleVerifyHospital = async (hospitalId) => {
    if (window.confirm('Are you sure you want to verify this hospital?')) {
      try {
        await hospitalService.verifyHospital(hospitalId);
        alert('Hospital verified successfully!');
        loadDashboardData();
      } catch (error) {
        alert('Error verifying hospital');
      }
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await bloodRequestService.approveRequest(requestId, {
        approvedBy: user.userId,
        adminNotes: 'Approved'
      });
      alert('Request approved successfully!');
      loadDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error approving request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    const reason = prompt('Enter reason for rejection:');
    if (reason) {
      try {
        await bloodRequestService.rejectRequest(requestId, { adminNotes: reason });
        alert('Request rejected');
        loadDashboardData();
      } catch (error) {
        alert('Error rejecting request');
      }
    }
  };

  const handleSendEmergencyAlert = async (e) => {
    e.preventDefault();
    const confirmMsg = emergencyAlert.location 
      ? `Send emergency alert to all eligible donors in ${emergencyAlert.location}?`
      : 'Send emergency alert to all eligible donors?';
    if (window.confirm(confirmMsg)) {
      try {
        const response = await notificationService.sendEmergencyAlert(emergencyAlert);
        let successMsg = `Emergency alert sent to ${response.data.notificationsSent} donors!`;
        if (response.data.location) {
          successMsg += ` in ${response.data.location}`;
        }
        alert(successMsg);
        setEmergencyAlert({ bloodGroup: 'A_POSITIVE', message: '', location: '' });
        setShowMatchingDonors(false);
        setMatchingDonors([]);
      } catch (error) {
        alert('Error sending emergency alert');
      }
    }
  };

  const handleCreateEmergencyRequest = async (e) => {
    e.preventDefault();
    try {
      const response = await bloodRequestService.createEmergencyRequest({
        ...emergencyRequest,
        quantity: Number(emergencyRequest.quantity)
      });
      alert(`Emergency request created. Notifications sent: ${response.data.notificationsSent || 0}`);
      setEmergencyRequest({
        hospitalId: '',
        bloodGroup: 'A_POSITIVE',
        quantity: '',
        patientName: '',
        reason: '',
        location: ''
      });
      loadDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create emergency request');
    }
  };

  const handleCreateCamp = async (e) => {
    e.preventDefault();
    try {
      await bloodCampService.createCamp(newCamp);
      alert('Blood camp created successfully');
      setNewCamp({
        campName: '',
        city: '',
        address: '',
        hospitalName: '',
        timePeriod: '',
        campDate: ''
      });
      loadDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create blood camp');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await authService.register({ ...newAdmin, role: 'ADMIN' });
      alert('Admin user created successfully');
      setNewAdmin({ name: '', email: '', password: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create admin');
    }
  };

  const handleCreateHospital = async (e) => {
    e.preventDefault();
    try {
      const registerRes = await authService.register({
        name: newHospital.name,
        email: newHospital.email,
        password: newHospital.password,
        role: 'HOSPITAL'
      });

      await hospitalService.createHospital({
        userId: registerRes.data.userId,
        hospitalName: newHospital.hospitalName,
        phone: newHospital.phone,
        address: newHospital.address,
        city: newHospital.city,
        state: newHospital.state,
        registrationNumber: newHospital.registrationNumber
      });

      alert('Hospital account created successfully');
      setNewHospital({
        name: '',
        email: '',
        password: '',
        hospitalName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        registrationNumber: ''
      });
      loadDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create hospital account');
    }
  };
  
  const handleFindMatchingDonors = () => {
    // Filter donors based on blood group and location
    let filtered = donors.filter(donor => {
      const bloodGroupMatch = donor.bloodGroup === emergencyAlert.bloodGroup;
      const eligibleMatch = donor.eligible; // Only eligible donors
      
      if (emergencyAlert.location) {
        const locationMatch = 
          donor.city.toLowerCase().includes(emergencyAlert.location.toLowerCase()) ||
          donor.state.toLowerCase().includes(emergencyAlert.location.toLowerCase());
        return bloodGroupMatch && eligibleMatch && locationMatch;
      }
      
      return bloodGroupMatch && eligibleMatch;
    });
    
    setMatchingDonors(filtered);
    setShowMatchingDonors(true);
  };

  const handleCompleteAppointment = async (appointmentId) => {
    if (window.confirm('Mark this appointment as completed?')) {
      try {
        await appointmentService.completeAppointment(appointmentId);
        alert('Appointment completed!');
        loadDashboardData();
      } catch (error) {
        alert('Error completing appointment');
      }
    }
  };

  // Render Dashboard Overview
  const renderDashboard = () => (
    <div className="dashboard-content">
      <h2>Dashboard Overview</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{donors.length}</h3>
          <p>Total Donors</p>
        </div>
        <div className="stat-card">
          <h3>{hospitals.length}</h3>
          <p>Registered Hospitals</p>
        </div>
        <div className="stat-card">
          <h3>{requests.length}</h3>
          <p>Pending Requests</p>
        </div>
        <div className="stat-card">
          <h3>{appointments.length}</h3>
          <p>Upcoming Appointments</p>
        </div>
      </div>

      <div className="blood-stock-section">
        <h3>Blood Stock Summary</h3>
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

      {lowStockAlerts.length > 0 && (
        <div className="alerts-section">
          <h3>⚠️ Low Stock Alerts</h3>
          <div className="alerts-list">
            {lowStockAlerts.map((alert, index) => (
              <div key={index} className="alert-item" style={{ borderLeft: `4px solid ${alert.status === 'CRITICAL' ? '#f44336' : '#ff9800'}` }}>
                <strong>{alert.bloodGroup}</strong>: {alert.quantity} units ({alert.status})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render Donors Management
  const renderDonors = () => (
    <div className="section-content">
      <h2>Donor Management</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Blood Group</th>
              <th>Phone</th>
              <th>City</th>
              <th>Last Donation</th>
              <th>Eligible</th>
              <th>Total Donations</th>
            </tr>
          </thead>
          <tbody>
            {donors.map((donor) => (
              <tr key={donor.id}>
                <td>{donor.user.name}</td>
                <td><span className="blood-badge">{donor.bloodGroup}</span></td>
                <td>{donor.phone}</td>
                <td>{donor.city}</td>
                <td>{donor.lastDonationDate ? formatDate(donor.lastDonationDate) : 'Never'}</td>
                <td>
                  <span className={`status-badge ${donor.eligible ? 'eligible' : 'not-eligible'}`}>
                    {donor.eligible ? 'Yes' : 'No'}
                  </span>
                </td>
                <td>{donor.totalDonations}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render Hospitals Management
  const renderHospitals = () => (
    <div className="section-content">
      <h2>Hospital Management</h2>

      <div className="form-card">
        <h3>Add Hospital Account</h3>
        <form onSubmit={handleCreateHospital}>
          <div className="form-row">
            <div className="form-group">
              <label>Contact Person</label>
              <input value={newHospital.name} onChange={(e) => setNewHospital({ ...newHospital, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={newHospital.email} onChange={(e) => setNewHospital({ ...newHospital, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={newHospital.password} onChange={(e) => setNewHospital({ ...newHospital, password: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Hospital Name</label>
              <input value={newHospital.hospitalName} onChange={(e) => setNewHospital({ ...newHospital, hospitalName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input value={newHospital.phone} onChange={(e) => setNewHospital({ ...newHospital, phone: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Registration Number</label>
              <input value={newHospital.registrationNumber} onChange={(e) => setNewHospital({ ...newHospital, registrationNumber: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Address</label>
              <input value={newHospital.address} onChange={(e) => setNewHospital({ ...newHospital, address: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>City</label>
              <input value={newHospital.city} onChange={(e) => setNewHospital({ ...newHospital, city: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>State</label>
              <input value={newHospital.state} onChange={(e) => setNewHospital({ ...newHospital, state: e.target.value })} required />
            </div>
          </div>
          <button type="submit" className="btn-primary">Create Hospital</button>
        </form>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Hospital Name</th>
              <th>Registration No.</th>
              <th>Phone</th>
              <th>City</th>
              <th>Appointments</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hospitals.map((hospital) => (
              <tr key={hospital.id}>
                <td>{hospital.hospitalName}</td>
                <td>{hospital.registrationNumber}</td>
                <td>{hospital.phone}</td>
                <td>{hospital.city}</td>
                <td>{appointments.filter((apt) => (apt.hospitalName || apt.donationCenter) === hospital.hospitalName).length}</td>
                <td>
                  <span className={`status-badge ${hospital.verified ? 'verified' : 'unverified'}`}>
                    {hospital.verified ? 'Verified' : 'Unverified'}
                  </span>
                </td>
                <td>
                  {!hospital.verified && (
                    <button
                      className="btn-small btn-success"
                      onClick={() => handleVerifyHospital(hospital.id)}
                    >
                      Verify
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render Inventory Management
  const renderInventory = () => (
    <div className="section-content">
      <h2>Blood Inventory Management</h2>
      
      <div className="form-card">
        <h3>Add New Blood Unit</h3>
        <form onSubmit={handleAddInventory}>
          <div className="form-row">
            <div className="form-group">
              <label>Blood Group</label>
              <select
                value={newInventory.bloodGroup}
                onChange={(e) => setNewInventory({ ...newInventory, bloodGroup: e.target.value })}
                required
              >
                <option value="A_POSITIVE">A+</option>
                <option value="A_NEGATIVE">A-</option>
                <option value="B_POSITIVE">B+</option>
                <option value="B_NEGATIVE">B-</option>
                <option value="AB_POSITIVE">AB+</option>
                <option value="AB_NEGATIVE">AB-</option>
                <option value="O_POSITIVE">O+</option>
                <option value="O_NEGATIVE">O-</option>
              </select>
            </div>
            <div className="form-group">
              <label>Quantity (units)</label>
              <input
                type="number"
                value={newInventory.quantity}
                onChange={(e) => setNewInventory({ ...newInventory, quantity: e.target.value })}
                required
                min="1"
              />
            </div>
            <div className="form-group">
              <label>Collection Date</label>
              <input
                type="date"
                value={newInventory.collectionDate}
                onChange={(e) => setNewInventory({ ...newInventory, collectionDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Expiry Date</label>
              <input
                type="date"
                value={newInventory.expiryDate}
                onChange={(e) => setNewInventory({ ...newInventory, expiryDate: e.target.value })}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">Add Blood Unit</button>
        </form>
      </div>

      <div className="table-container">
        <h3>Current Inventory</h3>
        <table>
          <thead>
            <tr>
              <th>Blood Group</th>
              <th>Quantity</th>
              <th>Collection Date</th>
              <th>Expiry Date</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id}>
                <td><span className="blood-badge">{item.bloodGroup}</span></td>
                <td>{item.quantity} units</td>
                <td>{formatDate(item.collectionDate)}</td>
                <td>{formatDate(item.expiryDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render Blood Requests
  const renderRequests = () => (
    <div className="section-content">
      <h2>Blood Requests</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Hospital</th>
              <th>Blood Group</th>
              <th>Quantity</th>
              <th>Urgency</th>
              <th>Patient Name</th>
              <th>Reason</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id}>
                <td>{request.hospital.hospitalName}</td>
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
                <td>{request.reason}</td>
                <td>
                  <button
                    className="btn-small btn-success"
                    onClick={() => handleApproveRequest(request.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="btn-small btn-danger"
                    onClick={() => handleRejectRequest(request.id)}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

 

  // Render Emergency Alerts
  const renderEmergencyAlerts = () => (
    <div className="section-content">
      <h2>Emergency Alerts</h2>

      <div className="form-card">
        <h3>Create Emergency Blood Request</h3>
        <form onSubmit={handleCreateEmergencyRequest}>
          <div className="form-row">
            <div className="form-group">
              <label>Hospital *</label>
              <select value={emergencyRequest.hospitalId} onChange={(e) => setEmergencyRequest({ ...emergencyRequest, hospitalId: e.target.value })} required>
                <option value="">Select hospital</option>
                {hospitals.map((hospital) => (
                  <option key={hospital.id} value={hospital.id}>{hospital.hospitalName}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Blood Group *</label>
              <select value={emergencyRequest.bloodGroup} onChange={(e) => setEmergencyRequest({ ...emergencyRequest, bloodGroup: e.target.value })} required>
                <option value="A_POSITIVE">A+</option>
                <option value="A_NEGATIVE">A-</option>
                <option value="B_POSITIVE">B+</option>
                <option value="B_NEGATIVE">B-</option>
                <option value="AB_POSITIVE">AB+</option>
                <option value="AB_NEGATIVE">AB-</option>
                <option value="O_POSITIVE">O+</option>
                <option value="O_NEGATIVE">O-</option>
              </select>
            </div>
            <div className="form-group">
              <label>Quantity *</label>
              <input type="number" min="1" value={emergencyRequest.quantity} onChange={(e) => setEmergencyRequest({ ...emergencyRequest, quantity: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Patient Name</label>
              <input value={emergencyRequest.patientName} onChange={(e) => setEmergencyRequest({ ...emergencyRequest, patientName: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Location (optional)</label>
              <input value={emergencyRequest.location} onChange={(e) => setEmergencyRequest({ ...emergencyRequest, location: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Reason</label>
            <textarea rows="2" value={emergencyRequest.reason} onChange={(e) => setEmergencyRequest({ ...emergencyRequest, reason: e.target.value })} />
          </div>
          <button type="submit" className="btn-danger">Create Emergency Request</button>
        </form>
      </div>

      <div className="form-card">
        <h3>Send Emergency Alert to Donors</h3>
        <form onSubmit={handleSendEmergencyAlert}>
          <div className="form-group">
            <label>Blood Group Needed</label>
            <select
              value={emergencyAlert.bloodGroup}
              onChange={(e) => {
                setEmergencyAlert({ ...emergencyAlert, bloodGroup: e.target.value });
                setShowMatchingDonors(false);
              }}
              required
            >
              <option value="A_POSITIVE">A+</option>
              <option value="A_NEGATIVE">A-</option>
              <option value="B_POSITIVE">B+</option>
              <option value="B_NEGATIVE">B-</option>
              <option value="AB_POSITIVE">AB+</option>
              <option value="AB_NEGATIVE">AB-</option>
              <option value="O_POSITIVE">O+</option>
              <option value="O_NEGATIVE">O-</option>
            </select>
          </div>
          <div className="form-group">
            <label>Location (Optional - City/State to filter donors)</label>
            <input
              type="text"
              value={emergencyAlert.location}
              onChange={(e) => {
                setEmergencyAlert({ ...emergencyAlert, location: e.target.value });
                setShowMatchingDonors(false);
              }}
              placeholder="Enter city or state name to target specific location"
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <button 
              type="button" 
              onClick={handleFindMatchingDonors}
              className="btn-primary"
              style={{ marginRight: '10px' }}
            >
              🔍 Find Matching Donors
            </button>
            {showMatchingDonors && (
              <span style={{ color: '#16a085', fontWeight: 'bold' }}>
                {matchingDonors.length} eligible donor(s) found
              </span>
            )}
          </div>
          
          {showMatchingDonors && matchingDonors.length > 0 && (
            <div className="matching-donors-section">
              <h4>📋 Matching Eligible Donors</h4>
              <div className="table-container" style={{ maxHeight: '300px', overflow: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Blood Group</th>
                      <th>Phone</th>
                      <th>City</th>
                      <th>State</th>
                      <th>Last Donation</th>
                      <th>Total Donations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchingDonors.map((donor) => (
                      <tr key={donor.id}>
                        <td>{donor.user.name}</td>
                        <td><span className="blood-badge">{donor.bloodGroup}</span></td>
                        <td>{donor.phone}</td>
                        <td>{donor.city}</td>
                        <td>{donor.state}</td>
                        <td>{donor.lastDonationDate ? formatDate(donor.lastDonationDate) : 'Never'}</td>
                        <td>{donor.totalDonations}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="alert-info" style={{ 
                background: '#e8f4f8', 
                padding: '12px', 
                borderRadius: '8px', 
                marginTop: '15px',
                borderLeft: '4px solid #3498db'
              }}>
                <p style={{ margin: 0, color: '#2c3e50' }}>
                  <strong>ℹ️ Ready to Send:</strong> The emergency alert will be sent to all {matchingDonors.length} donor(s) listed above.
                </p>
              </div>
            </div>
          )}
          
          {showMatchingDonors && matchingDonors.length === 0 && (
            <div className="no-donors-found" style={{ 
              background: '#fff3cd', 
              padding: '15px', 
              borderRadius: '8px', 
              marginBottom: '15px',
              borderLeft: '4px solid #ffc107'
            }}>
              <p style={{ margin: 0, color: '#856404' }}>
                ⚠️ No eligible donors found matching the criteria. Try adjusting the location or blood group.
              </p>
            </div>
          )}
          
          <div className="form-group">
            <label>Emergency Message *</label>
            <textarea
              value={emergencyAlert.message}
              onChange={(e) => setEmergencyAlert({ ...emergencyAlert, message: e.target.value })}
              placeholder="Enter emergency message for donors..."
              rows="4"
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn-danger"
            disabled={showMatchingDonors && matchingDonors.length === 0}
          >
            🚨 Send Emergency Alert {showMatchingDonors && `to ${matchingDonors.length} Donor(s)`}
          </button>
        </form>
      </div>

      <div className="form-card">
        <h3>Create Blood Camp</h3>
        <form onSubmit={handleCreateCamp}>
          <div className="form-row">
            <div className="form-group">
              <label>Camp Name</label>
              <input value={newCamp.campName} onChange={(e) => setNewCamp({ ...newCamp, campName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Hospital Name</label>
              <input value={newCamp.hospitalName} onChange={(e) => setNewCamp({ ...newCamp, hospitalName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={newCamp.campDate} onChange={(e) => setNewCamp({ ...newCamp, campDate: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input value={newCamp.city} onChange={(e) => setNewCamp({ ...newCamp, city: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input value={newCamp.address} onChange={(e) => setNewCamp({ ...newCamp, address: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Time Period</label>
              <input value={newCamp.timePeriod} onChange={(e) => setNewCamp({ ...newCamp, timePeriod: e.target.value })} required />
            </div>
          </div>
          <button type="submit" className="btn-primary">Create Camp</button>
        </form>

        {bloodCamps.length > 0 && (
          <div className="table-container" style={{ marginTop: '16px' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Hospital</th>
                  <th>City</th>
                  <th>Date</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {bloodCamps.map((camp) => (
                  <tr key={camp.id}>
                    <td>{camp.campName}</td>
                    <td>{camp.hospitalName}</td>
                    <td>{camp.city}</td>
                    <td>{formatDate(camp.campDate)}</td>
                    <td>{camp.timePeriod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="form-card">
        <h3>Create Admin User</h3>
        <form onSubmit={handleCreateAdmin}>
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input value={newAdmin.name} onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={newAdmin.password} onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} required />
            </div>
          </div>
          <button type="submit" className="btn-primary">Create Admin</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Blood Bank Admin</h2>
          <p>{user?.name}</p>
        </div>
        
        <nav className="sidebar-nav">
          <button
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={activeTab === 'donors' ? 'active' : ''}
            onClick={() => setActiveTab('donors')}
          >
            👥 Donors
          </button>
          <button
            className={activeTab === 'hospitals' ? 'active' : ''}
            onClick={() => setActiveTab('hospitals')}
          >
            🏥 Hospitals
          </button>
          <button
            className={activeTab === 'inventory' ? 'active' : ''}
            onClick={() => setActiveTab('inventory')}
          >
            💉 Inventory
          </button>
          <button
            className={activeTab === 'requests' ? 'active' : ''}
            onClick={() => setActiveTab('requests')}
          >
            📋 Requests
          </button>
          <button
            className={activeTab === 'appointments' ? 'active' : ''}
            onClick={() => setActiveTab('appointments')}
          >
            📅 Appointments
          </button>
          <button
            className={activeTab === 'alerts' ? 'active' : ''}
            onClick={() => setActiveTab('alerts')}
          >
            🚨 Emergency Alerts
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
            {activeTab === 'donors' && renderDonors()}
            {activeTab === 'hospitals' && renderHospitals()}
            {activeTab === 'inventory' && renderInventory()}
            {activeTab === 'requests' && renderRequests()}
            {activeTab === 'appointments' && renderAppointments()}
            {activeTab === 'alerts' && renderEmergencyAlerts()}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;

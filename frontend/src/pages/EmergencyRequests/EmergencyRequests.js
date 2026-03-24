import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { getAllEmergencyRequests } from '../../services/api';
import './EmergencyRequests.css';

function EmergencyRequests() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBloodType, setFilterBloodType] = useState('');
  const [filterCity, setFilterCity] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, filterBloodType, filterCity]);

  const fetchRequests = async () => {
    try {
      const res = await getAllEmergencyRequests();
      setRequests(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching emergency requests:', error);
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;
    if (filterBloodType) {
      filtered = filtered.filter(r => r.bloodTypeNeeded === filterBloodType);
    }
    if (filterCity) {
      filtered = filtered.filter(r => r.city.toLowerCase().includes(filterCity.toLowerCase()));
    }
    setFilteredRequests(filtered);
  };

  return (
    <div className="page emergency-requests-page">
      <Header />
      
      <main className="container emergency-requests-container">
        <div className="page-head">
          <h1>Emergency Blood Requests</h1>
          <p>Review urgent blood needs and respond faster to save lives.</p>
        </div>

        <div className="filters">
          <input
            type="text"
            placeholder="Filter by city..."
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="filter-input"
          />
          <select
            value={filterBloodType}
            onChange={(e) => setFilterBloodType(e.target.value)}
            className="filter-select"
          >
            <option value="">All Blood Types</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>

        {loading ? (
          <p className="loading">Loading...</p>
        ) : (
          <>
            {filteredRequests.length === 0 ? (
              <p className="no-data">No emergency requests found.</p>
            ) : (
              <div className="requests-list">
                {filteredRequests.map(request => (
                  <div key={request.requestId} className="request-card">
                    <div className="request-header">
                      <h2>{request.title}</h2>
                      <span className={`urgency-badge ${request.urgencyLevel.toLowerCase()}`}>
                        {request.urgencyLevel}
                      </span>
                    </div>
                    <div className="request-details">
                      <div className="detail-group">
                        <label>Blood Type:</label>
                        <span className="blood-type">{request.bloodTypeNeeded}</span>
                      </div>
                      <div className="detail-group">
                        <label>Units Needed:</label>
                        <span>{request.requiredUnits}</span>
                      </div>
                      <div className="detail-group">
                        <label>Hospital:</label>
                        <span>{request.hospital.hospitalName}</span>
                      </div>
                      <div className="detail-group">
                        <label>Location:</label>
                        <span>{request.hospital.address}, {request.city}</span>
                      </div>
                      <div className="detail-group">
                        <label>Contact Number:</label>
                        <span>{request.contactNumber}</span>
                      </div>
                      <div className="detail-group full-width">
                        <label>Description:</label>
                        <p>{request.description}</p>
                      </div>
                      <div className="detail-group">
                        <label>Requested:</label>
                        <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default EmergencyRequests;

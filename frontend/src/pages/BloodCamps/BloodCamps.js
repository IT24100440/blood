import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { getAllBloodCamps } from '../../services/api';
import './BloodCamps.css';

function BloodCamps() {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCamps();
  }, []);

  const fetchCamps = async () => {
    try {
      const res = await getAllBloodCamps();
      console.log('Blood camps response:', res.data);
      // Ensure camps is always an array
      const campsData = Array.isArray(res.data) ? res.data : [];
      const sortedCamps = campsData.sort((a, b) => new Date(a.date) - new Date(b.date));
      setCamps(sortedCamps);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching blood camps:', error);
      setCamps([]);
      setLoading(false);
    }
  };

  return (
    <div className="page blood-camps-page">
      <Header />
      
      <main className="container blood-camps-container">
        <div className="page-head">
          <h1>Upcoming Blood Camps</h1>
          <p>Plan your next donation at nearby camps and community events.</p>
        </div>

        {loading ? (
          <p className="loading">Loading...</p>
        ) : (
          <>
            {camps.length === 0 ? (
              <p className="no-data">No blood camps scheduled.</p>
            ) : (
              <div className="camps-grid">
                {camps.map(camp => (
                  <div key={camp.campId} className="camp-card">
                    <div className="camp-date">
                      <span className="date-day">{new Date(camp.date).getDate()}</span>
                      <span className="date-month">{new Date(camp.date).toLocaleString('default', { month: 'short' })}</span>
                    </div>
                    <div className="camp-content">
                      <h2>{camp.title}</h2>
                      <div className="camp-info">
                        <p><strong>Time:</strong> {camp.time}</p>
                        <p><strong>Location:</strong> {camp.location}</p>
                        <p><strong>Hospital:</strong> {camp.hospital.hospitalName}</p>
                        <p><strong>City:</strong> {camp.hospital.city}</p>
                        <p><strong>Max Donors:</strong> {camp.maxDonors}</p>
                      </div>
                      <p className="camp-description">{camp.description}</p>
                      <div className="camp-actions">
                        <button className="btn btn-primary" onClick={() => window.location.href = '/book-appointment'}>
                          Book for this Camp
                        </button>
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

export default BloodCamps;

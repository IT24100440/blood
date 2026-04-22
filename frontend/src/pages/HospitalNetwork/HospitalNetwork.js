import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { getAllHospitals } from '../../services/api';
import './HospitalNetwork.css';



  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    filterHospitals();
  }, [hospitals, filterCity]);

  const fetchHospitals = async () => {
    try {
      const res = await getAllHospitals();
      setHospitals(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      setLoading(false);
    }
  };

  const filterHospitals = () => {
    if (filterCity) {
      setFilteredHospitals(hospitals.filter(h => h.city.toLowerCase().includes(filterCity.toLowerCase())));
    } else {
      setFilteredHospitals(hospitals);
    }
  };

  return (
    <div className="page hospital-network-page">
      <Header />
      
      <main className="container hospital-network-container">
        <div className="page-head">
          <h1>Hospital Network</h1>
          <p>Find verified hospitals by city and book appointments quickly.</p>
        </div>

        <div className="filters">
          <input
            type="text"
            placeholder="Filter by city..."
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="filter-input"
          />
        </div>

        {loading ? (
          <p className="loading">Loading...</p>
        ) : (
          <>
            {filteredHospitals.length === 0 ? (
              <p className="no-data">No hospitals found.</p>
            ) : (
              <div className="hospitals-grid">
                {filteredHospitals.map(hospital => (
                  <div key={hospital.hospitalId} className="hospital-card">
                    <div className="hospital-header">
                      <h2>{hospital.hospitalName}</h2>
                      <span className={`status-badge ${hospital.status.toLowerCase()}`}>
                        {hospital.status}
                      </span>
                    </div>
                    <div className="hospital-details">
                      <p><strong>Hospital Code:</strong> {hospital.hospitalCode}</p>
                      <p><strong>Address:</strong> {hospital.address}</p>
                      <p><strong>City:</strong> {hospital.city}</p>
                      <p><strong>Phone:</strong> <a href={`tel:${hospital.phone}`}>{hospital.phone}</a></p>
                      <p><strong>Email:</strong> <a href={`mailto:${hospital.email}`}>{hospital.email}</a></p>
                      <p><strong>Operating Hours:</strong> {hospital.timePeriod}</p>
                    </div>
                    <button 
                      className="btn btn-primary"
                      onClick={() => window.location.href = '/book-appointment'}
                    >
                      Book Appointment Here
                    </button>
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

export default HospitalNetwork;

import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { getAllBloodCamps, getDonorByNic, bookBloodCamp, checkDonorBooking, getCampAvailability } from '../../services/api';
import './BloodCampBooking.css';

function BloodCampBooking() {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nic, setNic] = useState('');
  const [donor, setDonor] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [showBookingConfirm, setShowBookingConfirm] = useState(false);
  const [campAvailability, setCampAvailability] = useState(null);
  const [bookedCamps, setBookedCamps] = useState([]);
  const [bookingMessage, setBookingMessage] = useState('');

  // Load all camps
  useEffect(() => {
    const loadCamps = async () => {
      try {
        const res = await getAllBloodCamps();
        console.log('Blood camps response:', res.data);
        // Ensure camps is always an array
        const campsData = Array.isArray(res.data) ? res.data : [];
        // Filter to show only future camps
        const futureCamps = campsData.filter(camp => {
          const campDate = new Date(camp.date);
          return campDate >= new Date();
        });
        setCamps(futureCamps.sort((a, b) => new Date(a.date) - new Date(b.date)));
        setLoading(false);
      } catch (error) {
        console.error('Error loading camps:', error);
        setCamps([]);
        setLoading(false);
      }
    };
    loadCamps();
  }, []);

  const handleSearchDonor = async (e) => {
    e.preventDefault();
    if (!nic.trim()) {
      alert('Please enter your NIC');
      return;
    }

    setSearchLoading(true);
    try {
      const res = await getDonorByNic(nic);
      setDonor(res.data);
      
      // Check which camps this donor has already booked
      const bookedList = [];
      for (let camp of camps) {
        try {
          const bookRes = await checkDonorBooking(camp.campId, res.data.donorId);
          if (bookRes.data.isBooked) {
            bookedList.push(camp.campId);
          }
        } catch (err) {
          console.log('Error checking booking:', err);
        }
      }
      setBookedCamps(bookedList);
      alert('✅ Donor found! You can now book camps.');
    } catch (error) {
      console.error('Error finding donor:', error);
      alert('Donor not found with this NIC. Please register first at Book Appointment page.');
    }
    setSearchLoading(false);
  };

  const handleSelectCamp = async (camp) => {
    setSelectedCamp(camp);
    
    // Get camp availability
    try {
      const availRes = await getCampAvailability(camp.campId);
      setCampAvailability(availRes.data);
    } catch (error) {
      console.error('Error checking availability:', error);
      setCampAvailability(null);
    }
    
    setShowBookingConfirm(true);
  };

  const handleConfirmBooking = async () => {
    if (!donor || !selectedCamp) {
      alert('Please select a camp first');
      return;
    }

    try {
      const bookingData = {
        campId: selectedCamp.campId,
        donorId: donor.donorId
      };

      const res = await bookBloodCamp(bookingData);
      setBookingMessage('✅ ' + res.data.message);
      
      // Store donor info in localStorage for future visits
      localStorage.setItem('donorId', donor.donorId);
      localStorage.setItem('donorEmail', donor.email);
      localStorage.setItem('donorName', donor.name);
      localStorage.setItem('donorNic', nic);
      
      // Update availability
      if (campAvailability) {
        setCampAvailability({
          ...campAvailability,
          registeredDonors: campAvailability.registeredDonors + 1,
          remainingSlots: campAvailability.remainingSlots - 1,
          isAvailable: campAvailability.remainingSlots - 1 > 0
        });
      }

      // Add camp to booked list
      setBookedCamps([...bookedCamps, selectedCamp.campId]);
      
      setShowBookingConfirm(false);
      setSelectedCamp(null);

      // Auto-clear message after 3 seconds
      setTimeout(() => setBookingMessage(''), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      alert('❌ Booking failed: ' + errorMsg);
    }
  };

  const isEligibleToDonate = (donor) => {
    if (!donor.lastDonationDate) return true; // First time donor
    
    const lastDonation = new Date(donor.lastDonationDate);
    const today = new Date();
    const monthsDiff = (today.getFullYear() - lastDonation.getFullYear()) * 12 + 
                      (today.getMonth() - lastDonation.getMonth());
    
    return monthsDiff >= 4;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    return timeString.substring(0, 5);
  };

  return (
    <div className="page">
      <Header />
      
      <div className="camp-booking-container">
        <div className="camp-header">
          <h1>🏕️ Blood Donation Camps</h1>
          <p>Find and book nearby blood donation camps</p>
        </div>

        {/* Donor Search Section */}
        {!donor && (
          <div className="donor-search-section">
            <h2>Step 1: Enter Your NIC</h2>
            <form onSubmit={handleSearchDonor} className="search-form">
              <input
                type="text"
                value={nic}
                onChange={(e) => setNic(e.target.value)}
                placeholder="Enter your National ID"
                className="search-input"
              />
              <button type="submit" className="btn btn-primary" disabled={searchLoading}>
                {searchLoading ? 'Searching...' : '🔍 Find Your Profile'}
              </button>
            </form>
            <p className="search-hint">Not registered yet? <a href="/book-appointment">Book an appointment first</a></p>
          </div>
        )}

        {/* Donor Info Section */}
        {donor && (
          <div className="donor-info-section">
            <div className="donor-card">
              <h3>👤 {donor.name}</h3>
              <p><strong>NIC:</strong> {donor.nic}</p>
              <p><strong>Blood Type:</strong> <span className="blood-badge">{donor.bloodType}</span></p>
              <p>
                <strong>Eligibility Status:</strong> 
                <span className={isEligibleToDonate(donor) ? 'eligible-yes' : 'eligible-no'}>
                  {donor.eligibilityStatus}
                </span>
              </p>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setDonor(null);
                  setNic('');
                  setBookedCamps([]);
                  setBookingMessage('');
                }}
              >
                Change Donor
              </button>
            </div>
          </div>
        )}

        {/* Booking Message */}
        {bookingMessage && (
          <div className="booking-message">
            {bookingMessage}
          </div>
        )}

        {/* Camps List Section */}
        {donor && (
          <div className="camps-section">
            <h2>Step 2: Select a Camp to Book</h2>
            
            {loading ? (
              <p className="loading">Loading camps...</p>
            ) : camps.length === 0 ? (
              <div className="no-camps">
                <p>No upcoming camps available at the moment.</p>
              </div>
            ) : (
              <div className="camps-grid">
                {camps.map(camp => {
                  const isBooked = bookedCamps.includes(camp.campId);
                  const canBook = isEligibleToDonate(donor) && !isBooked && campAvailability?.campId !== camp.campId;
                  
                  return (
                    <div key={camp.campId} className={`camp-card ${isBooked ? 'booked' : ''}`}>
                      <div className="camp-header-card">
                        <h3>{camp.title}</h3>
                        {isBooked && <span className="booked-badge">✅ Booked</span>}
                      </div>

                      <div className="camp-details">
                        <p><strong>📅 Date:</strong> {formatDate(camp.date)}</p>
                        <p><strong>⏰ Time:</strong> {formatTime(camp.time)}</p>
                        <p><strong>📍 Location:</strong> {camp.location}</p>
                        <p><strong>🏥 Hospital:</strong> {camp.hospital.hospitalName}</p>
                        <p><strong>📝 Description:</strong> {camp.description}</p>
                      </div>

                      <div className="camp-footer">
                        <span className="max-donors">Max Donors: {camp.maxDonors}</span>
                        {isBooked ? (
                          <span className="status-badge booked-status">Already Booked</span>
                        ) : !isEligibleToDonate(donor) ? (
                          <span className="status-badge not-eligible">Not Eligible Yet</span>
                        ) : (
                          <button 
                            className="btn btn-book"
                            onClick={() => handleSelectCamp(camp)}
                          >
                            📋 Book Camp
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking Confirmation Modal */}
      {showBookingConfirm && selectedCamp && campAvailability && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>📋 Confirm Camp Booking</h2>
            
            <div className="booking-details">
              <h3>{selectedCamp.title}</h3>
              <p><strong>Date:</strong> {formatDate(selectedCamp.date)}</p>
              <p><strong>Time:</strong> {formatTime(selectedCamp.time)}</p>
              <p><strong>Location:</strong> {selectedCamp.location}</p>
              <p><strong>Hospital:</strong> {selectedCamp.hospital.hospitalName}</p>
            </div>

            <div className="availability-info">
              <h4>Camp Availability:</h4>
              <p>Registered Donors: {campAvailability.registeredDonors} / {campAvailability.maxDonors}</p>
              <div className="availability-bar">
                <div 
                  className="filled" 
                  style={{width: `${(campAvailability.registeredDonors / campAvailability.maxDonors) * 100}%`}}
                ></div>
              </div>
              <p className="remaining">
                {campAvailability.remainingSlots > 0 
                  ? `${campAvailability.remainingSlots} slots remaining` 
                  : 'Camp is full'}
              </p>
            </div>

            <div className="donor-confirmation">
              <p><strong>Booking for:</strong> {donor.name}</p>
              <p><strong>Blood Type:</strong> {donor.bloodType}</p>
            </div>

            <div className="modal-buttons">
              <button 
                className="btn btn-primary"
                onClick={handleConfirmBooking}
                disabled={!campAvailability.isAvailable}
              >
                ✅ Confirm Booking
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowBookingConfirm(false);
                  setSelectedCamp(null);
                }}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default BloodCampBooking;

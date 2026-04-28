import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { getDonorByNic, createDonor, createAppointment, checkDonorEligibility, getAllHospitals } from '../../services/api';
import './BookAppointment.css';

function BookAppointment() {
  const [nic, setNic] = useState('');
  const [donorData, setDonorData] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    weight: '',
    bloodType: 'O+',
    address: '',
    city: '',
    lastDonationDate: '',
    hospitalId: '',
    timePeriod: 'Morning',
    appointmentDate: ''
  });
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hospitalsLoading, setHospitalsLoading] = useState(true);
  const [step, setStep] = useState(1); // 1: NIC search, 2: Form, 3: Confirmation

  const toLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const addDays = (date, days) => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate;
  };

  const appointmentMinDate = toLocalDateString(new Date());
  const appointmentMaxDate = toLocalDateString(addDays(new Date(), 10));

  const isAppointmentDateWithinWindow = (dateValue) => {
    if (!dateValue) return false;
    return dateValue >= appointmentMinDate && dateValue <= appointmentMaxDate;
  };

  const getMonthsSinceDonation = (donationDate) => {
    if (!donationDate) return null;
    const lastDonation = new Date(donationDate);
    const today = new Date();
    const monthsDiff = (today.getFullYear() - lastDonation.getFullYear()) * 12 + 
                      (today.getMonth() - lastDonation.getMonth());
    return monthsDiff;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleSearchNic = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await getDonorByNic(nic);
      setDonorData(res.data);
      setFormData(prev => ({
        ...prev,
        name: res.data.name,
        email: res.data.email,
        phone: res.data.phone,
        age: res.data.age,
        weight: res.data.weight,
        bloodType: res.data.bloodType,
        address: res.data.address,
        city: res.data.city,
        lastDonationDate: res.data.lastDonationDate
      }));
      setStep(2);
      alert('Donor found! Your information has been auto-filled.');
    } catch (error) {
      // Donor not found, continue with new donor form
      setDonorData(null);
      setStep(2);
      alert('New donor detected. Please fill in your information.');
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckEligibility = async () => {
    if (!donorData && !nic) {
      alert('Please enter your NIC');
      return;
    }

    // validate required form inputs
    if (!formData.age || !formData.weight || !formData.appointmentDate || !formData.hospitalId) {
      const missing = [];
      if (!formData.age) missing.push('Age');
      if (!formData.weight) missing.push('Weight');
      if (!formData.appointmentDate) missing.push('Appointment Date');
      if (!formData.hospitalId) missing.push('Hospital');
      alert('Please fill in all required fields: ' + missing.join(', '));
      return;
    }

    // validate donor profile input values
    const phoneDigits = (formData.phone || '').replace(/\D/g, '');
    if (phoneDigits.length < 7) {
      setEligibilityResult('NOT_ELIGIBLE - Enter a valid phone number');
      return;
    }

    if (!formData.email || !formData.email.includes('@')) {
      setEligibilityResult('NOT_ELIGIBLE - Enter a valid email address');
      return;
    }

    if (!isAppointmentDateWithinWindow(formData.appointmentDate)) {
      setEligibilityResult(`NOT_ELIGIBLE - Appointment date must be between ${appointmentMinDate} and ${appointmentMaxDate}.`);
      return;
    }

    console.log('Checking eligibility with formData:', formData);

    // validate age
    if (formData.age < 18) {
      setEligibilityResult('NOT_ELIGIBLE - Age must be 18 or above');
      return;
    }

    // validate weight
    if (formData.weight <= 50) {
      setEligibilityResult('NOT_ELIGIBLE - Weight must be above 50 kg');
      return;
    }

    // validate last donation date
    if (formData.lastDonationDate) {
      const lastDonation = new Date(formData.lastDonationDate);
      const today = new Date();
      const monthsDiff = (today.getFullYear() - lastDonation.getFullYear()) * 12 + 
                        (today.getMonth() - lastDonation.getMonth());
      
      if (monthsDiff < 4) {
        setEligibilityResult(`NOT_ELIGIBLE - Last donation must be at least 4 months ago. ${4 - monthsDiff} months remaining.`);
        return;
      }
    }

    setEligibilityResult('ELIGIBLE - You are eligible to donate blood!');
  };

  const handleSubmitAppointment = async () => {
    if (!eligibilityResult || eligibilityResult.startsWith('NOT_ELIGIBLE')) {
      alert('Please check eligibility first');
      return;
    }

    if (!isAppointmentDateWithinWindow(formData.appointmentDate)) {
      alert(`Appointment date must be between ${appointmentMinDate} and ${appointmentMaxDate}.`);
      return;
    }

    setLoading(true);
    try {
      // Create or update donor
      let donorId;
      if (donorData) {
        donorId = donorData.donorId;
        console.log('Using existing donor:', donorId);
      } else {
        console.log('Creating new donor with data:', { nic, ...formData });
        const newDonorRes = await createDonor({
          nic,
          ...formData,
          lastDonationDate: formData.lastDonationDate || null
        });
        console.log('Donor creation response:', newDonorRes.data);
        donorId = newDonorRes.data.donor.donorId;
        console.log('New donor ID:', donorId);
      }

      // Create appointment
      const appointmentPayload = {
        donorId: parseInt(donorId),
        hospitalId: parseInt(formData.hospitalId),
        appointmentDate: formData.appointmentDate,
        timePeriod: formData.timePeriod,
        bookingType: 'Direct',
        eligibilityStatus: 'ELIGIBLE'
      };
      console.log('Creating appointment with payload:', appointmentPayload);
      
      const appointmentRes = await createAppointment(appointmentPayload);
      console.log('Appointment creation response:', appointmentRes.data);

      // Store donor info in localStorage for future visits
      localStorage.setItem('donorId', donorId);
      localStorage.setItem('donorEmail', formData.email);
      localStorage.setItem('donorName', formData.name);
      localStorage.setItem('donorNic', nic);

      alert('Appointment booked successfully!');
      window.location.href = '/';
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Error booking appointment. Please try again.';
      alert('Error: ' + errorMessage);
    }
    setLoading(false);
  };

  const loadHospitals = async () => {
    try {
      setHospitalsLoading(true);
      const res = await getAllHospitals();
      console.log('Hospitals loaded:', res.data);
      setHospitals(res.data);
    } catch (error) {
      console.error('Error loading hospitals:', error);
      alert('Failed to load hospitals. Please refresh the page.');
    } finally {
      setHospitalsLoading(false);
    }
  };

  React.useEffect(() => {
    loadHospitals();
  }, []);

    return (
    <div className="page">
      <Header />
      
      <div className="appointment-container">
        <div className="appointment-form">
          <h1>📅 Book Blood Donation Appointment</h1>

          {step === 1 && (
            <div className="step">
              <h2>Step 1: Search by NIC</h2>
              <form onSubmit={handleSearchNic} className="form-group">
                <label>National ID Number (NIC):</label>
                <input
                  type="text"
                  value={nic}
                  onChange={(e) => setNic(e.target.value)}
                  placeholder="e.g., 1234567890"
                  required
                  className="form-input"
                />
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Searching...' : 'Search'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setDonorData(null);
                    setStep(2);
                  }}
                >
                  Continue as New Donor
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="step">
              <h2>Step 2: Donor Information</h2>
              
              {donorData && formData.lastDonationDate && (
                <div className="returning-donor-info">
                  <h3>✅ Welcome Back, {formData.name}!</h3>
                  <p className="donation-history">
                    <strong>Last Donation Date:</strong> {formatDate(formData.lastDonationDate)}
                  </p>
                  <p className="months-since">
                    <strong>Time Since Last Donation:</strong> {getMonthsSinceDonation(formData.lastDonationDate)} months
                  </p>
                </div>
              )}

              {donorData && !formData.lastDonationDate && (
                <div className="new-donor-info">
                  <h3>👤 New Donor - {formData.name}</h3>
                  <p>No previous donation history found. Complete your first donation!</p>
                </div>
              )}

              <form className="form-group">
                <div className="form-row">
                  <div>
                    <label>Full Name:</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label>Email:</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div>
                    <label>Phone:</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                      minLength="7"
                      required
                    />
                  </div>
                  <div>
                    <label>Age:</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="form-input"
                      min="18"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div>
                    <label>Weight (kg):</label>
                    <input
                      type="number"
                      step="0.1"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      className="form-input"
                      min="50.1"
                      required
                    />
                  </div>
                  <div>
                    <label>Blood Type:</label>
                    <select name="bloodType" value={formData.bloodType} onChange={handleInputChange} className="form-input">
                      <option>O+</option>
                      <option>O-</option>
                      <option>A+</option>
                      <option>A-</option>
                      <option>B+</option>
                      <option>B-</option>
                      <option>AB+</option>
                      <option>AB-</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div>
                    <label>Address:</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label>City:</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div>
                    <label>Last Donation Date {donorData && formData.lastDonationDate ? '(Readonly):' : '(Optional):'}</label>
                    <input
                      type="date"
                      name="lastDonationDate"
                      value={formData.lastDonationDate}
                      onChange={handleInputChange}
                      className="form-input"
                      readOnly={donorData && formData.lastDonationDate ? true : false}
                      disabled={donorData && formData.lastDonationDate ? true : false}
                    />
                    {donorData && formData.lastDonationDate && (
                      <small style={{color: '#666', marginTop: '5px', display: 'block'}}>
                        Last donation was on {formatDate(formData.lastDonationDate)}
                      </small>
                    )}
                  </div>
                  <div>
                    <label>Appointment Date:</label>
                    <input
                      type="date"
                      name="appointmentDate"
                      value={formData.appointmentDate}
                      onChange={handleInputChange}
                      className="form-input"
                      min={appointmentMinDate}
                      max={appointmentMaxDate}
                      required
                    />
                    <small style={{color: '#666', marginTop: '5px', display: 'block'}}>
                      Select a date from today up to the next 10 days.
                    </small>
                  </div>
                </div>

                <div className="form-row">
                  <div>
                    <label>Time Period:</label>
                    <select name="timePeriod" value={formData.timePeriod} onChange={handleInputChange} className="form-input">
                      <option>Morning (9AM-12PM)</option>
                      <option>Afternoon (1PM-5PM)</option>
                      <option>Evening (5PM-8PM)</option>
                    </select>
                  </div>
                  <div>
                    <label>Hospital:</label>
                    <select name="hospitalId" value={formData.hospitalId} onChange={handleInputChange} className="form-input" required disabled={hospitalsLoading}>
                      <option value="">{hospitalsLoading ? 'Loading hospitals...' : 'Select Hospital'}</option>
                      {hospitals.map(h => (
                        <option key={h.hospitalId} value={h.hospitalId}>
                          {h.hospitalName} - {h.city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleCheckEligibility}
                >
                  Check Eligibility
                </button>
              </form>
            </div>
          )}

          {eligibilityResult && (
            <div className={`eligibility-result ${eligibilityResult.startsWith('ELIGIBLE') ? 'eligible' : 'not-eligible'}`}>
              <h3>{eligibilityResult}</h3>
              {eligibilityResult.startsWith('ELIGIBLE') && (
                <button 
                  className="btn btn-primary"
                  onClick={handleSubmitAppointment}
                  disabled={loading}
                >
                  {loading ? 'Booking...' : 'Confirm Appointment'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default BookAppointment;



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



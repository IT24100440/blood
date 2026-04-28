import React from 'react';
import { Route, Routes } from 'react-router-dom';

// Public Pages
import Home from './pages/Home/Home';
import EmergencyRequests from './pages/EmergencyRequests/EmergencyRequests';
import DonorNotifications from './componet/DonorNotifications/DonorNotifications';
import BloodCamps from './pages/BloodCamps/BloodCamps';
import BloodCampBooking from './pages/BloodCampBooking/BloodCampBooking';
import AvailableBloodUnits from './pages/AvailableBloodUnits/AvailableBloodUnits';
import HospitalNetwork from './pages/HospitalNetwork/HospitalNetwork';
import BookAppointment from './pages/BookAppointment/BookAppointment';
import AdminLogin from './pages/AdminLogin/AdminLogin';



// Components
import Chatbot from './components/Chatbot/Chatbot';

import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/emergency-requests" element={<EmergencyRequests />} />
        <Route path="/notifications" element={<DonorNotifications />} />
        <Route path="/blood-camps" element={<BloodCamps />} />
        <Route path="/book-blood-camp" element={<BloodCampBooking />} />
        <Route path="/blood-units" element={<AvailableBloodUnits />} />
        <Route path="/hospitals" element={<HospitalNetwork />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/appointment-requests" element={<ManageAppointmentRequests />} />
        <Route path="/admin/hospitals" element={<ManageHospitals />} />
        <Route path="/admin/hospitals/:id" element={<HospitalDashboard />} />
        <Route path="/admin/blood-camps" element={<ManageBloodCamps />} />
        <Route path="/admin/camp-bookings" element={<ManageCampBookings />} />
        <Route path="/admin/emergency-requests" element={<ManageEmergencyRequests />} />
        <Route path="/admin/blood-units" element={<ManageBloodUnits />} />
        <Route path="/admin/appointments" element={<ViewAppointments />} />
        <Route path="/admin/donors" element={<ViewDonorRecords />} />
        <Route path="/admin/admins" element={<ManageAdmins />} />
      </Routes>
      <Chatbot />
    </div>
  );
}

export default App;

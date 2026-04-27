import React from 'react';
import { Route, Routes } from 'react-router-dom';


// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard/AdminDashboard';
import ManageHospitals from './pages/Admin/ManageHospitals/ManageHospitals';
import HospitalDashboard from './pages/Admin/HospitalDashboard/HospitalDashboard';
import ManageBloodCamps from './pages/Admin/ManageBloodCamps/ManageBloodCamps';
import ManageCampBookings from './pages/Admin/ManageCampBookings/ManageCampBookings';
import ManageEmergencyRequests from './pages/Admin/ManageEmergencyRequests/ManageEmergencyRequests';
import ManageBloodUnits from './pages/Admin/ManageBloodUnits/ManageBloodUnits';
import ViewAppointments from './pages/Admin/ViewAppointments/ViewAppointments';
import ViewDonorRecords from './pages/Admin/ViewDonorRecords/ViewDonorRecords';
import ManageAdmins from './pages/Admin/ManageAdmins/ManageAdmins';
import ManageAppointmentRequests from './pages/Admin/ManageAppointmentRequests/ManageAppointmentRequests';

// Components.
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

import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Admin Menu</h2>
      </div>
      <nav className="sidebar-nav">
        <Link to="/admin/dashboard" className="sidebar-link">📊 Dashboard</Link>
        <Link to="/admin/appointment-requests" className="sidebar-link">📋 Appointment Requests</Link>
        <Link to="/admin/hospitals" className="sidebar-link">🏥 Manage Hospitals</Link>
        <Link to="/admin/blood-camps" className="sidebar-link">🏕️ Blood Camps</Link>
        <Link to="/admin/camp-bookings" className="sidebar-link">📝 Camp Bookings</Link>
        <Link to="/admin/emergency-requests" className="sidebar-link">🚨 Emergency Requests</Link>
        <Link to="/admin/blood-units" className="sidebar-link">🩸 Blood Units</Link>
        <Link to="/admin/appointments" className="sidebar-link">📅 Appointments</Link>
        <Link to="/admin/donors" className="sidebar-link">👥 Donor Records</Link>
        <Link to="/admin/admins" className="sidebar-link">👨‍💼 Manage Admins</Link>
      </nav>
    </aside>
  );
}

export default Sidebar;

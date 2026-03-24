import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Footer from '../../../components/Footer/Footer';
import { getAllDonors, deleteDonor } from '../../../services/api';
import { exportRowsToPdf, includesQuery } from '../../../utils/adminExport';

function ViewDonorRecords() {
  const navigate = useNavigate();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBloodType, setFilterBloodType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const adminId = localStorage.getItem('adminId');
    if (!adminId) navigate('/admin-login');
    else fetchDonors();
  }, [navigate]);

  const fetchDonors = async () => {
    try {
      const res = await getAllDonors();
      setDonors(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this donor record?')) {
      try {
        await deleteDonor(id);
        fetchDonors();
      } catch (error) {
        alert('Error');
      }
    }
  };

  const filteredDonors = donors
    .filter(d => !filterBloodType || d.bloodType === filterBloodType)
    .filter(d => includesQuery([
      d.nic,
      d.name,
      d.bloodType,
      d.city,
      d.eligibilityStatus,
    ], searchTerm));

  const handleExportPdf = () => {
    const rows = filteredDonors.map((d) => ([
      d.nic || 'N/A',
      d.name || 'Unknown Donor',
      d.bloodType || 'N/A',
      d.age ?? 'N/A',
      d.city || 'N/A',
      (d.eligibilityStatus || 'Unknown').substring(0, 20),
    ]));
    exportRowsToPdf('Admin Donor Records Report', ['NIC', 'Name', 'Blood Type', 'Age', 'City', 'Eligibility'], rows);
  };

  return (
    <div className="admin-page">
      <Header />
      <div className="admin-content">
        <Sidebar />
        <main className="admin-main">
          <h1>👥 Donor Records</h1>

          <div className="filters" style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search NIC, donor name, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
            <select value={filterBloodType} onChange={(e) => setFilterBloodType(e.target.value)} className="filter-select">
              <option value="">All Blood Types</option>
              <option>O+</option><option>O-</option><option>A+</option><option>A-</option>
              <option>B+</option><option>B-</option><option>AB+</option><option>AB-</option>
            </select>
            <button type="button" className="btn btn-primary" onClick={handleExportPdf}>📄 Generate PDF</button>
          </div>

          {loading ? <p className="loading">Loading...</p> : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>NIC</th><th>Name</th><th>Blood Type</th><th>Age</th><th>City</th><th>Eligibility</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonors.map(d => (
                    <tr key={d.donorId}>
                      <td>{d.nic || 'N/A'}</td>
                      <td>{d.name || 'Unknown Donor'}</td>
                      <td><span style={{background: '#dc3545', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px'}}>{d.bloodType || 'N/A'}</span></td>
                      <td>{d.age ?? 'N/A'}</td>
                      <td>{d.city || 'N/A'}</td>
                      <td><span style={{color: (d.eligibilityStatus || '').startsWith('ELIGIBLE') ? '#28a745' : '#dc3545'}}>{(d.eligibilityStatus || 'Unknown').substring(0, 20)}</span></td>
                      <td>
                        <button className="btn-small btn-delete" onClick={() => handleDelete(d.donorId)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default ViewDonorRecords;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Footer from '../../../components/Footer/Footer';
import{ getAllBloodUnits, createBloodUnit, updateBloodUnit, deleteBloodUnit, getAllHospitals } from '../../../services/api';
import { exportRowsToPdf, includesQuery } from '../../../utils/adminExport';

function ManageBloodUnits() {
  const navigate = useNavigate();
  const [units, setUnits] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    hospitalId: '', bloodType: 'O+', unitsAvailable: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const adminId = localStorage.getItem('adminId');
    if (!adminId) navigate('/admin-login');
    else fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [unitRes, hosRes] = await Promise.all([getAllBloodUnits(), getAllHospitals()]);
      setUnits(unitRes.data);
      setHospitals(hosRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validate blood unit input fields before submit
    if (!formData.hospitalId) {
      alert('Please select a hospital');
      return;
    }

    const validBloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
    if (!validBloodTypes.includes(formData.bloodType)) {
      alert('Please select a valid blood type');
      return;
    }

    const unitCount = Number(formData.unitsAvailable);
    if (!Number.isInteger(unitCount) || unitCount < 1) {
      alert('Units available must be a whole number greater than 0');
      return;
    }

    try {
      // Convert numeric values to numbers
      const dataToSend = {
        ...formData,
        hospitalId: parseInt(formData.hospitalId),
        unitsAvailable: parseInt(formData.unitsAvailable)
      };

      if (editingId) {
        await updateBloodUnit(editingId, dataToSend);
      } else {
        await createBloodUnit(dataToSend);
      }
      alert(editingId ? 'Unit updated!' : 'Unit created!');
      setFormData({ hospitalId: '', bloodType: 'O+', unitsAvailable: '' });
      setEditingId(null);
      setShowForm(false);
      fetchData();
    } catch (error) {
      alert('Error: ' + error.response?.data?.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this blood unit?')) {
      try {
        await deleteBloodUnit(id);
        fetchData();
      } catch (error) {
        alert('Error');
      }
    }
  };

  const filteredUnits = units.filter((u) => includesQuery([
    u.hospital?.hospitalName,
    u.bloodType,
    u.unitsAvailable,
  ], searchTerm));

  const handleExportPdf = () => {
    const rows = filteredUnits.map((u) => ([
      u.hospital?.hospitalName || 'N/A',
      u.bloodType,
      u.unitsAvailable,
      new Date(u.updatedAt).toLocaleDateString(),
    ]));
    exportRowsToPdf('Admin Blood Units Report', ['Hospital', 'Blood Type', 'Units', 'Last Updated'], rows);
  };

  return (
    <div className="admin-page">
      <Header />
      <div className="admin-content">
        <Sidebar />
        <main className="admin-main">
          <div className="page-header">
            <h1>🩸 Manage Blood Units</h1>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search hospital, blood type, units..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-input"
              />
              <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Cancel' : '➕ New Unit'}
              </button>
              <button className="btn btn-secondary" onClick={handleExportPdf}>📄 Generate PDF</button>
            </div>
          </div>

          {showForm && (
            <div className="form-container">
              <form onSubmit={handleSubmit} className="admin-form">
                <select name="hospitalId" value={formData.hospitalId} onChange={handleInputChange} required>
                  <option value="">Select Hospital</option>
                  {hospitals.map(h => <option key={h.hospitalId} value={h.hospitalId}>{h.hospitalName}</option>)}
                </select>
                <select name="bloodType" value={formData.bloodType} onChange={handleInputChange}>
                  <option>O+</option><option>O-</option><option>A+</option><option>A-</option>
                  <option>B+</option><option>B-</option><option>AB+</option><option>AB-</option>
                </select>
                <input type="number" name="unitsAvailable" placeholder="Units Available" value={formData.unitsAvailable} onChange={handleInputChange} min="1" step="1" required />
                <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Create'} Unit</button>
              </form>
            </div>
          )}

          {loading ? <p className="loading">Loading...</p> : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Hospital</th><th>Blood Type</th><th>Units</th><th>Last Updated</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUnits.map(u => (
                    <tr key={u.unitId}>
                      <td>{u.hospital.hospitalName}</td>
                      <td><span className="badge-bt">{u.bloodType}</span></td>
                      <td>{u.unitsAvailable}</td>
                      <td>{new Date(u.updatedAt).toLocaleDateString()}</td>
                      <td>
                        <button className="btn-small btn-edit" onClick={() => { setFormData(u); setEditingId(u.unitId); setShowForm(true); }}>Edit</button>
                        <button className="btn-small btn-delete" onClick={() => handleDelete(u.unitId)}>Delete</button>
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

export default ManageBloodUnits;

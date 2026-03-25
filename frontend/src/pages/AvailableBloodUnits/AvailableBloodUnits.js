import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { getAllBloodUnits } from '../../services/api';
import './AvailableBloodUnits.css';

//AvailableBloodUnits
function AvailableBloodUnits() {
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBloodType, setFilterBloodType] = useState('');

  useEffect(() => {
    fetchUnits();
  }, []);

  useEffect(() => {
    filterUnits();
  }, [units, filterBloodType]);

  const fetchUnits = async () => {
    try {
      const res = await getAllBloodUnits();
      setUnits(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching blood units:', error);
      setLoading(false);
    }
  };
// Function to filter the list based on the dropdown selection
  const filterUnits = () => {
    if (filterBloodType) {
      setFilteredUnits(units.filter(u => u.bloodType === filterBloodType));
    } else {
      setFilteredUnits(units);
    }
  };
// Colors for different blood types (UI styling)
  const bloodTypeColors = {
    'O+': '#dc3545',
    'O-': '#c82333',
    'A+': '#fd7e14',
    'A-': '#ffc107',
    'B+': '#28a745',
    'B-': '#20c997',
    'AB+': '#0d6efd',
    'AB-': '#6f42c1'
  };

  return (
    <div className="page">
      <Header />
      
      <div className="container">
        <h1>🩸 Available Blood Units</h1>

        <div className="filters">
          <select
            value={filterBloodType}
            onChange={(e) => setFilterBloodType(e.target.value)}
            className="filter-select"
          >
            <option value="">All Blood Types</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>

        {loading ? (
          <p className="loading">Loading...</p>
        ) : (
          <>
            {filteredUnits.length === 0 ? (
              <p className="no-data">No blood units available.</p>
            ) : (
              <div className="units-table-container">
                <table className="units-table">
                  <thead>
                    <tr>
                      <th>Blood Type</th>
                      <th>Hospital</th>
                      <th>City</th>
                      <th>Available Units</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUnits.map(unit => (
                      <tr key={unit.unitId}>
                        <td>
                          <span 
                            className="blood-type-label"
                            style={{ backgroundColor: bloodTypeColors[unit.bloodType] }}
                          >
                            {unit.bloodType}
                          </span>
                        </td>
                        <td>{unit.hospital.hospitalName}</td>
                        <td>{unit.hospital.city}</td>
                        <td className={unit.unitsAvailable <= 2 ? 'low-stock' : ''}>
                          {unit.unitsAvailable} {unit.unitsAvailable <= 2 && '⚠️'}
                        </td>
                        <td>{new Date(unit.updatedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default AvailableBloodUnits;

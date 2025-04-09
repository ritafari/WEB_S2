import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LearnMode.css';

const LearnMode = ({ onReturnToMenu }) => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [flagsData, setFlagsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('LearnMode mounted');
    const fetchFlags = async () => {
      try {
        console.log('Fetching from http://localhost:5001/api/countries');
        const response = await axios.get('http://localhost:5001/api/countries');
        console.log('Data received:', response.data);
        setFlagsData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err.message);
        console.error('Response:', err.response?.data || 'No response data');
        setError('Could not load flags. Check backend endpoint /api/countries.');
        setLoading(false);
      }
    };
    fetchFlags();
  }, []);

  const handleFlagClick = (country) => {
    setSelectedCountry(country);
  };

  const closePopup = () => {
    setSelectedCountry(null);
  };

  return (
    <div className="learn-mode-container">
      <h1 className="learn-mode-title">Learn Flags</h1>
      {loading ? (
        <p>Loading flags...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="flags-grid">
          {flagsData.map((country, index) => (
            <div
              key={index}
              className="flag-card"
              onClick={() => handleFlagClick(country)}
            >
              <img
                src={country.flag}
                alt={`${country.name} flag`}
                className="learn-flag"
              />
            </div>
          ))}
        </div>
      )}
      <button className="return-button" onClick={onReturnToMenu}>
        Return to Main Menu
      </button>

      {selectedCountry && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedCountry.flag}
              alt={`${selectedCountry.name} flag`}
              className="popup-flag"
            />
            <h2>{selectedCountry.name}</h2>
            <button className="close-button" onClick={closePopup}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnMode;
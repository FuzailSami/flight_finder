import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [flights, setFlights] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    sortBy: 'C'
  });

  const API_BASE = '/api';

  useEffect(() => {
    loadFlights();
  }, []);

  const loadFlights = async () => {
    try {
      const response = await fetch(`${API_BASE}/flights`);
      if (!response.ok) {
        throw new Error('Failed to fetch flights');
      }
      const flightsData = await response.json();
      setFlights(flightsData);

      // Extract unique cities
      const citiesSet = new Set();
      flightsData.forEach(flight => {
        citiesSet.add(flight.from);
        citiesSet.add(flight.to);
      });
      setCities(Array.from(citiesSet).sort());
    } catch (error) {
      console.error('Error loading flights:', error);
      setError('Failed to load flight data. Please make sure the server is running.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.origin || !formData.destination) {
      setError('Please select both origin and destination cities');
      return;
    }

    if (formData.origin === formData.destination) {
      setError('Origin and destination cannot be the same');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const response = await fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to search flights');
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error searching flights:', error);
      setError('Failed to search flights. Please make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="App">
      <header className="header">
        <div className="header-content">
          <h1><i className="fas fa-plane"></i> Flight Planner</h1>
          <p>Find the best flight routes between cities</p>
        </div>
      </header>

      <main className="main-content">
        <div className="search-section">
          <div className="search-card">
            <h2>Search Flights</h2>
            <form onSubmit={handleSubmit} className="search-form">
              <div className="form-group">
                <label htmlFor="origin">From:</label>
                <select
                  id="origin"
                  name="origin"
                  value={formData.origin}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select departure city</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="destination">To:</label>
                <select
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select arrival city</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="sortBy">Sort by:</label>
                <select
                  id="sortBy"
                  name="sortBy"
                  value={formData.sortBy}
                  onChange={handleInputChange}
                >
                  <option value="C">Cost</option>
                  <option value="T">Time</option>
                </select>
              </div>
              <button type="submit" className="search-btn" disabled={loading}>
                <i className="fas fa-search"></i> Search Flights
              </button>
            </form>
          </div>
        </div>

        {loading && (
          <div className="loading-section">
            <div className="loading-card">
              <div className="loading-spinner"></div>
              <p>Searching for flights...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="results-section">
            <div className="results-card">
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="results-section">
            <div className="results-card">
              <h2>Flight Results</h2>
              {results.map((path, index) => (
                <div key={index} className="result-item">
                  <div className="result-path">
                    <strong>Path {index + 1}:</strong> {path.cities.join(' → ')}
                  </div>
                  <div className="result-stats">
                    <div className="result-stat">
                      <i className="fas fa-clock"></i>
                      <span>Total Time: {formatTime(path.totalTime)}</span>
                    </div>
                    <div className="result-stat">
                      <i className="fas fa-dollar-sign"></i>
                      <span>Total Cost: ${path.totalCost}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flights-section">
          <div className="flights-card">
            <h2>Available Flights</h2>
            <div className="flights-list">
              {flights.map((flight, index) => (
                <div key={index} className="flight-item">
                  <div className="flight-route">
                    <span className="flight-cities">{flight.from}</span>
                    <i className="fas fa-arrow-right flight-arrow"></i>
                    <span className="flight-cities">{flight.to}</span>
                  </div>
                  <div className="flight-details">
                    <div className="flight-detail">
                      <i className="fas fa-clock"></i>
                      <span>{formatTime(flight.time)}</span>
                    </div>
                    <div className="flight-detail">
                      <i className="fas fa-dollar-sign"></i>
                      <span>${flight.cost}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;


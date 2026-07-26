import React, { useState } from 'react';
import './App.css';

function App() {
  const [urlsText, setUrlsText] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleTextChange(event) {
    setUrlsText(event.target.value);
  }

  async function handleAnalyze() {
    const urls = urlsText
      .split('\n')
      .map(function (line) { return line.trim(); })
      .filter(function (line) { return line.length > 0; });

    if (urls.length === 0) {
      setError('Please enter at least one URL.');
      return;
    }

    setError('');
    setLoading(true);
    setResults([]);

    try {
      const response = await fetch(const response = await fetch('https://phishguard-4.onrender.com/analyze-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: urls })
      });

      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError('Could not reach the server. Is the backend running?');
    }

    setLoading(false);
  }

  function getVerdictColor(verdict) {
    if (verdict === 'high risk') return '#e74c3c';
    if (verdict === 'medium risk') return '#f39c12';
    return '#2ecc71';
  }

  return (
    <div className="App">
      <h1>Phishing & Malicious URL Detector</h1>
      <p>Paste one or more links below (one per line) to check their risk.</p>

      <div className="input-section-batch">
        <textarea
          rows="6"
          placeholder={'http://paypa1-login.tk/verify\nhttps://www.google.com'}
          value={urlsText}
          onChange={handleTextChange}
        />
        <button onClick={handleAnalyze} disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze All'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {results.length > 0 && (
        <table className="results-table">
          <thead>
            <tr>
              <th>URL</th>
              <th>Score</th>
              <th>Verdict</th>
              <th>Reasons</th>
            </tr>
          </thead>
          <tbody>
            {results.map(function (r, index) {
              return (
                <tr key={index}>
                  <td className="url-cell">{r.url}</td>
                  <td>{r.score}/100</td>
                  <td style={{ color: getVerdictColor(r.verdict), fontWeight: 'bold' }}>
                    {r.verdict}
                  </td>
                  <td>
                    {r.reasons.length > 0 ? (
                      <ul>
                        {r.reasons.map(function (reason, i) {
                          return <li key={i}>{reason}</li>;
                        })}
                      </ul>
                    ) : (
                      'None'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;

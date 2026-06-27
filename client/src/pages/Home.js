import { useState, useEffect } from 'react';
import IssueCard from '../components/IssueCard';
import Loader from '../components/Loader';
import API from '../api/axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All', 'Pothole', 'Water Leakage', 'Streetlight', 'Garbage', 'Encroachment', 'Other'];
const STATUSES   = ['All', 'Reported', 'Verified', 'In Progress', 'Resolved'];

export default function Home() {
  const [issues, setIssues]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [category, setCategory] = useState('All');
  const [status, setStatus]     = useState('All');
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category !== 'All') params.category = category;
    if (status   !== 'All') params.status   = status;
    API.get('/issues', { params })
      .then(({ data }) => setIssues(data))
      .finally(() => setLoading(false));
  }, [category, status]);

  const resolved = issues.filter(i => i.status === 'Resolved').length;

  return (
    <div>
      {/* Hero banner */}
      <div style={{ background: '#1a56db', color: '#fff', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)',
                borderRadius: 100, padding: '4px 12px', fontSize: 12, fontWeight: 600, marginBottom: 14 }}>
                🤖 AI-powered civic reporting
              </div>
              <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 8, lineHeight: 1.2 }}>
                Fix Hazaribagh, together
              </h1>
              <p style={{ opacity: 0.8, fontSize: 15, maxWidth: 480 }}>
                Report local issues, verify community problems, and track resolution — powered by Gemini AI.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              {[
                { v: issues.length, l: 'Issues reported' },
                { v: resolved, l: 'Resolved' },
                { v: issues.filter(i=>i.status==='Verified').length, l: 'Verified' },
              ].map(s => (
                <div key={s.l} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>{s.v}</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '28px 24px' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                style={{
                  padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 500,
                  border: '1.5px solid', cursor: 'pointer', transition: 'all 0.15s',
                  background: category === c ? '#1a56db' : '#fff',
                  color: category === c ? '#fff' : '#4b5563',
                  borderColor: category === c ? '#1a56db' : '#e5e7eb',
                }}>
                {c}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="form-input" style={{ width: 'auto', padding: '7px 12px', fontSize: 13 }}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            {user && (
              <Link to="/report">
                <button className="btn btn-primary">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                  </svg>
                  Report
                </button>
              </Link>
            )}
          </div>
        </div>

        {loading ? <Loader /> : (
          issues.length === 0
            ? <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📍</div>
                <h3 style={{ marginBottom: 8, color: '#374151' }}>No issues found</h3>
                <p style={{ color: '#9ca3af', marginBottom: 20 }}>Be the first to report a problem in your area.</p>
                {user
                  ? <Link to="/report"><button className="btn btn-primary">Report an issue</button></Link>
                  : <Link to="/register"><button className="btn btn-primary">Join to report</button></Link>
                }
              </div>
            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                {issues.map(issue => <IssueCard key={issue._id} issue={issue} />)}
              </div>
        )}
      </div>
    </div>
  );
}
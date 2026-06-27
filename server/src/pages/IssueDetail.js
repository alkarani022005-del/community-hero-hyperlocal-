import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Loader from '../components/Loader';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function IssueDetail() {
  const { id } = useParams();
  const [issue, setIssue]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [letter, setLetter]   = useState('');
  const [genLetter, setGenLetter] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    API.get(`/issues/${id}`)
      .then(({ data }) => setIssue(data))
      .catch(() => toast.error('Issue not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpvote = async () => {
    if (!user) return toast.error('Login to upvote');
    try {
      const { data } = await API.put(`/issues/${id}/upvote`);
      setIssue(prev => ({ ...prev, upvotes: Array(data.upvotes).fill(null) }));
      toast.success(data.upvoted ? '👍 Upvoted! +2 pts' : 'Upvote removed');
    } catch { toast.error('Failed'); }
  };

  const handleVerify = async () => {
    if (!user) return toast.error('Login to verify');
    try {
      const { data } = await API.put(`/issues/${id}/verify`);
      setIssue(prev => ({ ...prev, verifiedBy: Array(data.verifiedBy).fill(null), status: data.status }));
      toast.success('✅ Verified! +5 pts');
    } catch { toast.error('Failed'); }
  };

  const handleGenerateLetter = async () => {
    setGenLetter(true);
    try {
      const { data } = await API.post(`/issues/${id}/generate-letter`);
      setLetter(data.letter);
      toast.success('✦ Complaint letter generated!');
    } catch { toast.error('Failed to generate letter'); }
    finally { setGenLetter(false); }
  };

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(letter);
    toast.success('Letter copied to clipboard!');
  };

  const severityColor = { Low: '#22c55e', Medium: '#f59e0b', High: '#f97316', Critical: '#ef4444' };

  if (loading) return <Loader />;
  if (!issue)  return <div className="container" style={{ padding: 40 }}>Issue not found</div>;

  const cat = issue.category?.replace(' ', '-') || 'Other';
  const sev = issue.severity || 'Medium';
  const sta = issue.status?.replace(' ', '-') || 'Reported';

  return (
    <div style={{ background: '#f3f4f8', minHeight: '100vh', padding: '32px 0' }}>
      <div className="container" style={{ maxWidth: 800 }}>

        {/* Back button */}
        <button onClick={() => navigate('/')} className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
          ← Back to feed
        </button>

        <div className="card" style={{ marginBottom: 20 }}>
          {issue.images?.[0] && (
            <img src={issue.images[0]} alt="issue"
              style={{ width: '100%', height: 320, objectFit: 'cover', display: 'block' }} />
          )}

          <div className="card-body">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              <span className={`badge badge-${cat}`}>{issue.category}</span>
              <span className={`badge badge-${sta}`}>{issue.status}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7280' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%',
                  background: severityColor[sev], display: 'inline-block' }}/>
                {sev} severity
              </span>
            </div>

            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{issue.title}</h1>
            <p style={{ color: '#374151', lineHeight: 1.8, marginBottom: 16, fontSize: 15 }}>
              {issue.description}
            </p>

            <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#6b7280', marginBottom: 20,
              paddingBottom: 20, borderBottom: '1px solid #f3f4f6' }}>
              <span>📍 {issue.location?.address}</span>
              <span>👤 {issue.reporter?.name}</span>
              <span>🕐 {new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>

            {/* AI Analysis */}
            {issue.aiSummary && (
              <div style={{ padding: 16, background: '#f0f4ff', borderRadius: 10,
                border: '1px solid #c7d7fd', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span className="ai-pill">✦ Gemini AI analysis</span>
                </div>
                <p style={{ fontSize: 13, color: '#374151', marginBottom: 8 }}>
                  <strong>Routes to:</strong> {issue.department}
                </p>
                <p style={{ fontSize: 13, color: '#4b5563', fontStyle: 'italic', lineHeight: 1.7 }}>
                  "{issue.aiSummary}"
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={handleUpvote}>
                👍 Upvote ({issue.upvotes?.length || 0})
              </button>
              <button className="btn btn-outline" onClick={handleVerify}>
                ✅ Verify ({issue.verifiedBy?.length || 0})
              </button>
              {user && (
                <button className="btn btn-ghost" onClick={handleGenerateLetter} disabled={genLetter}
                  style={{ marginLeft: 'auto' }}>
                  {genLetter ? '✦ Generating...' : '📄 Generate complaint letter'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Generated Letter */}
        {letter && (
          <div className="card">
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 600 }}>✦ AI-Generated Complaint Letter</h2>
                  <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                    Ready to send to {issue.department}
                  </p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={handleCopyLetter}>
                  Copy letter
                </button>
              </div>
              <div style={{ background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: 8,
                padding: 20, fontSize: 14, lineHeight: 1.9, color: '#374151',
                whiteSpace: 'pre-wrap', fontFamily: 'Georgia, serif' }}>
                {letter}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
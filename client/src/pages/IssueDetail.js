import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Loader from '../components/Loader';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FiThumbsUp, FiCheckCircle, FiMapPin } from 'react-icons/fi';

export default function IssueDetail() {
  const { id } = useParams();
  const [issue, setIssue]   = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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
      toast.success(data.upvoted ? 'Upvoted! +2 pts' : 'Upvote removed');
    } catch { toast.error('Failed'); }
  };

  const handleVerify = async () => {
    if (!user) return toast.error('Login to verify');
    try {
      const { data } = await API.put(`/issues/${id}/verify`);
      setIssue(prev => ({ ...prev, verifiedBy: Array(data.verifiedBy).fill(null), status: data.status }));
      toast.success('Verified! +5 pts');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <Loader />;
  if (!issue)  return <div className="container" style={{ padding: 40 }}>Issue not found</div>;

  return (
    <div className="container" style={{ padding: '30px 20px', maxWidth: 800 }}>
      <div className="card">
        {issue.images?.[0] && (
          <img src={issue.images[0]} alt="issue"
            style={{ width: '100%', height: 300, objectFit: 'cover', borderRadius: 8, marginBottom: 20 }} />
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <span className={`badge badge-${issue.category}`}>{issue.category}</span>
          <span className={`badge badge-${issue.severity}`}>{issue.severity}</span>
          <span className={`badge badge-${issue.status}`}>{issue.status}</span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{issue.title}</h1>
        <p style={{ color: '#374151', lineHeight: 1.7, marginBottom: 16 }}>{issue.description}</p>

        <div style={{ display: 'flex', gap: 16, color: '#6b7280', fontSize: 13, marginBottom: 20 }}>
          <span><FiMapPin size={13} /> {issue.location?.address}</span>
          <span>By {issue.reporter?.name}</span>
          <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
        </div>

        {issue.aiSummary && (
          <div style={{ padding: 16, background: '#eff6ff', borderRadius: 8, marginBottom: 20 }}>
            <h4 style={{ color: '#1d4ed8', marginBottom: 8 }}>🤖 AI Analysis</h4>
            <p style={{ fontSize: 13, color: '#1e40af', marginBottom: 6 }}><strong>Routes to:</strong> {issue.department}</p>
            <p style={{ fontSize: 13, color: '#374151', fontStyle: 'italic' }}>{issue.aiSummary}</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-primary" onClick={handleUpvote}>
            <FiThumbsUp style={{ verticalAlign: 'middle' }} /> Upvote ({issue.upvotes?.length || 0})
          </button>
          <button className="btn btn-success" onClick={handleVerify}>
            <FiCheckCircle style={{ verticalAlign: 'middle' }} /> Verify ({issue.verifiedBy?.length || 0})
          </button>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function ReportIssue() {
  const [form, setForm]       = useState({ title: '', description: '', address: '', lat: '', lng: '' });
  const [image, setImage]     = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return (
    <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
      <h2 style={{ marginBottom: 8 }}>Sign in to report issues</h2>
      <p style={{ color: '#6b7280', marginBottom: 24 }}>Join the community and help fix Hazaribagh.</p>
      <Link to="/login"><button className="btn btn-primary btn-lg">Sign in</button></Link>
    </div>
  );

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setImage(reader.result); setPreview(reader.result); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = null;
      if (image) {
        const { data } = await API.post('/upload', { image });
        imageUrl = data.url;
      }
      const { data } = await API.post('/issues', { ...form, images: imageUrl ? [imageUrl] : [] });
      setAiResult({ category: data.category, severity: data.severity, department: data.department, aiSummary: data.aiSummary });
      toast.success('Issue reported! AI has analyzed it.');
      setTimeout(() => navigate(`/issue/${data._id}`), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f3f4f8', minHeight: '100vh', padding: '32px 0' }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="page-header">
          <h1>Report an issue</h1>
          <p>Gemini AI will automatically categorize and route your report to the right authority.</p>
        </div>

        {aiResult && (
          <div style={{ background: '#fff', border: '1.5px solid #c7d7fd', borderRadius: 12,
            padding: 20, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div className="ai-pill">✦ Gemini AI analysis</div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <span className={`badge badge-${aiResult.category?.replace(' ', '-')}`}>{aiResult.category}</span>
              <span className={`badge badge-${aiResult.severity}`}>{aiResult.severity} severity</span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13,
              color: '#374151', marginBottom: 10 }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#1a56db" strokeWidth="2">
                <path d="M13 9l3 3-3 3M6 12h10M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Routed to: <strong>{aiResult.department}</strong>
            </div>
            <p style={{ fontSize: 13, color: '#6b7280', fontStyle: 'italic', lineHeight: 1.6,
              padding: '10px 14px', background: '#f8fafc', borderRadius: 8 }}>
              "{aiResult.aiSummary}"
            </p>
          </div>
        )}

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Issue title <span>*</span></label>
                <input className="form-input" placeholder="e.g. Large pothole near Railway Station" required
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Description <span>*</span></label>
                <textarea className="form-input" rows={4}
                  placeholder="Describe the issue — when did you first notice it, how bad is it, what's the impact on locals..."
                  required value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Location / address <span>*</span></label>
                <input className="form-input" placeholder="e.g. Near SBI Bank, Argada Road, Hazaribagh"
                  required value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="form-group">
                <div>
                  <label className="form-label">Latitude</label>
                  <input className="form-input" type="number" step="any" placeholder="24.0000"
                    value={form.lat} onChange={e => setForm({ ...form, lat: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Longitude</label>
                  <input className="form-input" type="number" step="any" placeholder="85.3000"
                    value={form.lng} onChange={e => setForm({ ...form, lng: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Upload photo</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                  border: '1.5px dashed #d1d5db', borderRadius: 8, cursor: 'pointer',
                  background: '#fafafa', transition: 'border-color 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.borderColor = '#1a56db'}
                  onMouseOut={e => e.currentTarget.style.borderColor = '#d1d5db'}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="1.5">
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span style={{ fontSize: 13, color: '#6b7280' }}>
                    {preview ? 'Photo selected ✓ — click to change' : 'Click to upload a photo (optional)'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
                </label>
                {preview && (
                  <div style={{ position: 'relative', marginTop: 10 }}>
                    <img src={preview} alt="preview"
                      style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 8 }} />
                    <button type="button" onClick={() => { setImage(null); setPreview(null); }}
                      style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)',
                        color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28,
                        cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ×
                    </button>
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading
                  ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span> Gemini AI is analyzing...</>
                  : '✦ Submit report'}
              </button>

              <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 12 }}>
                Your report earns you <strong>+10 points</strong>. Verify others' reports for +5 pts each.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
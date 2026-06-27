import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Register() {
  const [form, setForm]     = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', form);
      login(data);
      toast.success('Account created! Welcome to the community 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f3f4f8' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 48, height: 48, background: '#1a56db', borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Join Community Hero</h1>
            <p style={{ color: '#6b7280', fontSize: 14 }}>Help fix Hazaribagh. Earn points. Make impact.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
            {[
              { icon: '📍', label: 'Report issues' },
              { icon: '✅', label: 'Verify & upvote' },
              { icon: '⭐', label: 'Earn points' },
            ].map(f => (
              <div key={f.label} style={{ background: '#fff', border: '1px solid #e5e7eb',
                borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{f.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{f.label}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Full name</label>
                  <input className="form-input" type="text" placeholder="Alka Rani" required
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" placeholder="your@email.com" required
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" placeholder="Min. 6 characters" required minLength={6}
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary btn-lg"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} disabled={loading}>
                  {loading ? 'Creating account...' : 'Create account — it\'s free'}
                </button>
              </form>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b7280' }}>
            Already have an account? <Link to="/login" style={{ color: '#1a56db', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
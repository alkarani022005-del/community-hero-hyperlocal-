import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path) => pathname === path;

  const linkStyle = (path) => ({
    fontSize: 14, fontWeight: 500, textDecoration: 'none',
    color: isActive(path) ? '#1a56db' : '#4b5563',
    padding: '6px 10px', borderRadius: 6,
    background: isActive(path) ? '#e8f0fe' : 'transparent',
    transition: 'all 0.15s',
  });

  return (
    <nav style={{
      background: '#fff', borderBottom: '1px solid #e5e7eb',
      padding: '0 24px', height: 60, display: 'flex',
      alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
        <div style={{
          width: 32, height: 32, background: '#1a56db', borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2">
            <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>Community Hero</div>
          <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1 }}>Hazaribagh, JH</div>
        </div>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Link to="/"          style={linkStyle('/')}>Feed</Link>
        <Link to="/dashboard" style={linkStyle('/dashboard')}>Dashboard</Link>

        {user ? (
          <>
            <Link to="/report" style={{ marginLeft: 8 }}>
              <button className="btn btn-primary btn-sm">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
                Report Issue
              </button>
            </Link>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              marginLeft: 12, paddingLeft: 12, borderLeft: '1px solid #e5e7eb',
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: '#1a56db', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
              }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hide-mobile" style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>⭐ {user.points || 0} pts</div>
              </div>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ marginLeft: 4 }}>
                Sign out
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: 8, marginLeft: 8 }}>
            <Link to="/login"><button className="btn btn-ghost btn-sm">Sign in</button></Link>
            <Link to="/register"><button className="btn btn-primary btn-sm">Get started</button></Link>
          </div>
        )}
      </div>
    </nav>
  );
}
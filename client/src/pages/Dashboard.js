import { useState, useEffect } from 'react';
import API from '../api/axios';
import Loader from '../components/Loader';

const BAR_COLORS = {
  Pothole: '#f59e0b', 'Water Leakage': '#3b82f6',
  Streetlight: '#eab308', Garbage: '#22c55e',
  Encroachment: '#ec4899', Other: '#8b5cf6'
};

export default function Dashboard() {
  const [issues, setIssues]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/issues').then(({ data }) => { setIssues(data); setLoading(false); });
  }, []);

  if (loading) return <Loader />;

  const total    = issues.length || 1;
  const resolved = issues.filter(i => i.status === 'Resolved').length;
  const critical = issues.filter(i => i.severity === 'Critical').length;
  const verified = issues.filter(i => i.status === 'Verified').length;
  const inProg   = issues.filter(i => i.status === 'In Progress').length;

  const byCat = issues.reduce((a, i) => { a[i.category] = (a[i.category]||0)+1; return a; }, {});
  const maxCat = Math.max(...Object.values(byCat), 1);

  const reporters = issues.reduce((a, i) => {
    const name = i.reporter?.name || 'Unknown';
    if (!a[name]) a[name] = { name, count: 0, points: i.reporter?.points || 0 };
    a[name].count++;
    return a;
  }, {});
  const topReporters = Object.values(reporters).sort((a,b) => b.count - a.count).slice(0, 5);

  const recentIssues = [...issues].slice(0, 5);

  const statusData = ['Reported', 'Verified', 'In Progress', 'Resolved', 'Closed']
    .map(s => ({ s, n: issues.filter(i => i.status === s).length }));

  return (
    <div style={{ background: '#f3f4f8', minHeight: '100vh' }}>
      <div className="container" style={{ padding: '32px 24px' }}>
        <div className="page-header">
          <h1>Impact dashboard</h1>
          <p>Live overview of civic issues across Hazaribagh, Jharkhand</p>
        </div>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
          {[
            { v: total === 1 ? 0 : total, l: 'Total issues', color: '#1a56db', bg: '#e8f0fe' },
            { v: resolved, l: 'Resolved', color: '#059669', bg: '#ecfdf5' },
            { v: verified, l: 'Verified', color: '#d97706', bg: '#fffbeb' },
            { v: critical, l: 'Critical', color: '#dc2626', bg: '#fef2f2' },
            { v: inProg,   l: 'In progress', color: '#7c3aed', bg: '#f5f3ff' },
          ].map(s => (
            <div key={s.l} style={{ background: s.bg, borderRadius: 12, padding: '20px 24px',
              border: `1px solid ${s.color}22` }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 13, color: s.color, fontWeight: 500, marginTop: 6 }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

          {/* Category breakdown */}
          <div className="card">
            <div className="card-body">
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Issues by category</h2>
              {Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([cat, count]) => (
                <div key={cat} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between',
                    fontSize: 13, marginBottom: 5, fontWeight: 500 }}>
                    <span>{cat}</span>
                    <span style={{ color: '#6b7280' }}>{count} ({Math.round(count/total*100)}%)</span>
                  </div>
                  <div style={{ height: 8, background: '#f3f4f6', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 100, transition: 'width 0.8s ease',
                      background: BAR_COLORS[cat] || '#6b7280',
                      width: `${(count / maxCat) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status pipeline */}
          <div className="card">
            <div className="card-body">
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Resolution pipeline</h2>
              {statusData.map(({ s, n }) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: 14 }}>{s}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 80, height: 6, background: '#f3f4f6', borderRadius: 100 }}>
                      <div style={{ height: '100%', borderRadius: 100, background: '#1a56db',
                        width: `${(n/total)*100}%` }} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, minWidth: 24 }}>{n}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Leaderboard */}
          <div className="card">
            <div className="card-body">
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
                Top contributors 🏆
              </h2>
              {topReporters.length === 0
                ? <p style={{ color: '#9ca3af', fontSize: 14 }}>No reports yet.</p>
                : topReporters.map((r, i) => (
                    <div key={r.name} style={{ display: 'flex', alignItems: 'center',
                      gap: 12, padding: '10px 0', borderBottom: i < topReporters.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13,
                        background: i === 0 ? '#fef3c7' : i === 1 ? '#f3f4f6' : '#fdf4ff',
                        color: i === 0 ? '#92400e' : i === 1 ? '#374151' : '#6b21a8' }}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : r.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{r.name}</div>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>{r.count} issues reported</div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a56db' }}>
                        +{r.points} pts
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>

          {/* Recent activity */}
          <div className="card">
            <div className="card-body">
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Recent reports</h2>
              {recentIssues.map((issue, i) => (
                <div key={issue._id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '10px 0', borderBottom: i < recentIssues.length-1 ? '1px solid #f3f4f6' : 'none' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                    background: { Reported: '#3b82f6', Verified: '#22c55e', 'In Progress': '#f59e0b',
                      Resolved: '#059669', Closed: '#9ca3af' }[issue.status] || '#9ca3af' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{issue.title}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>
                      {issue.category} · {new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
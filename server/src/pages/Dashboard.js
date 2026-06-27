import { useState, useEffect } from 'react';
import API from '../api/axios';
import Loader from '../components/Loader';
import { toast } from 'react-hot-toast';

const BAR_COLORS = {
  Pothole: '#f59e0b', 'Water Leakage': '#3b82f6',
  Streetlight: '#eab308', Garbage: '#22c55e',
  Encroachment: '#ec4899', Other: '#8b5cf6'
};

export default function Dashboard() {
  const [issues, setIssues]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [digest, setDigest]       = useState('');
  const [digestLoad, setDigestLoad] = useState(false);
  const [digestStats, setDigestStats] = useState(null);

  useEffect(() => {
    API.get('/issues')
      .then(({ data }) => { setIssues(data); setLoading(false); });
  }, []);

  const fetchDigest = async () => {
    setDigestLoad(true);
    try {
      const { data } = await API.get('/issues/ai/weekly-digest');
      setDigest(data.digest);
      setDigestStats(data.stats);
      toast.success('✦ Weekly digest generated!');
    } catch (err) {
      toast.error('Failed to generate digest');
    } finally {
      setDigestLoad(false);
    }
  };

  if (loading) return <Loader />;

  const total    = issues.length || 1;
  const resolved = issues.filter(i => i.status === 'Resolved').length;
  const critical = issues.filter(i => i.severity === 'Critical').length;
  const verified = issues.filter(i => i.status === 'Verified').length;
  const inProg   = issues.filter(i => i.status === 'In Progress').length;

  const byCat = issues.reduce((a, i) => {
    a[i.category] = (a[i.category] || 0) + 1;
    return a;
  }, {});
  const maxCat = Math.max(...Object.values(byCat), 1);

  const reporters = issues.reduce((a, i) => {
    const name = i.reporter?.name || 'Unknown';
    if (!a[name]) a[name] = { name, count: 0, points: i.reporter?.points || 0 };
    a[name].count++;
    return a;
  }, {});
  const topReporters = Object.values(reporters)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const recentIssues = [...issues].slice(0, 5);

  const statusData = ['Reported', 'Verified', 'In Progress', 'Resolved', 'Closed']
    .map(s => ({ s, n: issues.filter(i => i.status === s).length }));

  const statusDot = {
    Reported: '#3b82f6', Verified: '#22c55e',
    'In Progress': '#f59e0b', Resolved: '#059669', Closed: '#9ca3af'
  };

  return (
    <div style={{ background: '#f3f4f8', minHeight: '100vh' }}>
      <div className="container" style={{ padding: '32px 24px' }}>

        {/* Page header */}
        <div className="page-header">
          <h1>Impact dashboard</h1>
          <p>Live overview of civic issues across Hazaribagh, Jharkhand</p>
        </div>

        {/* KPI cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14, marginBottom: 28
        }}>
          {[
            { v: total === 1 ? 0 : total, l: 'Total issues',  color: '#1a56db', bg: '#e8f0fe' },
            { v: resolved, l: 'Resolved',    color: '#059669', bg: '#ecfdf5' },
            { v: verified, l: 'Verified',    color: '#d97706', bg: '#fffbeb' },
            { v: critical, l: 'Critical',    color: '#dc2626', bg: '#fef2f2' },
            { v: inProg,   l: 'In progress', color: '#7c3aed', bg: '#f5f3ff' },
          ].map(s => (
            <div key={s.l} style={{
              background: s.bg, borderRadius: 12,
              padding: '20px 24px',
              border: `1px solid ${s.color}22`
            }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: s.color, lineHeight: 1 }}>
                {s.v}
              </div>
              <div style={{ fontSize: 13, color: s.color, fontWeight: 500, marginTop: 6 }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>

        {/* Row 1: Category + Pipeline */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

          {/* Category breakdown */}
          <div className="card">
            <div className="card-body">
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
                Issues by category
              </h2>
              {Object.keys(byCat).length === 0
                ? <p style={{ color: '#9ca3af', fontSize: 14 }}>No issues yet.</p>
                : Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                    <div key={cat} style={{ marginBottom: 14 }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        fontSize: 13, marginBottom: 5, fontWeight: 500
                      }}>
                        <span>{cat}</span>
                        <span style={{ color: '#6b7280' }}>
                          {count} ({Math.round((count / total) * 100)}%)
                        </span>
                      </div>
                      <div style={{ height: 8, background: '#f3f4f6', borderRadius: 100, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 100,
                          background: BAR_COLORS[cat] || '#6b7280',
                          width: `${(count / maxCat) * 100}%`,
                          transition: 'width 0.8s ease'
                        }} />
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>

          {/* Resolution pipeline */}
          <div className="card">
            <div className="card-body">
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
                Resolution pipeline
              </h2>
              {statusData.map(({ s, n }) => (
                <div key={s} style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 0', borderBottom: '1px solid #f3f4f6'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: statusDot[s], display: 'inline-block', flexShrink: 0
                    }} />
                    <span style={{ fontSize: 14 }}>{s}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 80, height: 6, background: '#f3f4f6', borderRadius: 100 }}>
                      <div style={{
                        height: '100%', borderRadius: 100, background: '#1a56db',
                        width: `${Math.round((n / total) * 100)}%`
                      }} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, minWidth: 24, textAlign: 'right' }}>
                      {n}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Leaderboard + Recent */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

          {/* Leaderboard */}
          <div className="card">
            <div className="card-body">
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
                Top contributors 🏆
              </h2>
              {topReporters.length === 0
                ? <p style={{ color: '#9ca3af', fontSize: 14 }}>No contributors yet.</p>
                : topReporters.map((r, i) => (
                    <div key={r.name} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 0',
                      borderBottom: i < topReporters.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 14, flexShrink: 0,
                        background: i === 0 ? '#fef3c7' : i === 1 ? '#f3f4f6' : '#fdf4ff',
                        color: i === 0 ? '#92400e' : i === 1 ? '#374151' : '#6b21a8'
                      }}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : r.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{r.name}</div>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>
                          {r.count} issue{r.count !== 1 ? 's' : ''} reported
                        </div>
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
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
                Recent reports
              </h2>
              {recentIssues.length === 0
                ? <p style={{ color: '#9ca3af', fontSize: 14 }}>No reports yet.</p>
                : recentIssues.map((issue, i) => (
                    <div key={issue._id} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '10px 0',
                      borderBottom: i < recentIssues.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        marginTop: 5, flexShrink: 0,
                        background: statusDot[issue.status] || '#9ca3af'
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 500,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                        }}>
                          {issue.title}
                        </div>
                        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                          {issue.category} · {new Date(issue.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short'
                          })}
                        </div>
                      </div>
                      <span className={`badge badge-${issue.status?.replace(' ', '-')}`}
                        style={{ fontSize: 10, flexShrink: 0 }}>
                        {issue.status}
                      </span>
                    </div>
                  ))
              }
            </div>
          </div>
        </div>

        {/* AI Weekly Digest */}
        <div className="card">
          <div className="card-body">
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 600 }}>✦ AI Weekly Digest</h2>
                  <span className="ai-pill">Gemini powered</span>
                </div>
                <p style={{ fontSize: 13, color: '#6b7280' }}>
                  AI-generated summary of community issues and recommended actions
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={fetchDigest}
                disabled={digestLoad}
              >
                {digestLoad
                  ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span> Generating...</>
                  : '✦ Generate this week\'s digest'
                }
              </button>
            </div>

            {/* Digest stats */}
            {digestStats && (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 12, marginBottom: 20
              }}>
                {[
                  { v: digestStats.newThisWeek,    l: 'New this week',     color: '#1a56db' },
                  { v: digestStats.totalUnresolved, l: 'Unresolved',       color: '#dc2626' },
                  { v: digestStats.resolved,        l: 'Total resolved',   color: '#059669' },
                  { v: digestStats.critical,        l: 'Critical pending', color: '#d97706' },
                ].map(s => (
                  <div key={s.l} style={{
                    background: '#f8fafc', borderRadius: 8,
                    padding: '12px 16px', border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.v}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Digest content */}
            {digest ? (
              <div style={{
                background: '#f8fafc', border: '1px solid #e5e7eb',
                borderRadius: 10, padding: 24,
                fontSize: 14, lineHeight: 1.9, color: '#374151',
                whiteSpace: 'pre-wrap'
              }}>
                {digest}
              </div>
            ) : (
              <div style={{
                textAlign: 'center', padding: '48px 20px',
                color: '#9ca3af', fontSize: 14,
                background: '#fafafa', borderRadius: 10,
                border: '1px dashed #e5e7eb'
              }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>✦</div>
                <p style={{ fontWeight: 500, marginBottom: 4, color: '#6b7280' }}>
                  No digest generated yet
                </p>
                <p>Click the button above to get an AI-powered summary of this week's community issues</p>
              </div>
            )}
          </div>
        </div>

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
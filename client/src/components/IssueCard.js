import { useNavigate } from 'react-router-dom';

const severityDot = { Low: '#22c55e', Medium: '#f59e0b', High: '#f97316', Critical: '#ef4444' };

export default function IssueCard({ issue }) {
  const navigate = useNavigate();
  const cat = issue.category?.replace(' ', '-') || 'Other';
  const sev = issue.severity || 'Medium';
  const sta = issue.status?.replace(' ', '-') || 'Reported';

  return (
    <div className="card card-hover" onClick={() => navigate(`/issue/${issue._id}`)}>
      {issue.images?.[0] && (
        <div style={{ height: 180, overflow: 'hidden' }}>
          <img src={issue.images[0]} alt="issue"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      <div className="card-body">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          <span className={`badge badge-${cat}`}>{issue.category}</span>
          <span className={`badge badge-${sta}`}>{issue.status}</span>
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7280' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: severityDot[sev], display: 'inline-block' }}/>
            {sev}
          </span>
        </div>

        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: '#111827', lineHeight: 1.4 }}>
          {issue.title}
        </h3>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 14, lineHeight: 1.6,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {issue.description}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#9ca3af', marginBottom: 14 }}>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <circle cx="12" cy="11" r="3"/>
          </svg>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {issue.location?.address}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#6b7280' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/>
                <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
              </svg>
              {issue.upvotes?.length || 0}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {issue.verifiedBy?.length || 0} verified
            </span>
          </div>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>
            {new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        </div>

        {issue.department && (
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 10px', background: '#f0f4ff', borderRadius: 6, fontSize: 12, color: '#3730a3' }}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
            AI → {issue.department}
          </div>
        )}
      </div>
    </div>
  );
}
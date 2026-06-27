export default function Loader() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '80px 20px', gap: 16 }}>
      <div style={{
        width: 36, height: 36,
        border: '3px solid #e5e7eb',
        borderTop: '3px solid #1a56db',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <span style={{ fontSize: 13, color: '#9ca3af' }}>Loading...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
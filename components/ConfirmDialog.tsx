'use client';

interface Props {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ message, onConfirm, onCancel }: Props) {
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: '28px 24px', maxWidth: 360, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, backgroundColor: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 16px' }}>🚪</div>
        <div style={{ fontWeight: 800, color: '#1e293b', fontSize: 17, marginBottom: 8 }}>Confirm Logout</div>
        <div style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>{message}</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid #e2e8f0', backgroundColor: '#fff', color: '#64748b', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', backgroundColor: '#dc2626', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Logout</button>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Footer from '../../components/Footer';

const priorityOptions = [
  { value: 'low',      label: 'Low',      color: '#16a34a', bg: '#f0fdf4', icon: '🟢' },
  { value: 'medium',   label: 'Medium',   color: '#d97706', bg: '#fffbeb', icon: '🟡' },
  { value: 'high',     label: 'High',     color: '#ea580c', bg: '#fff7ed', icon: '🟠' },
  { value: 'critical', label: 'Critical', color: '#dc2626', bg: '#fef2f2', icon: '🔴' },
];

export default function ReportEmergency() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({ title: '', description: '', location: '', contact_number: '', priority: 'medium', latitude: '', longitude: '' });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) setImagePreview(URL.createObjectURL(file));
    else setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('location', formData.location);
    data.append('contact_number', formData.contact_number);
    data.append('priority', formData.priority);
    if (formData.latitude) data.append('latitude', formData.latitude);
    if (formData.longitude) data.append('longitude', formData.longitude);
    if (image) data.append('image', image);
    try {
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch('http://localhost:8000/api/emergency-reports/', { method: 'POST', headers, body: data });
      if (response.ok) {
        setSuccess(true);
      } else {
        const result = await response.json().catch(() => ({}));
        const msgs: string[] = [];
        Object.keys(result).forEach(k => { msgs.push(Array.isArray(result[k]) ? `${k}: ${result[k].join(', ')}` : `${k}: ${result[k]}`); });
        setError(msgs.join(' | ') || 'Failed to submit report');
      }
    } catch (err: any) {
      setError('Connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 40 }}>🚨</div>
    </div>
  );

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, color: '#1e293b', backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <style>{`
        @media (max-width: 640px) { .priority-grid { grid-template-columns: repeat(2,1fr) !important; } .loc-btns { flex-direction: column !important; } }
      `}</style>

      {/* Success Modal */}
      {success && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: '36px 28px', maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ width: 72, height: 72, backgroundColor: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 36 }}>✅</div>
            <div style={{ fontWeight: 800, fontSize: 20, color: '#1e293b', marginBottom: 8 }}>Report Submitted!</div>
            <div style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              Your emergency report has been successfully sent to the <strong>Cebu City Fire Department</strong>. Responders will be notified immediately.
            </div>
            <button onClick={() => router.push(user ? '/my-reports' : '/')}
              style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', backgroundColor: '#dc2626', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
              {user ? 'View My Reports' : 'Back to Home'}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 16px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a href="/" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none' }}>← Home</a>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <div style={{ fontWeight: 800, color: '#1e293b', fontSize: 16 }}>Report Emergency</div>
          </div>
          {user && <a href="/my-reports" style={{ color: '#dc2626', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>My Reports</a>}
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>

        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', borderRadius: 20, padding: '28px 24px', marginBottom: 20, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 26 }}>🚨</div>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Report Emergency</div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Submit an emergency report to the Cebu City Fire Department</div>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 14, padding: '14px 16px', marginBottom: 20, color: '#dc2626', fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            <div>
              <label style={labelStyle}>Title *</label>
              <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Brief description of the emergency" style={inputStyle} required />
            </div>

            <div>
              <label style={labelStyle}>Description *</label>
              <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={4} placeholder="Provide details about the emergency situation..." style={{ ...inputStyle, resize: 'none' }} required />
            </div>

            <div>
              <label style={labelStyle}>Location *</label>
              <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="Enter the exact address or location of the fire" style={inputStyle} required />
            </div>

            <div>
              <label style={labelStyle}>Contact Number *</label>
              <input type="tel" value={formData.contact_number} onChange={e => setFormData({ ...formData, contact_number: e.target.value })} placeholder="09XX XXX XXXX" style={inputStyle} required />
            </div>

            <div>
              <label style={labelStyle}>Priority Level</label>
              <div className="priority-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                {priorityOptions.map(p => (
                  <button key={p.value} type="button" onClick={() => setFormData({ ...formData, priority: p.value })}
                    style={{ padding: '10px 6px', borderRadius: 10, border: `1.5px solid ${formData.priority === p.value ? p.color : '#e2e8f0'}`, backgroundColor: formData.priority === p.value ? p.bg : '#fff', color: formData.priority === p.value ? p.color : '#64748b', fontWeight: 700, fontSize: 12, cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontSize: 16, marginBottom: 3 }}>{p.icon}</div>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Photo <span style={{ color: '#94a3b8', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', borderRadius: 12, border: '2px dashed #e2e8f0', backgroundColor: '#f8fafc', cursor: 'pointer' }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ maxHeight: 160, borderRadius: 10, objectFit: 'cover' }} />
                ) : (
                  <>
                    <span style={{ fontSize: 28, marginBottom: 8 }}>📷</span>
                    <span style={{ color: '#64748b', fontSize: 13 }}>Click to upload a photo</span>
                    <span style={{ color: '#94a3b8', fontSize: 11, marginTop: 4 }}>JPG, PNG up to 10MB</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </label>
              {imagePreview && (
                <button type="button" onClick={() => { setImage(null); setImagePreview(null); }} style={{ marginTop: 8, fontSize: 12, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>✕ Remove photo</button>
              )}
            </div>

            <button type="submit" disabled={loading || success}
              style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', backgroundColor: '#dc2626', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', opacity: loading || success ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? (
                <><svg style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Submitting...</>
              ) : '🚨 Submit Emergency Report'}
            </button>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

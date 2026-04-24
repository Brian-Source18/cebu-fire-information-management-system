'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Footer from '../../components/Footer';

const CEBU_BARANGAYS = [
  'Adlaon','Agsungot','Apas','Babag','Bacayan','Banilad','Basak Pardo','Basak San Nicolas',
  'Binaliw','Bonbon','Budlaan','Bulacao','Buot-Taup Pardo','Busay','Calamba','Cambinocot',
  'Capitol Site','Carreta','Central','Cogon Pardo','Cogon Ramos','Day-as','Duljo','Ermita',
  'Escario','Guadalupe','Guba','Hippodromo','Inayawan','Kalubihan','Kalunasan','Kamagayan',
  'Kamputhaw','Kasambagan','Kinasang-an','Labangon','Lahug','Lorega','Lusaran','Luz',
  'Mabini','Mabolo','Malubog','Mambaling','Mining','Mohon','Montalban','Motarro',
  'Nasipit','Nga-an','Nangka','Pahina Central','Pahina San Nicolas','Pamutan','Pardo',
  'Pari-an','Paril','Pasil','Pit-os','Poblacion Pardo','Pulangbato','Pung-ol-Sibugay',
  'Punta Princesa','Quiot Pardo','Sambag I','Sambag II','San Antonio','San Jose',
  'San Nicolas Central','San Roque','Santa Cruz','Santo Niño','Sapangdaku','Sawang Calero',
  'Sinsin','Sirao','Suba','Sudlon I','Sudlon II','T. Padilla','Tabunan','Tagbao',
  'Talamban','Taptap','Tejero','Tinago','Tisa','To-ong Pardo','Toong','Zapatera',
];

export default function ReportEmergency() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({ title: '', description: '', location: '', contact_number: '', barangay: '', latitude: '', longitude: '' });
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
    data.append('location', `${formData.location}, Brgy. ${formData.barangay}, Cebu City`);
    data.append('contact_number', formData.contact_number);
    if (formData.latitude) data.append('latitude', formData.latitude);
    if (formData.longitude) data.append('longitude', formData.longitude);
    if (image) data.append('image', image);
    try {
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/emergency-reports/`, { method: 'POST', headers, body: data });
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

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user]);

  if (authLoading || !user) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 40 }}>🚨</div>
    </div>
  );

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, color: '#1e293b', backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <style>{`
        @media (max-width: 640px) { .loc-btns { flex-direction: column !important; } }
      `}</style>

      {/* Success Modal */}
      {success && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: '36px 28px', maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ width: 72, height: 72, backgroundColor: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 36 }}>✅</div>
            <div style={{ fontWeight: 800, fontSize: 20, color: '#1e293b', marginBottom: 8 }}>Report Submitted!</div>
            <div style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              Your emergency report has been successfully sent to the <strong>Cebu City Fire System</strong>. Responders will be notified immediately.
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
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Submit an emergency report to the Cebu City Fire System</div>
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
              <label style={labelStyle}>Barangay *</label>
              <select value={formData.barangay} onChange={e => setFormData({ ...formData, barangay: e.target.value })} style={inputStyle} required>
                <option value="">Select Barangay</option>
                {CEBU_BARANGAYS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
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
              <label style={labelStyle}>Photo *</label>
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
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} required />
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


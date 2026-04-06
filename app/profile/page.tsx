'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Footer from '../../components/Footer';
import ConfirmDialog from '../../components/ConfirmDialog';

const API_BASE = 'http://localhost:8000';

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  pending:    { color: '#d97706', bg: '#fffbeb', label: 'Pending' },
  responding: { color: '#2563eb', bg: '#eff6ff', label: 'Responding' },
  resolved:   { color: '#16a34a', bg: '#f0fdf4', label: 'Resolved' },
};

type Tab = 'account' | 'security' | 'reports';

export default function ProfilePage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('account');
  const [emailForm, setEmailForm] = useState({ email: '' });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [emailMsg, setEmailMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (!authLoading && user) {
      setEmailForm({ email: user.email || '' });
      const token = localStorage.getItem('access_token');
      fetch(`${API_BASE}/api/emergency-reports/`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : [])
        .then(data => { setReports(Array.isArray(data) ? data : []); setLoadingReports(false); })
        .catch(() => setLoadingReports(false));
    }
  }, [user, authLoading, router]);

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailMsg(''); setEmailError('');
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${API_BASE}/api/auth/update-profile/`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailForm.email }),
    });
    const data = await res.json();
    if (res.ok) setEmailMsg(data.message);
    else setEmailError(data.error);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(''); setPasswordError('');
    if (passwordForm.new_password !== passwordForm.confirm_password) { setPasswordError('New passwords do not match.'); return; }
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${API_BASE}/api/auth/update-profile/`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password: passwordForm.current_password, new_password: passwordForm.new_password }),
    });
    const data = await res.json();
    if (res.ok) { setPasswordMsg(data.message); setPasswordForm({ current_password: '', new_password: '', confirm_password: '' }); }
    else setPasswordError(data.error);
  };

  const handleLogout = () => setShowConfirm(true);

  if (authLoading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 40 }}>🔥</div>
    </div>
  );
  if (!user) return null;

  const initials = (user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase();
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username;
  const totalReports = reports.length;
  const pendingReports = reports.filter(r => r.status === 'pending').length;
  const resolvedReports = reports.filter(r => r.status === 'resolved').length;

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'account',  label: 'Account',    icon: '👤' },
    { key: 'security', label: 'Security',   icon: '🔒' },
    { key: 'reports',  label: 'My Reports', icon: '📋' },
  ];

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, color: '#1e293b', backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {showConfirm && <ConfirmDialog message="Are you sure you want to logout?" onConfirm={() => { logout(); router.push('/login'); }} onCancel={() => setShowConfirm(false)} />}
      <style>{`
        @media (max-width: 640px) {
          .profile-stats { grid-template-columns: repeat(3,1fr) !important; }
          .tab-label { display: none; }
        }
      `}</style>

      {/* Header */}
      <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a href="/" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none' }}>← Home</a>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <div style={{ fontWeight: 800, color: '#1e293b', fontSize: 16 }}>My Profile</div>
          </div>
          <button onClick={handleLogout} style={{ backgroundColor: '#fef2f2', color: '#dc2626', fontWeight: 700, padding: '7px 16px', borderRadius: 8, border: '1px solid #fca5a5', cursor: 'pointer', fontSize: 13 }}>Logout</button>
        </div>
      </header>

      {/* Hero Banner */}
      <div style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', padding: '32px 16px', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 28, fontWeight: 900, color: '#fff', border: '3px solid rgba(255,255,255,0.4)' }}>{initials}</div>
        <div style={{ color: '#fff', fontWeight: 800, fontSize: 20, marginBottom: 4 }}>{fullName}</div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 12 }}>@{user.username} · {user.email}</div>
        <span style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.3)' }}>🔥 {user.role} User</span>

        {/* Stats */}
        <div className="profile-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, maxWidth: 400, margin: '20px auto 0' }}>
          {[
            { label: 'Total', value: totalReports, icon: '📊' },
            { label: 'Pending', value: pendingReports, icon: '⏳' },
            { label: 'Resolved', value: resolvedReports, icon: '✅' },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: 18 }}>{s.icon}</div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 20 }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, backgroundColor: '#fff', borderRadius: 14, padding: 6, border: '1px solid #e2e8f0' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 8px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, backgroundColor: activeTab === t.key ? '#fef2f2' : 'transparent', color: activeTab === t.key ? '#dc2626' : '#64748b', transition: 'all 0.2s' }}>
              <span>{t.icon}</span>
              <span className="tab-label">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 800, color: '#1e293b', fontSize: 16, marginBottom: 4 }}>Update Email</div>
            <div style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>Change the email address linked to your account.</div>
            <form onSubmit={handleEmailUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input type="email" value={emailForm.email} onChange={e => setEmailForm({ email: e.target.value })} style={inputStyle} placeholder="your@email.com" required />
              </div>
              {emailMsg && <div style={{ color: '#16a34a', fontSize: 13 }}>✅ {emailMsg}</div>}
              {emailError && <div style={{ color: '#dc2626', fontSize: 13 }}>⚠️ {emailError}</div>}
              <button type="submit" style={{ backgroundColor: '#dc2626', color: '#fff', fontWeight: 700, padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, alignSelf: 'flex-start' }}>Save Email</button>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 800, color: '#1e293b', fontSize: 16, marginBottom: 4 }}>Change Password</div>
            <div style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>Keep your account secure with a strong password.</div>
            <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Current Password', key: 'current_password', placeholder: 'Enter current password' },
                { label: 'New Password', key: 'new_password', placeholder: 'Enter new password' },
                { label: 'Confirm Password', key: 'confirm_password', placeholder: 'Confirm new password' },
              ].map(f => (
                <div key={f.key}>
                  <label style={labelStyle}>{f.label}</label>
                  <input type="password" value={passwordForm[f.key as keyof typeof passwordForm]} onChange={e => setPasswordForm({ ...passwordForm, [f.key]: e.target.value })} style={inputStyle} placeholder={f.placeholder} required />
                </div>
              ))}
              {passwordMsg && <div style={{ color: '#16a34a', fontSize: 13 }}>✅ {passwordMsg}</div>}
              {passwordError && <div style={{ color: '#dc2626', fontSize: 13 }}>⚠️ {passwordError}</div>}
              <button type="submit" style={{ backgroundColor: '#dc2626', color: '#fff', fontWeight: 700, padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, alignSelf: 'flex-start' }}>Update Password</button>
            </form>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontWeight: 800, color: '#1e293b', fontSize: 16 }}>My Reports</div>
                <div style={{ color: '#64748b', fontSize: 12 }}>{totalReports} report{totalReports !== 1 ? 's' : ''} submitted</div>
              </div>
              <a href="/report" style={{ backgroundColor: '#dc2626', color: '#fff', fontWeight: 700, padding: '8px 16px', borderRadius: 10, textDecoration: 'none', fontSize: 13 }}>+ New Report</a>
            </div>
            {loadingReports ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>Loading reports...</div>
            ) : reports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', backgroundColor: '#fff', borderRadius: 16, border: '1px dashed #e2e8f0' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
                <div style={{ color: '#475569', fontWeight: 700 }}>No reports yet</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {reports.map(r => {
                  const s = statusConfig[r.status] || statusConfig.pending;
                  return (
                    <div key={r.id} style={{ backgroundColor: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 14, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                        <div style={{ color: '#94a3b8', fontSize: 12 }}>📍 {r.location}</div>
                        <div style={{ color: '#94a3b8', fontSize: 12 }}>{new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, color: s.color, backgroundColor: s.bg, flexShrink: 0 }}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <a href="/" style={{ flex: 1, textAlign: 'center', padding: '12px', borderRadius: 12, border: '1px solid #e2e8f0', color: '#64748b', textDecoration: 'none', fontSize: 13, fontWeight: 600, backgroundColor: '#fff' }}>← Back to Home</a>
          <button onClick={handleLogout} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #fca5a5', color: '#dc2626', fontSize: 13, fontWeight: 700, backgroundColor: '#fef2f2', cursor: 'pointer' }}>🚪 Logout</button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

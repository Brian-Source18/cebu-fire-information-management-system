'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Footer from '../../components/Footer';

const statusConfig: Record<string, { color: string; bg: string; border: string; label: string; icon: string }> = {
  pending:    { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Pending',    icon: '⏳' },
  responding: { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'Responding', icon: '🚒' },
  resolved:   { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Resolved',   icon: '✅' },
};

const priorityConfig: Record<string, { color: string; bg: string; label: string }> = {
  low:      { color: '#16a34a', bg: '#f0fdf4', label: 'Low' },
  medium:   { color: '#d97706', bg: '#fffbeb', label: 'Medium' },
  high:     { color: '#ea580c', bg: '#fff7ed', label: 'High' },
  critical: { color: '#dc2626', bg: '#fef2f2', label: 'Critical' },
};

const alarmConfig: Record<string, { color: string; bg: string; label: string }> = {
  '1st':               { color: '#16a34a', bg: '#f0fdf4', label: '1st Alarm' },
  '2nd':               { color: '#d97706', bg: '#fffbeb', label: '2nd Alarm' },
  '3rd':               { color: '#ea580c', bg: '#fff7ed', label: '3rd Alarm' },
  '4th':               { color: '#dc2626', bg: '#fef2f2', label: '4th Alarm' },
  '5th':               { color: '#b91c1c', bg: '#fef2f2', label: '5th Alarm' },
  'task_force_alpha':  { color: '#991b1b', bg: '#fef2f2', label: 'Task Force Alpha' },
  'task_force_bravo':  { color: '#991b1b', bg: '#fef2f2', label: 'Task Force Bravo' },
  'task_force_charlie':{ color: '#7f1d1d', bg: '#fef2f2', label: 'Task Force Charlie' },
  'task_force_delta':  { color: '#7f1d1d', bg: '#fef2f2', label: 'Task Force Delta' },
  'general_alarm':     { color: '#fff',    bg: '#dc2626', label: '🚨 General Alarm' },
};

export default function MyReports() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [toasts, setToasts] = useState<{ id: number; message: string; icon: string }[]>([]);
  const prevStatuses = useRef<Record<number, string>>({});
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchReports = (isPolling = false) => {
    const token = localStorage.getItem('access_token');
    fetch('http://localhost:8000/api/emergency-reports/', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        const list: any[] = Array.isArray(data) ? data : [];
        if (isPolling) {
          list.forEach(report => {
            const prev = prevStatuses.current[report.id];
            if (prev && prev !== report.status) {
              const s = statusConfig[report.status];
              const id = Date.now() + report.id;
              const message = `"${report.title}" is now ${s?.label ?? report.status}`;
              const icon = s?.icon ?? '🔔';
              setToasts(prev => [...prev, { id, message, icon }]);
              setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
            }
          });
        }
        prevStatuses.current = Object.fromEntries(list.map(r => [r.id, r.status]));
        setReports(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchReportsRef = useRef(fetchReports);
  fetchReportsRef.current = fetchReports;

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (!authLoading && user) {
      fetchReportsRef.current();
      pollRef.current = setInterval(() => fetchReportsRef.current(true), 10000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [user, authLoading, router]);

  const handleCancel = async (id: number) => {
    if (!confirm('Cancel this report?')) return;
    const token = localStorage.getItem('access_token');
    await fetch(`http://localhost:8000/api/emergency-reports/${id}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchReportsRef.current();
  };

  if (authLoading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 40 }}>📋</div>
    </div>
  );
  if (!user) return null;

  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter);
  const counts = {
    all: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    responding: reports.filter(r => r.status === 'responding').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <style>{`
        @keyframes toast-in { from { opacity:0; transform:translateX(60px); } to { opacity:1; transform:translateX(0); } }
        .toast-item { animation: toast-in 0.3s ease-out forwards; }
        @media (max-width: 640px) {
          .reports-header { flex-direction: column !important; align-items: flex-start !important; }
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>

      {/* Toast Notifications */}
      <div style={{ position: 'fixed', top: 20, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {toasts.map(toast => (
          <div key={toast.id} className="toast-item" style={{ background: '#fff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 260, maxWidth: 320 }}>
            <span style={{ fontSize: 20 }}>{toast.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#1e293b', fontSize: 13, fontWeight: 600 }}>Report Status Updated</div>
              <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{toast.message}</div>
            </div>
            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
        ))}
      </div>

      {/* Header */}
      <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a href="/" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>← Home</a>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <div style={{ fontWeight: 800, color: '#1e293b', fontSize: 16 }}>My Reports</div>
          </div>
          <a href="/report" style={{ backgroundColor: '#dc2626', color: '#fff', fontWeight: 700, padding: '7px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 13 }}>🚨 New Report</a>
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>

        {/* Stats */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { key: 'all',        label: 'Total',      icon: '📊', color: '#ea580c', bg: '#fff7ed' },
            { key: 'pending',    label: 'Pending',    icon: '⏳', color: '#d97706', bg: '#fffbeb' },
            { key: 'responding', label: 'Responding', icon: '🚒', color: '#2563eb', bg: '#eff6ff' },
            { key: 'resolved',   label: 'Resolved',   icon: '✅', color: '#16a34a', bg: '#f0fdf4' },
          ].map(s => (
            <button key={s.key} onClick={() => setFilter(s.key)}
              style={{ backgroundColor: filter === s.key ? s.bg : '#fff', border: `1.5px solid ${filter === s.key ? s.color + '60' : '#e2e8f0'}`, borderRadius: 14, padding: '14px 8px', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: 18 }}>{s.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: filter === s.key ? s.color : '#1e293b' }}>{counts[s.key as keyof typeof counts]}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{s.label}</div>
            </button>
          ))}
        </div>

        {/* Reports List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>Loading your reports...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', backgroundColor: '#fff', borderRadius: 16, border: '1px dashed #e2e8f0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div style={{ color: '#475569', fontWeight: 700, marginBottom: 6 }}>No reports found</div>
            <div style={{ color: '#94a3b8', fontSize: 13 }}>
              {filter === 'all' ? <a href="/report" style={{ color: '#dc2626' }}>Submit your first emergency report</a> : `No ${filter} reports`}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(report => {
              const s = statusConfig[report.status] || statusConfig.pending;
              const p = priorityConfig[report.priority] || priorityConfig.medium;
              return (
                <div key={report.id} style={{ backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
                  <div style={{ height: 3, background: `linear-gradient(to right, ${s.color}, transparent)` }} />
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 15, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{report.title}</div>
                        <div style={{ color: '#94a3b8', fontSize: 12 }}>
                          {new Date(report.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, color: p.color, backgroundColor: p.bg }}>{p.label}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, color: s.color, backgroundColor: s.bg, border: `1px solid ${s.border}` }}>{s.icon} {s.label}</span>
                        {report.alarm_level && alarmConfig[report.alarm_level] && (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, color: alarmConfig[report.alarm_level].color, backgroundColor: alarmConfig[report.alarm_level].bg }}>
                            🚨 {alarmConfig[report.alarm_level].label}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ color: '#475569', fontSize: 13, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{report.description}</div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: '#94a3b8', marginBottom: report.status === 'pending' ? 10 : 0 }}>
                      <span>📍 {report.location}</span>
                      <span>📞 {report.contact_number}</span>
                    </div>
                    {report.image && <img src={report.image} alt={report.title} style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 10, marginBottom: 10, border: '1px solid #e2e8f0' }} />}
                    {report.status === 'pending' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleCancel(report.id)} style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 8, backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', cursor: 'pointer' }}>
                          ✕ Cancel Report
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface EmergencyReport {
  id: number; title: string; description: string; location: string;
  latitude: number; longitude: number; priority: string; status: string;
  alarm_level: string | null; image: string; contact_number: string; reported_by_name: string; created_at: string;
}
interface Personnel { id: number; first_name: string; middle_initial: string; last_name: string; rank_display: string; }
interface ResponseLog { time_dispatched: string; time_arrived: string; personnel_deployed: Personnel[]; equipment_used: string; notes: string; }

const alarmCfg: Record<string, { color: string; bg: string; label: string }> = {
  '1st':               { color: '#4ade80', bg: 'rgba(74,222,128,0.15)',   label: '1st Alarm' },
  '2nd':               { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)',   label: '2nd Alarm' },
  '3rd':               { color: '#fb923c', bg: 'rgba(251,146,60,0.15)',   label: '3rd Alarm' },
  '4th':               { color: '#f97316', bg: 'rgba(249,115,22,0.15)',   label: '4th Alarm' },
  '5th':               { color: '#ef4444', bg: 'rgba(239,68,68,0.15)',    label: '5th Alarm' },
  'task_force_alpha':  { color: '#dc2626', bg: 'rgba(220,38,38,0.2)',     label: 'Task Force Alpha' },
  'task_force_bravo':  { color: '#b91c1c', bg: 'rgba(185,28,28,0.2)',     label: 'Task Force Bravo' },
  'task_force_charlie':{ color: '#991b1b', bg: 'rgba(153,27,27,0.2)',     label: 'Task Force Charlie' },
  'task_force_delta':  { color: '#7f1d1d', bg: 'rgba(127,29,29,0.2)',     label: 'Task Force Delta' },
  'general_alarm':     { color: '#fff',    bg: 'rgba(239,68,68,0.4)',     label: '🚨 General Alarm' },
};

const inputCls = 'w-full rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none transition-all focus:ring-1 focus:ring-orange-500';
const inputStyle = { background: 'rgba(15,5,5,0.8)', border: '1px solid rgba(239,68,68,0.25)', color: 'white' };

const priorityBadge = (p: string) => {
  const map: Record<string, [string, string]> = {
    critical: ['rgba(220,38,38,0.2)', '#f87171'],
    high:     ['rgba(234,88,12,0.2)', '#fb923c'],
    medium:   ['rgba(234,179,8,0.2)', '#fbbf24'],
    low:      ['rgba(107,114,128,0.2)', '#9ca3af'],
  };
  const [bg, color] = map[p] || map.low;
  return { background: bg, color };
};

const statusStyle = (s: string) => {
  const map: Record<string, [string, string]> = {
    pending:    ['rgba(217,119,6,0.2)',  '#fbbf24'],
    responding: ['rgba(37,99,235,0.2)',  '#60a5fa'],
    resolved:   ['rgba(22,163,74,0.2)',  '#4ade80'],
  };
  const [bg, color] = map[s] || map.pending;
  return { background: bg, color, border: 'none', cursor: 'pointer' };
};

export default function StationReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<EmergencyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<EmergencyReport | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [resolveModal, setResolveModal] = useState<{ id: number } | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [showLogModal, setShowLogModal] = useState(false);
  const [logReport, setLogReport] = useState<EmergencyReport | null>(null);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [existingLog, setExistingLog] = useState<ResponseLog | null>(null);
  const [logForm, setLogForm] = useState({ time_dispatched: '', time_arrived: '', equipment_used: '', notes: '', personnel_deployed_ids: [] as number[] });
  const [formData, setFormData] = useState({ title: '', description: '', location: '', latitude: '', longitude: '', priority: 'medium', contact_number: '' });
  const [sendingLocation, setSendingLocation] = useState(false);

  useEffect(() => {
    fetchReports();
    fetchPersonnel();
    const interval = setInterval(fetchReports, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('https://firebackend-tsi7.onrender.com/api/station/emergency-reports/', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch { setReports([]); }
    finally { setLoading(false); }
  };

  const fetchPersonnel = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('https://firebackend-tsi7.onrender.com/api/station/personnel/', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setPersonnel(await res.json());
    } catch {}
  };

  const openLogModal = async (report: EmergencyReport) => {
    setLogReport(report); setShowLogModal(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`https://firebackend-tsi7.onrender.com/api/station/response-log/${report.id}/`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setExistingLog(data);
          setLogForm({ time_dispatched: data.time_dispatched?.slice(0, 16) || '', time_arrived: data.time_arrived?.slice(0, 16) || '', equipment_used: data.equipment_used || '', notes: data.notes || '', personnel_deployed_ids: data.personnel_deployed.map((p: Personnel) => p.id) });
        } else {
          setExistingLog(null);
          setLogForm({ time_dispatched: '', time_arrived: '', equipment_used: '', notes: '', personnel_deployed_ids: [] });
        }
      }
    } catch {}
  };

  const handleSaveLog = async () => {
    if (!logReport) return;
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`https://firebackend-tsi7.onrender.com/api/station/response-log/${logReport.id}/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(logForm),
      });
      setShowLogModal(false);
    } catch {}
  };

  const togglePersonnel = (id: number) => setLogForm(f => ({
    ...f,
    personnel_deployed_ids: f.personnel_deployed_ids.includes(id)
      ? f.personnel_deployed_ids.filter(p => p !== id)
      : [...f.personnel_deployed_ids, id],
  }));

  const updateStatus = async (id: number, newStatus: string, notes = '') => {
    try {
      const token = localStorage.getItem('access_token');
      const body: any = { status: newStatus };
      if (newStatus === 'resolved') body.resolution_notes = notes;
      const res = await fetch(`https://firebackend-tsi7.onrender.com/api/station/emergency-reports/${id}/`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        fetchReports();
        if (selectedReport?.id === id) setSelectedReport({ ...selectedReport, status: newStatus });
      }
    } catch {}
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    if (newStatus === 'resolved') {
      setResolveNotes('');
      setResolveModal({ id });
    } else {
      updateStatus(id, newStatus);
    }
  };

  const handleUpdateAlarm = async (id: number, alarm_level: string) => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`https://firebackend-tsi7.onrender.com/api/station/emergency-reports/${id}/`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ alarm_level: alarm_level || null }),
      });
      fetchReports();
      if (selectedReport?.id === id) setSelectedReport(r => r ? { ...r, alarm_level: alarm_level || null } : r);
    } catch {}
  };

  const sendLocation = async (report: EmergencyReport) => {
    if (!navigator.geolocation) return alert('Geolocation not supported.');
    setSendingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const token = localStorage.getItem('access_token');
          const res = await fetch(`https://firebackend-tsi7.onrender.com/api/station/emergency-reports/${report.id}/`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude: parseFloat(pos.coords.latitude.toFixed(6)), longitude: parseFloat(pos.coords.longitude.toFixed(6)) }),
          });
          if (res.ok) {
            fetchReports();
            setSelectedReport(r => r ? { ...r, latitude: pos.coords.latitude, longitude: pos.coords.longitude } : r);
          } else {
            const err = await res.json();
            alert('Failed to save location: ' + JSON.stringify(err));
          }
        } catch (e) {
          alert('Error saving location. Please try again.');
        }
        setSendingLocation(false);
      },
      () => { alert('Unable to get location. Please enable location services.'); setSendingLocation(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const confirmResolve = async () => {
    if (!resolveModal) return;
    await updateStatus(resolveModal.id, 'resolved', resolveNotes);
    setResolveModal(null);
    setResolveNotes('');
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('https://firebackend-tsi7.onrender.com/api/station/emergency-reports/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, latitude: formData.latitude ? parseFloat(formData.latitude) : null, longitude: formData.longitude ? parseFloat(formData.longitude) : null }),
      });
      if (res.ok) {
        fetchReports(); setShowCreateModal(false);
        setFormData({ title: '', description: '', location: '', latitude: '', longitude: '', priority: 'medium', contact_number: '' });
      }
    } catch {}
  };

  const filteredReports = reports.filter(r => {
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.location.toLowerCase().includes(search.toLowerCase());
    const matchPriority = !filterPriority || r.priority === filterPriority;
    const matchFrom = !filterFrom || new Date(r.created_at) >= new Date(filterFrom);
    const matchTo = !filterTo || new Date(r.created_at) <= new Date(filterTo + 'T23:59:59');
    return matchStatus && matchSearch && matchPriority && matchFrom && matchTo;
  });

  const modalBg = { background: '#1a0808', border: '1px solid rgba(239,68,68,0.25)' };
  const labelCls = 'block text-xs font-bold uppercase tracking-widest mb-1.5';

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="text-2xl animate-pulse">🔥</span>
      <span className="ml-3 text-gray-400">Loading...</span>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-white font-black text-xl uppercase tracking-widest">Emergency Reports</h1>
        <button onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
          style={{ background: 'rgba(220,38,38,0.2)', color: '#f87171', border: '1px solid rgba(220,38,38,0.4)' }}>
          + Create Report
        </button>
      </div>

      {/* Filter bar */}
      <div className="rounded-xl p-4 mb-4 flex flex-wrap gap-3" style={{ background: 'rgba(30,10,10,0.95)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <input type="text" placeholder="Search title or location..." value={search} onChange={e => setSearch(e.target.value)}
          className={`${inputCls} w-full`} style={inputStyle} />
        <div className="flex flex-wrap gap-3 w-full">
          {[
            { value: filterStatus, onChange: (v: string) => setFilterStatus(v), options: [['all','All Status'],['pending','Pending'],['responding','Responding'],['resolved','Resolved']] },
            { value: filterPriority, onChange: (v: string) => setFilterPriority(v), options: [['','All Priority'],['critical','Critical'],['high','High'],['medium','Medium'],['low','Low']] },
          ].map((sel, i) => (
            <select key={i} value={sel.value} onChange={e => sel.onChange(e.target.value)}
              className="flex-1 min-w-[120px] rounded-lg px-3 py-2 text-sm outline-none"
              style={inputStyle}>
              {sel.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
          <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} className="flex-1 min-w-[130px] rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} />
          <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} className="flex-1 min-w-[130px] rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} />
          {(search || filterStatus !== 'all' || filterPriority || filterFrom || filterTo) && (
            <button onClick={() => { setSearch(''); setFilterStatus('all'); setFilterPriority(''); setFilterFrom(''); setFilterTo(''); }}
              className="px-3 py-2 rounded-lg text-sm transition-colors" style={{ color: '#f87171', background: 'rgba(220,38,38,0.1)' }}>
              Clear
            </button>
          )}
          <span className="text-sm self-center" style={{ color: '#6b7280' }}>{filteredReports.length} result{filteredReports.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {filteredReports.length === 0 ? (
          <p className="text-center py-12 text-gray-600">No reports found</p>
        ) : filteredReports.map(r => (
          <div key={r.id} className="rounded-xl p-4" style={{ background: 'rgba(30,10,10,0.95)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div className="flex justify-between items-start mb-2">
              <p className="text-white font-bold text-sm flex-1 pr-2">{r.title}</p>
              <span className="px-2 py-0.5 rounded text-xs font-bold capitalize shrink-0" style={priorityBadge(r.priority)}>{r.priority}</span>
            </div>
            <p className="text-xs mb-1" style={{ color: '#9ca3af' }}>📍 {r.location}</p>
            <p className="text-xs mb-3" style={{ color: '#6b7280' }}>👤 {r.reported_by_name} · {new Date(r.created_at).toLocaleDateString()}</p>
            <div className="flex items-center justify-between">
              <select value={r.status} onChange={e => handleStatusChange(r.id, e.target.value)}
                className="px-2 py-1 rounded text-xs font-bold capitalize outline-none"
                style={statusStyle(r.status)}>
                <option value="pending">Pending</option>
                <option value="responding">Responding</option>
                <option value="resolved">Resolved</option>
              </select>
              <div className="flex gap-3">
                <button onClick={() => setSelectedReport(r)} className="text-xs font-bold" style={{ color: '#60a5fa' }}>View</button>
                {r.status !== 'pending' && (
                  <button onClick={() => openLogModal(r)} className="text-xs font-bold" style={{ color: '#f97316' }}>📋 Log</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl overflow-hidden" style={{ background: 'rgba(30,10,10,0.95)', border: '1px solid rgba(239,68,68,0.2)' }}>
        {filteredReports.length === 0 ? (
          <p className="text-center py-12 text-gray-600">No reports found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
                  {['Title','Location','Priority','Status','Reported By','Date','Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-black uppercase tracking-widest" style={{ color: '#6b7280' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredReports.map(r => (
                  <tr key={r.id} className="transition-colors hover:bg-red-950/20" style={{ borderBottom: '1px solid rgba(239,68,68,0.08)' }}>
                    <td className="px-5 py-3 text-white text-sm font-medium whitespace-nowrap">{r.title}</td>
                    <td className="px-5 py-3 text-sm whitespace-nowrap" style={{ color: '#9ca3af' }}>{r.location}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-xs font-bold capitalize" style={priorityBadge(r.priority)}>{r.priority}</span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <select value={r.status} onChange={e => handleStatusChange(r.id, e.target.value)}
                        className="px-2 py-0.5 rounded text-xs font-bold capitalize outline-none"
                        style={statusStyle(r.status)}>
                        <option value="pending">Pending</option>
                        <option value="responding">Responding</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="px-5 py-3 text-sm whitespace-nowrap" style={{ color: '#9ca3af' }}>{r.reported_by_name}</td>
                    <td className="px-5 py-3 text-sm whitespace-nowrap" style={{ color: '#9ca3af' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3 whitespace-nowrap flex items-center gap-3">
                      <button onClick={() => setSelectedReport(r)} className="text-xs font-bold transition-colors" style={{ color: '#60a5fa' }}>View</button>
                      {r.status !== 'pending' && (
                        <button onClick={() => openLogModal(r)} className="text-xs font-bold transition-colors" style={{ color: '#f97316' }}>📋 Log</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6" style={modalBg}>
            <div className="flex justify-between items-start mb-5">
              <h2 className="text-white font-black text-lg">{selectedReport.title}</h2>
              <button onClick={() => setSelectedReport(null)} className="text-gray-500 hover:text-white text-2xl leading-none">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <p className={labelCls} style={{ color: '#f97316' }}>Description</p>
                <p className="text-gray-300 text-sm">{selectedReport.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[['Location', selectedReport.location], ['Contact', selectedReport.contact_number]].map(([l, v]) => (
                  <div key={l}><p className={labelCls} style={{ color: '#f97316' }}>{l}</p><p className="text-gray-300 text-sm">{v}</p></div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={labelCls} style={{ color: '#f97316' }}>Priority</p>
                  <span className="px-2 py-0.5 rounded text-xs font-bold capitalize" style={priorityBadge(selectedReport.priority)}>{selectedReport.priority}</span>
                </div>
                <div>
                  <p className={labelCls} style={{ color: '#f97316' }}>Status</p>
                  <span className="px-2 py-0.5 rounded text-xs font-bold capitalize" style={statusStyle(selectedReport.status)}>{selectedReport.status}</span>
                </div>
              </div>
              <div>
                <p className={labelCls} style={{ color: '#f97316' }}>🚨 Alarm Level</p>
                <select
                  value={selectedReport.alarm_level || ''}
                  onChange={e => handleUpdateAlarm(selectedReport.id, e.target.value)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg outline-none cursor-pointer"
                  style={selectedReport.alarm_level
                    ? { color: alarmCfg[selectedReport.alarm_level]?.color, background: alarmCfg[selectedReport.alarm_level]?.bg, border: `1px solid ${alarmCfg[selectedReport.alarm_level]?.color}40` }
                    : { color: '#6b7280', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(239,68,68,0.2)' }
                  }>
                  <option value="">Not Set</option>
                  {['1st','2nd','3rd','4th','5th','task_force_alpha','task_force_bravo','task_force_charlie','task_force_delta','general_alarm'].map(v => (
                    <option key={v} value={v}>{alarmCfg[v]?.label}</option>
                  ))}
                </select>
              </div>
              {[['Reported By', selectedReport.reported_by_name], ['Date Reported', new Date(selectedReport.created_at).toLocaleString()]].map(([l, v]) => (
                <div key={l}><p className={labelCls} style={{ color: '#f97316' }}>{l}</p><p className="text-gray-300 text-sm">{v}</p></div>
              ))}
              {selectedReport.image && (
                <div>
                  <p className={labelCls} style={{ color: '#f97316' }}>Image</p>
                  <img src={selectedReport.image} alt="Report" className="w-full rounded-lg" />
                </div>
              )}
              {selectedReport.status === 'responding' && (
                <div>
                  <p className={labelCls} style={{ color: '#f97316' }}>Fire Location</p>
                  {selectedReport.latitude && selectedReport.longitude ? (
                    <p className="text-green-400 text-sm font-bold">✅ Location sent: {Number(selectedReport.latitude).toFixed(5)}, {Number(selectedReport.longitude).toFixed(5)}</p>
                  ) : (
                    <p className="text-gray-500 text-sm mb-2">No location set yet.</p>
                  )}
                  <button onClick={() => sendLocation(selectedReport)} disabled={sendingLocation}
                    className="mt-2 px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 transition-all"
                    style={{ background: 'rgba(37,99,235,0.2)', color: '#60a5fa', border: '1px solid rgba(37,99,235,0.4)' }}>
                    {sendingLocation ? '📡 Getting location...' : '📍 Send My Location'}
                  </button>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-5">
              <button onClick={() => setSelectedReport(null)} className="px-4 py-2 rounded-lg text-sm font-bold"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Response Log Modal */}
      {showLogModal && logReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6" style={modalBg}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-black text-base">📋 Response Log — {logReport.title}</h2>
              <button onClick={() => setShowLogModal(false)} className="text-gray-500 hover:text-white text-2xl leading-none">×</button>
            </div>
            {existingLog && <p className="text-xs font-bold mb-3" style={{ color: '#4ade80' }}>✅ Existing log found — you can update it below.</p>}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[['Time Dispatched', 'time_dispatched'], ['Time Arrived', 'time_arrived']].map(([l, k]) => (
                <div key={k}>
                  <label className={labelCls} style={{ color: '#f97316' }}>{l}</label>
                  <input type="datetime-local" value={(logForm as any)[k]} onChange={e => setLogForm(f => ({ ...f, [k]: e.target.value }))}
                    className={inputCls} style={inputStyle} />
                </div>
              ))}
            </div>
            <div className="mb-4">
              <label className={labelCls} style={{ color: '#f97316' }}>Equipment Used</label>
              <input type="text" value={logForm.equipment_used} onChange={e => setLogForm(f => ({ ...f, equipment_used: e.target.value }))}
                placeholder="e.g. Fire truck, Hose, Ladder" className={inputCls} style={inputStyle} />
            </div>
            <div className="mb-4">
              <label className={labelCls} style={{ color: '#f97316' }}>Personnel Deployed</label>
              <div className="rounded-lg p-3 max-h-40 overflow-y-auto grid grid-cols-2 gap-2" style={{ background: 'rgba(15,5,5,0.8)', border: '1px solid rgba(239,68,68,0.2)' }}>
                {personnel.length === 0 ? <p className="text-gray-600 text-sm col-span-2">No personnel found</p> : personnel.map(p => (
                  <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: '#d1d5db' }}>
                    <input type="checkbox" checked={logForm.personnel_deployed_ids.includes(p.id)} onChange={() => togglePersonnel(p.id)} className="accent-orange-500" />
                    {p.first_name} {p.middle_initial ? p.middle_initial + '. ' : ''}{p.last_name} — {p.rank_display}
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-5">
              <label className={labelCls} style={{ color: '#f97316' }}>Notes</label>
              <textarea value={logForm.notes} onChange={e => setLogForm(f => ({ ...f, notes: e.target.value }))} rows={3}
                placeholder="Additional notes..." className={inputCls} style={inputStyle} />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowLogModal(false)} className="px-4 py-2 rounded-lg text-sm font-bold"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>Cancel</button>
              <button onClick={handleSaveLog} className="px-4 py-2 rounded-lg text-sm font-bold"
                style={{ background: 'rgba(249,115,22,0.2)', color: '#f97316', border: '1px solid rgba(249,115,22,0.4)' }}>Save Log</button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {resolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl p-6" style={modalBg}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-black text-base">✅ Mark as Resolved</h2>
              <button onClick={() => setResolveModal(null)} className="text-gray-500 hover:text-white text-2xl leading-none">×</button>
            </div>
            <p className="text-gray-400 text-sm mb-4">Please provide resolution notes before marking this report as resolved.</p>
            <div className="mb-5">
              <label className={labelCls} style={{ color: '#f97316' }}>Resolution Notes *</label>
              <textarea
                value={resolveNotes}
                onChange={e => setResolveNotes(e.target.value)}
                rows={4}
                placeholder="Describe the outcome — fire extinguished, damage assessment, casualties, actions taken..."
                className={inputCls}
                style={inputStyle}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setResolveModal(null)} className="px-4 py-2 rounded-lg text-sm font-bold"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>Cancel</button>
              <button onClick={confirmResolve} disabled={!resolveNotes.trim()} className="px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-40"
                style={{ background: 'rgba(22,163,74,0.2)', color: '#4ade80', border: '1px solid rgba(22,163,74,0.4)' }}>Confirm Resolved</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6" style={modalBg}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-white font-black text-base">Create Emergency Report</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-white text-2xl leading-none">×</button>
            </div>
            <form onSubmit={handleCreateReport} className="space-y-4">
              {[['Title','text','title'],['Location','text','location']].map(([l,t,k]) => (
                <div key={k}>
                  <label className={labelCls} style={{ color: '#f97316' }}>{l}</label>
                  <input type={t} value={(formData as any)[k]} onChange={e => setFormData(f => ({ ...f, [k]: e.target.value }))}
                    className={inputCls} style={inputStyle} required />
                </div>
              ))}
              <div>
                <label className={labelCls} style={{ color: '#f97316' }}>Description</label>
                <textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                  rows={3} className={inputCls} style={inputStyle} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[['Latitude','latitude'],['Longitude','longitude']].map(([l,k]) => (
                  <div key={k}>
                    <label className={labelCls} style={{ color: '#f97316' }}>{l} (Optional)</label>
                    <input type="number" step="any" value={(formData as any)[k]} onChange={e => setFormData(f => ({ ...f, [k]: e.target.value }))}
                      className={inputCls} style={inputStyle} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} style={{ color: '#f97316' }}>Priority</label>
                  <select value={formData.priority} onChange={e => setFormData(f => ({ ...f, priority: e.target.value }))}
                    className={inputCls} style={inputStyle} required>
                    {['low','medium','high','critical'].map(v => <option key={v} value={v} className="bg-gray-900">{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls} style={{ color: '#f97316' }}>Contact Number</label>
                  <input type="text" value={formData.contact_number} onChange={e => setFormData(f => ({ ...f, contact_number: e.target.value }))}
                    className={inputCls} style={inputStyle} required />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-lg text-sm font-bold"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg text-sm font-bold"
                  style={{ background: 'rgba(220,38,38,0.25)', color: '#f87171', border: '1px solid rgba(220,38,38,0.4)' }}>Create Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

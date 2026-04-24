'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

function MapPicker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) { onPick(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

const pinIcon = typeof window !== 'undefined' ? new L.DivIcon({
  html: '<div style="font-size:28px;line-height:1;">📍</div>',
  iconSize: [32, 32], iconAnchor: [16, 32], className: ''
}) : undefined;

const cardStyle = {
  background: 'linear-gradient(135deg, rgba(30,10,10,0.95), rgba(20,5,5,0.98))',
  border: '1px solid rgba(239,68,68,0.2)',
};

const statusCfg: Record<string, { color: string; bg: string }> = {
  pending:    { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
  responding: { color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
  resolved:   { color: '#4ade80', bg: 'rgba(74,222,128,0.15)' },
};
const priorityCfg: Record<string, { color: string; bg: string }> = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  high:     { color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
  medium:   { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
  low:      { color: '#4ade80', bg: 'rgba(74,222,128,0.15)' },
};

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

const inputCls = "px-3 py-2 rounded-lg text-white text-sm bg-transparent focus:outline-none transition-all";
const inputSty = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(239,68,68,0.25)' };

export default function EmergencyReportsManagement() {
  const [reports, setReports]           = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [responseLog, setResponseLog]   = useState<any>(null);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterFrom, setFilterFrom]     = useState('');
  const [filterTo, setFilterTo]         = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm]           = useState({ title: '', description: '', barangay: '', location: '', latitude: '', longitude: '' });
  const [addLoading, setAddLoading]     = useState(false);
  const [pinPos, setPinPos]             = useState<[number,number] | null>(null);
  const [mapMounted, setMapMounted]     = useState(false);

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 10000);
    const token = localStorage.getItem('access_token');
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/emergency-reports/mark_all_read/`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { setMapMounted(true); }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/emergency-reports/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setReports(await res.json());
    } finally { setLoading(false); }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    const token = localStorage.getItem('access_token');
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/emergency-reports/${id}/`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchReports();
  };

  const handleUpdateAlarm = async (id: number, alarm_level: string) => {
    const token = localStorage.getItem('access_token');
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/emergency-reports/${id}/`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ alarm_level: alarm_level || null }),
    });
    fetchReports();
    if (selectedReport?.id === id) setSelectedReport((r: any) => ({ ...r, alarm_level: alarm_level || null }));
  };

  const handleAddEmergency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinPos) { alert('Please click on the map to set the location.'); return; }
    setAddLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const body = {
        title: addForm.title,
        description: addForm.description,
        location: `${addForm.location}, Brgy. ${addForm.barangay}, Cebu City`,
        latitude: parseFloat(pinPos[0].toFixed(6)),
        longitude: parseFloat(pinPos[1].toFixed(6)),
        priority: 'high',
        status: 'responding',
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/emergency-reports/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowAddModal(false);
        setAddForm({ title: '', description: '', barangay: '', location: '', latitude: '', longitude: '' });
        setPinPos(null);
        fetchReports();
      } else {
        const d = await res.json();
        alert(JSON.stringify(d));
      }
    } finally { setAddLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this report?')) return;
    const token = localStorage.getItem('access_token');
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/emergency-reports/${id}/`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    });
    fetchReports();
  };

  const viewDetails = async (report: any) => {
    setSelectedReport(report); setResponseLog(null);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/response-logs/?report=${report.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { const d = await res.json(); setResponseLog(d.length > 0 ? d[0] : null); }
    } catch {}
  };

  const filtered = reports.filter(r => {
    const q = search.toLowerCase();
    return (!search || r.title.toLowerCase().includes(q) || r.location.toLowerCase().includes(q))
      && (!filterStatus   || r.status   === filterStatus)
      && (!filterPriority || r.priority === filterPriority)
      && (!filterFrom || new Date(r.created_at) >= new Date(filterFrom))
      && (!filterTo   || new Date(r.created_at) <= new Date(filterTo + 'T23:59:59'));
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-4xl animate-bounce">🚨</div></div>;

  return (
    <div className="space-y-4">
      <style>{`
        .tbl-row { transition: background 0.15s ease; }
        .tbl-row:hover { background: rgba(239,68,68,0.06) !important; }
        select option { background: #1a0808; color: white; }
        .input-f:focus { border-color: rgba(251,146,60,0.6) !important; }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-orange-800">Emergency Reports</h1>
          <p className="text-gray-500 text-xs mt-0.5">{filtered.length} of {reports.length} reports</p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="text-sm font-bold px-4 py-2 rounded-lg transition-colors"
          style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
          + Add Emergency
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl p-4 flex flex-wrap gap-3 items-center" style={cardStyle}>
        <input type="text" placeholder="🔍 Search title or location..." value={search}
          onChange={e => setSearch(e.target.value)}
          className={`${inputCls} input-f flex-1 min-w-[180px]`} style={inputSty} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className={`${inputCls} input-f`} style={inputSty}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="responding">Responding</option>
          <option value="resolved">Resolved</option>
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
          className={`${inputCls} input-f`} style={inputSty}>
          <option value="">All Priority</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)}
          className={`${inputCls} input-f`} style={{ ...inputSty, colorScheme: 'dark' }} />
        <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)}
          className={`${inputCls} input-f`} style={{ ...inputSty, colorScheme: 'dark' }} />
        {(search || filterStatus || filterPriority || filterFrom || filterTo) && (
          <button onClick={() => { setSearch(''); setFilterStatus(''); setFilterPriority(''); setFilterFrom(''); setFilterTo(''); }}
            className="text-xs text-red-400 hover:text-red-300 px-3 py-2 rounded-lg transition-colors"
            style={{ background: 'rgba(239,68,68,0.1)' }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={cardStyle}>
        <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
          <table className="w-full">
            <thead style={{ background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
              <tr>
                {['Title', 'Location', 'Priority', 'Status', 'Reported By', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-600">No reports found.</td></tr>
              ) : filtered.map(r => {
                const s = statusCfg[r.status] || statusCfg.pending;
                const p = priorityCfg[r.priority] || priorityCfg.medium;
                return (
                  <tr key={r.id} className="tbl-row" style={{ borderBottom: '1px solid rgba(239,68,68,0.08)' }}>
                    <td className="px-4 py-3 text-white text-sm font-semibold max-w-[160px] truncate">{r.title}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm max-w-[140px] truncate">{r.location}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2 py-1 rounded-full"
                        style={{ color: p.color, background: p.bg }}>{r.priority}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select value={r.status} onChange={e => handleUpdateStatus(r.id, e.target.value)}
                        className="text-xs font-bold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none"
                        style={{ color: s.color, background: s.bg }}>
                        <option value="pending">Pending</option>
                        <option value="responding">Responding</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{r.reported_by_name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => viewDetails(r)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                          style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}>
                          View
                        </button>
                        <button onClick={() => handleDelete(r.id)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                          style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Emergency Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{ background: '#120505', border: '1px solid rgba(239,68,68,0.35)', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
              <h2 className="text-white font-black text-lg">🚨 Add Active Emergency</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white text-xl">✕</button>
            </div>
            <form onSubmit={handleAddEmergency} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#f97316' }}>Title *</label>
                <input required value={addForm.title} onChange={e => setAddForm({ ...addForm, title: e.target.value })}
                  placeholder="Brief description of the emergency"
                  className={inputCls} style={{ ...inputSty, width: '100%' }} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#f97316' }}>Description *</label>
                <textarea required value={addForm.description} onChange={e => setAddForm({ ...addForm, description: e.target.value })}
                  placeholder="Provide details about the emergency..."
                  rows={3} className={inputCls} style={{ ...inputSty, width: '100%', resize: 'none' }} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#f97316' }}>Barangay *</label>
                <select required value={addForm.barangay} onChange={e => setAddForm({ ...addForm, barangay: e.target.value })}
                  className={inputCls} style={{ ...inputSty, width: '100%' }}>
                  <option value="">Select Barangay</option>
                  {CEBU_BARANGAYS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#f97316' }}>Street / Address *</label>
                <input required value={addForm.location} onChange={e => setAddForm({ ...addForm, location: e.target.value })}
                  placeholder="Street name or landmark"
                  className={inputCls} style={{ ...inputSty, width: '100%' }} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#f97316' }}>
                  📍 Pin Location on Map * {pinPos && <span style={{ color: '#4ade80' }}>— ({pinPos[0].toFixed(5)}, {pinPos[1].toFixed(5)})</span>}
                </label>
                <p className="text-xs text-gray-500 mb-2">Click on the map to drop a pin at the exact location of the emergency.</p>
                {mapMounted && (
                  <div style={{ height: 280, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <MapContainer center={[10.3157, 123.8854]} zoom={13} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <MapPicker onPick={(lat, lng) => setPinPos([lat, lng])} />
                      {pinPos && pinIcon && <Marker position={pinPos} icon={pinIcon} />}
                    </MapContainer>
                  </div>
                )}
              </div>
              <button type="submit" disabled={addLoading || !pinPos}
                className="w-full py-3 rounded-lg font-bold text-white text-sm uppercase tracking-widest transition-all"
                style={{ background: addLoading || !pinPos ? 'rgba(239,68,68,0.3)' : 'linear-gradient(135deg,#dc2626,#ea580c)', cursor: addLoading || !pinPos ? 'not-allowed' : 'pointer' }}>
                {addLoading ? 'Submitting...' : '🚨 Submit Emergency'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setSelectedReport(null); }}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{ background: '#120505', border: '1px solid rgba(239,68,68,0.35)', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
              <h2 className="text-white font-black text-lg">Report Details</h2>
              <button onClick={() => setSelectedReport(null)} className="text-gray-500 hover:text-white text-xl transition-colors">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {[
                ['Title', selectedReport.title],
                ['Description', selectedReport.description],
                ['Location', selectedReport.location],
                ['Contact', selectedReport.contact_number],
                ['Reported By', selectedReport.reported_by_name],
                ['Date', new Date(selectedReport.created_at).toLocaleString()],
              ].map(([label, val]) => (
                <div key={label as string}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#f97316' }}>{label}</p>
                  <p className="text-gray-300 text-sm">{val}</p>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#f97316' }}>Priority</p>
                  <span className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{ color: priorityCfg[selectedReport.priority]?.color, background: priorityCfg[selectedReport.priority]?.bg }}>
                    {selectedReport.priority}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#f97316' }}>Status</p>
                  <span className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{ color: statusCfg[selectedReport.status]?.color, background: statusCfg[selectedReport.status]?.bg }}>
                    {selectedReport.status}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#f97316' }}>🚨 Alarm Level</p>
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
              {selectedReport.image && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#f97316' }}>Image</p>
                  <img src={selectedReport.image} alt="Report" className="w-full rounded-xl" style={{ border: '1px solid rgba(239,68,68,0.2)' }} />
                </div>
              )}
              {selectedReport.resolution_notes && (
                <div className="rounded-xl p-4" style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.25)' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#4ade80' }}>✅ Resolution Notes</p>
                  <p className="text-gray-300 text-sm">{selectedReport.resolution_notes}</p>
                </div>
              )}
              {/* Response Log */}
              <div className="pt-4" style={{ borderTop: '1px solid rgba(239,68,68,0.15)' }}>
                <p className="text-white font-black mb-3">📋 Response Log</p>
                {responseLog ? (
                  <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    {responseLog.logged_by_station && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-1 text-gray-500">Responded By</p>
                        <p className="text-white font-bold text-sm">🚒 {responseLog.logged_by_station}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      {[['Dispatched', responseLog.time_dispatched], ['Arrived', responseLog.time_arrived]].map(([l, v]) => (
                        <div key={l as string}>
                          <p className="text-xs font-bold uppercase tracking-widest mb-1 text-gray-500">{l}</p>
                          <p className="text-gray-300 text-sm">{v ? new Date(v as string).toLocaleString() : '—'}</p>
                        </div>
                      ))}
                    </div>
                    {responseLog.time_dispatched && responseLog.time_arrived && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-1 text-gray-500">Response Time</p>
                        <p className="font-black" style={{ color: '#4ade80' }}>
                          {Math.round((new Date(responseLog.time_arrived).getTime() - new Date(responseLog.time_dispatched).getTime()) / 60000)} minutes
                        </p>
                      </div>
                    )}
                    {responseLog.equipment_used && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-1 text-gray-500">Equipment</p>
                        <p className="text-gray-300 text-sm">{responseLog.equipment_used}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest mb-2 text-gray-500">Personnel ({responseLog.personnel_deployed?.length || 0})</p>
                      <div className="flex flex-wrap gap-2">
                        {responseLog.personnel_deployed?.length > 0
                          ? responseLog.personnel_deployed.map((p: any) => (
                              <span key={p.id} className="text-xs px-2 py-1 rounded-full text-gray-300"
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                {p.first_name} {p.middle_initial ? p.middle_initial + '. ' : ''}{p.last_name} — {p.rank_display}
                              </span>
                            ))
                          : <p className="text-gray-600 text-sm">None recorded</p>}
                      </div>
                    </div>
                    {responseLog.notes && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-1 text-gray-500">Notes</p>
                        <p className="text-gray-300 text-sm">{responseLog.notes}</p>
                      </div>
                    )}
                  </div>
                ) : <p className="text-gray-600 text-sm">No response log recorded yet.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


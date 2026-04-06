'use client';
import { useEffect, useState } from 'react';

const cardStyle = {
  background: 'linear-gradient(135deg, rgba(30,10,10,0.95), rgba(20,5,5,0.98))',
  border: '1px solid rgba(239,68,68,0.2)',
};

export default function AuditLogsPage() {
  const [logs, setLogs]       = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch('http://localhost:8000/api/admin/audit-logs/', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { setLogs(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = logs.filter((l: any) =>
    !search ||
    l.username?.toLowerCase().includes(search.toLowerCase()) ||
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.target?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-4xl animate-bounce">🔍</div></div>;

  return (
    <div className="space-y-4">
      <style>{`
        .tbl-row:hover { background: rgba(239,68,68,0.06) !important; }
        .input-f:focus { border-color: rgba(251,146,60,0.6) !important; outline: none; }
      `}</style>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-orange-800">Audit Logs</h1>
          <p className="text-gray-500 text-xs mt-0.5">{filtered.length} of {logs.length} entries</p>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-xl p-4 flex gap-3 items-center" style={cardStyle}>
        <input type="text" placeholder="🔍 Search by user, action, or target..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="input-f flex-1 px-3 py-2.5 rounded-lg text-white text-sm transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(239,68,68,0.25)' }} />
        {search && (
          <button onClick={() => setSearch('')}
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
            <thead className="sticky top-0" style={{ background: 'rgba(15,5,5,0.98)', borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
              <tr>
                {['User', 'Action', 'Target', 'Timestamp'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-600">No audit logs found.</td></tr>
              ) : filtered.map((log: any) => (
                <tr key={log.id} className="tbl-row transition-colors" style={{ borderBottom: '1px solid rgba(239,68,68,0.07)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                        style={{ background: 'rgba(239,68,68,0.2)', color: '#f97316' }}>
                        {log.username?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white text-sm font-semibold">{log.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-300 text-sm">{log.action}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-500 text-sm">{log.target || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-600 text-xs">{new Date(log.timestamp).toLocaleString()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

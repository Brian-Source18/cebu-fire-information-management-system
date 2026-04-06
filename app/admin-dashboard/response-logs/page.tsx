'use client';
import { useEffect, useState } from 'react';

const cardStyle = {
  background: 'linear-gradient(135deg, rgba(30,10,10,0.95), rgba(20,5,5,0.98))',
  border: '1px solid rgba(239,68,68,0.2)',
};

export default function ResponseLogsPage() {
  const [logs, setLogs]       = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch('http://localhost:8000/api/admin/response-logs/', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { setLogs(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const calcMins = (d: string, a: string) =>
    Math.round((new Date(a).getTime() - new Date(d).getTime()) / 60000);

  const filtered = logs.filter(l =>
    !search ||
    String(l.report).includes(search) ||
    l.logged_by_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-4xl animate-bounce">📋</div></div>;

  return (
    <div className="space-y-4">
      <style>{`
        .input-f:focus { border-color: rgba(251,146,60,0.6) !important; outline: none; }
      `}</style>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-orange-800">Response Logs</h1>
          <p className="text-gray-500 text-xs mt-0.5">{filtered.length} log{filtered.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-xl p-4" style={cardStyle}>
        <input type="text" placeholder="🔍 Search by report # or logged by..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="input-f w-full px-3 py-2.5 rounded-lg text-white text-sm transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(239,68,68,0.25)' }} />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={cardStyle}>
          <div className="text-4xl mb-3">📭</div>
          <p className="text-gray-500">No response logs recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((log: any) => {
            const hasTimes = log.time_dispatched && log.time_arrived;
            const mins = hasTimes ? calcMins(log.time_dispatched, log.time_arrived) : null;
            const fast = mins !== null && mins <= 10;
            return (
              <div key={log.id} className="rounded-2xl overflow-hidden" style={cardStyle}>
                {/* Top accent */}
                <div className="h-0.5" style={{ background: `linear-gradient(to right, ${fast ? '#4ade80' : '#f97316'}, transparent)` }} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-white font-black">Report #{log.report}</h3>
                      <p className="text-gray-500 text-xs mt-0.5">
                        Logged by <span className="text-orange-400">{log.logged_by_name}</span> · {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                    {mins !== null && (
                      <span className="shrink-0 text-sm font-black px-3 py-1.5 rounded-full"
                        style={{ color: fast ? '#4ade80' : '#fbbf24', background: fast ? 'rgba(74,222,128,0.15)' : 'rgba(251,191,36,0.15)', border: `1px solid ${fast ? 'rgba(74,222,128,0.3)' : 'rgba(251,191,36,0.3)'}` }}>
                        ⏱ {mins} min{mins !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {[['🚀 Dispatched', log.time_dispatched], ['📍 Arrived', log.time_arrived]].map(([l, v]) => (
                      <div key={l as string} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(239,68,68,0.12)' }}>
                        <p className="text-gray-500 text-xs mb-1">{l}</p>
                        <p className="text-white text-sm font-semibold">{v ? new Date(v as string).toLocaleString() : '—'}</p>
                      </div>
                    ))}
                  </div>

                  {log.equipment_used && (
                    <div className="mb-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Equipment Used</p>
                      <p className="text-gray-300 text-sm">{log.equipment_used}</p>
                    </div>
                  )}

                  <div className="mb-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                      Personnel Deployed ({log.personnel_deployed?.length || 0})
                    </p>
                    {log.personnel_deployed?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {log.personnel_deployed.map((p: any) => (
                          <span key={p.id} className="text-xs px-2.5 py-1 rounded-full text-gray-300"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
                            {p.first_name} {p.middle_initial ? p.middle_initial + '. ' : ''}{p.last_name} — {p.rank_display}
                          </span>
                        ))}
                      </div>
                    ) : <p className="text-gray-600 text-sm">None recorded</p>}
                  </div>

                  {log.notes && (
                    <div className="pt-3" style={{ borderTop: '1px solid rgba(239,68,68,0.1)' }}>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Notes</p>
                      <p className="text-gray-400 text-sm">{log.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

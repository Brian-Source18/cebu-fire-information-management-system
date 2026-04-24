'use client';

import { useEffect, useState } from 'react';

const statusCfg: Record<string, { bg: string; color: string; label: string }> = {
  on_duty:  { bg: 'rgba(22,163,74,0.2)',   color: '#4ade80', label: 'On Duty' },
  on_leave: { bg: 'rgba(217,119,6,0.2)',   color: '#fbbf24', label: 'On Leave' },
  absent:   { bg: 'rgba(239,68,68,0.2)',   color: '#f87171', label: 'Absent' },
  inactive: { bg: 'rgba(107,114,128,0.2)', color: '#9ca3af', label: 'Inactive' },
  active:   { bg: 'rgba(22,163,74,0.2)',   color: '#4ade80', label: 'On Duty' },
};

const initials = (first: string, last: string) =>
  `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

export default function StationPersonnelPage() {
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const fetchPersonnel = () => {
    const token = localStorage.getItem('access_token');
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/station/personnel/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setPersonnel(data); setLoading(false); });
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    setUpdating(id);
    const token = localStorage.getItem('access_token');
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/station/personnel/${id}/`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setPersonnel(prev => prev.map(p => p.id === id ? { ...p, status: newStatus, status_display: statusCfg[newStatus]?.label || newStatus } : p));
    setUpdating(null);
  };

  const onDutyCount = personnel.filter(p => p.status === 'on_duty' || p.status === 'active').length;
  const onLeaveCount = personnel.filter(p => p.status === 'on_leave').length;
  const absentCount = personnel.filter(p => p.status === 'absent').length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="text-2xl animate-pulse">🔥</span>
      <span className="ml-3 text-gray-400">Loading...</span>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-white font-black text-xl uppercase tracking-widest">Personnel</h1>
        <span className="text-sm px-3 py-1 rounded-full font-bold"
          style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316', border: '1px solid rgba(249,115,22,0.3)' }}>
          {personnel.length} assigned
        </span>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'On Duty',  value: onDutyCount,  color: '#4ade80', bg: 'rgba(22,163,74,0.15)',   icon: '✅' },
          { label: 'On Leave', value: onLeaveCount, color: '#fbbf24', bg: 'rgba(217,119,6,0.15)',   icon: '🏖️' },
          { label: 'Absent',   value: absentCount,  color: '#f87171', bg: 'rgba(239,68,68,0.15)',   icon: '❌' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 flex items-center gap-3"
            style={{ background: 'rgba(30,10,10,0.95)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <span className="text-2xl">{s.icon}</span>
            <div>
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(30,10,10,0.95)', border: '1px solid rgba(239,68,68,0.2)' }}>
        {personnel.length === 0 ? (
          <p className="text-center py-12 text-gray-600">No personnel assigned to your station yet.</p>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[560px]">
            <table className="min-w-full">
              <thead className="sticky top-0 z-10" style={{ background: 'rgba(30,10,10,0.95)' }}>
                <tr style={{ borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
                  {['Personnel', 'Rank', 'Contact', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-black uppercase tracking-widest" style={{ color: '#6b7280' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {personnel.map(p => {
                  const cfg = statusCfg[p.status] || statusCfg.inactive;
                  return (
                    <tr key={p.id} className="transition-colors hover:bg-red-950/20" style={{ borderBottom: '1px solid rgba(239,68,68,0.08)' }}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                            style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316', border: '1px solid rgba(249,115,22,0.3)' }}>
                            {initials(p.first_name, p.last_name)}
                          </div>
                          <span className="text-white font-semibold text-sm">{p.first_name} {p.middle_initial ? p.middle_initial + '. ' : ''}{p.last_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm" style={{ color: '#9ca3af' }}>{p.rank_display}</td>
                      <td className="px-5 py-3 text-sm" style={{ color: '#9ca3af' }}>{p.contact_number || '—'}</td>
                      <td className="px-5 py-3">
                        <select
                          value={p.status}
                          disabled={updating === p.id}
                          onChange={e => handleStatusChange(p.id, e.target.value)}
                          className="text-xs font-bold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none"
                          style={{ color: cfg.color, background: cfg.bg }}>
                          <option value="on_duty">On Duty</option>
                          <option value="on_leave">On Leave</option>
                          <option value="absent">Absent</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

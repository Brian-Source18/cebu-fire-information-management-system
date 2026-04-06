'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

interface StationStats {
  total_reports: number; pending_reports: number; responding_reports: number; resolved_reports: number;
  reports_by_priority: { critical: number; high: number; medium: number; low: number; };
  reports_by_month: any[];
}

const cardStyle = (accent: string) => ({
  background: 'rgba(30,10,10,0.95)',
  border: '1px solid rgba(239,68,68,0.2)',
  borderTop: `3px solid ${accent}`,
});

export default function StationStatistics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://localhost:8000/api/station/statistics/', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setStats(await res.json());
    } catch {}
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="text-2xl animate-pulse">🔥</span>
      <span className="ml-3 text-gray-400">Loading...</span>
    </div>
  );

  const chartOptions = { plugins: { legend: { labels: { color: '#9ca3af' } } } };

  const statusDoughnutData = {
    labels: ['Pending', 'Responding', 'Resolved'],
    datasets: [{ data: [stats?.pending_reports || 0, stats?.responding_reports || 0, stats?.resolved_reports || 0], backgroundColor: ['rgba(217,119,6,0.8)', 'rgba(37,99,235,0.8)', 'rgba(22,163,74,0.8)'], borderWidth: 0 }],
  };

  const priorityBarData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [{ label: 'Reports', data: [stats?.reports_by_priority?.critical || 0, stats?.reports_by_priority?.high || 0, stats?.reports_by_priority?.medium || 0, stats?.reports_by_priority?.low || 0], backgroundColor: ['rgba(220,38,38,0.8)', 'rgba(234,88,12,0.8)', 'rgba(234,179,8,0.8)', 'rgba(107,114,128,0.8)'], borderWidth: 0 }],
  };

  const statCards = [
    { label: 'Total Reports', value: stats?.total_reports ?? 0,     accent: '#6b7280', color: '#d1d5db' },
    { label: 'Pending',       value: stats?.pending_reports ?? 0,   accent: '#d97706', color: '#fbbf24' },
    { label: 'Responding',    value: stats?.responding_reports ?? 0, accent: '#2563eb', color: '#60a5fa' },
    { label: 'Resolved',      value: stats?.resolved_reports ?? 0,  accent: '#16a34a', color: '#4ade80' },
  ];

  const priorityRows = [
    { label: 'Critical', value: stats?.reports_by_priority?.critical || 0, accent: '#dc2626', color: '#f87171' },
    { label: 'High',     value: stats?.reports_by_priority?.high || 0,     accent: '#ea580c', color: '#fb923c' },
    { label: 'Medium',   value: stats?.reports_by_priority?.medium || 0,   accent: '#d97706', color: '#fbbf24' },
    { label: 'Low',      value: stats?.reports_by_priority?.low || 0,      accent: '#6b7280', color: '#9ca3af' },
  ];

  const total = stats?.total_reports || 1;
  const progressRows = [
    { label: 'Resolved',   value: stats?.resolved_reports || 0,   color: '#16a34a' },
    { label: 'Responding', value: stats?.responding_reports || 0, color: '#2563eb' },
    { label: 'Pending',    value: stats?.pending_reports || 0,    color: '#d97706' },
  ];

  const panelStyle = { background: 'rgba(30,10,10,0.95)', border: '1px solid rgba(239,68,68,0.2)' };

  return (
    <div>
      <h1 className="text-white font-black text-xl uppercase tracking-widest mb-5">Station Statistics</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {statCards.map(s => (
          <div key={s.label} className="rounded-xl p-5" style={cardStyle(s.accent)}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#6b7280' }}>{s.label}</p>
            <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl p-5" style={panelStyle}>
          <h2 className="text-white font-black text-sm uppercase tracking-widest mb-4">Reports by Status</h2>
          <div className="flex justify-center">
            <div style={{ width: 240 }}>
              <Doughnut data={statusDoughnutData} options={{ ...chartOptions, responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af' } } } }} />
            </div>
          </div>
        </div>
        <div className="rounded-xl p-5" style={panelStyle}>
          <h2 className="text-white font-black text-sm uppercase tracking-widest mb-4">Reports by Priority</h2>
          <Bar data={priorityBarData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(239,68,68,0.08)' } }, y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(239,68,68,0.08)' } } } }} />
        </div>
      </div>

      {/* Priority breakdown */}
      <div className="rounded-xl p-5 mb-6" style={panelStyle}>
        <h2 className="text-white font-black text-sm uppercase tracking-widest mb-4">Priority Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {priorityRows.map(r => (
            <div key={r.label} className="pl-4 rounded-r-lg" style={{ borderLeft: `3px solid ${r.accent}` }}>
              <p className="text-xs text-gray-500 mb-1">{r.label}</p>
              <p className="text-2xl font-black" style={{ color: r.color }}>{r.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl p-5" style={panelStyle}>
          <h2 className="text-white font-black text-sm uppercase tracking-widest mb-4">Response Rate</h2>
          <div className="space-y-4">
            {progressRows.map(r => (
              <div key={r.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-500">{r.label}</span>
                  <span className="text-xs font-bold text-white">{Math.round((r.value / total) * 100)}%</span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: 'rgba(239,68,68,0.1)' }}>
                  <div className="h-2 rounded-full transition-all" style={{ width: `${(r.value / total) * 100}%`, background: r.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl p-5" style={panelStyle}>
          <h2 className="text-white font-black text-sm uppercase tracking-widest mb-4">Station Info</h2>
          <div className="space-y-4">
            {[
              ['Station Name', user?.fire_station_name || 'N/A'],
              ['Username',     user?.username || '—'],
              ['Role',         'Fire Station'],
            ].map(([l, v]) => (
              <div key={l}>
                <p className="text-xs text-gray-600 mb-0.5">{l}</p>
                <p className="text-white font-semibold text-sm">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

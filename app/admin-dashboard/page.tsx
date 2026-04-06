'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const cardStyle = {
  background: 'linear-gradient(135deg, rgba(30,10,10,0.95), rgba(20,5,5,0.98))',
  border: '1px solid rgba(239,68,68,0.2)',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newUsers, setNewUsers] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const fetchStats = () => {
      fetch('https://firebackend-tsi7.onrender.com/api/admin/dashboard/stats/', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => { setStats(data); setLoading(false); })
        .catch(() => setLoading(false));
    };
    fetchStats();
    fetch('https://firebackend-tsi7.onrender.com/api/admin/users/unread_count/', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(data => setNewUsers(data.count || 0)).catch(() => {});
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-5xl animate-bounce">📊</div>
    </div>
  );

  const statCards = [
    { title: 'Total Users',       value: stats?.total_users || 0,            icon: '👥', color: '#60a5fa', link: '/admin-dashboard/users' },
    { title: 'Fire Stations',     value: stats?.total_stations || 0,         icon: '🚒', color: '#ef4444', link: '/admin-dashboard/stations' },
    { title: 'Station Accounts',  value: stats?.total_station_accounts || 0, icon: '👨‍🚒', color: '#f97316', link: '/admin-dashboard/station-accounts' },
    { title: 'News Articles',     value: stats?.total_news || 0,             icon: '📰', color: '#4ade80', link: '/admin-dashboard/news' },
    { title: 'Prevention Tips',   value: stats?.total_prevention_tips || 0,  icon: '🛡️', color: '#a78bfa', link: '/admin-dashboard/prevention' },
    { title: 'Pending Reports',   value: stats?.pending_reports || 0,        icon: '🚨', color: '#fbbf24', link: '/admin-dashboard/reports' },
    { title: 'Total Reports',     value: stats?.total_reports || 0,          icon: '📋', color: '#818cf8', link: '/admin-dashboard/reports' },
    { title: 'Quiz Results',      value: stats?.total_quiz_results || 0,     icon: '📝', color: '#f472b6', link: '/admin-dashboard/quiz-results' },
  ];

  const statusColors: Record<string, { color: string; bg: string }> = {
    pending:    { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
    responding: { color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
    resolved:   { color: '#4ade80', bg: 'rgba(74,222,128,0.15)' },
  };

  const quickActions = [
    { href: '/admin-dashboard/news',             icon: '📰', label: 'Add News',             color: '#4ade80' },
    { href: '/admin-dashboard/prevention',       icon: '🛡️', label: 'Add Prevention Tip',   color: '#a78bfa' },
    { href: '/admin-dashboard/announcements',    icon: '📢', label: 'Add Announcement',      color: '#f97316' },
    { href: '/admin-dashboard/station-accounts', icon: '👥', label: 'Create Station Account', color: '#60a5fa' },
  ];

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes fade-up { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .stat-card { animation: fade-up 0.4s ease-out forwards; transition: all 0.3s ease; }
        .stat-card:hover { transform: translateY(-3px); }
      `}</style>

      {/* Welcome banner */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.25), rgba(234,88,12,0.2))', border: '1px solid rgba(239,68,68,0.35)' }}>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-6xl opacity-20 pointer-events-none">🔥</div>
        <h2 className="text-2xl font-black text-white mb-1">Welcome back, Admin! 🔥</h2>
        <p className="text-gray-400 text-sm">Manage the Cebu City Fire Department system from here.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const inner = (
            <div className="stat-card rounded-xl p-5" style={{ ...cardStyle, animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-medium mb-1">{card.title}</p>
                  <p className="text-3xl font-black text-white">{card.value}</p>
                  {card.title === 'Total Users' && newUsers > 0 && (
                    <p className="text-xs font-bold mt-1" style={{ color: '#4ade80' }}>+{newUsers} new</p>
                  )}
                </div>
                <span className="text-2xl">{card.icon}</span>
              </div>
              <div className="mt-3 h-0.5 rounded-full w-8" style={{ background: card.color }} />
            </div>
          );
          return card.link
            ? <Link key={card.title} href={card.link}>{inner}</Link>
            : <div key={card.title}>{inner}</div>;
        })}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reports */}
        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-black flex items-center gap-2">🚨 Recent Reports</h3>
            <Link href="/admin-dashboard/reports" className="text-xs font-bold transition-colors" style={{ color: '#f97316' }}>
              View all →
            </Link>
          </div>
          {stats?.recent_reports?.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_reports.map((r: any) => {
                const s = statusColors[r.status] || statusColors.pending;
                return (
                  <div key={r.id} className="flex items-start justify-between gap-3 py-2"
                    style={{ borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{r.title}</p>
                      <p className="text-gray-500 text-xs truncate">📍 {r.location}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ color: s.color, background: s.bg }}>
                        {r.status}
                      </span>
                      <p className="text-gray-600 text-xs mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-gray-600 text-sm">No recent reports.</p>}
        </div>

        {/* Recent Quiz Results */}
        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-black flex items-center gap-2">📝 Recent Quiz Results</h3>
            <Link href="/admin-dashboard/quiz-results" className="text-xs font-bold transition-colors" style={{ color: '#f97316' }}>
              View all →
            </Link>
          </div>
          {stats?.recent_quiz_results?.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_quiz_results.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between gap-3 py-2"
                  style={{ borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{r.user_name}</p>
                    <p className="text-gray-500 text-xs">{new Date(r.completed_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-white text-sm font-bold">{r.score}/{r.total_questions} <span className="text-gray-500 font-normal">({r.percentage}%)</span></p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.passed ? 'text-green-400' : 'text-red-400'}`}
                      style={{ background: r.passed ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)' }}>
                      {r.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-600 text-sm">No recent quiz results.</p>}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl p-5" style={cardStyle}>
        <h3 className="text-white font-black mb-4">⚡ Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map(a => (
            <Link key={a.href} href={a.href}
              className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl text-center transition-all duration-200 hover:-translate-y-1"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(239,68,68,0.15)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = `${a.color}50`)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(239,68,68,0.15)')}>
              <span className="text-2xl">{a.icon}</span>
              <span className="text-xs font-bold text-gray-400">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

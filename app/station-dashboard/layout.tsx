'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { name: 'Dashboard',         path: '/station-dashboard',                  icon: '📊' },
  { name: 'Emergency Reports', path: '/station-dashboard/reports',          icon: '🚨' },
  { name: 'Personnel',         path: '/station-dashboard/personnel',        icon: '🧑‍🚒' },
  { name: 'Statistics',        path: '/station-dashboard/statistics',       icon: '📈' },
  { name: 'Notifications',     path: '/station-dashboard/notifications',    icon: '🔔' },
  { name: 'Profile',           path: '/station-dashboard/profile',          icon: '👤' },
];

export default function StationDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [notifReports, setNotifReports] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('https://firebackend-tsi7.onrender.com/api/station/notifications/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifCount(data.count);
        setNotifReports(data.reports);
      }
    } catch {}
  };

  useEffect(() => {
    if (user?.role === 'station') {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (!user) router.push('/login');
    else if (user.role !== 'station') router.push('/');
  }, [user, router]);

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (!user || user.role !== 'station') return null;

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <>
      {/* Logo */}
      <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
        {(sidebarOpen || onClose) && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚒</span>
            <div>
              <p className="text-white font-black text-sm tracking-widest uppercase">Station</p>
              <p className="text-xs font-bold tracking-widest uppercase" style={{ color: '#f97316' }}>Portal</p>
            </div>
          </div>
        )}
        {onClose ? (
          <button onClick={onClose} className="p-1.5 rounded text-gray-400 hover:text-white"
            style={{ background: 'rgba(239,68,68,0.1)' }}>✕</button>
        ) : (
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded text-gray-400 hover:text-white transition-colors"
            style={{ background: 'rgba(239,68,68,0.1)' }}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        {menuItems.map(item => {
          const active = pathname === item.path;
          const isReports = item.path === '/station-dashboard/reports';
          return (
            <Link key={item.path} href={item.path}
              className="flex items-center gap-3 px-4 py-3 mx-2 rounded-lg mb-1 transition-all"
              style={{
                background: active ? 'rgba(249,115,22,0.15)' : 'transparent',
                borderLeft: active ? '3px solid #f97316' : '3px solid transparent',
                color: active ? '#f97316' : '#9ca3af',
              }}>
              <span className="text-xl shrink-0 relative">
                {item.icon}
                {isReports && notifCount > 0 && (
                  <span style={{ position: 'absolute', top: -6, right: -8, background: '#dc2626', color: '#fff', borderRadius: '50%', fontSize: 10, fontWeight: 900, minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', lineHeight: 1 }}>
                    {notifCount > 99 ? '99+' : notifCount}
                  </span>
                )}
              </span>
              {(sidebarOpen || onClose) && <span className="font-semibold text-sm">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(239,68,68,0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0"
            style={{ background: 'rgba(249,115,22,0.2)', color: '#f97316', border: '1px solid rgba(249,115,22,0.4)' }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          {(sidebarOpen || onClose) && (
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm truncate">{user.username}</p>
              <p className="text-xs truncate" style={{ color: '#f97316' }}>{user.fire_station_name || 'Fire Station'}</p>
            </div>
          )}
        </div>
        {(sidebarOpen || onClose) && (
          <button onClick={() => { logout(); router.push('/login'); }}
            className="w-full mt-3 py-2 rounded-lg text-sm font-bold transition-all"
            style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
            Logout
          </button>
        )}
      </div>
    </>
  );

  return (
    <div className="flex h-screen" style={{ background: '#0a0202' }}>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: '#0f0505', borderRight: '1px solid rgba(239,68,68,0.15)' }}>
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} hidden lg:flex flex-col transition-all duration-300 shrink-0`}
        style={{ background: '#0f0505', borderRight: '1px solid rgba(239,68,68,0.15)' }}>
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="px-4 sm:px-6 py-3 flex items-center justify-between shrink-0"
          style={{ background: '#0f0505', borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button onClick={() => setMobileOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-white"
              style={{ background: 'rgba(239,68,68,0.1)' }}>
              ☰
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <h2 className="text-white font-bold text-base sm:text-lg">
                {menuItems.find(i => i.path === pathname)?.name || 'Station Dashboard'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-sm hidden sm:inline" style={{ color: '#9ca3af' }}>
              Welcome, <span className="text-white font-bold">{user.username}</span>
            </span>
            <div className="relative" ref={notifRef}>
              <button onClick={() => setShowNotif(!showNotif)}
                className="relative p-2 rounded-lg transition-colors"
                style={{ background: 'rgba(239,68,68,0.1)' }}>
                <span className="text-xl">🔔</span>
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                )}
              </button>
              {showNotif && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl shadow-2xl z-50 overflow-hidden"
                  style={{ background: '#1a0808', border: '1px solid rgba(239,68,68,0.25)' }}>
                  <div className="px-4 py-3 flex justify-between items-center" style={{ borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
                    <span className="text-white font-bold text-sm">🚨 New Pending Reports</span>
                    <span className="text-xs" style={{ color: '#f97316' }}>{notifCount} unread</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifReports.length === 0 ? (
                      <p className="p-4 text-center text-sm" style={{ color: '#6b7280' }}>No new reports</p>
                    ) : notifReports.map(r => (
                      <Link key={r.id} href="/station-dashboard/reports" onClick={() => setShowNotif(false)}
                        className="block px-4 py-3 transition-colors hover:bg-red-950"
                        style={{ borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
                        <p className="text-white font-semibold text-sm">{r.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{r.location}</p>
                        <p className="text-xs mt-1" style={{ color: '#f97316' }}>{new Date(r.created_at).toLocaleString()}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

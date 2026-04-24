'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { name: 'Dashboard',         path: '/admin-dashboard',                  icon: '📊' },
  { name: 'Emergency Reports', path: '/admin-dashboard/reports',          icon: '🚨' },
  { name: 'Response Logs',     path: '/admin-dashboard/response-logs',    icon: '📋' },
  { name: 'Fire Stations',     path: '/admin-dashboard/stations',         icon: '🚒' },
  { name: 'Station Accounts',  path: '/admin-dashboard/station-accounts', icon: '👥' },
  { name: 'Personnel',         path: '/admin-dashboard/personnel',        icon: '🧑‍🚒' },
  { name: 'News',              path: '/admin-dashboard/news',             icon: '📰' },
  { name: 'Announcements',     path: '/admin-dashboard/announcements',    icon: '📢' },
  { name: 'Fire Prevention',   path: '/admin-dashboard/prevention',       icon: '🛡️' },
  { name: 'Heroic Acts',       path: '/admin-dashboard/heroic-acts',      icon: '🏆' },
  { name: 'Featured Stories',  path: '/admin-dashboard/stories',          icon: '🔥' },
  { name: 'Statistics',        path: '/admin-dashboard/statistics',       icon: '📈' },
  { name: 'User Management',   path: '/admin-dashboard/users',            icon: '🧑‍💻' },
  { name: 'Quiz Results',      path: '/admin-dashboard/quiz-results',     icon: '📝' },
  { name: 'FAQ',               path: '/admin-dashboard/faq',              icon: '❓' },
  { name: 'Feedback',          path: '/admin-dashboard/feedback',         icon: '💬' },
  { name: 'Audit Logs',        path: '/admin-dashboard/audit-logs',       icon: '🔍' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadFeedback, setUnreadFeedback] = useState(0);
  const [unreadQuiz, setUnreadQuiz] = useState(0);
  const [unreadReports, setUnreadReports] = useState(0);
  const [unreadUsers, setUnreadUsers] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/feedback/unread_count/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(data => setUnreadFeedback(data.count || 0)).catch(() => {});
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/quiz-results/unread_count/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(data => setUnreadQuiz(data.count || 0)).catch(() => {});
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/emergency-reports/unread_count/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(data => setUnreadReports(data.count || 0)).catch(() => {});
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/unread_count/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(data => setUnreadUsers(data.count || 0)).catch(() => {});
  }, [pathname]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (loading || !user || user.role !== 'admin') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-5xl animate-bounce">🔥</div>
    </div>
  );

  const currentPage = menuItems.find(m => m.path === pathname)?.name || 'Admin Dashboard';

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
        {(!collapsed || onClose) && (
          <div>
            <p className="text-white font-black text-sm">🔥 Admin Panel</p>
            <p className="text-gray-500 text-xs">Cebu Fire Dept.</p>
          </div>
        )}
        {onClose ? (
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white"
            style={{ background: 'rgba(239,68,68,0.1)' }}>✕</button>
        ) : (
          <button onClick={() => setCollapsed(!collapsed)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white"
            style={{ background: 'rgba(239,68,68,0.1)' }}>
            {collapsed ? '▶' : '◀'}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3" style={{ scrollbarWidth: 'thin' }}>
        {menuItems.map(item => {
          const active = pathname === item.path;
          const isFeedback = item.path === '/admin-dashboard/feedback';
          const isQuiz = item.path === '/admin-dashboard/quiz-results';
          const isReports = item.path === '/admin-dashboard/reports';
          const isUsers = item.path === '/admin-dashboard/users';
          const badgeCount = isFeedback ? unreadFeedback : isQuiz ? unreadQuiz : isReports ? unreadReports : isUsers ? unreadUsers : 0;
          return (
            <Link key={item.path} href={item.path}
              className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg mb-0.5 transition-all"
              style={{
                background: active ? 'rgba(239,68,68,0.2)' : 'transparent',
                borderLeft: active ? '3px solid #f97316' : '3px solid transparent',
              }}>
              <span className="text-lg shrink-0 relative">
                {item.icon}
                {badgeCount > 0 && (
                  <span style={{ position: 'absolute', top: -6, right: -8, background: '#dc2626', color: '#fff', borderRadius: '50%', fontSize: 10, fontWeight: 900, minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', lineHeight: 1 }}>
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </span>
              {(!collapsed || onClose) && (
                <span className={`text-sm font-medium truncate ${active ? 'text-orange-400' : 'text-gray-400'}`}>
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid rgba(239,68,68,0.15)' }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-black text-sm"
            style={{ background: 'linear-gradient(135deg, #dc2626, #ea580c)', color: 'white' }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          {(!collapsed || onClose) && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-bold truncate">{user.username}</p>
              <p className="text-gray-500 text-xs">Administrator</p>
            </div>
          )}
        </div>
        {(!collapsed || onClose) && (
          <button onClick={() => { logout(); router.push('/login'); }}
            className="w-full py-2 rounded-lg text-xs font-bold text-red-400 transition-all"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
            🚪 Logout
          </button>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-gray-950">
      <style>{`
        .main-scroll::-webkit-scrollbar { width: 6px; }
        .main-scroll::-webkit-scrollbar-track { background: transparent; }
        .main-scroll::-webkit-scrollbar-thumb { background: rgba(239,68,68,0.3); border-radius: 3px; }
      `}</style>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'linear-gradient(180deg, #0f0505 0%, #1a0808 100%)', borderRight: '1px solid rgba(239,68,68,0.2)' }}>
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-60'} hidden lg:flex flex-shrink-0 flex-col transition-all duration-300`}
        style={{ background: 'linear-gradient(180deg, #0f0505 0%, #1a0808 100%)', borderRight: '1px solid rgba(239,68,68,0.2)' }}>
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 shrink-0"
          style={{ background: 'rgba(15,5,5,0.95)', borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-white"
              style={{ background: 'rgba(239,68,68,0.1)' }}>
              ☰
            </button>
            <div>
              <h1 className="text-white font-black text-base sm:text-lg">{currentPage}</h1>
              <p className="text-gray-500 text-xs hidden sm:block">Cebu City Fire System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 hidden sm:inline">Welcome, <span className="text-orange-400 font-bold">{user.username}</span></span>
            <div className="w-2 h-2 rounded-full bg-green-400" title="Online" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto main-scroll p-4 sm:p-6" style={{ background: '#0a0202' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

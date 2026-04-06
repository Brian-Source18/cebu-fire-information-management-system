'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import ConfirmDialog from '../components/ConfirmDialog';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  image?: string;
  created_at: string;
}

interface Announcement {
  id: number;
  title: string;
  message: string;
  priority: string;
  created_at: string;
}

export default function Home() {
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [userReports, setUserReports] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetch('https://firebackend-tsi7.onrender.com/api/news/')
      .then(res => res.json())
      .then(data => setLatestNews(data.slice(0, 3)))
      .catch(() => {});
    fetch('https://firebackend-tsi7.onrender.com/api/announcements/')
      .then(res => res.json())
      .then(data => setAnnouncements(data.slice(0, 2)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('access_token');
    fetch('https://firebackend-tsi7.onrender.com/api/emergency-reports/', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setUserReports(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [user]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <style>{`
        .home-nav-link { transition: box-shadow 0.2s; }
        .home-nav-link:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
        .home-card { transition: box-shadow 0.2s; }
        .home-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
        @media (max-width: 640px) {
          .hero-btns { flex-direction: column; }
          .quick-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .services-grid { grid-template-columns: repeat(1, 1fr) !important; }
          .news-grid { grid-template-columns: repeat(1, 1fr) !important; }
          .about-grid { grid-template-columns: repeat(1, 1fr) !important; }
          .auth-cta-btns { flex-direction: column; align-items: stretch; }
          .header-nav a, .header-nav button { font-size: 12px !important; padding: 5px 10px !important; }
        }
      `}</style>

      {/* Header */}
      <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, backgroundColor: '#dc2626', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔥</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#1e293b', letterSpacing: 0.3, lineHeight: 1.2 }}>CEBU CITY FIRE DEPT.</div>
              <div style={{ fontSize: 10, color: '#dc2626', fontWeight: 600 }}>Always Ready • Always There</div>
            </div>
          </div>
          <div className="header-nav" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <AuthButtons user={user} />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>

        {/* Welcome Section — logged in users only */}
        {user && (
          <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: '20px 24px', marginBottom: 20, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, backgroundColor: '#dc2626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                {(user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 800, color: '#1e293b', fontSize: 16 }}>
                  Welcome back, {user.first_name || user.username}! 👋
                </div>
                <div style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
                  {userReports.filter(r => r.status === 'pending').length > 0
                    ? `You have ${userReports.filter(r => r.status === 'pending').length} pending report${userReports.filter(r => r.status === 'pending').length > 1 ? 's' : ''}`
                    : userReports.length > 0
                    ? `All ${userReports.length} report${userReports.length > 1 ? 's' : ''} resolved ✅`
                    : 'No reports submitted yet'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a href="/my-reports" style={{ backgroundColor: '#fef2f2', color: '#dc2626', fontWeight: 700, padding: '8px 16px', borderRadius: 10, textDecoration: 'none', fontSize: 13, border: '1px solid #fca5a5' }}>📋 My Reports ({userReports.length})</a>
              <a href="/report" style={{ backgroundColor: '#dc2626', color: '#fff', fontWeight: 700, padding: '8px 16px', borderRadius: 10, textDecoration: 'none', fontSize: 13 }}>🚨 New Report</a>
            </div>
          </div>
        )}

        {/* Hero Card */}
        <div style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', borderRadius: 20, padding: '36px 24px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: -50, right: 60, width: 130, height: 130, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '4px 12px', marginBottom: 14 }}>
              <span style={{ fontSize: 11 }}>🔥</span>
              <span style={{ color: '#fef2f2', fontSize: 11, fontWeight: 600 }}>Official Fire Department Portal</span>
            </div>
            <h1 style={{ color: '#fff', fontSize: 'clamp(22px, 5vw, 36px)', fontWeight: 900, margin: '0 0 8px', lineHeight: 1.2 }}>Protecting Our Community</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, margin: '0 0 24px' }}>Courage • Honor • Sacrifice — Serving Cebu 24/7</p>
            <div className="hero-btns" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href="/report" style={{ backgroundColor: '#fff', color: '#dc2626', fontWeight: 700, padding: '11px 22px', borderRadius: 10, textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                🚨 Report Emergency
              </a>
              <a href="/map" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700, padding: '11px 22px', borderRadius: 10, textDecoration: 'none', fontSize: 14, border: '1px solid rgba(255,255,255,0.3)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                🗺️ Station Map
              </a>
            </div>
          </div>
        </div>

        {/* Emergency CTA */}
        <div style={{ backgroundColor: '#fff', border: '2px solid #fca5a5', borderRadius: 16, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 16px rgba(220,38,38,0.1)', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, backgroundColor: '#fef2f2', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🚒</div>
            <div>
              <div style={{ fontWeight: 700, color: '#dc2626', fontSize: 15 }}>Emergency Hotline</div>
              <div style={{ color: '#64748b', fontSize: 12 }}>Call us immediately for fire emergencies</div>
            </div>
          </div>
          <a href="tel:911" style={{ backgroundColor: '#dc2626', color: '#fff', fontWeight: 700, padding: '9px 20px', borderRadius: 10, textDecoration: 'none', fontSize: 14, flexShrink: 0 }}>📞 Call 911</a>
        </div>

        {/* Quick Actions Grid */}
        <div className="quick-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { icon: '🚒', label: 'Emergency Response', sub: '24/7 rapid response', href: '/emergency', color: '#fef2f2' },
            { icon: '🏆', label: 'Heroic Acts', sub: 'Stories of bravery', href: '/heroes', color: '#fffbeb' },
            { icon: '🛡️', label: 'Fire Prevention', sub: 'Safety programs', href: '/prevention', color: '#f0fdf4' },
            { icon: '📊', label: 'Statistics', sub: 'Incident data', href: '/statistics', color: '#eff6ff' },
          ].map(item => (
            <a key={item.href} href={item.href} className="home-card" style={{ backgroundColor: '#fff', borderRadius: 16, padding: '18px 14px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
              <div style={{ width: 40, height: 40, backgroundColor: item.color, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{item.icon}</div>
              <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 13 }}>{item.label}</div>
              <div style={{ color: '#64748b', fontSize: 11 }}>{item.sub}</div>
            </a>
          ))}
        </div>

        {/* Services Row */}
        <div className="services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { icon: '❓', label: 'FAQ', href: '/faq' },
            { icon: '🎓', label: 'Fire Safety Quiz', href: '/quiz' },
            { icon: '💬', label: 'Send Feedback', href: '/feedback' },
          ].map(item => (
            <a key={item.href} href={item.href} className="home-card" style={{ backgroundColor: '#fff', borderRadius: 14, padding: '14px 16px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontWeight: 600, color: '#1e293b', fontSize: 13 }}>{item.label}</span>
            </a>
          ))}
        </div>

        {/* Announcements */}
        {announcements.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            {announcements.map(a => {
              const colors: Record<string, { bg: string; bar: string; icon: string }> = {
                emergency: { bg: '#fef2f2', bar: '#dc2626', icon: '🚨' },
                warning: { bg: '#fffbeb', bar: '#d97706', icon: '⚠️' },
                info: { bg: '#eff6ff', bar: '#2563eb', icon: '📢' },
              };
              const c = colors[a.priority] || colors.info;
              return (
                <a key={a.id} href={`/announcements/${a.id}`} style={{ backgroundColor: c.bg, borderRadius: 14, padding: '14px 18px', marginBottom: 10, display: 'flex', alignItems: 'flex-start', gap: 12, borderLeft: `4px solid ${c.bar}`, textDecoration: 'none' }}>
                  <span style={{ fontSize: 20, marginTop: 2, flexShrink: 0 }}>{c.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 14, marginBottom: 3 }}>{a.title}</div>
                    <div style={{ color: '#475569', fontSize: 13, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.message}</div>
                    <div style={{ color: c.bar, fontSize: 12, fontWeight: 600, marginTop: 6 }}>Read more →</div>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* Safety Tips */}
        <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 16, padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: '#92400e', fontSize: 14, marginBottom: 10 }}>⚠️ Fire Safety Reminders</div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {['Test smoke detectors monthly', 'Have an escape plan ready', 'Never leave cooking unattended', 'Keep fire extinguisher accessible'].map(tip => (
              <div key={tip} style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#78350f', fontSize: 12 }}>
                <span style={{ color: '#d97706' }}>•</span> {tip}
              </div>
            ))}
          </div>
        </div>

        {/* Latest News */}
        <div id="news" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontWeight: 800, color: '#1e293b', fontSize: 18 }}>Latest News</div>
            <a href="/emergency" style={{ color: '#dc2626', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>View all →</a>
          </div>
          {latestNews.length === 0 ? (
            <div style={{ color: '#94a3b8', textAlign: 'center', padding: '32px 0' }}>No news available</div>
          ) : (
            <div className="news-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {latestNews.map(news => (
                <a key={news.id} href={`/news/${news.id}`} className="home-card" style={{ backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', textDecoration: 'none', display: 'block' }}>
                  {news.image && <img src={news.image} alt={news.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />}
                  <div style={{ padding: '14px' }}>
                    <div style={{ color: '#dc2626', fontSize: 11, fontWeight: 600, marginBottom: 5 }}>
                      {new Date(news.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 14, marginBottom: 5 }}>{news.title}</div>
                    <div style={{ color: '#64748b', fontSize: 12, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{news.content}</div>
                    <div style={{ color: '#dc2626', fontSize: 12, fontWeight: 600, marginTop: 8 }}>Read more →</div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Auth CTA — guests only */}
        {!user && (
          <div style={{ background: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)', borderRadius: 20, padding: '32px 24px', marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>🔥</div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Join Our Community</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 22 }}>Create an account to report incidents, track your reports, and stay updated.</div>
            <div className="auth-cta-btns" style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/login" style={{ backgroundColor: '#fff', color: '#dc2626', fontWeight: 700, padding: '11px 28px', borderRadius: 10, textDecoration: 'none', fontSize: 14 }}>Login</a>
              <a href="/register" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700, padding: '11px 28px', borderRadius: 10, textDecoration: 'none', fontSize: 14, border: '1px solid rgba(255,255,255,0.3)' }}>Register</a>
            </div>
          </div>
        )}

        {/* About Cards */}
        <div className="about-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { icon: '🎯', title: 'Our Mission', text: 'To protect lives, property, and the environment from fire and other emergencies through prevention, education, and rapid response.' },
            { icon: '👁️', title: 'Our Vision', text: 'A fire-safe Cebu where every community is prepared, protected, and resilient against fire hazards.' },
            { icon: '⭐', title: 'Core Values', text: 'Courage, Integrity, Professionalism, Excellence, and Service to the community above self.' },
          ].map(card => (
            <div key={card.title} style={{ backgroundColor: '#fff', borderRadius: 16, padding: '22px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 26, marginBottom: 10 }}>{card.icon}</div>
              <div style={{ fontWeight: 700, color: '#dc2626', fontSize: 14, marginBottom: 8 }}>{card.title}</div>
              <div style={{ color: '#475569', fontSize: 13, lineHeight: 1.6 }}>{card.text}</div>
            </div>
          ))}
        </div>

        {/* History */}
        <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '28px 24px', marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: 26, marginBottom: 10 }}>📜</div>
          <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 17, marginBottom: 12 }}>Our History</div>
          <p style={{ color: '#475569', fontSize: 13, lineHeight: 1.7, maxWidth: 680, margin: '0 auto' }}>
            The Cebu City Fire Department has been serving the community for decades, evolving from a small volunteer brigade to a professional fire service.
            Today, we operate multiple stations across Cebu, equipped with modern firefighting equipment and highly trained personnel ready to respond 24/7.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function AuthButtons({ user }: { user: any }) {
  const { logout } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);

  if (user) {
    return (
      <>
        {showConfirm && <ConfirmDialog message="Are you sure you want to logout?" onConfirm={() => logout()} onCancel={() => setShowConfirm(false)} />}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <a href="/profile" style={{ color: '#dc2626', fontSize: 12, fontWeight: 600, textDecoration: 'none', padding: '5px 10px', borderRadius: 8, backgroundColor: '#fef2f2', whiteSpace: 'nowrap' }}>👤 {user.username}</a>
          <a href="/my-reports" style={{ color: '#475569', fontSize: 12, fontWeight: 600, textDecoration: 'none', padding: '5px 10px', borderRadius: 8, backgroundColor: '#f1f5f9', whiteSpace: 'nowrap' }} className="hidden sm:block">My Reports</a>
          <button onClick={() => setShowConfirm(true)} style={{ backgroundColor: '#dc2626', color: '#fff', fontWeight: 700, padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap' }}>Logout</button>
        </div>
      </>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <a href="/login" style={{ color: '#dc2626', fontSize: 12, fontWeight: 700, textDecoration: 'none', padding: '6px 14px', borderRadius: 8, border: '1.5px solid #dc2626', whiteSpace: 'nowrap' }}>Login</a>
      <a href="/register" style={{ backgroundColor: '#dc2626', color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none', padding: '6px 14px', borderRadius: 8, whiteSpace: 'nowrap' }}>Register</a>
    </div>
  );
}

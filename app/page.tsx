'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import ConfirmDialog from '../components/ConfirmDialog';
import Link from 'next/link';

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
  image?: string;
  created_at: string;
}

export default function Home() {
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [userReports, setUserReports] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [featuredStories, setFeaturedStories] = useState<any[]>([]);
  const [showHotlines, setShowHotlines] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news/`)
      .then(res => res.json())
      .then(data => setLatestNews(data.slice(0, 3)))
      .catch(() => {});
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements/`)
      .then(res => res.json())
      .then(data => setAnnouncements(Array.isArray(data) ? data : []))
      .catch(() => {});
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fire-stations/`)
      .then(res => res.json())
      .then(data => setStations(Array.isArray(data) ? data : []))
      .catch(() => {});
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/featured-stories/`)
      .then(res => res.json())
      .then(data => setFeaturedStories(Array.isArray(data) ? data.slice(0, 9) : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('access_token');
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/emergency-reports/`, {
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
              <div style={{ fontWeight: 800, fontSize: 13, color: '#1e293b', letterSpacing: 0.3, lineHeight: 1.2 }}>CEBU CITY FIRE SYSTEM</div>
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
          <div style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #fff 60%, #fff7ed 100%)', borderRadius: 20, padding: '24px', marginBottom: 20, border: '1px solid #fca5a5', boxShadow: '0 4px 16px rgba(220,38,38,0.08)', position: 'relative', overflow: 'hidden' }}>
            <style>{`
              @keyframes flicker { 0%,100%{transform:scaleY(1) scaleX(1);} 25%{transform:scaleY(1.08) scaleX(0.95);} 50%{transform:scaleY(0.95) scaleX(1.05);} 75%{transform:scaleY(1.05) scaleX(0.97);} }
              .fire-flicker { animation: flicker 1.5s ease-in-out infinite; transform-origin: bottom center; }
            `}</style>

            {/* Fire animation on the right */}
            <div style={{ position: 'absolute', right: 24, top: 0, bottom: 0, display: 'flex', alignItems: 'center', opacity: 0.15, pointerEvents: 'none' }}>
              <div className="fire-flicker" style={{ fontSize: 80, lineHeight: 1 }}>🔥</div>
            </div>
            <div style={{ position: 'absolute', right: 60, top: 0, bottom: 0, display: 'flex', alignItems: 'center', opacity: 0.08, pointerEvents: 'none' }}>
              <div className="fire-flicker" style={{ fontSize: 60, lineHeight: 1, animationDelay: '0.4s' }}>🔥</div>
            </div>
            <div style={{ position: 'absolute', right: 10, top: 0, bottom: 0, display: 'flex', alignItems: 'center', opacity: 0.07, pointerEvents: 'none' }}>
              <div className="fire-flicker" style={{ fontSize: 50, lineHeight: 1, animationDelay: '0.8s' }}>🔥</div>
            </div>

            {/* Top row: greeting + badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #dc2626, #ea580c)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: '#fff', flexShrink: 0, boxShadow: '0 4px 12px rgba(220,38,38,0.4)' }}>
                  {(user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#1e293b', fontSize: 17 }}>
                    {(() => {
                      const h = new Date().getHours();
                      const greeting = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
                      return `${greeting}, ${user.first_name || user.username}! 👋`;
                    })()}
                  </div>
                  <div style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>Thank you for using the Cebu City Fire System. Stay safe! 🔥</div>
                </div>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 20, padding: '4px 12px', flexShrink: 0 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626' }}>Active User</span>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, position: 'relative', zIndex: 1 }}>
              {[
                { label: 'Total Reports', value: userReports.length, icon: '📋', color: '#1e293b', bg: '#f1f5f9' },
                { label: 'Pending', value: userReports.filter(r => r.status === 'pending').length, icon: '🟡', color: '#d97706', bg: '#fffbeb' },
                { label: 'Resolved', value: userReports.filter(r => r.status === 'resolved').length, icon: '✅', color: '#16a34a', bg: '#f0fdf4' },
              ].map(stat => (
                <div key={stat.label} style={{ backgroundColor: stat.bg, borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{stat.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, color: stat.color, fontSize: 18, lineHeight: 1 }}>{stat.value}</div>
                    <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>{stat.label}</div>
                  </div>
                </div>
              ))}
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
              <span style={{ color: '#fef2f2', fontSize: 11, fontWeight: 600 }}>Official Fire System Portal</span>
            </div>
            <h1 style={{ color: '#fff', fontSize: 'clamp(22px, 5vw, 36px)', fontWeight: 900, margin: '0 0 8px', lineHeight: 1.2 }}>Protecting Our Community</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, margin: '0 0 24px' }}>Courage • Honor • Sacrifice — Serving Cebu 24/7</p>
            <div className="hero-btns" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href="/report" style={{ backgroundColor: '#fff', color: '#dc2626', fontWeight: 700, padding: '11px 22px', borderRadius: 10, textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                🚨 Report Emergency
              </a>
              <a href="/map" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700, padding: '11px 22px', borderRadius: 10, textDecoration: 'none', fontSize: 14, border: '1px solid rgba(255,255,255,0.3)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                🗺️ Active Emergency & Station Map
              </a>
              <button onClick={() => setShowHotlines(true)} style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700, padding: '11px 22px', borderRadius: 10, fontSize: 14, border: '1px solid rgba(255,255,255,0.3)', display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                📞 Station Hotlines
              </button>
            </div>
          </div>
        </div>

        {/* Emergency CTA */}
        <div style={{ backgroundColor: '#fff', border: '2px solid #fca5a5', borderRadius: 16, padding: '16px 20px', marginBottom: 20, boxShadow: '0 4px 16px rgba(220,38,38,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, backgroundColor: '#fef2f2', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🚒</div>
              <div>
                <div style={{ fontWeight: 700, color: '#dc2626', fontSize: 15 }}>Emergency Hotline</div>
                <div style={{ color: '#64748b', fontSize: 12 }}>Call us immediately for fire emergencies</div>
              </div>
            </div>
            <a href="tel:160" style={{ backgroundColor: '#dc2626', color: '#fff', fontWeight: 700, padding: '9px 20px', borderRadius: 10, textDecoration: 'none', fontSize: 14, flexShrink: 0 }}>📞 Call 160</a>
          </div>
          <div style={{ backgroundColor: '#fef2f2', borderRadius: 12, padding: '16px 18px', fontSize: 13 }}>
            <div style={{ fontWeight: 800, color: '#dc2626', fontSize: 14, marginBottom: 12 }}>🚒 SOP: Calling 160 (Fire Emergency – Cebu City)</div>
            {[
              { title: '1. 📞 Purpose', desc: 'To ensure fast, accurate, and effective reporting of fire or rescue emergencies to dispatchers for immediate response.' },
              { title: '2. 👤 Scope', desc: 'Applies to: General public reporting emergencies, Security personnel / responders, Fire station dispatch communication.' },
              { title: '3. ⚠️ When to Call 160', desc: 'Call immediately if there is: Fire or visible smoke, Explosion, People trapped in a structure, Fire-related accidents (vehicles, electrical, etc.)' },
            ].map(item => (
              <div key={item.title} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: 3 }}>{item.title}</div>
                <div style={{ color: '#475569' }}>{item.desc}</div>
              </div>
            ))}
            <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>4. 📋 Procedure for Callers</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { step: 'Step 1', title: 'Stay Calm and Call 160', desc: 'Use a landline if possible. Speak clearly and loudly.' },
                { step: 'Step 2', title: 'Identify Yourself', desc: 'Provide your name and contact number. e.g. "This is Juan Dela Cruz, contact number 09XXXXXXXXX."' },
                { step: 'Step 3', title: 'State the Emergency', desc: 'Clearly say what is happening. e.g. "I am reporting a fire."' },
                { step: 'Step 4', title: 'Provide Exact Location (CRITICAL)', desc: 'Give house/building number, street name, barangay, city, and nearest landmark. e.g. "123 Mango Street, Barangay Lahug, near JY Square Mall."' },
                { step: 'Step 5', title: 'Describe the Situation', desc: 'Include what is burning, size/severity of fire, and presence of trapped or injured persons.' },
                { step: 'Step 6', title: 'Answer Dispatcher Questions', desc: 'Be ready to provide best access routes, hazards (gas tanks, chemicals, electrical risks), and updates if situation changes.' },
                { step: 'Step 7', title: 'Do Not End Call Prematurely', desc: 'Wait for dispatcher instructions. Only hang up when told.' },
              ].map(item => (
                <div key={item.step} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ backgroundColor: '#dc2626', color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{item.step}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 12 }}>{item.title}</div>
                    <div style={{ color: '#64748b', fontSize: 12 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
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
              {[...announcements.filter(a => a.priority === 'emergency' && a.image).map(a => ({ type: 'announcement', data: a })), ...latestNews.map(n => ({ type: 'news', data: n }))].slice(0, 3).map(item => {
                if (item.type === 'announcement') {
                  const a = item.data as any;
                  return (
                    <a key={`ann-${a.id}`} href={`/announcements/${a.id}`} className="home-card" style={{ backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #fca5a5', textDecoration: 'none', display: 'block' }}>
                      <div style={{ position: 'relative' }}>
                        <img src={a.image} alt={a.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', top: 10, left: 10, backgroundColor: '#dc2626', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>EMERGENCY</span>
                      </div>
                      <div style={{ padding: '14px' }}>
                        <div style={{ color: '#dc2626', fontSize: 11, fontWeight: 600, marginBottom: 5 }}>{new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 14, marginBottom: 5 }}>{a.title}</div>
                        <div style={{ color: '#64748b', fontSize: 12, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.message}</div>
                        <div style={{ color: '#dc2626', fontSize: 12, fontWeight: 600, marginTop: 8 }}>Read more</div>
                      </div>
                    </a>
                  );
                }
                const news = item.data as any;
                return (
                  <Link key={`news-${news.id}`} href={`/news/${news.id}`} className="home-card" style={{ backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', textDecoration: 'none', display: 'block' }}>
                    {news.image && <img src={news.image} alt={news.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />}
                    <div style={{ padding: '14px' }}>
                      <div style={{ color: '#dc2626', fontSize: 11, fontWeight: 600, marginBottom: 5 }}>{new Date(news.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 14, marginBottom: 5 }}>{news.title}</div>
                      <div style={{ color: '#64748b', fontSize: 12, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{news.content}</div>
                      <div style={{ color: '#dc2626', fontSize: 12, fontWeight: 600, marginTop: 8 }}>Read more</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Featured Stories */}
        {featuredStories.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontWeight: 800, color: '#1e293b', fontSize: 18 }}>🔥 Featured Stories</div>
              {user && <a href="/my-story" style={{ color: '#ea580c', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Share your story →</a>}
            </div>
            <div className="news-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {featuredStories.map(s => (
                <Link key={s.id} href={`/stories/${s.id}`} className="home-card" style={{ backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textDecoration: 'none', display: 'block' }}>
                  {s.image && <img src={s.image} alt={s.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />}
                  <div style={{ padding: '14px' }}>
                    <div style={{ color: '#ea580c', fontSize: 11, fontWeight: 600, marginBottom: 5 }}>
                      {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 14, marginBottom: 5 }}>{s.title}</div>
                    <div style={{ color: '#64748b', fontSize: 12, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{s.story}</div>
                    <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 8 }}>By {s.submitted_by_name}</div>
                    <div style={{ color: '#ea580c', fontSize: 12, fontWeight: 600, marginTop: 8 }}>Read more →</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Announcements */}
        {announcements.filter(a => a.priority !== 'emergency').length > 0 && (
          <div style={{ marginBottom: 20 }}>
            {announcements.filter(a => a.priority !== 'emergency').map(a => {
              const colors: Record<string, { bg: string; bar: string; icon: string }> = {
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
        <div style={{ marginBottom: 20 }}>
        </div>


      </main>

      {/* Station Hotlines Modal */}
      {showHotlines && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '24px', width: '100%', maxWidth: 520, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontWeight: 800, color: '#dc2626', fontSize: 18 }}>📞 Hotlines</div>
              <button onClick={() => setShowHotlines(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ backgroundColor: '#fef2f2', borderRadius: 12, padding: '14px 16px', border: '1px solid #fca5a5' }}>
                <div style={{ fontWeight: 800, color: '#dc2626', fontSize: 13, marginBottom: 10 }}>🚒 Fire Stations</div>
                {stations.length === 0 ? (
                  <div style={{ color: '#94a3b8', fontSize: 12 }}>No stations available</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {stations.map((station: any) => (
                      <div key={station.id}>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 12, marginBottom: 3 }}>{station.name}</div>
                        <a href={`tel:${station.contact_number}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, backgroundColor: '#dc2626', color: '#fff', fontWeight: 700, padding: '5px 10px', borderRadius: 8, textDecoration: 'none', fontSize: 12 }}>
                          📞 {station.contact_number}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ backgroundColor: '#eff6ff', borderRadius: 12, padding: '14px 16px', border: '1px solid #93c5fd' }}>
                <div style={{ fontWeight: 800, color: '#1d4ed8', fontSize: 13, marginBottom: 6 }}>👮 Police Hotlines</div>
                <div style={{ fontSize: 11, color: '#475569', marginBottom: 10, fontStyle: 'italic' }}>If fire station hotlines are not answering, you may call the police for assistance.</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['(032) 232-9370', '(032) 233-0762', '(032) 233-6795'].map(num => (
                    <a key={num} href={`tel:${num}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, backgroundColor: '#1d4ed8', color: '#fff', fontWeight: 700, padding: '5px 10px', borderRadius: 8, textDecoration: 'none', fontSize: 12 }}>
                      ☎️ {num}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
          <a href="/my-story" style={{ color: '#ea580c', fontSize: 12, fontWeight: 700, textDecoration: 'none', padding: '6px 14px', borderRadius: 8, border: '1.5px solid #ea580c', whiteSpace: 'nowrap' }}>🔥 Feature Your Story</a>
          <a href="/about" style={{ color: '#475569', fontSize: 12, fontWeight: 700, textDecoration: 'none', padding: '6px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', whiteSpace: 'nowrap' }}>About Us</a>
          <a href="/profile" style={{ color: '#dc2626', fontSize: 12, fontWeight: 600, textDecoration: 'none', padding: '5px 10px', borderRadius: 8, backgroundColor: '#fef2f2', whiteSpace: 'nowrap' }}>👤 {user.username}</a>
          <a href="/my-reports" style={{ color: '#475569', fontSize: 12, fontWeight: 600, textDecoration: 'none', padding: '5px 10px', borderRadius: 8, backgroundColor: '#f1f5f9', whiteSpace: 'nowrap' }} className="hidden sm:block">My Reports</a>
          <button onClick={() => setShowConfirm(true)} style={{ backgroundColor: '#dc2626', color: '#fff', fontWeight: 700, padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap' }}>Logout</button>
        </div>
      </>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <a href="/about" style={{ color: '#475569', fontSize: 12, fontWeight: 700, textDecoration: 'none', padding: '6px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', whiteSpace: 'nowrap' }}>About Us</a>
      <a href="/login" style={{ color: '#dc2626', fontSize: 12, fontWeight: 700, textDecoration: 'none', padding: '6px 14px', borderRadius: 8, border: '1.5px solid #dc2626', whiteSpace: 'nowrap' }}>Login</a>
      <a href="/register" style={{ backgroundColor: '#dc2626', color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none', padding: '6px 14px', borderRadius: 8, whiteSpace: 'nowrap' }}>Register</a>
    </div>
  );
}


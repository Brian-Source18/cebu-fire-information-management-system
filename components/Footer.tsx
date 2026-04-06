import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a0202 0%, #0f0505 100%)', borderTop: '1px solid rgba(239,68,68,0.25)' }}>

      {/* Top glow line */}
      <div className="absolute top-0 left-0 w-full h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(239,68,68,0.6) 30%, rgba(251,146,60,0.6) 70%, transparent)' }} />

      {/* Radial glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-48 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center bottom, rgba(220,38,38,0.08) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

          {/* ── Branding ── */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🔥</span>
              <div>
                <p className="text-white font-black text-sm tracking-widest uppercase">Cebu City</p>
                <p className="font-bold text-xs tracking-widest uppercase" style={{ color: '#f97316' }}>Fire Department</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Protecting lives and property through courage, service, and excellence since 1945.
            </p>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <span className="text-red-400 text-lg animate-pulse">🚨</span>
              <div>
                <p className="text-xs text-gray-500">Emergency Hotline</p>
                <p className="text-white font-black text-sm">160 / 911</p>
              </div>
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4"
              style={{ borderBottom: '1px solid rgba(239,68,68,0.2)', paddingBottom: '8px' }}>
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                { href: '/',            label: 'Home' },
                { href: '/emergency',   label: 'Emergency News' },
                { href: '/prevention',  label: 'Fire Prevention' },
                { href: '/heroes',      label: 'Heroic Acts' },
                { href: '/map',         label: 'Station Map' },
                { href: '/statistics',  label: 'Statistics' },
                { href: '/faq',         label: 'FAQ' },
                { href: '/quiz',        label: 'Fire Safety Quiz' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href}
                    className="text-gray-500 hover:text-orange-400 text-sm transition-colors flex items-center gap-1.5">
                    <span className="text-xs" style={{ color: 'rgba(239,68,68,0.4)' }}>›</span>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── My Account ── */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4"
              style={{ borderBottom: '1px solid rgba(239,68,68,0.2)', paddingBottom: '8px' }}>
              My Account
            </h4>
            <ul className="space-y-2">
              {[
                { href: '/login',      label: 'Login' },
                { href: '/register',   label: 'Register' },
                { href: '/profile',    label: 'My Profile' },
                { href: '/my-reports', label: 'My Reports' },
                { href: '/report',     label: 'Report Emergency' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href}
                    className="text-gray-500 hover:text-orange-400 text-sm transition-colors flex items-center gap-1.5">
                    <span className="text-xs" style={{ color: 'rgba(239,68,68,0.4)' }}>›</span>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ── */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4"
              style={{ borderBottom: '1px solid rgba(239,68,68,0.2)', paddingBottom: '8px' }}>
              Contact Us
            </h4>
            <ul className="space-y-3">
              {[
                { icon: '📍', label: 'Address',  value: 'Cebu City Hall Compound, Cebu City, Philippines' },
                { icon: '📞', label: 'Hotline',  value: '(032) 255-1234' },
                { icon: '📧', label: 'Email',    value: 'cebufire@gmail.com' },
                { icon: '🕐', label: 'Hours',    value: '24/7 — Always Ready' },
              ].map(c => (
                <li key={c.label} className="flex items-start gap-2.5">
                  <span className="text-base mt-0.5 shrink-0">{c.icon}</span>
                  <div>
                    <p className="text-gray-600 text-xs">{c.label}</p>
                    <p className="text-gray-400 text-sm">{c.value}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full mb-6" style={{ background: 'rgba(239,68,68,0.15)' }} />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} Cebu City Fire Department. All rights reserved.
          </p>
          <p className="text-gray-700 text-xs">
            Built with ❤️ for <span style={{ color: '#f97316' }}>Cebu</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

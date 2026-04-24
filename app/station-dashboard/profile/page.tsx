'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface StationProfile {
  id: number; name: string; address: string; contact_number: string;
  email: string; station_type: string; latitude: number; longitude: number;
}

const panelStyle = { background: 'rgba(30,10,10,0.95)', border: '1px solid rgba(239,68,68,0.2)' };
const labelCls = 'text-xs font-bold uppercase tracking-widest mb-1';

export default function StationProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StationProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/station/profile/`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setProfile(await res.json());
    } catch {}
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="text-2xl animate-pulse">🔥</span>
      <span className="ml-3 text-gray-400">Loading...</span>
    </div>
  );

  return (
    <div>
      {/* Hero */}
      <div className="rounded-xl p-6 mb-6 flex items-center gap-5"
        style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(220,38,38,0.08) 100%)', border: '1px solid rgba(249,115,22,0.2)' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black shrink-0"
          style={{ background: 'rgba(249,115,22,0.2)', color: '#f97316', border: '2px solid rgba(249,115,22,0.5)', boxShadow: '0 0 20px rgba(249,115,22,0.3)' }}>
          {user?.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-white font-black text-xl">{user?.username}</h1>
          <p className="text-sm mt-0.5" style={{ color: '#f97316' }}>{profile?.name || user?.fire_station_name || 'Fire Station'}</p>
          <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: 'rgba(22,163,74,0.2)', color: '#4ade80', border: '1px solid rgba(22,163,74,0.3)' }}>
            ● Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Account info */}
        <div className="rounded-xl p-5" style={panelStyle}>
          <h2 className="text-white font-black text-sm uppercase tracking-widest mb-4" style={{ borderBottom: '1px solid rgba(239,68,68,0.15)', paddingBottom: '10px' }}>
            Account Information
          </h2>
          <div className="space-y-4">
            {[
              ['Username', user?.username],
              ['Email',    user?.email || 'Not set'],
              ['Role',     'Fire Station'],
            ].map(([l, v]) => (
              <div key={l}>
                <p className={labelCls} style={{ color: '#f97316' }}>{l}</p>
                <p className="text-gray-300 text-sm">{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Station info */}
        <div className="rounded-xl p-5" style={panelStyle}>
          <h2 className="text-white font-black text-sm uppercase tracking-widest mb-4" style={{ borderBottom: '1px solid rgba(239,68,68,0.15)', paddingBottom: '10px' }}>
            Station Information
          </h2>
          {profile ? (
            <div className="space-y-4">
              {[
                ['Station Name',   profile.name],
                ['Station Type',   profile.station_type],
                ['Address',        profile.address],
                ['Contact Number', profile.contact_number],
                ['Email',          profile.email || 'Not set'],
                ['Coordinates',    `Lat: ${profile.latitude}, Long: ${profile.longitude}`],
              ].map(([l, v]) => (
                <div key={l}>
                  <p className={labelCls} style={{ color: '#f97316' }}>{l}</p>
                  <p className="text-gray-300 text-sm capitalize">{v}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">No station assigned</p>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-xl p-5" style={panelStyle}>
        <h2 className="text-white font-black text-sm uppercase tracking-widest mb-4" style={{ borderBottom: '1px solid rgba(239,68,68,0.15)', paddingBottom: '10px' }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { href: '/station-dashboard/reports',    icon: '📋', label: 'View All Reports',  accent: '#ea580c' },
            { href: '/station-dashboard/statistics', icon: '📊', label: 'View Statistics',   accent: '#2563eb' },
            { href: '/station-dashboard/personnel',  icon: '🧑🚒', label: 'View Personnel',  accent: '#16a34a' },
          ].map(a => (
            <Link key={a.href} href={a.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all hover:opacity-80"
              style={{ background: 'rgba(15,5,5,0.8)', border: `1px solid ${a.accent}40`, color: a.accent }}>
              <span className="text-lg">{a.icon}</span>
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}


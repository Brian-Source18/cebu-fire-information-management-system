'use client';
import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL;

interface StatData {
  year: number;
  is_live: boolean;
  available_years: number[];
  total_incidents: number;
  avg_response_time: number;
  lives_saved: number;
  properties_protected: number;
  electrical_fires: number;
  cooking_fires: number;
  smoking_fires: number;
  other_fires: number;
  pending: number;
  responding: number;
  resolved: number;
}

export default function Statistics() {
  const currentYear = new Date().getFullYear();
  const [stats, setStats] = useState<StatData | null>(null);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/live-statistics/?year=${selectedYear}`)
      .then(res => res.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedYear]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black relative overflow-hidden py-12">
        <div className="flames"></div>
        <div className="flames flames-2"></div>
        <div className="relative z-10 container mx-auto px-6 max-w-4xl">
          <div className="fire-card text-center">
            <h1 className="text-3xl font-black text-white mb-4">No Statistics Available</h1>
            <p className="text-gray-400">Statistics will be available soon.</p>
            <div className="mt-6">
              <a href="/" className="text-yellow-400 hover:text-yellow-300">← Back to Home</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalCauses = stats.electrical_fires + stats.cooking_fires + stats.smoking_fires + stats.other_fires;
  const electricalPct = totalCauses > 0 ? Math.round((stats.electrical_fires / totalCauses) * 100) : 0;
  const cookingPct = totalCauses > 0 ? Math.round((stats.cooking_fires / totalCauses) * 100) : 0;
  const smokingPct = totalCauses > 0 ? Math.round((stats.smoking_fires / totalCauses) * 100) : 0;
  const otherPct = totalCauses > 0 ? Math.round((stats.other_fires / totalCauses) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black relative overflow-hidden py-12">
      <div className="flames"></div>
      <div className="flames flames-2"></div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="text-center mb-8 sm:mb-12">
          <div className="fire-badge mx-auto mb-4">📊</div>
          <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 mb-4">
            FIRE STATISTICS
          </h1>
          <p className="text-base sm:text-xl text-yellow-400 font-semibold mb-4">Department Performance & Impact</p>

          {/* Year Selector */}
          <div className="flex justify-center items-center gap-3 mb-4">
            <label className="text-white font-bold">Select Year:</label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(parseInt(e.target.value))}
              className="bg-gray-800 text-white border-2 border-yellow-500 rounded-lg px-6 py-2 font-bold text-lg hover:bg-gray-700 cursor-pointer"
            >
              {stats.available_years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Live / Manual badge */}
          {stats.is_live ? (
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/40 rounded-full px-4 py-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block"></span>
              <span className="text-green-400 font-bold text-sm">Live Data — {stats.year}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/40 rounded-full px-4 py-1">
              <span className="text-blue-400 font-bold text-sm">📁 Historical Data — {stats.year}</span>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="fire-card text-center">
            <div className="text-5xl mb-3">🔥</div>
            <h3 className="text-4xl font-black text-red-500 mb-2">{stats.total_incidents}</h3>
            <p className="text-gray-300 font-bold">Total Incidents</p>
          </div>
          <div className="fire-card text-center">
            <div className="text-5xl mb-3">⏱️</div>
            <h3 className="text-4xl font-black text-orange-500 mb-2">{stats.avg_response_time > 0 ? `${stats.avg_response_time} min` : 'N/A'}</h3>
            <p className="text-gray-300 font-bold">Avg Response Time</p>
          </div>
          <div className="fire-card text-center">
            <div className="text-5xl mb-3">👥</div>
            <h3 className="text-4xl font-black text-yellow-500 mb-2">{stats.lives_saved}</h3>
            <p className="text-gray-300 font-bold">Lives Saved</p>
          </div>
          <div className="fire-card text-center">
            <div className="text-5xl mb-3">🏠</div>
            <h3 className="text-4xl font-black text-green-500 mb-2">{stats.properties_protected}</h3>
            <p className="text-gray-300 font-bold">Properties Protected</p>
          </div>
        </div>

        {/* Report Status — only for live year */}
        {stats.is_live && (
          <div className="fire-card mb-8">
            <h2 className="text-2xl font-black text-white mb-6 text-center">📋 Report Status</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl p-4">
                <div className="text-3xl font-black text-amber-400 mb-1">{stats.pending}</div>
                <div className="text-gray-300 font-bold text-sm">Pending</div>
              </div>
              <div className="bg-blue-500/15 border border-blue-500/30 rounded-xl p-4">
                <div className="text-3xl font-black text-blue-400 mb-1">{stats.responding}</div>
                <div className="text-gray-300 font-bold text-sm">Responding</div>
              </div>
              <div className="bg-green-500/15 border border-green-500/30 rounded-xl p-4">
                <div className="text-3xl font-black text-green-400 mb-1">{stats.resolved}</div>
                <div className="text-gray-300 font-bold text-sm">Resolved</div>
              </div>
            </div>
          </div>
        )}

        {/* Fire Causes Breakdown */}
        <div className="fire-card mb-12">
          <h2 className="text-3xl font-black text-white mb-6 text-center">🔍 Fire Causes Breakdown</h2>
          <div className="space-y-6">
            {[
              { label: '⚡ Electrical', count: stats.electrical_fires, pct: electricalPct, color: 'from-yellow-500 to-orange-500' },
              { label: '🍳 Cooking', count: stats.cooking_fires, pct: cookingPct, color: 'from-red-500 to-orange-500' },
              { label: '🚬 Smoking', count: stats.smoking_fires, pct: smokingPct, color: 'from-orange-500 to-red-500' },
              { label: '🔧 Other', count: stats.other_fires, pct: otherPct, color: 'from-gray-500 to-gray-600' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between mb-2">
                  <span className="text-yellow-400 font-bold">{item.label}</span>
                  <span className="text-white font-bold">{item.count} incidents ({item.pct}%)</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4">
                  <div className={`bg-gradient-to-r ${item.color} h-4 rounded-full`} style={{ width: `${item.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-400 mb-4">
            {stats.is_live ? 'Live data — updates automatically from emergency reports.' : 'Historical data entered by the admin.'}
          </p>
          <a href="/" className="text-yellow-400 hover:text-yellow-300 font-bold">← Back to Home</a>
        </div>
      </div>
    </div>
  );
}

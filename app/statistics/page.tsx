'use client';
import { useState, useEffect } from 'react';

interface FireStat {
  year: number;
  total_incidents: number;
  avg_response_time: number;
  lives_saved: number;
  properties_protected: number;
  electrical_fires: number;
  cooking_fires: number;
  smoking_fires: number;
  other_fires: number;
  updated_at: string;
}

export default function Statistics() {
  const [allStats, setAllStats] = useState<FireStat[]>([]);
  const [stats, setStats] = useState<FireStat | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/statistics/')
      .then(res => res.json())
      .then(data => {
        setAllStats(data);
        if (data.length > 0) {
          setStats(data[0]);
          setSelectedYear(data[0].year);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleYearChange = (year: string) => {
    const yearStats = allStats.find(s => s.year === parseInt(year));
    setStats(yearStats ?? null);
    setSelectedYear(parseInt(year));
  };

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
          <p className="text-base sm:text-xl text-yellow-400 font-semibold mb-6">Department Performance & Impact</p>
          
          {allStats.length > 1 && (
            <div className="flex justify-center items-center gap-3">
              <label className="text-white font-bold">Select Year:</label>
              <select
                value={selectedYear ?? ''}
                onChange={(e) => handleYearChange(e.target.value)}
                className="bg-gray-800 text-white border-2 border-yellow-500 rounded-lg px-6 py-2 font-bold text-lg hover:bg-gray-700 transition-smooth cursor-pointer"
              >
                {allStats.map((stat) => (
                  <option key={stat.year} value={stat.year}>
                    {stat.year}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          <div className="fire-card text-center">
            <div className="text-5xl mb-3">🔥</div>
            <h3 className="text-4xl font-black text-red-500 mb-2">{stats.total_incidents}</h3>
            <p className="text-gray-300 font-bold">Total Incidents</p>
          </div>

          <div className="fire-card text-center">
            <div className="text-5xl mb-3">⏱️</div>
            <h3 className="text-4xl font-black text-orange-500 mb-2">{stats.avg_response_time} min</h3>
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

        <div className="fire-card mb-12">
          <h2 className="text-3xl font-black text-white mb-6 text-center">🔍 Fire Causes Breakdown</h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-yellow-400 font-bold">⚡ Electrical</span>
                <span className="text-white font-bold">{stats.electrical_fires} incidents ({electricalPct}%)</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-4 rounded-full" style={{width: `${electricalPct}%`}}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-yellow-400 font-bold">🍳 Cooking</span>
                <span className="text-white font-bold">{stats.cooking_fires} incidents ({cookingPct}%)</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 h-4 rounded-full" style={{width: `${cookingPct}%`}}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-yellow-400 font-bold">🚬 Smoking</span>
                <span className="text-white font-bold">{stats.smoking_fires} incidents ({smokingPct}%)</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 h-4 rounded-full" style={{width: `${smokingPct}%`}}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-yellow-400 font-bold">🔧 Other</span>
                <span className="text-white font-bold">{stats.other_fires} incidents ({otherPct}%)</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div className="bg-gradient-to-r from-gray-500 to-gray-600 h-4 rounded-full" style={{width: `${otherPct}%`}}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-400 mb-4">Last updated: {new Date(stats.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <a href="/" className="text-yellow-400 hover:text-yellow-300 font-bold">← Back to Home</a>
        </div>
      </div>
    </div>
  );
}

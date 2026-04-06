'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('../../components/StationMap'), { ssr: false });

interface FireStation {
  id: number;
  name: string;
  address: string;
  contact_number: string;
  email?: string;
  station_type: string;
  latitude?: number;
  longitude?: number;
}

interface EmergencyReport {
  id: number;
  title: string;
  location: string;
  latitude?: number;
  longitude?: number;
  status: string;
}

export default function MapPage() {
  const [stations, setStations] = useState<FireStation[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      Promise.all([
        fetch('https://firebackend-tsi7.onrender.com/api/fire-stations/').then(res => res.json()),
        fetch('https://firebackend-tsi7.onrender.com/api/responding-emergencies/').then(res => res.json()),
      ]).then(([stationsData, reportsData]) => {
        setStations(stationsData);
        setEmergencies(reportsData);
        setLoading(false);
      }).catch(() => setLoading(false));
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const mainStations = stations.filter(s => s.station_type === 'main');
  const subStations = stations.filter(s => s.station_type === 'sub');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black">
      <div className="flames"></div>
      <div className="flames flames-2"></div>

      <div className="relative z-10">
        <header className="bg-red-600 border-b-4 border-yellow-400 shadow-2xl">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 sm:gap-4 hover:opacity-80 transition">
              <div className="fire-badge" style={{fontSize: '1.5rem'}}>🔥</div>
              <div>
                <h1 className="text-lg sm:text-2xl font-black text-white tracking-wider">CEBU FIRE DEPARTMENT</h1>
                <p className="text-yellow-300 text-xs sm:text-sm font-semibold">Fire Station Map</p>
              </div>
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 mb-4">
                FIRE STATION MAP
              </h2>
              <p className="text-base sm:text-xl text-gray-300">Locate fire stations across Cebu City</p>
            </div>

            {loading ? (
              <div className="text-center text-white text-2xl">Loading...</div>
            ) : (
              <>
                <div className="mb-12">
                  <MapComponent stations={stations} emergencies={emergencies} />
                </div>

                {emergencies.length > 0 && (
                  <div className="mb-8 p-4 bg-red-900/40 border border-red-600 rounded-lg">
                    <h3 className="text-2xl font-bold text-red-400 mb-3">🔥 Active Emergencies Being Responded To</h3>
                    <div className="space-y-2">
                      {emergencies.map(e => (
                        <div key={e.id} className="flex items-center gap-3 text-white">
                          <span className="text-xl">🔥</span>
                          <div>
                            <p className="font-bold">{e.title}</p>
                            <p className="text-gray-400 text-sm">📍 {e.location}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <h3 className="text-3xl font-bold text-yellow-400 mb-6">Main Stations</h3>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {mainStations.map((station) => (
                    <div key={station.id} className="station-card">
                      <h4 className="text-2xl font-bold text-white mb-3">🏢 {station.name}</h4>
                      <p className="text-gray-300 mb-2">📍 {station.address}</p>
                      <p className="text-yellow-400 font-semibold mb-1">📞 {station.contact_number}</p>
                      {station.email && <p className="text-gray-400">✉️ {station.email}</p>}
                    </div>
                  ))}
                </div>

                <h3 className="text-3xl font-bold text-yellow-400 mb-6">Sub Stations</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {subStations.map((station) => (
                    <div key={station.id} className="station-card">
                      <h4 className="text-2xl font-bold text-white mb-3">🏪 {station.name}</h4>
                      <p className="text-gray-300 mb-2">📍 {station.address}</p>
                      <p className="text-yellow-400 font-semibold mb-1">📞 {station.contact_number}</p>
                      {station.email && <p className="text-gray-400">✉️ {station.email}</p>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>

        <footer className="bg-black/50 border-t-2 border-red-600 py-6 mt-16">
          <div className="container mx-auto px-6 text-center text-gray-400">
            <p className="font-semibold">© 2026 Cebu Fire Department • Serving with Pride</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

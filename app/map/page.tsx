'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import API from '../../lib/api';

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
  priority?: string;
  created_at?: string;
  updated_at?: string;
}

const priorityClasses: Record<string, string> = {
  low: 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/30',
  medium: 'bg-amber-500/15 text-amber-200 border border-amber-500/30',
  high: 'bg-orange-500/15 text-orange-200 border border-orange-500/30',
  critical: 'bg-red-500/15 text-red-200 border border-red-500/30',
};

const statusClasses: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-200 border border-amber-500/30',
  responding: 'bg-blue-500/15 text-blue-200 border border-blue-500/30',
  resolved: 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/30',
};

export default function MapPage() {
  const [stations, setStations] = useState<FireStation[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyReport[]>([]);
  const [history, setHistory] = useState<EmergencyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      Promise.all([
        fetch(`${API}/api/fire-stations/`).then((res) => res.json()),
        fetch(`${API}/api/responding-emergencies/`).then((res) => res.json()),
        fetch(`${API}/api/emergency-history/`).then((res) => res.json()),
      ])
        .then(([stationsData, reportsData, historyData]) => {
          setStations(Array.isArray(stationsData) ? stationsData : []);
          setEmergencies(Array.isArray(reportsData) ? reportsData : []);
          setHistory(Array.isArray(historyData) ? historyData : []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const mainStations = stations.filter((station) => station.station_type === 'main');
  const subStations = stations.filter((station) => station.station_type === 'sub');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black">
      <div className="flames" />
      <div className="flames flames-2" />

      <div className="relative z-10">
        <header className="border-b-4 border-yellow-400 bg-red-600 shadow-2xl">
          <div className="container mx-auto flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
            <Link href="/" className="flex items-center gap-2 transition hover:opacity-80 sm:gap-4">
              <div className="fire-badge text-2xl">🔥</div>
              <div>
                <h1 className="text-lg font-black tracking-wider text-white sm:text-2xl">CEBU CITY FIRE SYSTEM</h1>
                <p className="text-xs font-semibold text-yellow-300 sm:text-sm">Fire Station Map</p>
              </div>
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 text-center sm:mb-12">
              <h2 className="mb-4 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-3xl font-black text-transparent sm:text-5xl">
                ACTIVE EMERGENCIES & FIRE STATION MAP
              </h2>
              <p className="text-base text-gray-300 sm:text-xl">Locate fire stations and view active emergencies across Cebu City</p>
            </div>

            {loading ? (
              <div className="text-center text-2xl text-white">Loading...</div>
            ) : (
              <>
                <div className="mb-12">
                  <MapComponent stations={stations} emergencies={emergencies} />
                </div>

                {emergencies.length > 0 && (
                  <section className="mb-8 rounded-lg border border-red-600 bg-red-900/40 p-4">
                    <h3 className="mb-3 text-2xl font-bold text-red-400">Active Emergencies Being Responded To</h3>
                    <div className="space-y-2">
                      {emergencies.map((emergency) => (
                        <div key={emergency.id} className="flex items-center gap-3 text-white">
                          <span className="text-xl">Alert</span>
                          <div>
                            <p className="font-bold">{emergency.title}</p>
                            <p className="text-sm text-gray-400">{emergency.location}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section className="mb-10 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-bold text-yellow-400">Emergency History</h3>
                      <p className="text-sm text-gray-300">Recent past incidents with date, location, priority, and status.</p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-gray-200">
                      {history.length} recent incident{history.length === 1 ? '' : 's'}
                    </div>
                  </div>

                  {history.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/15 bg-black/20 px-4 py-8 text-center text-sm text-gray-400">
                      No recent emergency history available yet.
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {history.map((incident) => {
                        const priorityClass = priorityClasses[incident.priority || 'medium'] || priorityClasses.medium;
                        const statusClass = statusClasses[incident.status] || statusClasses.resolved;
                        const displayDate = incident.updated_at || incident.created_at;

                        return (
                          <article key={incident.id} className="rounded-xl border border-white/10 bg-black/25 p-4 shadow-lg">
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-lg font-bold text-white">{incident.title}</p>
                                <p className="mt-1 text-sm text-gray-400">
                                  {displayDate
                                    ? new Date(displayDate).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })
                                    : 'Date unavailable'}
                                </p>
                              </div>
                              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusClass}`}>
                                {incident.status}
                              </span>
                            </div>

                            <div className="mb-3 flex flex-wrap gap-2">
                              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${priorityClass}`}>
                                {incident.priority || 'medium'} priority
                              </span>
                            </div>

                            <p className="text-sm text-gray-200">{incident.location}</p>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>

                <h3 className="mb-6 text-3xl font-bold text-yellow-400">Main Stations</h3>
                <div className="mb-8 grid gap-6 md:grid-cols-2">
                  {mainStations.map((station) => (
                    <div key={station.id} className="station-card">
                      <h4 className="mb-3 text-2xl font-bold text-white">{station.name}</h4>
                      <p className="mb-2 text-gray-300">{station.address}</p>
                      <p className="mb-1 font-semibold text-yellow-400">{station.contact_number}</p>
                      {station.email && <p className="text-gray-400">{station.email}</p>}
                    </div>
                  ))}
                </div>

                <h3 className="mb-6 text-3xl font-bold text-yellow-400">Sub Stations</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {subStations.map((station) => (
                    <div key={station.id} className="station-card">
                      <h4 className="mb-3 text-2xl font-bold text-white">{station.name}</h4>
                      <p className="mb-2 text-gray-300">{station.address}</p>
                      <p className="mb-1 font-semibold text-yellow-400">{station.contact_number}</p>
                      {station.email && <p className="text-gray-400">{station.email}</p>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>

        <footer className="mt-16 border-t-2 border-red-600 bg-black/50 py-6">
          <div className="container mx-auto px-6 text-center text-gray-400">
            <p className="font-semibold">Copyright 2026 Cebu Fire Department. Serving with Pride.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}


'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface HeroicAct {
  id: number;
  title: string;
  story: string;
  date_of_incident: string;
  location: string;
  image?: string;
  created_by_name: string;
}

export default function TrainedHeroes() {
  const [heroicActs, setHeroicActs] = useState<HeroicAct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/heroic-acts/')
      .then(res => res.json())
      .then(data => { setHeroicActs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

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
                <p className="text-yellow-300 text-xs sm:text-sm font-semibold">Our Heroes & Stations</p>
              </div>
            </Link>
            <Link href="/" className="bg-white/20 hover:bg-white/30 text-white text-sm font-bold px-4 py-2 rounded-lg transition">← Home</Link>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <section>
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 mb-4">
                  HEROIC ACTS
                </h2>
                <p className="text-base sm:text-xl text-gray-300">Stories of courage and bravery</p>
              </div>

              {heroicActs.length === 0 ? (
                <div className="fire-card text-center">
                  <p className="text-xl text-gray-300">No heroic acts recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {heroicActs.map((act) => (
                    <div key={act.id} className="heroic-card">
                      {act.image && (
                        <img src={act.image} alt={act.title} className="heroic-image" />
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">HEROIC ACT</span>
                          <span className="text-gray-400 text-sm">
                            {new Date(act.date_of_incident).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-2">🏆 {act.title}</h3>
                        <p className="text-yellow-400 mb-3">📍 {act.location}</p>
                        <p className="text-gray-300 text-lg leading-relaxed">{act.story}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>

        <footer className="bg-black/50 border-t-2 border-red-600 py-6 mt-16">
          <div className="container mx-auto px-6 text-center text-gray-400">
            <p className="font-semibold">© 2024 Cebu Fire Department • Serving with Pride</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

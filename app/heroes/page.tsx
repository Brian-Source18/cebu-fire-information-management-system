'use client';
import { useEffect, useState } from 'react';

import Footer from '../../components/Footer';
import PublicHeader from '../../components/PublicHeader';

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
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/heroic-acts/`)
      .then(res => res.json())
      .then(data => { setHeroicActs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black">
      <div className="flames"></div>
      <div className="flames flames-2"></div>
      
      <div className="relative z-10">
      <PublicHeader />

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

        <Footer />
      </div>
    </div>
  );
}



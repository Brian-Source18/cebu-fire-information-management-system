'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PreventionTip {
  id: number;
  title: string;
  description: string;
  image?: string;
  created_by_name: string;
  created_at: string;
}

export default function FirePrevention() {
  const [tips, setTips] = useState<PreventionTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTip, setSelectedTip] = useState<PreventionTip | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/fire-prevention/')
      .then(res => res.json())
      .then(data => {
        setTips(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const openModal = (tip: PreventionTip) => {
    setSelectedTip(tip);
  };

  const closeModal = () => {
    setSelectedTip(null);
  };

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
                <p className="text-yellow-300 text-xs sm:text-sm font-semibold">Fire Prevention & Safety</p>
              </div>
            </Link>
            <Link href="/" className="bg-white/20 hover:bg-white/30 text-white text-sm font-bold px-4 py-2 rounded-lg transition">← Home</Link>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-16">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 mb-4">
                FIRE PREVENTION TIPS
              </h2>
              <p className="text-base sm:text-xl text-gray-300">Learn how to protect your community from fire hazards</p>
              <p className="text-sm text-yellow-400 mt-2">Click on any tip to view full details</p>
            </div>

            {loading ? (
              <div className="text-center text-white text-2xl">Loading tips...</div>
            ) : tips.length === 0 ? (
              <div className="fire-card text-center">
                <p className="text-xl text-gray-300">No prevention tips available at the moment.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {tips.map((tip) => (
                  <div 
                    key={tip.id} 
                    className="prevention-card cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => openModal(tip)}
                  >
                    {tip.image && (
                      <img src={tip.image} alt={tip.title} className="prevention-image" />
                    )}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-white mb-3">🛡️ {tip.title}</h3>
                      <p className="text-gray-300 text-base leading-relaxed line-clamp-3">{tip.description}</p>
                      <p className="text-yellow-400 text-sm mt-3 font-semibold">Click to read more →</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {selectedTip && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <div 
              className="bg-gradient-to-br from-gray-900 to-red-950 border-4 border-red-600 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-red-600 p-4 flex items-center justify-between border-b-4 border-yellow-400">
                <h3 className="text-2xl font-black text-white">🛡️ {selectedTip.title}</h3>
                <button 
                  onClick={closeModal}
                  className="text-white hover:text-yellow-400 text-3xl font-bold transition"
                >
                  ×
                </button>
              </div>
              
              {selectedTip.image && (
                <img 
                  src={selectedTip.image} 
                  alt={selectedTip.title} 
                  className="w-full h-64 object-cover"
                />
              )}
              
              <div className="p-6">
                <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-line">
                  {selectedTip.description}
                </p>
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <p className="text-gray-400 text-sm">
                    Posted by: <span className="text-yellow-400 font-semibold">{selectedTip.created_by_name}</span>
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Date: <span className="text-yellow-400">{new Date(selectedTip.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </p>
                </div>
                <button 
                  onClick={closeModal}
                  className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <footer className="bg-black/50 border-t-2 border-red-600 py-6 mt-16">
          <div className="container mx-auto px-6 text-center text-gray-400">
            <p className="font-semibold">© 2024 Cebu Fire Department • Serving with Pride</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

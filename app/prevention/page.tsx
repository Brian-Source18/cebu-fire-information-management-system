'use client';
import { useEffect, useState } from 'react';
import Footer from '../../components/Footer';
import PublicHeader from '../../components/PublicHeader';

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
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fire-prevention/`)
      .then((res) => res.json())
      .then((data) => {
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
      <PublicHeader />

        <main className="container mx-auto px-4 py-8 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 text-center sm:mb-12">
              <h2 className="mb-4 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-3xl font-black text-transparent sm:text-5xl">
                FIRE PREVENTION TIPS
              </h2>
              <p className="text-base text-gray-300 sm:text-xl">Learn how to protect your community from fire hazards</p>
              <p className="mt-2 text-sm text-yellow-400">Click on any tip to view full details</p>
            </div>

            {loading ? (
              <div className="text-center text-2xl text-white">Loading tips...</div>
            ) : tips.length === 0 ? (
              <div className="fire-card text-center">
                <p className="text-xl text-gray-300">No prevention tips available at the moment.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {tips.map((tip) => (
                  <div
                    key={tip.id}
                    className="prevention-card cursor-pointer transition-transform hover:scale-105"
                    onClick={() => openModal(tip)}
                  >
                    {tip.image && (
                      <img src={tip.image} alt={tip.title} className="prevention-image" />
                    )}
                    <div className="p-6">
                      <h3 className="mb-3 text-2xl font-bold text-white">Safety {tip.title}</h3>
                      <p className="line-clamp-3 text-base leading-relaxed text-gray-300">{tip.description}</p>
                      <p className="mt-3 text-sm font-semibold text-yellow-400">Click to read more -&gt;</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {selectedTip && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={closeModal}
          >
            <div
              className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border-4 border-red-600 bg-gradient-to-br from-gray-900 to-red-950"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 flex items-center justify-between border-b-4 border-yellow-400 bg-red-600 p-4">
                <h3 className="text-2xl font-black text-white">Safety {selectedTip.title}</h3>
                <button
                  onClick={closeModal}
                  className="text-3xl font-bold text-white transition hover:text-yellow-400"
                >
                  ×
                </button>
              </div>

              {selectedTip.image && (
                <img
                  src={selectedTip.image}
                  alt={selectedTip.title}
                  className="h-64 w-full object-cover"
                />
              )}

              <div className="p-6">
                <p className="whitespace-pre-line text-lg leading-relaxed text-gray-300">
                  {selectedTip.description}
                </p>
                <div className="mt-6 border-t border-gray-700 pt-6">
                  <p className="text-sm text-gray-400">
                    Posted by: <span className="font-semibold text-yellow-400">{selectedTip.created_by_name}</span>
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    Date:{' '}
                    <span className="text-yellow-400">
                      {new Date(selectedTip.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="mt-6 w-full rounded bg-red-600 py-3 font-bold text-white transition hover:bg-red-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}


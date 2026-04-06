'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  image?: string;
  created_by_name: string;
  created_at: string;
}

export default function EmergencyResponse() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [imageZoom, setImageZoom] = useState(false);

  useEffect(() => {
    fetch('https://firebackend-tsi7.onrender.com/api/news/')
      .then(res => res.json())
      .then(data => {
        console.log('News data:', data);
        setNews(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching news:', err);
        setLoading(false);
      });
  }, []);

  const openModal = (item: NewsItem) => {
    setSelectedNews(item);
    setImageZoom(false);
  };

  const closeModal = () => {
    setSelectedNews(null);
    setImageZoom(false);
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
                <p className="text-yellow-300 text-xs sm:text-sm font-semibold">Emergency Response Updates</p>
              </div>
            </Link>
            <Link href="/" className="bg-white/20 hover:bg-white/30 text-white text-sm font-bold px-4 py-2 rounded-lg transition">← Home</Link>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-16">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 mb-4">
                LATEST NEWS & UPDATES
              </h2>
              <p className="text-base sm:text-xl text-gray-300">Stay informed about Cebu Fire Department activities</p>
              <p className="text-sm text-yellow-400 mt-2">Click on any news to view full details</p>
            </div>

            {loading ? (
              <div className="text-center text-white text-2xl">Loading news...</div>
            ) : news.length === 0 ? (
              <div className="fire-card text-center">
                <p className="text-xl text-gray-300">No news available at the moment.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {news.map((item) => (
                  <div 
                    key={item.id} 
                    className="news-card cursor-pointer hover:scale-[1.02] transition-transform"
                    onClick={() => openModal(item)}
                  >
                    {item.image && (
                      <img src={item.image} alt={item.title} className="news-image-tag" />
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">NEWS</span>
                        <span className="text-gray-400 text-sm">
                          {new Date(item.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-3">{item.title}</h3>
                      <p className="text-gray-300 text-lg leading-relaxed mb-4 line-clamp-3">{item.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-yellow-400">
                          <span className="font-semibold">Posted by:</span>
                          <span>{item.created_by_name}</span>
                        </div>
                        <span className="text-yellow-400 font-semibold">Click to read more →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {selectedNews && (
          <div 
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <div 
              className="bg-gradient-to-br from-gray-900 to-red-950 border-4 border-red-600 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-red-600 p-4 flex items-center justify-between border-b-4 border-yellow-400 z-10">
                <h3 className="text-2xl font-black text-white">📰 {selectedNews.title}</h3>
                <button 
                  onClick={closeModal}
                  className="text-white hover:text-yellow-400 text-3xl font-bold transition"
                >
                  ×
                </button>
              </div>
              
              {selectedNews.image && (
                <div className="relative">
                  <img 
                    src={selectedNews.image} 
                    alt={selectedNews.title} 
                    className={`w-full transition-all duration-300 cursor-pointer ${
                      imageZoom ? 'h-auto' : 'h-96 object-cover'
                    }`}
                    onClick={() => setImageZoom(!imageZoom)}
                  />
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 rounded text-sm">
                    {imageZoom ? '🔍 Click to minimize' : '🔍 Click to zoom'}
                  </div>
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">NEWS</span>
                  <span className="text-gray-400 text-sm">
                    {new Date(selectedNews.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-line mb-6">
                  {selectedNews.content}
                </p>
                
                <div className="pt-6 border-t border-gray-700">
                  <p className="text-gray-400 text-sm">
                    Posted by: <span className="text-yellow-400 font-semibold">{selectedNews.created_by_name}</span>
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

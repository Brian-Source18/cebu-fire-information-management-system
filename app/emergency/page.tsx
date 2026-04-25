'use client';
import { useEffect, useState } from 'react';

import Footer from '../../components/Footer';
import PublicHeader from '../../components/PublicHeader';

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
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news/`).then(r => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements/`).then(r => r.json()),
    ]).then(([newsData, annData]) => {
      const emergencyAnns = (Array.isArray(annData) ? annData : []).filter((a: any) => a.priority === 'emergency').map((a: any) => ({
        id: `ann-${a.id}`,
        title: a.title,
        content: a.message,
        image: a.image,
        created_by_name: a.created_by_name,
        created_at: a.created_at,
        isAnnouncement: true,
      }));
      setNews([...emergencyAnns, ...(Array.isArray(newsData) ? newsData.map((n: any) => ({ ...n, id: `news-${n.id}` })) : [])]);
      setLoading(false);
    }).catch(() => setLoading(false));
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
      <PublicHeader />

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
                        <span className={`px-3 py-1 rounded-full text-sm font-bold text-white ${(item as any).isAnnouncement ? 'bg-red-700' : 'bg-red-600'}`}>
                          {(item as any).isAnnouncement ? 'EMERGENCY' : 'NEWS'}
                        </span>
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

        <Footer />
      </div>
    </div>
  );
}



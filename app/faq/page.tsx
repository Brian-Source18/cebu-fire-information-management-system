'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}

export default function FAQ() {
  const [openId, setOpenId] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/faq/');
      const data = await response.json();
      setFaqs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryDisplay = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'emergency': 'Emergency Procedures',
      'safety': 'Fire Safety',
      'equipment': 'Equipment & Tools',
      'permits': 'Permits & Regulations',
      'prevention': 'Fire Prevention',
      'training': 'Training & Education'
    };
    return categoryMap[category] || category;
  };

  const categories = ['emergency', 'safety', 'equipment', 'permits', 'prevention', 'training'];

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  const filteredFaqs = selectedCategory
    ? faqs.filter(faq => faq.category === selectedCategory)
    : faqs;

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
                <p className="text-yellow-300 text-xs sm:text-sm font-semibold">Frequently Asked Questions</p>
              </div>
            </Link>
            <Link href="/" className="bg-white/20 hover:bg-white/30 text-white text-sm font-bold px-4 py-2 rounded-lg transition">← Home</Link>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 mb-4">
                FREQUENTLY ASKED QUESTIONS
              </h2>
              <p className="text-base sm:text-xl text-gray-300">Find answers to common fire safety questions</p>
              <p className="text-sm text-yellow-400 mt-2">Click on any question to see the answer</p>
            </div>

            <div className="mb-8 flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  selectedCategory === null
                    ? 'bg-yellow-500 text-black shadow-lg scale-105'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    selectedCategory === category
                      ? 'bg-yellow-500 text-black shadow-lg scale-105'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {getCategoryDisplay(category)}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center text-white text-xl py-12">Loading FAQs...</div>
            ) : filteredFaqs.length === 0 ? (
              <div className="text-center text-gray-400 text-xl py-12">
                {selectedCategory ? `No FAQs found for ${getCategoryDisplay(selectedCategory)}.` : 'No FAQs available at the moment.'}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFaqs.map((faq) => (
                  <div key={faq.id} className="fire-card">
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full text-left flex items-center justify-between gap-4"
                    >
                      <div className="flex-1">
                        <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-2">
                          {getCategoryDisplay(faq.category)}
                        </span>
                        <h3 className="text-xl font-bold text-white">
                          ❓ {faq.question}
                        </h3>
                      </div>
                      <div className="text-yellow-400 text-3xl font-bold transition-transform" style={{ transform: openId === faq.id ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        ▼
                      </div>
                    </button>
                    
                    {openId === faq.id && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-line">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-12 fire-card text-center">
              <h3 className="text-2xl font-bold text-white mb-4">📞 Still Have Questions?</h3>
              <p className="text-gray-300 mb-4">Contact us for more information</p>
              <div className="space-y-2 text-yellow-400">
                <p className="font-bold">Emergency: 911</p>
                <p>Non-Emergency: (032) 234-5678</p>
                <p>Email: cebufire@gmail.com</p>
              </div>
            </div>
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

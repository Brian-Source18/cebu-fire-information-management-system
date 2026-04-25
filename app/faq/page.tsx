'use client';
import { useState, useEffect } from 'react';
import Footer from '../../components/Footer';
import PublicHeader from '../../components/PublicHeader';

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/faq/`);
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
      emergency: 'Emergency Procedures',
      safety: 'Fire Safety',
      equipment: 'Equipment & Tools',
      permits: 'Permits & Regulations',
      prevention: 'Fire Prevention',
      training: 'Training & Education',
    };
    return categoryMap[category] || category;
  };

  const categories = ['emergency', 'safety', 'equipment', 'permits', 'prevention', 'training'];

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  const filteredFaqs = selectedCategory ? faqs.filter((faq) => faq.category === selectedCategory) : faqs;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black">
      <div className="flames"></div>
      <div className="flames flames-2"></div>

      <div className="relative z-10">
      <PublicHeader />

        <main className="container mx-auto px-4 py-8 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center sm:mb-12">
              <h2 className="mb-4 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-3xl font-black text-transparent sm:text-5xl">
                FREQUENTLY ASKED QUESTIONS
              </h2>
              <p className="text-base text-gray-300 sm:text-xl">Find answers to common fire safety questions</p>
              <p className="mt-2 text-sm text-yellow-400">Click on any question to see the answer</p>
            </div>

            <div className="mb-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
                  selectedCategory === null ? 'bg-yellow-500 text-black shadow-lg scale-105' : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
                    selectedCategory === category ? 'bg-yellow-500 text-black shadow-lg scale-105' : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {getCategoryDisplay(category)}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="py-12 text-center text-xl text-white">Loading FAQs...</div>
            ) : filteredFaqs.length === 0 ? (
              <div className="py-12 text-center text-xl text-gray-400">
                {selectedCategory ? `No FAQs found for ${getCategoryDisplay(selectedCategory)}.` : 'No FAQs available at the moment.'}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFaqs.map((faq) => (
                  <div key={faq.id} className="fire-card">
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="flex w-full items-center justify-between gap-4 text-left"
                    >
                      <div className="flex-1">
                        <span className="mb-2 inline-block rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
                          {getCategoryDisplay(faq.category)}
                        </span>
                        <h3 className="text-xl font-bold text-white">
                          ? {faq.question}
                        </h3>
                      </div>
                      <div
                        className="text-3xl font-bold text-yellow-400 transition-transform"
                        style={{ transform: openId === faq.id ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      >
                        ▼
                      </div>
                    </button>

                    {openId === faq.id && (
                      <div className="mt-4 border-t border-gray-700 pt-4">
                        <p className="whitespace-pre-line text-lg leading-relaxed text-gray-300">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="fire-card mt-12 text-center">
              <h3 className="mb-4 text-2xl font-bold text-white">Still Have Questions?</h3>
              <p className="mb-4 text-gray-300">Contact us for more information</p>
              <div className="space-y-2 text-yellow-400">
                <p className="font-bold">Emergency: 911</p>
                <p>Non-Emergency: (032) 234-5678</p>
                <p>Email: cebufire@gmail.com</p>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}


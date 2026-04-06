'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
}

const CATEGORIES = [
  'emergency',
  'safety',
  'equipment',
  'permits',
  'prevention',
  'training'
];

export default function FAQManagement() {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ category: '', question: '', answer: '' });

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('https://firebackend-tsi7.onrender.com/api/admin/faq/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setFaqs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId 
      ? `https://firebackend-tsi7.onrender.com/api/admin/faq/${editingId}/`
      : 'https://firebackend-tsi7.onrender.com/api/admin/faq/';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchFAQs();
        setShowModal(false);
        setFormData({ category: '', question: '', answer: '' });
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error saving FAQ:', error);
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingId(faq.id);
    setFormData({ category: faq.category, question: faq.question, answer: faq.answer });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this FAQ?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`https://firebackend-tsi7.onrender.com/api/admin/faq/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchFAQs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-orange-800">FAQ Management</h1>
        <button onClick={() => { setShowModal(true); setEditingId(null); setFormData({ category: '', question: '', answer: '' }); }} className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
          Add FAQ
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {faqs.length === 0 ? (
          <div className="p-6 text-center text-gray-600">No FAQs found</div>
        ) : (
        <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Question</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Answer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {faqs.map((faq) => (
              <tr key={faq.id}>
                <td className="px-6 py-4 text-gray-800">{faq.category}</td>
                <td className="px-6 py-4 text-gray-800 max-w-xs truncate">{faq.question}</td>
                <td className="px-6 py-4 text-gray-600 max-w-md truncate">{faq.answer}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleEdit(faq)} className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                  <button onClick={() => handleDelete(faq.id)} className="text-red-600 hover:text-red-800">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">{editingId ? 'Edit' : 'Add'} FAQ</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full border rounded px-3 py-2 text-gray-800" required>
                  <option value="">Select Category</option>
                  <option value="emergency">Emergency Procedures</option>
                  <option value="safety">Fire Safety</option>
                  <option value="equipment">Equipment & Tools</option>
                  <option value="permits">Permits & Regulations</option>
                  <option value="prevention">Fire Prevention</option>
                  <option value="training">Training & Education</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Question</label>
                <input type="text" value={formData.question} onChange={(e) => setFormData({...formData, question: e.target.value})} className="w-full border rounded px-3 py-2 text-gray-800" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Answer</label>
                <textarea value={formData.answer} onChange={(e) => setFormData({...formData, answer: e.target.value})} className="w-full border rounded px-3 py-2 text-gray-800" rows={6} required />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => { setShowModal(false); setEditingId(null); }} className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  image: string | null;
  is_active: boolean;
  created_by_name: string;
  created_at: string;
}

interface FormData {
  title: string;
  content: string;
  image: File | string | null;
  is_active: boolean;
}

export default function NewsManagement() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    image: null,
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const { refreshToken } = useAuth();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/news/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setNews(data);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('access_token');
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('is_active', String(formData.is_active));
      
      if (formData.image && typeof formData.image !== 'string') {
        formDataToSend.append('image', formData.image);
      }

      const url = editingNews
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/news/${editingNews.id}/`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/news/`;
      
      const method = editingNews ? 'PATCH' : 'POST';

      let response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend,
      });

      if (response.status === 401) {
        const newToken = await refreshToken();
        if (newToken) {
          response = await fetch(url, {
            method,
            headers: { 'Authorization': `Bearer ${newToken}` },
            body: formDataToSend,
          });
        }
      }

      if (response.ok) {
        alert(editingNews ? 'News updated successfully!' : 'News created successfully!');
        setShowModal(false);
        resetForm();
        fetchNews();
      } else {
        alert('Error saving news');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving news');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this news?')) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/news/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        alert('News deleted successfully!');
        fetchNews();
      } else {
        alert('Error deleting news');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error deleting news');
    }
  };

  const handleEdit = (newsItem: NewsItem) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      image: newsItem.image,
      is_active: newsItem.is_active,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', image: null, is_active: true });
    setEditingNews(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  if (loading) {
    return <div className="text-center py-8">Loading news...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-orange-800">News Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-600 hover:bg-red-700 text-black px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2"
        >
          <span>➕</span> Add News
        </button>
      </div>

      {/* News Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-black-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black-200">
            {news.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-black">
                  No news articles yet. Click "Add News" to create one.
                </td>
              </tr>
            ) : (
              news.map((item) => (
                <tr key={item.id} className="hover:bg-black-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img src={item.image} alt="" className="w-12 h-12 object-cover rounded" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-800">{item.title}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{item.content}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.created_by_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-black">
                {editingNews ? 'Edit News' : 'Add News'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-black font-semibold mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="text-black w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-black font-semibold mb-2">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="text-black w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 h-32"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                />
                {editingNews && editingNews.image && (
                  <img src={editingNews.image} alt="" className="mt-2 w-32 h-32 object-cover rounded" />
                )}
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700 font-semibold">Active</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (editingNews ? 'Update' : 'Create')}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


'use client';
import { useEffect, useState } from 'react';

interface PreventionTip {
  id: number;
  title: string;
  description: string;
  image: string | null;
  is_active: boolean;
  created_by_name: string;
  created_at: string;
}

interface FormData {
  title: string;
  description: string;
  image: File | string | null;
  is_active: boolean;
}

export default function PreventionManagement() {
  const [tips, setTips] = useState<PreventionTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTip, setEditingTip] = useState<PreventionTip | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    image: null,
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/admin/fire-prevention/', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTips(data);
      }
    } catch (error) {
      console.error('Error fetching tips:', error);
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
      formDataToSend.append('description', formData.description);
      formDataToSend.append('is_active', String(formData.is_active));
      
      if (formData.image && typeof formData.image !== 'string') {
        formDataToSend.append('image', formData.image);
      }

      const url = editingTip
        ? `http://localhost:8000/api/admin/fire-prevention/${editingTip.id}/`
        : 'http://localhost:8000/api/admin/fire-prevention/';
      
      const method = editingTip ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend,
      });

      if (response.ok) {
        alert(editingTip ? 'Tip updated successfully!' : 'Tip created successfully!');
        setShowModal(false);
        resetForm();
        fetchTips();
      } else {
        alert('Error saving tip');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving tip');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tip?')) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/admin/fire-prevention/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        alert('Tip deleted successfully!');
        fetchTips();
      } else {
        alert('Error deleting tip');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error deleting tip');
    }
  };

  const handleEdit = (tip: PreventionTip) => {
    setEditingTip(tip);
    setFormData({
      title: tip.title,
      description: tip.description,
      image: tip.image,
      is_active: tip.is_active,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', image: null, is_active: true });
    setEditingTip(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  if (loading) {
    return <div className="text-center py-8">Loading fire prevention tips...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-orange-800">Fire Prevention Tips</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2"
        >
          <span>➕</span> Add Tip
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tips.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No fire prevention tips yet. Click "Add Tip" to create one.
                </td>
              </tr>
            ) : (
              tips.map((tip) => (
                <tr key={tip.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {tip.image && (
                        <img src={tip.image} alt="" className="w-12 h-12 object-cover rounded" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-800">{tip.title}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{tip.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{tip.created_by_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(tip.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${tip.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {tip.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(tip)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(tip.id)}
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingTip ? 'Edit Fire Prevention Tip' : 'Add Fire Prevention Tip'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-32"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {editingTip && editingTip.image && (
                  <img src={editingTip.image} alt="" className="mt-2 w-32 h-32 object-cover rounded" />
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
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (editingTip ? 'Update' : 'Create')}
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

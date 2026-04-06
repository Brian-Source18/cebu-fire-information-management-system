'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Announcement {
  id: number;
  title: string;
  message: string;
  priority: string;
  created_at: string;
}

export default function AnnouncementsManagement() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: '', message: '', priority: 'info' });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/admin/announcements/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId 
      ? `http://localhost:8000/api/admin/announcements/${editingId}/`
      : 'http://localhost:8000/api/admin/announcements/';
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
        fetchAnnouncements();
        setShowModal(false);
        setFormData({ title: '', message: '', priority: 'info' });
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setFormData({ title: announcement.title, message: announcement.message, priority: announcement.priority });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`http://localhost:8000/api/admin/announcements/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-orange-800">Announcements Management</h1>
        <button onClick={() => { setShowModal(true); setEditingId(null); setFormData({ title: '', message: '', priority: 'info' }); }} className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
          Add Announcement
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {announcements.length === 0 ? (
          <div className="p-6 text-center text-gray-600">No announcements found</div>
        ) : (
        <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Message</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {announcements.map((announcement) => (
              <tr key={announcement.id}>
                <td className="px-6 py-4 text-gray-800">{announcement.title}</td>
                <td className="px-6 py-4 text-gray-600 max-w-md truncate">{announcement.message}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    announcement.priority === 'emergency' ? 'bg-red-100 text-red-800' :
                    announcement.priority === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {announcement.priority.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{new Date(announcement.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleEdit(announcement)} className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                  <button onClick={() => handleDelete(announcement.id)} className="text-red-600 hover:text-red-800">Delete</button>
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
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">{editingId ? 'Edit' : 'Add'} Announcement</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full border rounded px-3 py-2 text-gray-800" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Message</label>
                <textarea value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full border rounded px-3 py-2 text-gray-800" rows={6} required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Priority</label>
                <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full border rounded px-3 py-2 text-gray-800" required>
                  <option value="info">Information</option>
                  <option value="warning">Warning</option>
                  <option value="emergency">Emergency</option>
                </select>
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

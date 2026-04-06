'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface FireStation {
  id: number;
  name: string;
  address: string;
  contact_number: string;
  station_type: string;
  latitude: number;
  longitude: number;
}

export default function FireStationsManagement() {
  const { user } = useAuth();
  const [stations, setStations] = useState<FireStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '', contact_number: '', station_type: 'sub', latitude: '', longitude: '' });

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('https://firebackend-tsi7.onrender.com/api/admin/fire-stations/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching stations:', error);
      setStations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId 
      ? `https://firebackend-tsi7.onrender.com/api/admin/fire-stations/${editingId}/`
      : 'https://firebackend-tsi7.onrender.com/api/admin/fire-stations/';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
        })
      });

      if (response.ok) {
        fetchStations();
        setShowModal(false);
        setFormData({ name: '', address: '', contact_number: '', station_type: 'sub', latitude: '', longitude: '' });
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error saving station:', error);
    }
  };

  const handleEdit = (station: FireStation) => {
    setEditingId(station.id);
    setFormData({ 
      name: station.name, 
      address: station.address, 
      contact_number: station.contact_number,
      station_type: station.station_type,
      latitude: station.latitude.toString(),
      longitude: station.longitude.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this fire station?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`https://firebackend-tsi7.onrender.com/api/admin/fire-stations/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchStations();
    } catch (error) {
      console.error('Error deleting station:', error);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-orange-800">Fire Stations Management</h1>
        <button onClick={() => { setShowModal(true); setEditingId(null); setFormData({ name: '', address: '', contact_number: '', station_type: 'sub', latitude: '', longitude: '' }); }} className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
          Add Fire Station
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {stations.length === 0 ? (
          <div className="p-6 text-center text-gray-600">No fire stations found</div>
        ) : (
        <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Coordinates</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {stations.map((station) => (
              <tr key={station.id}>
                <td className="px-6 py-4 text-gray-800">{station.name}</td>
                <td className="px-6 py-4 text-gray-600">{station.station_type === 'main' ? 'Main Station' : 'Sub Station'}</td>
                <td className="px-6 py-4 text-gray-600">{station.address}</td>
                <td className="px-6 py-4 text-gray-600">{station.contact_number}</td>
                <td className="px-6 py-4 text-gray-600">{station.latitude}, {station.longitude}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleEdit(station)} className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                  <button onClick={() => handleDelete(station.id)} className="text-red-600 hover:text-red-800">Delete</button>
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
            <h2 className="text-xl font-bold mb-4 text-gray-800">{editingId ? 'Edit' : 'Add'} Fire Station</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border rounded px-3 py-2 text-gray-800" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Address</label>
                <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full border rounded px-3 py-2 text-gray-800" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Contact Number</label>
                <input type="text" value={formData.contact_number} onChange={(e) => setFormData({...formData, contact_number: e.target.value})} className="w-full border rounded px-3 py-2 text-gray-800" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Station Type</label>
                <select value={formData.station_type} onChange={(e) => setFormData({...formData, station_type: e.target.value})} className="w-full border rounded px-3 py-2 text-gray-800" required>
                  <option value="main">Main Station</option>
                  <option value="sub">Sub Station</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">Latitude</label>
                  <input type="number" step="any" value={formData.latitude} onChange={(e) => setFormData({...formData, latitude: e.target.value})} className="w-full border rounded px-3 py-2 text-gray-800" required />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Longitude</label>
                  <input type="number" step="any" value={formData.longitude} onChange={(e) => setFormData({...formData, longitude: e.target.value})} className="w-full border rounded px-3 py-2 text-gray-800" required />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => { setShowModal(false); setEditingId(null); setFormData({ name: '', address: '', contact_number: '', station_type: 'sub', latitude: '', longitude: '' }); }} className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

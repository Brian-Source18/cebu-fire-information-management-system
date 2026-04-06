'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

interface Statistic {
  id: number;
  year: number;
  total_incidents: number;
  lives_saved: number;
  properties_protected: number;
  avg_response_time: string;
  electrical_fires: number;
  cooking_fires: number;
  smoking_fires: number;
  other_fires: number;
}

export default function StatisticsManagement() {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    year: '', 
    total_incidents: '', 
    lives_saved: '', 
    properties_protected: '', 
    avg_response_time: '',
    electrical_fires: '',
    cooking_fires: '',
    smoking_fires: '',
    other_fires: ''
  });

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('https://firebackend-tsi7.onrender.com/api/admin/statistics/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStatistics(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setStatistics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId 
      ? `https://firebackend-tsi7.onrender.com/api/admin/statistics/${editingId}/`
      : 'https://firebackend-tsi7.onrender.com/api/admin/statistics/';
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
          year: parseInt(formData.year),
          total_incidents: parseInt(formData.total_incidents),
          lives_saved: parseInt(formData.lives_saved),
          properties_protected: parseInt(formData.properties_protected),
          avg_response_time: parseFloat(formData.avg_response_time),
          electrical_fires: parseInt(formData.electrical_fires),
          cooking_fires: parseInt(formData.cooking_fires),
          smoking_fires: parseInt(formData.smoking_fires),
          other_fires: parseInt(formData.other_fires)
        })
      });

      if (response.ok) {
        fetchStatistics();
        setShowModal(false);
        setFormData({ 
          year: '', 
          total_incidents: '', 
          lives_saved: '', 
          properties_protected: '', 
          avg_response_time: '',
          electrical_fires: '',
          cooking_fires: '',
          smoking_fires: '',
          other_fires: ''
        });
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error saving statistic:', error);
    }
  };

  const handleEdit = (stat: Statistic) => {
    setEditingId(stat.id);
    setFormData({ 
      year: stat.year.toString(), 
      total_incidents: stat.total_incidents.toString(), 
      lives_saved: stat.lives_saved.toString(),
      properties_protected: stat.properties_protected.toString(),
      avg_response_time: stat.avg_response_time.toString(),
      electrical_fires: stat.electrical_fires.toString(),
      cooking_fires: stat.cooking_fires.toString(),
      smoking_fires: stat.smoking_fires.toString(),
      other_fires: stat.other_fires.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this statistic?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`https://firebackend-tsi7.onrender.com/api/admin/statistics/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchStatistics();
    } catch (error) {
      console.error('Error deleting statistic:', error);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  const sortedStats = [...statistics].sort((a, b) => a.year - b.year);
  const years = sortedStats.map(s => s.year.toString());

  const incidentsBarData = {
    labels: years,
    datasets: [{
      label: 'Total Incidents',
      data: sortedStats.map(s => s.total_incidents),
      backgroundColor: 'rgba(220, 38, 38, 0.7)',
      borderColor: 'rgba(220, 38, 38, 1)',
      borderWidth: 1,
    }],
  };

  const livesSavedBarData = {
    labels: years,
    datasets: [{
      label: 'Lives Saved',
      data: sortedStats.map(s => s.lives_saved),
      backgroundColor: 'rgba(22, 163, 74, 0.7)',
      borderColor: 'rgba(22, 163, 74, 1)',
      borderWidth: 1,
    }],
  };

  const latest = sortedStats[sortedStats.length - 1];
  const fireCausePieData = latest ? {
    labels: ['Electrical', 'Cooking', 'Smoking', 'Other'],
    datasets: [{
      data: [latest.electrical_fires, latest.cooking_fires, latest.smoking_fires, latest.other_fires],
      backgroundColor: ['rgba(234, 88, 12, 0.8)', 'rgba(234, 179, 8, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(107, 114, 128, 0.8)'],
      borderWidth: 1,
    }],
  } : null;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-orange-800">Fire Statistics Management</h1>
        <button onClick={() => { setShowModal(true); setEditingId(null); setFormData({ year: '', total_incidents: '', lives_saved: '', properties_protected: '', avg_response_time: '', electrical_fires: '', cooking_fires: '', smoking_fires: '', other_fires: '' }); }} className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
          Add Statistic
        </button>
      </div>

      {statistics.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-base font-bold text-gray-700 mb-3">Total Incidents per Year</h2>
            <Bar data={incidentsBarData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-base font-bold text-gray-700 mb-3">Lives Saved per Year</h2>
            <Bar data={livesSavedBarData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>
          {fireCausePieData && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-base font-bold text-gray-700 mb-3">Fire Causes ({latest.year})</h2>
              <Doughnut data={fireCausePieData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {statistics.length === 0 ? (
          <div className="p-6 text-center text-gray-600">No statistics found</div>
        ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Total Incidents</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Lives Saved</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Properties Protected</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Avg Response Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Electrical Fires</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Cooking Fires</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Smoking Fires</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Other Fires</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {statistics.map((stat) => (
                <tr key={stat.id}>
                  <td className="px-6 py-4 text-gray-800">{stat.year}</td>
                  <td className="px-6 py-4 text-gray-600">{stat.total_incidents}</td>
                  <td className="px-6 py-4 text-gray-600">{stat.lives_saved}</td>
                  <td className="px-6 py-4 text-gray-600">{stat.properties_protected}</td>
                  <td className="px-6 py-4 text-gray-600">{stat.avg_response_time} min</td>
                  <td className="px-6 py-4 text-gray-600">{stat.electrical_fires}</td>
                  <td className="px-6 py-4 text-gray-600">{stat.cooking_fires}</td>
                  <td className="px-6 py-4 text-gray-600">{stat.smoking_fires}</td>
                  <td className="px-6 py-4 text-gray-600">{stat.other_fires}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleEdit(stat)} className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                    <button onClick={() => handleDelete(stat.id)} className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Edit' : 'Add'} Statistic</h2>
            </div>
            <div className="overflow-y-auto p-6">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Year</label>
                  <input type="number" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} className="w-full border rounded px-3 py-2 text-gray-800" required />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Total Incidents</label>
                  <input type="number" value={formData.total_incidents} onChange={(e) => setFormData({...formData, total_incidents: e.target.value})} className="w-full border rounded px-3 py-2 text-gray-800" required />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Lives Saved</label>
                  <input type="number" value={formData.lives_saved} onChange={(e) => setFormData({...formData, lives_saved: e.target.value})} className="w-full border rounded px-3 py-2 text-gray-800" required />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Properties Protected</label>
                  <input type="number" value={formData.properties_protected} onChange={(e) => setFormData({...formData, properties_protected: e.target.value})} className="w-full border rounded px-3 py-2 text-gray-800" required />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Avg Response Time (minutes)</label>
                  <input type="number" step="0.01" value={formData.avg_response_time} onChange={(e) => setFormData({...formData, avg_response_time: e.target.value})} className="w-full border rounded px-3 py-2 text-gray-800" required />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Electrical Fires</label>
                    <input type="number" value={formData.electrical_fires} onChange={(e) => setFormData({...formData, electrical_fires: e.target.value})} className="w-full border rounded px-3 py-2 text-gray-800" required />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Cooking Fires</label>
                    <input type="number" value={formData.cooking_fires} onChange={(e) => setFormData({...formData, cooking_fires: e.target.value})} className="w-full border rounded px-3 py-2 text-gray-800" required />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Smoking Fires</label>
                    <input type="number" value={formData.smoking_fires} onChange={(e) => setFormData({...formData, smoking_fires: e.target.value})} className="w-full border rounded px-3 py-2 text-gray-800" required />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Other Fires</label>
                    <input type="number" value={formData.other_fires} onChange={(e) => setFormData({...formData, other_fires: e.target.value})} className="w-full border rounded px-3 py-2 text-gray-800" required />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button type="button" onClick={() => { setShowModal(false); setEditingId(null); }} className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

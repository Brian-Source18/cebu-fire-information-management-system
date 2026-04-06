'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const API = 'https://firebackend-tsi7.onrender.com';

const RANKS = [
  { value: 'fire_marshal', label: 'Fire Marshal' },
  { value: 'senior_fire_officer', label: 'Senior Fire Officer' },
  { value: 'fire_officer', label: 'Fire Officer' },
  { value: 'firefighter', label: 'Firefighter' },
];

const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'inactive', label: 'Inactive' },
];

export default function AdminPersonnelPage() {
  const { user } = useAuth();
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStation, setFilterStation] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ first_name: '', middle_initial: '', last_name: '', rank: 'firefighter', contact_number: '', status: 'active', fire_station: '' });

  const fetchData = async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('access_token');
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    setLoading(true);
    const url = filterStation ? `${API}/api/admin/personnel/?station=${filterStation}` : `${API}/api/admin/personnel/`;
    try {
      const [pRes, sRes] = await Promise.all([fetch(url, { headers }), fetch(`${API}/api/admin/fire-stations/`, { headers })]);
      setPersonnel(await pRes.json());
      setStations(await sRes.json());
    } catch (err) {
      console.error('Personnel fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filterStation]);

  const openAdd = () => { setEditing(null); setForm({ first_name: '', middle_initial: '', last_name: '', rank: 'firefighter', contact_number: '', status: 'active', fire_station: '' }); setShowForm(true); };
  const openEdit = (p: any) => { setEditing(p); setForm({ first_name: p.first_name, middle_initial: p.middle_initial || '', last_name: p.last_name, rank: p.rank, contact_number: p.contact_number, status: p.status, fire_station: p.fire_station }); setShowForm(true); };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    const method = editing ? 'PATCH' : 'POST';
    const url = editing ? `${API}/api/admin/personnel/${editing.id}/` : `${API}/api/admin/personnel/`;
    await fetch(url, { method, headers, body: JSON.stringify(form) });
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this personnel?')) return;
    const token = localStorage.getItem('access_token');
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    await fetch(`${API}/api/admin/personnel/${id}/`, { method: 'DELETE', headers });
    fetchData();
  };

  const statusColor = (s: string) => s === 'active' ? 'bg-green-100 text-green-800' : s === 'on_leave' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <select value={filterStation} onChange={e => setFilterStation(e.target.value)} className="border rounded px-3 py-2 text-sm">
            <option value="">All Stations</option>
            {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <button onClick={openAdd} className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded font-bold">+ Add Personnel</button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[560px]">
          <table className="w-full text-sm">
            <thead className="bg-red-900 text-white sticky top-0 z-10">
              <tr>
                {['Name', 'Rank', 'Station', 'Contact', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {personnel.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No personnel found.</td></tr>
              ) : personnel.map(p => (
                <tr key={p.id} className="text-black border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.first_name} {p.middle_initial ? p.middle_initial + '. ' : ''}{p.last_name}</td>
                  <td className="px-4 py-3">{p.rank_display}</td>
                  <td className="px-4 py-3">{p.fire_station_name}</td>
                  <td className="px-4 py-3">{p.contact_number || '—'}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor(p.status)}`}>{p.status_display}</span></td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => openEdit(p)} className="text-blue-600 hover:underline text-xs font-bold">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline text-xs font-bold">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-black font-bold mb-4">{editing ? 'Edit Personnel' : 'Add Personnel'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-black">
              <div className="flex gap-2">
                <input required placeholder="First Name" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} className="text-black border rounded px-3 py-2 flex-1 text-sm" />
                <input placeholder="M.I." value={form.middle_initial} onChange={e => setForm({ ...form, middle_initial: e.target.value })} maxLength={1} className="text-black border rounded px-3 py-2 w-12 text-sm text-center" />
              </div>
              <input required placeholder="Last Name" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} className="text-black border rounded px-3 py-2 w-full text-sm" />
              <select required value={form.fire_station} onChange={e => setForm({ ...form, fire_station: e.target.value })} className="text-black border rounded px-3 py-2 w-full text-sm">
                <option value="">Select Station</option>
                {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select value={form.rank} onChange={e => setForm({ ...form, rank: e.target.value })} className="text-black border rounded px-3 py-2 w-full text-sm">
                {RANKS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <input placeholder="Contact Number" value={form.contact_number} onChange={e => setForm({ ...form, contact_number: e.target.value })} className="border rounded px-3 py-2 w-full text-sm" />
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="text-black border rounded px-3 py-2 w-full text-sm">
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-red-700 hover:bg-red-800 text-white py-2 rounded font-bold">{editing ? 'Save Changes' : 'Add Personnel'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded font-bold">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

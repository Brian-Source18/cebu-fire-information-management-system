'use client';
import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL;

interface FireTruck {
  id: number;
  truck_number: string;
  model: string;
  status: string;
  status_display: string;
  water_level: string;
  water_level_display: string;
  notes: string;
  updated_at: string;
}

const emptyForm = { truck_number: '', model: '', status: 'operational', water_level: 'full', notes: '' };

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  operational:  { bg: 'rgba(22,163,74,0.2)',  color: '#4ade80' },
  damaged:      { bg: 'rgba(220,38,38,0.2)',  color: '#f87171' },
  under_repair: { bg: 'rgba(217,119,6,0.2)',  color: '#fbbf24' },
};

const WATER_STYLES: Record<string, { bg: string; color: string; icon: string }> = {
  full:  { bg: 'rgba(37,99,235,0.2)',  color: '#60a5fa', icon: '💧' },
  half:  { bg: 'rgba(234,179,8,0.2)',  color: '#fbbf24', icon: '🔵' },
  empty: { bg: 'rgba(220,38,38,0.2)',  color: '#f87171', icon: '⚠️' },
};

export default function FireTrucksPage() {
  const [trucks, setTrucks] = useState<FireTruck[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<FireTruck | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchTrucks(); }, []);

  const fetchTrucks = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API}/api/station/fire-trucks/`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setTrucks(Array.isArray(data) ? data : []);
    } catch { setTrucks([]); } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const url = editing ? `${API}/api/station/fire-trucks/${editing.id}/` : `${API}/api/station/fire-trucks/`;
    await fetch(url, {
      method: editing ? 'PUT' : 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    fetchTrucks();
    setShowModal(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this fire truck?')) return;
    const token = localStorage.getItem('access_token');
    await fetch(`${API}/api/station/fire-trucks/${id}/`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchTrucks();
  };

  const openEdit = (truck: FireTruck) => {
    setEditing(truck);
    setForm({ truck_number: truck.truck_number, model: truck.model, status: truck.status, water_level: truck.water_level, notes: truck.notes });
    setShowModal(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="text-2xl animate-pulse">🚒</span>
      <span className="ml-3 text-gray-400">Loading...</span>
    </div>
  );

  const operational = trucks.filter(t => t.status === 'operational').length;
  const damaged = trucks.filter(t => t.status === 'damaged').length;
  const underRepair = trucks.filter(t => t.status === 'under_repair').length;
  const fullWater = trucks.filter(t => t.water_level === 'full').length;
  const halfWater = trucks.filter(t => t.water_level === 'half').length;
  const emptyWater = trucks.filter(t => t.water_level === 'empty').length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-white font-black text-xl">Fire Trucks</h1>
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Manage your station's fire trucks and water levels</p>
        </div>
        <button onClick={() => { setEditing(null); setForm(emptyForm); setShowModal(true); }}
          className="px-4 py-2 rounded-lg font-bold text-sm"
          style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316', border: '1px solid rgba(249,115,22,0.3)' }}>
          + Add Fire Truck
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="rounded-xl p-4" style={{ background: 'rgba(30,10,10,0.95)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#6b7280' }}>Truck Status</p>
          <div className="space-y-2">
            {[{ label: 'Operational', value: operational, color: '#4ade80' }, { label: 'Damaged', value: damaged, color: '#f87171' }, { label: 'Under Repair', value: underRepair, color: '#fbbf24' }].map(s => (
              <div key={s.label} className="flex justify-between items-center">
                <span className="text-xs" style={{ color: '#9ca3af' }}>{s.label}</span>
                <span className="font-black text-sm" style={{ color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'rgba(30,10,10,0.95)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#6b7280' }}>Water Level</p>
          <div className="space-y-2">
            {[{ label: '💧 Full', value: fullWater, color: '#60a5fa' }, { label: '🔵 Half', value: halfWater, color: '#fbbf24' }, { label: '⚠️ Empty', value: emptyWater, color: '#f87171' }].map(s => (
              <div key={s.label} className="flex justify-between items-center">
                <span className="text-xs" style={{ color: '#9ca3af' }}>{s.label}</span>
                <span className="font-black text-sm" style={{ color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl p-4 flex flex-col items-center justify-center" style={{ background: 'rgba(30,10,10,0.95)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div className="text-5xl font-black text-white">{trucks.length}</div>
          <div className="text-xs font-bold mt-1" style={{ color: '#9ca3af' }}>Total Trucks</div>
        </div>
      </div>

      {/* Table */}
      {trucks.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: 'rgba(30,10,10,0.95)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div className="text-4xl mb-3">🚒</div>
          <p className="text-gray-400">No fire trucks added yet. Click "Add Fire Truck" to get started.</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(30,10,10,0.95)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#6b7280' }}>Truck No.</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#6b7280' }}>Model</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: '#6b7280' }}>Status</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: '#6b7280' }}>Water Level</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#6b7280' }}>Notes</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#6b7280' }}>Last Updated</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: '#6b7280' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trucks.map(truck => (
                  <tr key={truck.id} style={{ borderBottom: '1px solid rgba(239,68,68,0.07)' }}>
                    <td className="px-5 py-3 text-white font-black">🚒 {truck.truck_number}</td>
                    <td className="px-4 py-3 text-gray-300">{truck.model || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 rounded-full text-xs font-bold" style={STATUS_STYLES[truck.status]}>{truck.status_display}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 rounded-full text-xs font-bold" style={WATER_STYLES[truck.water_level]}>
                        {WATER_STYLES[truck.water_level].icon} {truck.water_level_display}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#6b7280' }}>{truck.notes || '—'}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#6b7280' }}>
                      {new Date(truck.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => openEdit(truck)} className="text-xs font-bold mr-3" style={{ color: '#60a5fa' }}>Edit</button>
                      <button onClick={() => handleDelete(truck.id)} className="text-xs font-bold" style={{ color: '#f87171' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-xl p-6 w-full max-w-md" style={{ background: '#1a0808', border: '1px solid rgba(239,68,68,0.3)' }}>
            <h2 className="text-white font-black text-lg mb-5">{editing ? 'Edit' : 'Add'} Fire Truck</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: '#9ca3af' }}>Truck Number</label>
                <input type="text" value={form.truck_number} onChange={e => setForm({ ...form, truck_number: e.target.value })}
                  placeholder="e.g. BFP-001"
                  className="w-full rounded-lg px-3 py-2 text-white text-sm" style={{ background: '#0f0505', border: '1px solid rgba(239,68,68,0.3)' }} required />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: '#9ca3af' }}>Model (optional)</label>
                <input type="text" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })}
                  placeholder="e.g. Isuzu FTR"
                  className="w-full rounded-lg px-3 py-2 text-white text-sm" style={{ background: '#0f0505', border: '1px solid rgba(239,68,68,0.3)' }} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: '#9ca3af' }}>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 text-white text-sm" style={{ background: '#0f0505', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <option value="operational">Operational</option>
                  <option value="damaged">Damaged</option>
                  <option value="under_repair">Under Repair</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: '#9ca3af' }}>Water Level</label>
                <select value={form.water_level} onChange={e => setForm({ ...form, water_level: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 text-white text-sm" style={{ background: '#0f0505', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <option value="full">💧 Full</option>
                  <option value="half">🔵 Half</option>
                  <option value="empty">⚠️ Empty</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: '#9ca3af' }}>Notes (optional)</label>
                <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 text-white text-sm" style={{ background: '#0f0505', border: '1px solid rgba(239,68,68,0.3)' }} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setEditing(null); }}
                  className="px-4 py-2 rounded-lg text-sm font-bold" style={{ background: 'rgba(239,68,68,0.1)', color: '#9ca3af' }}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg text-sm font-bold"
                  style={{ background: 'rgba(249,115,22,0.2)', color: '#f97316', border: '1px solid rgba(249,115,22,0.3)' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

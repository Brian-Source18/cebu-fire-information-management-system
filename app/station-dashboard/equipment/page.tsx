'use client';
import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL;

interface Equipment {
  id: number;
  name: string;
  name_display: string;
  category: string;
  category_display: string;
  operational: number;
  damaged: number;
  under_repair: number;
  total: number;
  notes: string;
}

const EQUIPMENT_OPTIONS = [
  { value: 'fire_hose', label: 'Fire Hose', category: 'suppression' },
  { value: 'nozzle', label: 'Nozzle', category: 'suppression' },
  { value: 'fire_hydrant', label: 'Fire Hydrant', category: 'suppression' },
  { value: 'fire_extinguisher', label: 'Fire Extinguisher', category: 'suppression' },
  { value: 'fire_pump', label: 'Fire Pump', category: 'suppression' },
  { value: 'foam_system', label: 'Foam System', category: 'suppression' },
  { value: 'ladder', label: 'Ladder (Extension & Aerial)', category: 'rescue' },
  { value: 'hydraulic_cutter', label: 'Hydraulic Cutter/Spreader (Jaws of Life)', category: 'rescue' },
  { value: 'axe_halligan', label: 'Axe & Halligan Tool', category: 'rescue' },
  { value: 'rope_harness', label: 'Rope & Harness', category: 'rescue' },
  { value: 'crowbar', label: 'Crowbar', category: 'rescue' },
  { value: 'turnout_gear', label: 'Fire-Resistant Suit (Turnout Gear)', category: 'ppe' },
  { value: 'helmet', label: 'Helmet', category: 'ppe' },
  { value: 'gloves_boots', label: 'Gloves & Boots', category: 'ppe' },
  { value: 'scba', label: 'SCBA (Self-Contained Breathing Apparatus)', category: 'ppe' },
  { value: 'flashlight', label: 'Flashlight', category: 'detection' },
  { value: 'thermal_camera', label: 'Thermal Imaging Camera', category: 'detection' },
  { value: 'gas_detector', label: 'Gas Detector', category: 'detection' },
  { value: 'radio', label: 'Radio', category: 'detection' },
  { value: 'first_aid_kit', label: 'First Aid Kit', category: 'medical' },
  { value: 'aed', label: 'AED (Automated External Defibrillator)', category: 'medical' },
  { value: 'stretcher', label: 'Stretcher', category: 'medical' },
  { value: 'oxygen_tank', label: 'Oxygen Tank', category: 'medical' },
  { value: 'ventilation_fan', label: 'Ventilation Fan', category: 'ventilation' },
  { value: 'generator', label: 'Generator', category: 'ventilation' },
  { value: 'chainsaw', label: 'Chainsaw', category: 'ventilation' },
];

const CATEGORY_LABELS: Record<string, string> = {
  suppression: '🔥 Fire Suppression Equipment',
  rescue: '🪜 Rescue Equipment',
  ppe: '😷 Personal Protective Equipment',
  detection: '🔍 Search & Detection Tools',
  medical: '🚑 Medical Equipment',
  ventilation: '🌬️ Ventilation & Support Tools',
};

const emptyForm = { name: 'fire_hose', category: 'suppression', operational: 0, damaged: 0, under_repair: 0, notes: '' };

export default function StationEquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [form, setForm] = useState(emptyForm);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCategory = (cat: string) => {
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  useEffect(() => { fetchEquipment(); }, []);

  const fetchEquipment = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API}/api/station/equipment/`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setEquipment(Array.isArray(data) ? data : []);
    } catch { setEquipment([]); } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const url = editing ? `${API}/api/station/equipment/${editing.id}/` : `${API}/api/station/equipment/`;
    await fetch(url, {
      method: editing ? 'PUT' : 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    fetchEquipment();
    setShowModal(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this equipment?')) return;
    const token = localStorage.getItem('access_token');
    await fetch(`${API}/api/station/equipment/${id}/`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchEquipment();
  };

  const openEdit = (eq: Equipment) => {
    setEditing(eq);
    setForm({ name: eq.name, category: eq.category, operational: eq.operational, damaged: eq.damaged, under_repair: eq.under_repair, notes: eq.notes });
    setShowModal(true);
  };

  const grouped = equipment.reduce((acc, eq) => {
    if (!acc[eq.category]) acc[eq.category] = [];
    acc[eq.category].push(eq);
    return acc;
  }, {} as Record<string, Equipment[]>);

  const totalAll = equipment.reduce((s, e) => s + e.total, 0);
  const totalOperational = equipment.reduce((s, e) => s + e.operational, 0);
  const totalDamaged = equipment.reduce((s, e) => s + e.damaged, 0);
  const totalUnderRepair = equipment.reduce((s, e) => s + e.under_repair, 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="text-2xl animate-pulse">🔥</span>
      <span className="ml-3 text-gray-400">Loading...</span>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-white font-black text-xl">Equipment Inventory</h1>
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Track equipment quantity and condition per type</p>
        </div>
        <button onClick={() => { setEditing(null); setForm(emptyForm); setShowModal(true); }}
          className="px-4 py-2 rounded-lg font-bold text-sm"
          style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316', border: '1px solid rgba(249,115,22,0.3)' }}>
          + Add Equipment
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: totalAll, color: '#e5e7eb' },
          { label: 'Operational', value: totalOperational, color: '#4ade80' },
          { label: 'Damaged', value: totalDamaged, color: '#f87171' },
          { label: 'Under Repair', value: totalUnderRepair, color: '#fbbf24' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: 'rgba(30,10,10,0.95)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs font-bold mt-1" style={{ color: '#9ca3af' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {equipment.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: 'rgba(30,10,10,0.95)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div className="text-4xl mb-3">🚒</div>
          <p className="text-gray-400">No equipment added yet. Click "Add Equipment" to get started.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className="rounded-xl overflow-hidden" style={{ background: 'rgba(30,10,10,0.95)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div className="px-5 py-3 flex items-center justify-between cursor-pointer select-none"
                style={{ borderBottom: collapsed[cat] ? 'none' : '1px solid rgba(239,68,68,0.15)' }}
                onClick={() => toggleCategory(cat)}>
                <h2 className="text-white font-black text-sm uppercase tracking-widest">{CATEGORY_LABELS[cat] || cat}</h2>
                <span className="text-xs font-bold" style={{ color: '#6b7280' }}>{collapsed[cat] ? '▶ Show' : '▼ Hide'}</span>
              </div>
              {!collapsed[cat] && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
                      <th className="px-5 py-3 text-left font-bold uppercase tracking-wider text-xs" style={{ color: '#6b7280' }}>Equipment</th>
                      <th className="px-4 py-3 text-center font-bold uppercase tracking-wider text-xs" style={{ color: '#6b7280' }}>Total</th>
                      <th className="px-4 py-3 text-center font-bold uppercase tracking-wider text-xs" style={{ color: '#4ade80' }}>Operational</th>
                      <th className="px-4 py-3 text-center font-bold uppercase tracking-wider text-xs" style={{ color: '#f87171' }}>Damaged</th>
                      <th className="px-4 py-3 text-center font-bold uppercase tracking-wider text-xs" style={{ color: '#fbbf24' }}>Under Repair</th>
                      <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-xs" style={{ color: '#6b7280' }}>Notes</th>
                      <th className="px-4 py-3 text-center font-bold uppercase tracking-wider text-xs" style={{ color: '#6b7280' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(eq => (
                      <tr key={eq.id} style={{ borderBottom: '1px solid rgba(239,68,68,0.07)' }}>
                        <td className="px-5 py-3 text-white font-semibold">{eq.name_display}</td>
                        <td className="px-4 py-3 text-center font-black text-white">{eq.total}</td>
                        <td className="px-4 py-3 text-center font-bold" style={{ color: '#4ade80' }}>{eq.operational}</td>
                        <td className="px-4 py-3 text-center font-bold" style={{ color: '#f87171' }}>{eq.damaged}</td>
                        <td className="px-4 py-3 text-center font-bold" style={{ color: '#fbbf24' }}>{eq.under_repair}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: '#6b7280' }}>{eq.notes || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => openEdit(eq)} className="text-xs font-bold mr-3" style={{ color: '#60a5fa' }}>Edit</button>
                          <button onClick={() => handleDelete(eq.id)} className="text-xs font-bold" style={{ color: '#f87171' }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-xl p-6 w-full max-w-md" style={{ background: '#1a0808', border: '1px solid rgba(239,68,68,0.3)' }}>
            <h2 className="text-white font-black text-lg mb-5">{editing ? 'Edit' : 'Add'} Equipment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: '#9ca3af' }}>Equipment</label>
                <select value={form.name} onChange={e => {
                  const opt = EQUIPMENT_OPTIONS.find(o => o.value === e.target.value);
                  setForm({ ...form, name: e.target.value, category: opt?.category || 'suppression' });
                }} className="w-full rounded-lg px-3 py-2 text-white text-sm" style={{ background: '#0f0505', border: '1px solid rgba(239,68,68,0.3)' }}>
                  {EQUIPMENT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'operational', label: 'Operational', color: '#4ade80' },
                  { key: 'damaged', label: 'Damaged', color: '#f87171' },
                  { key: 'under_repair', label: 'Under Repair', color: '#fbbf24' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-bold mb-1" style={{ color: f.color }}>{f.label}</label>
                    <input type="number" min={0} value={form[f.key as keyof typeof form] as number}
                      onChange={e => setForm({ ...form, [f.key]: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-lg px-3 py-2 text-white text-sm" style={{ background: '#0f0505', border: `1px solid rgba(239,68,68,0.3)` }} required />
                  </div>
                ))}
              </div>
              <div className="text-xs font-bold text-center" style={{ color: '#9ca3af' }}>
                Total: <span className="text-white">{(form.operational || 0) + (form.damaged || 0) + (form.under_repair || 0)}</span>
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

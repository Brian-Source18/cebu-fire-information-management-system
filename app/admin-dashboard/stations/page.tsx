'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL;

interface FireStation {
  id: number;
  name: string;
  address: string;
  contact_number: string;
  station_type: string;
  latitude: number;
  longitude: number;
}

interface Equipment {
  id: number;
  fire_station: number;
  name: string;
  name_display: string;
  category: string;
  category_display: string;
  quantity: number;
  status: string;
  status_display: string;
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

const STATUS_COLORS: Record<string, string> = {
  operational: 'bg-green-100 text-green-700',
  damaged: 'bg-red-100 text-red-700',
  under_repair: 'bg-yellow-100 text-yellow-700',
};

export default function FireStationsManagement() {
  const { user } = useAuth();
  const [stations, setStations] = useState<FireStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '', contact_number: '', station_type: 'sub', latitude: '', longitude: '' });

  // Equipment state
  const [selectedStation, setSelectedStation] = useState<FireStation | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [equipLoading, setEquipLoading] = useState(false);
  const [showEquipModal, setShowEquipModal] = useState(false);
  const [editingEquip, setEditingEquip] = useState<Equipment | null>(null);
  const [equipForm, setEquipForm] = useState({ name: 'fire_hose', category: 'suppression', quantity: 1, status: 'operational', notes: '' });

  useEffect(() => { fetchStations(); }, []);

  const fetchStations = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API}/api/admin/fire-stations/`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setStations(Array.isArray(data) ? data : []);
    } catch { setStations([]); } finally { setLoading(false); }
  };

  const fetchEquipment = async (stationId: number) => {
    setEquipLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API}/api/admin/equipment/?station=${stationId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setEquipment(Array.isArray(data) ? data : []);
    } catch { setEquipment([]); } finally { setEquipLoading(false); }
  };

  const handleStationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `${API}/api/admin/fire-stations/${editingId}/` : `${API}/api/admin/fire-stations/`;
    const token = localStorage.getItem('access_token');
    await fetch(url, {
      method: editingId ? 'PUT' : 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, latitude: parseFloat(formData.latitude), longitude: parseFloat(formData.longitude) }),
    });
    fetchStations();
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', address: '', contact_number: '', station_type: 'sub', latitude: '', longitude: '' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this fire station?')) return;
    const token = localStorage.getItem('access_token');
    await fetch(`${API}/api/admin/fire-stations/${id}/`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (selectedStation?.id === id) setSelectedStation(null);
    fetchStations();
  };

  const handleEquipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const url = editingEquip ? `${API}/api/admin/equipment/${editingEquip.id}/` : `${API}/api/admin/equipment/`;
    await fetch(url, {
      method: editingEquip ? 'PUT' : 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...equipForm, fire_station: selectedStation!.id }),
    });
    fetchEquipment(selectedStation!.id);
    setShowEquipModal(false);
    setEditingEquip(null);
    setEquipForm({ name: 'fire_hose', category: 'suppression', quantity: 1, status: 'operational', notes: '' });
  };

  const handleDeleteEquip = async (id: number) => {
    if (!confirm('Delete this equipment?')) return;
    const token = localStorage.getItem('access_token');
    await fetch(`${API}/api/admin/equipment/${id}/`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchEquipment(selectedStation!.id);
  };

  const openEquipEdit = (eq: Equipment) => {
    setEditingEquip(eq);
    setEquipForm({ name: eq.name, category: eq.category, quantity: eq.quantity, status: eq.status, notes: eq.notes });
    setShowEquipModal(true);
  };

  // Group equipment by category
  const grouped = equipment.reduce((acc, eq) => {
    if (!acc[eq.category]) acc[eq.category] = [];
    acc[eq.category].push(eq);
    return acc;
  }, {} as Record<string, Equipment[]>);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-orange-800">Fire Stations Management</h1>
        <button onClick={() => { setShowModal(true); setEditingId(null); setFormData({ name: '', address: '', contact_number: '', station_type: 'sub', latitude: '', longitude: '' }); }}
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
          Add Fire Station
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stations List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {stations.length === 0 ? (
            <div className="p-6 text-center text-gray-600">No fire stations found</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {stations.map(station => (
                <div key={station.id} className={`p-4 cursor-pointer hover:bg-orange-50 transition ${selectedStation?.id === station.id ? 'bg-orange-50 border-l-4 border-orange-500' : ''}`}
                  onClick={() => { setSelectedStation(station); fetchEquipment(station.id); }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-gray-800">{station.name}</div>
                      <div className="text-sm text-gray-500">{station.station_type === 'main' ? 'Main Station' : 'Sub Station'} • {station.contact_number}</div>
                      <div className="text-xs text-gray-400 mt-1">{station.address}</div>
                    </div>
                    <div className="flex gap-2 ml-2">
                      <button onClick={e => { e.stopPropagation(); setEditingId(station.id); setFormData({ name: station.name, address: station.address, contact_number: station.contact_number, station_type: station.station_type, latitude: String(station.latitude), longitude: String(station.longitude) }); setShowModal(true); }}
                        className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                      <button onClick={e => { e.stopPropagation(); handleDelete(station.id); }}
                        className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Equipment Panel */}
        <div className="bg-white rounded-lg shadow">
          {!selectedStation ? (
            <div className="p-8 text-center text-gray-400">
              <div className="text-4xl mb-2">🚒</div>
              <p>Select a station to manage its equipment</p>
            </div>
          ) : (
            <div>
              <div className="p-4 border-b flex justify-between items-center">
                <div>
                  <div className="font-bold text-gray-800">{selectedStation.name}</div>
                  <div className="text-sm text-gray-500">Equipment Inventory (View Only)</div>
                </div>
              </div>

              {equipLoading ? (
                <div className="p-6 text-center text-gray-500">Loading...</div>
              ) : equipment.length === 0 ? (
                <div className="p-6 text-center text-gray-400">No equipment added yet</div>
              ) : (
                <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                  {Object.entries(grouped).map(([cat, items]) => (
                    <div key={cat}>
                      <div className="font-bold text-gray-700 text-sm mb-2">{CATEGORY_LABELS[cat] || cat}</div>
                      <div className="space-y-2">
                        {items.map(eq => (
                          <div key={eq.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                            <div className="flex-1">
                              <div className="font-medium text-gray-800 text-sm">{eq.name_display}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">Qty: {eq.quantity}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[eq.status]}`}>{eq.status_display}</span>
                              </div>
                              {eq.notes && <div className="text-xs text-gray-400 mt-1">{eq.notes}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Station Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">{editingId ? 'Edit' : 'Add'} Fire Station</h2>
            <form onSubmit={handleStationSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded px-3 py-2 text-gray-800" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Address</label>
                <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full border rounded px-3 py-2 text-gray-800" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Contact Number</label>
                <input type="text" value={formData.contact_number} onChange={e => setFormData({ ...formData, contact_number: e.target.value })} className="w-full border rounded px-3 py-2 text-gray-800" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Station Type</label>
                <select value={formData.station_type} onChange={e => setFormData({ ...formData, station_type: e.target.value })} className="w-full border rounded px-3 py-2 text-gray-800">
                  <option value="main">Main Station</option>
                  <option value="sub">Sub Station</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">Latitude</label>
                  <input type="number" step="any" value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: e.target.value })} className="w-full border rounded px-3 py-2 text-gray-800" required />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Longitude</label>
                  <input type="number" step="any" value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: e.target.value })} className="w-full border rounded px-3 py-2 text-gray-800" required />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => { setShowModal(false); setEditingId(null); }} className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Equipment Modal */}
      {showEquipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">{editingEquip ? 'Edit' : 'Add'} Equipment</h2>
            <form onSubmit={handleEquipSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Equipment</label>
                <select value={equipForm.name} onChange={e => {
                  const opt = EQUIPMENT_OPTIONS.find(o => o.value === e.target.value);
                  setEquipForm({ ...equipForm, name: e.target.value, category: opt?.category || 'suppression' });
                }} className="w-full border rounded px-3 py-2 text-gray-800">
                  {EQUIPMENT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Quantity</label>
                <input type="number" min={1} value={equipForm.quantity} onChange={e => setEquipForm({ ...equipForm, quantity: parseInt(e.target.value) })} className="w-full border rounded px-3 py-2 text-gray-800" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Status</label>
                <select value={equipForm.status} onChange={e => setEquipForm({ ...equipForm, status: e.target.value })} className="w-full border rounded px-3 py-2 text-gray-800">
                  <option value="operational">Operational</option>
                  <option value="damaged">Damaged</option>
                  <option value="under_repair">Under Repair</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Notes (optional)</label>
                <input type="text" value={equipForm.notes} onChange={e => setEquipForm({ ...equipForm, notes: e.target.value })} className="w-full border rounded px-3 py-2 text-gray-800" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => { setShowEquipModal(false); setEditingEquip(null); }} className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

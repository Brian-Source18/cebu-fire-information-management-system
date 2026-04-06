'use client';
import { useState, useEffect } from 'react';

const cardStyle = {
  background: 'linear-gradient(135deg, rgba(30,10,10,0.95), rgba(20,5,5,0.98))',
  border: '1px solid rgba(239,68,68,0.2)',
};
const inputCls = "w-full px-3 py-2.5 rounded-lg text-white text-sm focus:outline-none transition-all input-f";
const inputSty = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(239,68,68,0.25)' };
const labelCls = "block text-xs font-bold uppercase tracking-widest mb-1.5";

interface HeroicAct {
  id: number; title: string; story: string;
  location: string; date_of_incident: string; image: string;
}

export default function HeroicActsManagement() {
  const [acts, setActs]           = useState<HeroicAct[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData]   = useState({ title: '', story: '', location: '', date_of_incident: '', image: null as File | null });
  const [preview, setPreview]     = useState<string | null>(null);

  useEffect(() => { fetchActs(); }, []);

  const fetchActs = async () => {
    const token = localStorage.getItem('access_token');
    const res = await fetch('https://firebackend-tsi7.onrender.com/api/admin/heroic-acts/', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setActs(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `https://firebackend-tsi7.onrender.com/api/admin/heroic-acts/${editingId}/` : 'https://firebackend-tsi7.onrender.com/api/admin/heroic-acts/';
    const fd = new FormData();
    fd.append('title', formData.title);
    fd.append('story', formData.story);
    fd.append('location', formData.location);
    fd.append('date_of_incident', formData.date_of_incident);
    if (formData.image) fd.append('image', formData.image);
    const token = localStorage.getItem('access_token');
    const res = await fetch(url, { method: editingId ? 'PUT' : 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
    if (res.ok) { fetchActs(); closeModal(); }
  };

  const handleEdit = (act: HeroicAct) => {
    setEditingId(act.id);
    setFormData({ title: act.title, story: act.story, location: act.location, date_of_incident: act.date_of_incident, image: null });
    setPreview(act.image || null);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this heroic act?')) return;
    const token = localStorage.getItem('access_token');
    await fetch(`https://firebackend-tsi7.onrender.com/api/admin/heroic-acts/${id}/`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchActs();
  };

  const closeModal = () => {
    setShowModal(false); setEditingId(null); setPreview(null);
    setFormData({ title: '', story: '', location: '', date_of_incident: '', image: null });
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-4xl animate-bounce">🏆</div></div>;

  return (
    <div className="space-y-4">
      <style>{`
        .act-card { transition: all 0.3s ease; }
        .act-card:hover { transform: translateY(-3px); border-color: rgba(251,146,60,0.4) !important; }
        .input-f:focus { border-color: rgba(251,146,60,0.6) !important; box-shadow: 0 0 8px rgba(251,146,60,0.15); }
      `}</style>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-orange-800">Heroic Acts</h1>
          <p className="text-gray-500 text-xs mt-0.5">{acts.length} act{acts.length !== 1 ? 's' : ''} recorded</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #dc2626, #ea580c)', boxShadow: '0 4px 14px rgba(220,38,38,0.35)' }}>
          🏆 Add Heroic Act
        </button>
      </div>

      {acts.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={cardStyle}>
          <div className="text-4xl mb-3">🏆</div>
          <p className="text-gray-500">No heroic acts recorded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {acts.map(act => (
            <div key={act.id} className="act-card rounded-2xl overflow-hidden" style={cardStyle}>
              {act.image ? (
                <img src={act.image} alt={act.title} className="w-full h-44 object-cover"
                  style={{ borderBottom: '1px solid rgba(239,68,68,0.2)' }} />
              ) : (
                <div className="w-full h-44 flex items-center justify-center text-5xl"
                  style={{ background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.2)' }}>🏆</div>
              )}
              <div className="p-4">
                <h3 className="text-white font-black text-sm mb-1 truncate">{act.title}</h3>
                <p className="text-gray-500 text-xs mb-1">📍 {act.location}</p>
                <p className="text-gray-600 text-xs mb-3">📅 {new Date(act.date_of_incident).toLocaleDateString()}</p>
                <p className="text-gray-400 text-xs line-clamp-2 mb-4">{act.story}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(act)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold"
                    style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(act.id)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold"
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{ background: '#120505', border: '1px solid rgba(239,68,68,0.35)', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
              <h2 className="text-white font-black">{editingId ? 'Edit' : 'Add'} Heroic Act</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-white text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {[['Title', 'title', 'text'], ['Location', 'location', 'text']].map(([l, k, t]) => (
                <div key={k as string}>
                  <label className={labelCls} style={{ color: '#f97316' }}>{l}</label>
                  <input type={t as string} value={formData[k as keyof typeof formData] as string}
                    onChange={e => setFormData({ ...formData, [k as string]: e.target.value })}
                    className={inputCls} style={inputSty} required />
                </div>
              ))}
              <div>
                <label className={labelCls} style={{ color: '#f97316' }}>Date of Incident</label>
                <input type="date" value={formData.date_of_incident}
                  onChange={e => setFormData({ ...formData, date_of_incident: e.target.value })}
                  className={inputCls} style={{ ...inputSty, colorScheme: 'dark' }} required />
              </div>
              <div>
                <label className={labelCls} style={{ color: '#f97316' }}>Story</label>
                <textarea value={formData.story} onChange={e => setFormData({ ...formData, story: e.target.value })}
                  rows={5} className={`${inputCls} resize-none`} style={inputSty} required />
              </div>
              <div>
                <label className={labelCls} style={{ color: '#f97316' }}>Image</label>
                <label className="flex flex-col items-center justify-center w-full py-5 rounded-lg cursor-pointer transition-all"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(239,68,68,0.3)' }}>
                  {preview ? (
                    <img src={preview} alt="Preview" className="max-h-32 rounded-lg object-cover" />
                  ) : (
                    <>
                      <span className="text-2xl mb-1">📷</span>
                      <span className="text-gray-500 text-xs">Click to upload image</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0] || null;
                      setFormData({ ...formData, image: f });
                      setPreview(f ? URL.createObjectURL(f) : null);
                    }} />
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold"
                  style={{ background: 'linear-gradient(135deg, #dc2626, #ea580c)' }}>
                  {editingId ? 'Save Changes' : 'Add Act'}
                </button>
                <button type="button" onClick={closeModal}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-400"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
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

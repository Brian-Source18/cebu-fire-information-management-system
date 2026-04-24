'use client';

import { useState, useEffect } from 'react';

const cardStyle = {
  background: 'linear-gradient(135deg, rgba(30,10,10,0.95), rgba(20,5,5,0.98))',
  border: '1px solid rgba(239,68,68,0.2)',
};

const priorityCfg: Record<string, { color: string; bg: string }> = {
  emergency: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  warning:   { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
  info:      { color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
};

const inputCls = "px-3 py-2 rounded-lg text-white text-sm bg-transparent focus:outline-none w-full";
const inputSty = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(239,68,68,0.25)' };
const labelSty = { color: '#f97316', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1, display: 'block', marginBottom: 6 };

export default function AnnouncementsManagement() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: '', message: '', priority: 'info' });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => { fetchAnnouncements(); }, []);

  const fetchAnnouncements = async () => {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/announcements/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setAnnouncements(await res.json());
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const url = editingId
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/announcements/${editingId}/`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/announcements/`;
    const method = editingId ? 'PUT' : 'POST';

    const data = new FormData();
    data.append('title', formData.title);
    data.append('message', formData.message);
    data.append('priority', formData.priority);
    if (image) data.append('image', image);

    const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: data });
    if (res.ok) {
      fetchAnnouncements();
      closeModal();
    }
  };

  const handleEdit = (a: any) => {
    setEditingId(a.id);
    setFormData({ title: a.title, message: a.message, priority: a.priority });
    setImagePreview(a.image || null);
    setImage(null);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this announcement?')) return;
    const token = localStorage.getItem('access_token');
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/announcements/${id}/`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    });
    fetchAnnouncements();
  };

  const closeModal = () => {
    setShowModal(false); setEditingId(null);
    setFormData({ title: '', message: '', priority: 'info' });
    setImage(null); setImagePreview(null);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-4xl animate-bounce">📢</div></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-orange-800">Announcements</h1>
          <p className="text-gray-500 text-xs mt-0.5">{announcements.length} total</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="text-sm font-bold px-4 py-2 rounded-lg"
          style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
          + Add Announcement
        </button>
      </div>

      <div className="rounded-xl overflow-hidden" style={cardStyle}>
        <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
          <table className="w-full">
            <thead style={{ background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
              <tr>
                {['Title', 'Message', 'Priority', 'Image', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {announcements.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-600">No announcements found.</td></tr>
              ) : announcements.map(a => {
                const cfg = priorityCfg[a.priority] || priorityCfg.info;
                return (
                  <tr key={a.id} style={{ borderBottom: '1px solid rgba(239,68,68,0.08)' }}>
                    <td className="px-4 py-3 text-white text-sm font-semibold max-w-[160px] truncate">{a.title}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm max-w-[200px] truncate">{a.message}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2 py-1 rounded-full capitalize"
                        style={{ color: cfg.color, background: cfg.bg }}>{a.priority}</span>
                    </td>
                    <td className="px-4 py-3">
                      {a.image ? <img src={a.image} alt="" className="w-10 h-10 rounded object-cover" /> : <span className="text-gray-600 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(a.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(a)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg"
                          style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}>Edit</button>
                        <button onClick={() => handleDelete(a.id)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg"
                          style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{ background: '#120505', border: '1px solid rgba(239,68,68,0.35)', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
              <h2 className="text-white font-black text-lg">{editingId ? 'Edit' : 'Add'} Announcement</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-white text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label style={labelSty}>Title *</label>
                <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Announcement title" className={inputCls} style={inputSty} />
              </div>
              <div>
                <label style={labelSty}>Message *</label>
                <textarea required value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}
                  rows={5} placeholder="Announcement message..." className={inputCls} style={{ ...inputSty, resize: 'none' }} />
              </div>
              <div>
                <label style={labelSty}>Priority *</label>
                <select required value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}
                  className={inputCls} style={inputSty}>
                  <option value="info">Information</option>
                  <option value="warning">Warning</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              {/* Image — required for emergency */}
              <div>
                <label style={labelSty}>
                  Image {formData.priority === 'emergency' ? '*' : <span style={{ color: '#6b7280', fontWeight: 400, textTransform: 'none' }}>(optional)</span>}
                </label>
                {formData.priority === 'emergency' && (
                  <p className="text-xs text-red-400 mb-2">Emergency announcements require an image — it will be displayed in the Latest News section.</p>
                )}
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', borderRadius: 12, border: '2px dashed rgba(239,68,68,0.3)', backgroundColor: 'rgba(255,255,255,0.02)', cursor: 'pointer' }}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ maxHeight: 140, borderRadius: 10, objectFit: 'cover' }} />
                  ) : (
                    <>
                      <span style={{ fontSize: 28, marginBottom: 8 }}>📷</span>
                      <span style={{ color: '#64748b', fontSize: 13 }}>Click to upload a photo</span>
                    </>
                  )}
                  <input type="file" accept="image/*" required={formData.priority === 'emergency' && !imagePreview}
                    onChange={e => { const f = e.target.files?.[0] || null; setImage(f); setImagePreview(f ? URL.createObjectURL(f) : null); }}
                    style={{ display: 'none' }} />
                </label>
                {imagePreview && (
                  <button type="button" onClick={() => { setImage(null); setImagePreview(null); }}
                    style={{ marginTop: 8, fontSize: 12, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>✕ Remove image</button>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 py-2.5 rounded-lg font-bold text-sm text-gray-400"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
                <button type="submit"
                  className="flex-1 py-2.5 rounded-lg font-bold text-sm text-white"
                  style={{ background: 'linear-gradient(135deg,#dc2626,#ea580c)' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

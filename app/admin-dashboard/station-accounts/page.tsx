'use client';
import { useEffect, useState } from 'react';

const cardStyle = {
  background: 'linear-gradient(135deg, rgba(30,10,10,0.95), rgba(20,5,5,0.98))',
  border: '1px solid rgba(239,68,68,0.2)',
};
const inputCls = "w-full px-3 py-2.5 rounded-lg text-white text-sm focus:outline-none transition-all input-f";
const inputSty = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(239,68,68,0.25)' };
const labelCls = "block text-xs font-bold uppercase tracking-widest mb-1.5";

export default function StationAccountsManagement() {
  const [accounts, setAccounts]   = useState<any[]>([]);
  const [stations, setStations]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', password_confirm: '', email: '', first_name: '', last_name: '', fire_station: '' });
  const [editFormData, setEditFormData] = useState({ username: '', email: '', first_name: '', last_name: '', fire_station: '', is_active: true });

  useEffect(() => { fetchAccounts(); fetchStations(); }, []);

  const fetchAccounts = async () => {
    const token = localStorage.getItem('access_token');
    const res = await fetch('https://firebackend-tsi7.onrender.com/api/admin/station-accounts/', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setAccounts(await res.json());
    setLoading(false);
  };
  const fetchStations = async () => {
    const token = localStorage.getItem('access_token');
    const res = await fetch('https://firebackend-tsi7.onrender.com/api/admin/fire-stations/', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setStations(await res.json());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirm) { alert('Passwords do not match!'); return; }
    setSubmitting(true);
    const token = localStorage.getItem('access_token');
    const res = await fetch('https://firebackend-tsi7.onrender.com/api/admin/station-accounts/', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) { setShowModal(false); resetForm(); fetchAccounts(); }
    else { const d = await res.json(); alert(JSON.stringify(d)); }
    setSubmitting(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    const token = localStorage.getItem('access_token');
    const res = await fetch(`https://firebackend-tsi7.onrender.com/api/admin/station-accounts/${editingAccount.id}/`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(editFormData),
    });
    if (res.ok) { setShowEditModal(false); fetchAccounts(); }
    else { const d = await res.json(); alert(JSON.stringify(d)); }
    setSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this station account?')) return;
    const token = localStorage.getItem('access_token');
    await fetch(`https://firebackend-tsi7.onrender.com/api/admin/station-accounts/${id}/`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchAccounts();
  };

  const handleEdit = (a: any) => {
    setEditingAccount(a);
    setEditFormData({ username: a.username, email: a.email || '', first_name: a.first_name || '', last_name: a.last_name || '', fire_station: a.fire_station || '', is_active: a.is_active });
    setShowEditModal(true);
  };

  const resetForm = () => setFormData({ username: '', password: '', password_confirm: '', email: '', first_name: '', last_name: '', fire_station: '' });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-4xl animate-bounce">👥</div></div>;

  return (
    <div className="space-y-4">
      <style>{`
        .tbl-row:hover { background: rgba(239,68,68,0.06) !important; }
        .input-f:focus { border-color: rgba(251,146,60,0.6) !important; box-shadow: 0 0 8px rgba(251,146,60,0.15); }
        select option { background: #1a0808; color: white; }
      `}</style>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-orange-800">Station Accounts</h1>
          <p className="text-gray-500 text-xs mt-0.5">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all duration-200"
          style={{ background: 'linear-gradient(135deg, #dc2626, #ea580c)', boxShadow: '0 4px 14px rgba(220,38,38,0.35)' }}>
          ➕ Create Account
        </button>
      </div>

      <div className="rounded-xl overflow-hidden" style={cardStyle}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
              <tr>
                {['Account', 'Email', 'Fire Station', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-600">No station accounts yet.</td></tr>
              ) : accounts.map(a => (
                <tr key={a.id} className="tbl-row transition-colors" style={{ borderBottom: '1px solid rgba(239,68,68,0.08)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                        style={{ background: 'linear-gradient(135deg, #dc2626, #ea580c)', color: 'white' }}>
                        {a.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">{a.username}</p>
                        <p className="text-gray-500 text-xs">{a.first_name} {a.last_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{a.email || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-full"
                      style={{ color: '#f97316', background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)' }}>
                      {a.fire_station_name || 'Not Assigned'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-full"
                      style={{ color: a.is_active ? '#4ade80' : '#9ca3af', background: a.is_active ? 'rgba(74,222,128,0.15)' : 'rgba(156,163,175,0.15)' }}>
                      {a.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(a)}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg"
                        style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(a.id)}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg"
                        style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{ background: '#120505', border: '1px solid rgba(239,68,68,0.35)', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
              <h2 className="text-white font-black">Create Station Account</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-500 hover:text-white text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[['First Name', 'first_name', 'text'], ['Last Name', 'last_name', 'text']].map(([l, k, t]) => (
                  <div key={k as string}>
                    <label className={labelCls} style={{ color: '#f97316' }}>{l}</label>
                    <input type={t as string} value={formData[k as keyof typeof formData] as string}
                      onChange={e => setFormData({ ...formData, [k as string]: e.target.value })}
                      className={inputCls} style={inputSty} required />
                  </div>
                ))}
              </div>
              {[['Username', 'username', 'text'], ['Email', 'email', 'email']].map(([l, k, t]) => (
                <div key={k as string}>
                  <label className={labelCls} style={{ color: '#f97316' }}>{l}</label>
                  <input type={t as string} value={formData[k as keyof typeof formData] as string}
                    onChange={e => setFormData({ ...formData, [k as string]: e.target.value })}
                    className={inputCls} style={inputSty} required />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                {[['Password', 'password'], ['Confirm Password', 'password_confirm']].map(([l, k]) => (
                  <div key={k}>
                    <label className={labelCls} style={{ color: '#f97316' }}>{l}</label>
                    <input type="password" value={formData[k as keyof typeof formData] as string}
                      onChange={e => setFormData({ ...formData, [k]: e.target.value })}
                      className={inputCls} style={inputSty} required />
                  </div>
                ))}
              </div>
              <div>
                <label className={labelCls} style={{ color: '#f97316' }}>Fire Station</label>
                <select value={formData.fire_station} onChange={e => setFormData({ ...formData, fire_station: e.target.value })}
                  className={inputCls} style={inputSty} required>
                  <option value="">Select a fire station...</option>
                  {stations.map(s => <option key={s.id} value={s.id}>{s.name} — {s.address}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #dc2626, #ea580c)' }}>
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-400"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{ background: '#120505', border: '1px solid rgba(239,68,68,0.35)', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
              <div>
                <h2 className="text-white font-black">Edit Account</h2>
                <p className="text-gray-500 text-xs">@{editingAccount.username}</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-white text-xl">✕</button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[['First Name', 'first_name'], ['Last Name', 'last_name']].map(([l, k]) => (
                  <div key={k}>
                    <label className={labelCls} style={{ color: '#f97316' }}>{l}</label>
                    <input type="text" value={editFormData[k as keyof typeof editFormData] as string}
                      onChange={e => setEditFormData({ ...editFormData, [k]: e.target.value })}
                      className={inputCls} style={inputSty} />
                  </div>
                ))}
              </div>
              {[['Username', 'username', 'text'], ['Email', 'email', 'email']].map(([l, k, t]) => (
                <div key={k as string}>
                  <label className={labelCls} style={{ color: '#f97316' }}>{l}</label>
                  <input type={t as string} value={editFormData[k as keyof typeof editFormData] as string}
                    onChange={e => setEditFormData({ ...editFormData, [k as string]: e.target.value })}
                    className={inputCls} style={inputSty} required={k === 'username'} />
                </div>
              ))}
              <div>
                <label className={labelCls} style={{ color: '#f97316' }}>Fire Station</label>
                <select value={editFormData.fire_station} onChange={e => setEditFormData({ ...editFormData, fire_station: e.target.value })}
                  className={inputCls} style={inputSty}>
                  <option value="">Not Assigned</option>
                  {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls} style={{ color: '#f97316' }}>Status</label>
                <select value={editFormData.is_active ? 'true' : 'false'}
                  onChange={e => setEditFormData({ ...editFormData, is_active: e.target.value === 'true' })}
                  className={inputCls} style={inputSty}>
                  <option value="true">Active</option>
                  <option value="false">Inactive (Banned)</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #dc2626, #ea580c)' }}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setShowEditModal(false)}
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

'use client';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const headers = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
  });

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch(`${API}/api/admin/users/`, { headers: headers() });
    setUsers(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    const token = localStorage.getItem('access_token');
    fetch(`${API}/api/admin/users/mark_all_read/`, { method: 'POST', headers: headers() }).catch(() => {});
  }, []);

  const toggleActive = async (user: any) => {
    await fetch(`${API}/api/admin/users/${user.id}/`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ is_active: !user.is_active }),
    });
    fetchUsers();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white font-black text-xl uppercase tracking-widest">User Management</h1>
          <p className="text-gray-500 text-xs mt-1">{users.length} public accounts</p>
        </div>
        <input
          type="text"
          placeholder="Search by name, username, or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="text-sm px-4 py-2 rounded-lg bg-gray-900 text-white placeholder-gray-600 outline-none w-72"
          style={{ border: '1px solid rgba(239,68,68,0.2)' }}
        />
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(30,10,10,0.95)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10" style={{ background: '#1a0808' }}>
                <tr style={{ borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
                  {['Username', 'Email', 'Name', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-black uppercase tracking-widest" style={{ color: '#6b7280' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const q = search.toLowerCase();
                  const filtered = users.filter(u =>
                    u.username?.toLowerCase().includes(q) ||
                    u.email?.toLowerCase().includes(q) ||
                    `${u.first_name} ${u.last_name}`.toLowerCase().includes(q)
                  );
                  return filtered.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-10 text-gray-600">{search ? 'No users match your search.' : 'No public users found.'}</td></tr>
                  ) : filtered.map(u => (
                  <tr key={u.id} className="transition-colors hover:bg-red-950/20" style={{ borderBottom: '1px solid rgba(239,68,68,0.08)' }}>
                    <td className="px-5 py-3 text-white font-semibold">{u.username}</td>
                    <td className="px-5 py-3" style={{ color: '#9ca3af' }}>{u.email || '—'}</td>
                    <td className="px-5 py-3" style={{ color: '#9ca3af' }}>{[u.first_name, u.last_name].filter(Boolean).join(' ') || '—'}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: '#6b7280' }}>
                      {new Date(u.date_joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: u.is_active ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)', color: u.is_active ? '#4ade80' : '#f87171' }}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => toggleActive(u)}
                        className="text-xs font-bold px-3 py-1 rounded-lg transition-all"
                        style={{ background: u.is_active ? 'rgba(239,68,68,0.15)' : 'rgba(74,222,128,0.15)', color: u.is_active ? '#f87171' : '#4ade80', border: `1px solid ${u.is_active ? 'rgba(239,68,68,0.3)' : 'rgba(74,222,128,0.3)'}` }}>
                        {u.is_active ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


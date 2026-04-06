'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Footer from '../../components/Footer';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', first_name: '', last_name: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('https://firebackend-tsi7.onrender.com/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) { login(data.user, data.tokens); router.push('/'); }
      else setError(data.error || 'Registration failed');
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const embers = Array.from({ length: 14 }, (_, i) => i);
  const inputClass = "w-full pl-10 pr-4 py-3 rounded-lg text-white text-sm placeholder-gray-600 transition-all duration-300 focus:outline-none input-field";
  const inputStyle = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(239,68,68,0.3)' };

  const fields: { key: keyof typeof formData; label: string; icon: string; type: string; placeholder: string; required: boolean }[] = [
    { key: 'first_name',  label: 'First Name', icon: '✏️', type: 'text',     placeholder: 'Juan',           required: false },
    { key: 'last_name',   label: 'Last Name',  icon: '✏️', type: 'text',     placeholder: 'Dela Cruz',      required: false },
    { key: 'username',    label: 'Username',   icon: '👤', type: 'text',     placeholder: 'juandelacruz',   required: true  },
    { key: 'email',       label: 'Email',      icon: '📧', type: 'email',    placeholder: 'juan@email.com', required: true  },
  ];

  return (
    <>
    <div className="min-h-screen flex bg-gray-950 overflow-hidden">
      <style>{`
        @keyframes ember-rise {
          0%   { transform: translateY(0) scale(1); opacity: 0.8; }
          100% { transform: translateY(-100vh) translateX(var(--drift)) scale(0.2); opacity: 0; }
        }
        @keyframes brand-flicker {
          0%, 100% { text-shadow: 0 0 20px rgba(251,146,60,0.8), 0 0 40px rgba(239,68,68,0.5); }
          50%       { text-shadow: 0 0 30px rgba(251,191,36,1),   0 0 60px rgba(239,68,68,0.8); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes badge-burn {
          0%, 100% { transform: scale(1) rotate(-4deg); filter: drop-shadow(0 0 16px rgba(255,69,0,0.9)); }
          50%       { transform: scale(1.12) rotate(4deg); filter: drop-shadow(0 0 28px rgba(255,165,0,1)); }
        }
        .ember {
          position: absolute; bottom: -10px;
          width: 6px; height: 6px; border-radius: 50% 50% 50% 0;
          background: radial-gradient(circle, #fbbf24, #ef4444);
          animation: ember-rise linear infinite; opacity: 0;
        }
        .input-field:focus { border-color: rgba(251,146,60,0.7) !important; box-shadow: 0 0 12px rgba(251,146,60,0.2); }
        .brand-title { animation: brand-flicker 2.5s ease-in-out infinite; }
        .form-card   { animation: slide-up 0.7s ease-out forwards; }
        .badge-icon  { animation: badge-burn 1.8s ease-in-out infinite; }
        .divider-line { background: linear-gradient(to bottom, transparent, rgba(239,68,68,0.6) 30%, rgba(251,146,60,0.6) 70%, transparent); }
      `}</style>

      {/* ── LEFT BRANDING PANEL ── */}
      <div className="hidden lg:flex lg:w-5/12 relative flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-red-950 to-black overflow-hidden">
        {embers.map((i) => (
          <span key={i} className="ember" style={{
            left: `${(i * 7) % 100}%`,
            animationDuration: `${3 + (i % 5)}s`,
            animationDelay: `${(i * 0.35) % 4}s`,
            ['--drift' as string]: `${(i % 2 === 0 ? 1 : -1) * (10 + (i % 20))}px`,
            width: `${4 + (i % 4)}px`, height: `${4 + (i % 4)}px`,
          }} />
        ))}
        <div className="absolute bottom-0 left-0 w-full h-64 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(220,38,38,0.35), transparent)' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(220,38,38,0.15) 0%, transparent 70%)' }} />

        <div className="relative z-10 text-center px-10">
          <div className="badge-icon text-7xl mb-5 inline-block">🔥</div>
          <h1 className="brand-title text-4xl font-black text-white tracking-widest uppercase mb-2">CEBU CITY</h1>
          <h2 className="text-2xl font-bold tracking-widest uppercase mb-2" style={{ color: '#f97316' }}>FIRE DEPARTMENT</h2>
          <div className="w-20 h-1 mx-auto my-4 rounded-full" style={{ background: 'linear-gradient(to right, #ef4444, #fbbf24, #ef4444)' }} />
          <p className="text-gray-400 text-base leading-relaxed max-w-xs mx-auto">
            Create your account and be part of our community safety network.
          </p>
          <div className="mt-8 space-y-3">
            {[['🚨', 'Report emergencies instantly'], ['📍', 'Share your location with responders'], ['📋', 'Track your report status live']].map(([icon, text]) => (
              <div key={text as string} className="flex items-center gap-3 text-left px-4 py-2.5 rounded-lg"
                style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <span className="text-xl">{icon}</span>
                <span className="text-gray-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden lg:block w-px divider-line" />

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex items-center justify-center bg-gray-950 px-4 sm:px-8 py-8 sm:py-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />

        <div className="form-card w-full max-w-md relative z-10">
          <div className="lg:hidden text-center mb-6">
            <div className="badge-icon text-5xl inline-block mb-2">🔥</div>
            <h1 className="text-xl font-black text-white tracking-widest uppercase">Cebu City Fire Dept.</h1>
          </div>

          <div className="rounded-2xl p-6 sm:p-8" style={{
            background: 'linear-gradient(135deg, rgba(30,10,10,0.95), rgba(20,5,5,0.98))',
            border: '1px solid rgba(239,68,68,0.35)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(220,38,38,0.1)',
            backdropFilter: 'blur(20px)',
          }}>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-white mb-1">Create Account</h2>
              <p className="text-gray-500 text-sm">Join the community safety network</p>
              <div className="mt-3 h-0.5 w-12 rounded-full" style={{ background: 'linear-gradient(to right, #ef4444, #f97316)' }} />
            </div>

            {error && (
              <div className="mb-5 px-4 py-3 rounded-lg text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5' }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fields.slice(0, 2).map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#f97316' }}>{f.label}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-base">{f.icon}</span>
                      <input type={f.type} value={formData[f.key]} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                        placeholder={f.placeholder} className={inputClass} style={inputStyle} required={f.required} />
                    </div>
                  </div>
                ))}
              </div>

              {fields.slice(2).map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#f97316' }}>{f.label}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-base">{f.icon}</span>
                    <input type={f.type} value={formData[f.key]} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                      placeholder={f.placeholder} className={inputClass} style={inputStyle} required={f.required} />
                  </div>
                </div>
              ))}

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#f97316' }}>Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-base">🔒</span>
                  <input type={showPassword ? 'text' : 'password'} value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Create a strong password" className={`${inputClass} pr-12`} style={inputStyle} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors text-lg">
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-lg font-bold text-white text-sm uppercase tracking-widest transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                style={{ background: loading ? 'rgba(239,68,68,0.5)' : 'linear-gradient(135deg, #dc2626, #ea580c)', boxShadow: loading ? 'none' : '0 8px 24px rgba(220,38,38,0.4)' }}>
                {loading ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Creating account...</>
                ) : '🔥 Create Account'}
              </button>
            </form>

            <div className="mt-5 pt-5 text-center" style={{ borderTop: '1px solid rgba(239,68,68,0.15)' }}>
              <p className="text-gray-500 text-sm">
                Already have an account?{' '}
                <a href="/login" className="font-bold transition-colors" style={{ color: '#f97316' }}>Login here</a>
              </p>
              <a href="/" className="inline-block mt-2 text-xs text-gray-600 hover:text-gray-400 transition-colors">← Back to Home</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}

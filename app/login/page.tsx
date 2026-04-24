'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const resetSuccess = searchParams.get('reset') === 'success';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        login(data.user, data.tokens);
        if (data.user.role === 'admin') router.push('/admin-dashboard');
        else if (data.user.role === 'station') router.push('/station-dashboard');
        else router.push('/');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const embers = Array.from({ length: 18 }, (_, i) => i);

  return (
    <div className="min-h-screen flex bg-gray-950 overflow-hidden">
      <style>{`
        @keyframes ember-rise {
          0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0.8; }
          100% { transform: translateY(-100vh) translateX(var(--drift)) scale(0.2); opacity: 0; }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 8px rgba(239,68,68,0.4), inset 0 0 8px rgba(239,68,68,0.05); }
          50%       { box-shadow: 0 0 18px rgba(251,146,60,0.7), inset 0 0 12px rgba(251,146,60,0.1); }
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
          position: absolute;
          bottom: -10px;
          width: 6px;
          height: 6px;
          border-radius: 50% 50% 50% 0;
          background: radial-gradient(circle, #fbbf24, #ef4444);
          animation: ember-rise linear infinite;
          opacity: 0;
        }
        .input-glow:focus {
          animation: glow-pulse 2s ease-in-out infinite;
          border-color: rgba(251,146,60,0.8) !important;
          outline: none;
        }
        .brand-title { animation: brand-flicker 2.5s ease-in-out infinite; }
        .form-card   { animation: slide-up 0.7s ease-out forwards; }
        .badge-icon  { animation: badge-burn 1.8s ease-in-out infinite; }
        .divider-line {
          background: linear-gradient(to bottom, transparent, rgba(239,68,68,0.6) 30%, rgba(251,146,60,0.6) 70%, transparent);
        }
      `}</style>

      {/* ── LEFT BRANDING PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-red-950 to-black overflow-hidden">
        {/* Ember particles */}
        {embers.map((i) => (
          <span
            key={i}
            className="ember"
            style={{
              left: `${(i * 5.5) % 100}%`,
              animationDuration: `${3 + (i % 5)}s`,
              animationDelay: `${(i * 0.4) % 4}s`,
              ['--drift' as string]: `${(i % 2 === 0 ? 1 : -1) * (10 + (i % 20))}px`,
              width: `${4 + (i % 5)}px`,
              height: `${4 + (i % 5)}px`,
            }}
          />
        ))}

        {/* Bottom flame glow */}
        <div className="absolute bottom-0 left-0 w-full h-64 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(220,38,38,0.35), transparent)' }} />
        <div className="absolute bottom-0 left-0 w-full h-40 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(251,146,60,0.2), transparent)' }} />

        {/* Radial center glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(220,38,38,0.15) 0%, transparent 70%)' }} />

        <div className="relative z-10 text-center px-12">
          <div className="badge-icon text-8xl mb-6 inline-block">🔥</div>

          <h1 className="brand-title text-5xl font-black text-white tracking-widest uppercase mb-3">
            CEBU CITY
          </h1>
          <h2 className="text-3xl font-bold tracking-widest uppercase mb-2"
            style={{ color: '#f97316' }}>
            FIRE DEPARTMENT
          </h2>
          <div className="w-24 h-1 mx-auto my-5 rounded-full"
            style={{ background: 'linear-gradient(to right, #ef4444, #fbbf24, #ef4444)' }} />
          <p className="text-gray-400 text-lg leading-relaxed max-w-xs mx-auto">
            Protecting lives and property through courage, service, and excellence.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[['🚒', 'Rapid', 'Response'], ['🛡️', 'Always', 'Ready'], ['❤️', 'Serve &', 'Protect']].map(([icon, l1, l2]) => (
              <div key={l1} className="rounded-xl p-3"
                style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-xs text-orange-400 font-bold">{l1}</div>
                <div className="text-xs text-orange-400 font-bold">{l2}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vertical divider */}
      <div className="hidden lg:block w-px divider-line" />

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex items-center justify-center bg-gray-950 px-4 sm:px-8 py-8 sm:py-12 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.06) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

        <div className="form-card w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="badge-icon text-6xl inline-block mb-3">🔥</div>
            <h1 className="text-2xl font-black text-white tracking-widest uppercase">Cebu City Fire Dept.</h1>
          </div>

          {/* Card */}
          <div className="rounded-2xl p-6 sm:p-8"
            style={{
              background: 'linear-gradient(135deg, rgba(30,10,10,0.95), rgba(20,5,5,0.98))',
              border: '1px solid rgba(239,68,68,0.35)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(220,38,38,0.1)',
              backdropFilter: 'blur(20px)',
            }}>

            <div className="mb-8">
              <h2 className="text-3xl font-black text-white mb-1">Welcome Back</h2>
              <p className="text-gray-500 text-sm">Sign in to your account to continue</p>
              <div className="mt-3 h-0.5 w-12 rounded-full"
                style={{ background: 'linear-gradient(to right, #ef4444, #f97316)' }} />
            </div>

            {resetSuccess && (
              <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-lg text-sm"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.4)', color: '#86efac' }}>
                ✅ Password reset successfully! Please login with your new password.
              </div>
            )}

            {error && (
              <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-lg text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5' }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: '#f97316' }}>
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">👤</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="input-glow w-full pl-10 pr-4 py-3 rounded-lg text-white text-sm placeholder-gray-600 transition-all duration-300"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(239,68,68,0.3)',
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold uppercase tracking-widest"
                    style={{ color: '#f97316' }}>
                    Password
                  </label>
                  <a href="/forgot-password"
                    className="text-xs text-gray-500 hover:text-orange-400 transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input-glow w-full pl-10 pr-12 py-3 rounded-lg text-white text-sm placeholder-gray-600 transition-all duration-300"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(239,68,68,0.3)',
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors text-lg">
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-lg font-bold text-white text-sm uppercase tracking-widest transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                style={{
                  background: loading
                    ? 'rgba(239,68,68,0.5)'
                    : 'linear-gradient(135deg, #dc2626, #ea580c)',
                  boxShadow: loading ? 'none' : '0 8px 24px rgba(220,38,38,0.4)',
                }}
                onMouseEnter={(e) => {
                  if (!loading) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 32px rgba(220,38,38,0.6)';
                }}
                onMouseLeave={(e) => {
                  if (!loading) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(220,38,38,0.4)';
                }}>
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>🔥 Sign In</>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 text-center"
              style={{ borderTop: '1px solid rgba(239,68,68,0.15)' }}>
              <p className="text-gray-500 text-sm">
                Don't have an account?{' '}
                <a href="/register" className="font-bold transition-colors"
                  style={{ color: '#f97316' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#fbbf24')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#f97316')}>
                  Register here
                </a>
              </p>
              <a href="/" className="inline-block mt-3 text-xs text-gray-600 hover:text-gray-400 transition-colors">
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}


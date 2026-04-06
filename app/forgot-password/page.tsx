'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '../../components/Footer';

export default function ForgotPassword() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/auth/forgot-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      if (response.ok) {
        router.push(`/reset-password?username=${encodeURIComponent(username)}&message=${encodeURIComponent(data.message)}`);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 sm:px-6 overflow-hidden relative">
      <style>{`
        @keyframes ember-rise {
          0%   { transform: translateY(0) scale(1); opacity: 0.7; }
          100% { transform: translateY(-100vh) translateX(var(--drift)) scale(0.2); opacity: 0; }
        }
        @keyframes key-swing {
          0%, 100% { transform: rotate(-15deg); }
          50%       { transform: rotate(15deg); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ember {
          position: absolute; bottom: -10px;
          border-radius: 50% 50% 50% 0;
          background: radial-gradient(circle, #fbbf24, #ef4444);
          animation: ember-rise linear infinite; opacity: 0;
        }
        .key-icon  { animation: key-swing 2s ease-in-out infinite; display: inline-block; }
        .form-card { animation: slide-up 0.6s ease-out forwards; }
        .input-field:focus { border-color: rgba(251,146,60,0.7) !important; box-shadow: 0 0 12px rgba(251,146,60,0.2); outline: none; }
      `}</style>

      {/* Ember particles */}
      {Array.from({ length: 10 }, (_, i) => (
        <span key={i} className="ember" style={{
          left: `${(i * 10) % 100}%`,
          width: `${4 + (i % 4)}px`, height: `${4 + (i % 4)}px`,
          animationDuration: `${3 + (i % 4)}s`,
          animationDelay: `${(i * 0.5) % 4}s`,
          ['--drift' as string]: `${(i % 2 === 0 ? 1 : -1) * (10 + (i % 25))}px`,
        }} />
      ))}

      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(220,38,38,0.15) 0%, transparent 60%)' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.06) 0%, transparent 70%)' }} />

      <div className="form-card w-full max-w-md relative z-10">
        <div className="rounded-2xl p-6 sm:p-8" style={{
          background: 'linear-gradient(135deg, rgba(30,10,10,0.97), rgba(20,5,5,0.99))',
          border: '1px solid rgba(239,68,68,0.35)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.7), 0 0 40px rgba(220,38,38,0.1)',
          backdropFilter: 'blur(20px)',
        }}>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="key-icon text-6xl mb-4">🔑</div>
            <h1 className="text-2xl font-black text-white mb-1">Forgot Password?</h1>
            <p className="text-gray-500 text-sm">Enter your username and we'll send you a reset code.</p>
            <div className="mt-3 h-0.5 w-12 mx-auto rounded-full" style={{ background: 'linear-gradient(to right, #ef4444, #f97316)' }} />
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#f97316' }}>
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">👤</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="input-field w-full pl-10 pr-4 py-3 rounded-lg text-white text-sm placeholder-gray-600 transition-all duration-300"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(239,68,68,0.3)' }}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-lg font-bold text-white text-sm uppercase tracking-widest transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: loading ? 'rgba(239,68,68,0.5)' : 'linear-gradient(135deg, #dc2626, #ea580c)', boxShadow: loading ? 'none' : '0 8px 24px rgba(220,38,38,0.4)' }}>
              {loading ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Sending...</>
              ) : '📨 Send Reset Code'}
            </button>
          </form>

          {/* Steps hint */}
          <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">How it works</p>
            <div className="space-y-1.5">
              {['Enter your username', 'Receive a reset code', 'Set your new password'].map((step, i) => (
                <div key={step} className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: 'rgba(239,68,68,0.2)', color: '#f97316' }}>{i + 1}</span>
                  {step}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-5 text-center" style={{ borderTop: '1px solid rgba(239,68,68,0.15)' }}>
            <a href="/login" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">← Back to Login</a>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}

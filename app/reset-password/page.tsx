'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ResetPasswordForm() {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || '';
  const message = searchParams.get('message') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/reset-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, code, new_password: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/login?reset=success');
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black relative overflow-hidden flex items-center justify-center">
      <div className="flames"></div>
      <div className="flames flames-2"></div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="fire-card">
          <div className="text-center mb-8">
            <div className="fire-badge mx-auto mb-4">🔒</div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500">
              RESET PASSWORD
            </h1>
            {message && (
              <div className="bg-green-600/20 border border-green-600 text-green-400 px-4 py-3 rounded mt-4 text-sm">
                ✅ {message}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-600/20 border border-red-600 text-red-400 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-yellow-400 font-bold mb-2">6-Digit Reset Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 bg-gray-800 border border-red-600 rounded text-white focus:outline-none focus:border-yellow-400 text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-yellow-400 font-bold mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-red-600 rounded text-white focus:outline-none focus:border-yellow-400 pr-12"
                  placeholder="Minimum 8 characters"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xl">
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-yellow-400 font-bold mb-2">Confirm New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-red-600 rounded text-white focus:outline-none focus:border-yellow-400"
                placeholder="Re-enter new password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Resetting...
                </>
              ) : 'RESET PASSWORD'}
            </button>
          </form>

          <div className="text-center mt-4">
            <a href="/forgot-password" className="text-gray-500 hover:text-gray-400 text-sm">
              Didn't receive a code? Request again
            </a>
          </div>

          <div className="text-center mt-2">
            <a href="/login" className="text-gray-500 hover:text-gray-400">
              ← Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

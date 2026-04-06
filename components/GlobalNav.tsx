'use client';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import ConfirmDialog from './ConfirmDialog';

const HIDDEN_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];

export default function GlobalNav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Hide on auth pages and admin/station dashboards
  if (!user || HIDDEN_PATHS.includes(pathname) || pathname.startsWith('/admin-dashboard') || pathname.startsWith('/station-dashboard')) {
    return null;
  }

  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
    {showConfirm && <ConfirmDialog message="Are you sure you want to logout?" onConfirm={() => { logout(); router.push('/'); }} onCancel={() => setShowConfirm(false)} />}
    <div className="fixed top-0 right-0 z-50 flex items-center gap-2 p-2 sm:p-3">
      <a
        href="/profile"
        className="bg-gray-800/90 hover:bg-gray-700 text-yellow-300 text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-lg backdrop-blur-sm transition border border-gray-600"
      >
        👤 <span className="hidden sm:inline">{user.username}</span>
      </a>
      <a
        href="/my-reports"
        className="hidden sm:block bg-gray-800/90 hover:bg-gray-700 text-white text-sm font-bold px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm transition border border-gray-600"
      >
        My Reports
      </a>
      <button
        onClick={() => setShowConfirm(true)}
        className="bg-red-700/90 hover:bg-red-800 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-lg backdrop-blur-sm transition border border-red-600"
      >
        Logout
      </button>
    </div>
    </>
  );
}

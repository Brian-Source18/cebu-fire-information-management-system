'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from './ConfirmDialog';

export default function PublicHeader() {
  const { user, logout } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      {showConfirm && (
        <ConfirmDialog
          message="Are you sure you want to logout?"
          onConfirm={() => logout()}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <header
        className="sticky top-0 z-[1000] isolate border-b border-slate-200 bg-white shadow-sm"
      >
        <div className="mx-auto flex h-[60px] max-w-[1200px] items-center justify-between gap-2 px-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-lg text-white">
              🔥
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-extrabold leading-tight tracking-[0.3px] text-slate-800">
                CEBU CITY FIRE SYSTEM
              </div>
              <div className="truncate text-[10px] font-semibold text-red-600">
                Always Ready • Always There
              </div>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  href="/my-story"
                  className="hidden whitespace-nowrap rounded-lg border border-orange-600 px-3 py-1.5 text-xs font-bold text-orange-600 sm:inline-block"
                >
                  Feature Your Story
                </Link>
                <Link
                  href="/about"
                  className="whitespace-nowrap rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600"
                >
                  About Us
                </Link>
                <Link
                  href="/profile"
                  className="hidden whitespace-nowrap rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 sm:inline-block"
                >
                  {user.username}
                </Link>
                <Link
                  href="/my-reports"
                  className="hidden whitespace-nowrap rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 md:inline-block"
                >
                  My Reports
                </Link>
                <button
                  onClick={() => setShowConfirm(true)}
                  className="whitespace-nowrap rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/about"
                  className="whitespace-nowrap rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600"
                >
                  About Us
                </Link>
                <Link
                  href="/login"
                  className="whitespace-nowrap rounded-xl border border-red-600 px-4 py-2 text-sm font-bold text-red-600"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="whitespace-nowrap rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}

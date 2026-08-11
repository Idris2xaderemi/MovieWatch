'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import SearchBar from '../ui/SearchBar';

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isSignIn, setIsSignIn] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsSignIn((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = () => {
    signOut();
    setShowSignOutModal(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white text-lg">
                F
              </div>
              <span className="text-xl font-bold">Film<span className="text-primary">Hive</span></span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-gray-300 hover:text-white transition">Home</Link>
              {session && (
                <>
                  <Link href="/watchlist" className="text-gray-300 hover:text-white transition">Watchlist</Link>
                  <Link href="/profile" className="text-gray-300 hover:text-white transition">Profile</Link>
                </>
              )}
              <Link href="/about" className="text-gray-300 hover:text-white transition">About</Link>
            </div>

            {/* Right side: Search + Auth (desktop) */}
            <div className="flex items-center gap-3">
              <SearchBar />

              {/* Desktop Sign-in/out */}
              <div className="hidden md:flex items-center gap-2">
                {session ? (
                  <>
                    <span className="text-sm text-gray-400 hidden sm:inline">{session.user?.name}</span>
                    <button
                      onClick={() => setShowSignOutModal(true)}
                      className="auth-btn auth-btn-signout text-sm px-3 py-1.5"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => signIn('google')}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary hover:bg-red-600 text-white font-medium transition-all overflow-hidden"
                    style={{ height: '40px' }}
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <div className="relative h-5 overflow-hidden">
                      <div
                        className="flex flex-col transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateY(${isSignIn ? 0 : -20}px)` }}
                      >
                        <span className="h-5 flex items-center whitespace-nowrap">Sign in</span>
                        <span className="h-5 flex items-center whitespace-nowrap">Sign up</span>
                      </div>
                    </div>
                  </button>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                className="md:hidden text-gray-400 hover:text-white transition p-1.5"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-border">
              <div className="flex flex-col gap-2">
                <Link href="/" className="px-3 py-2 rounded-lg hover:bg-surface transition">Home</Link>
                {session && (
                  <>
                    <Link href="/watchlist" className="px-3 py-2 rounded-lg hover:bg-surface transition">Watchlist</Link>
                    <Link href="/profile" className="px-3 py-2 rounded-lg hover:bg-surface transition">Profile</Link>
                  </>
                )}
                <Link href="/about" className="px-3 py-2 rounded-lg hover:bg-surface transition">About</Link>

                {/* Mobile auth buttons */}
                <div className="pt-2 border-t border-border mt-1">
                  {session ? (
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-sm text-gray-300">{session.user?.name}</span>
                      <button
                        onClick={() => setShowSignOutModal(true)}
                        className="text-sm text-red-400 hover:text-red-300 transition"
                      >
                        Sign out
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => signIn('google')}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface transition text-primary font-medium"
                    >
                      Sign in / Sign up
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Sign-out modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-surface rounded-xl border border-border p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Sign out</h3>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to sign out? You can always sign back in.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="btn-outline text-sm px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="btn-primary text-sm px-4 py-2"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
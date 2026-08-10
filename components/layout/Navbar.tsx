'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import SearchBar from '../ui/SearchBar';

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white text-lg">
              F
            </div>
            <span className="text-xl font-bold">Film<span className="text-primary">Hub</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-300 hover:text-white transition">Home</Link>
            {session ? (
              <>
                <Link href="/watchlist" className="text-gray-300 hover:text-white transition">Watchlist</Link>
                <Link href="/rated-movies" className="text-gray-300 hover:text-white transition">Top Rated</Link>
                <Link href="/profile" className="text-gray-300 hover:text-white transition">Profile</Link>
              </>
            ) : null}
            <Link href="/about" className="text-gray-300 hover:text-white transition">About</Link>
          </div>

          {/* Right side: search + auth + hamburger */}
          <div className="flex items-center gap-3">
            {/* Search – mobile: icon only; desktop: full input */}
            <div className="flex items-center">
              {!searchOpen ? (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="md:hidden text-gray-400 hover:text-white transition p-1"
                  aria-label="Open search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              ) : (
                <div className="relative md:hidden">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-40 px-3 py-1.5 rounded-full bg-surface border border-border text-sm focus:outline-none focus:border-primary transition text-white placeholder-gray-500"
                    autoFocus
                    onBlur={() => setSearchOpen(false)}
                  />
                </div>
              )}
              {/* Desktop full search */}
              <div className="hidden md:block">
                <SearchBar />
              </div>
            </div>

            {/* Auth buttons – hidden on mobile, shown inside hamburger */}
            {session ? (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-gray-400 hidden sm:inline">{session.user?.name}</span>
                <button
                  onClick={() => signOut()}
                  className="auth-btn auth-btn-signout text-sm px-3 py-1.5"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="hidden md:flex auth-btn auth-btn-google"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Sign in
              </button>
            )}

            {/* Hamburger button */}
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

        {/* Mobile menu (hamburger) – includes auth buttons at the bottom */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-border">
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                className="px-3 py-2 rounded-lg hover:bg-surface transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              {session ? (
                <>
                  <Link
                    href="/watchlist"
                    className="px-3 py-2 rounded-lg hover:bg-surface transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Watchlist
                  </Link>
                  <Link
                    href="/rated-movies"
                    className="px-3 py-2 rounded-lg hover:bg-surface transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Top Rated
                  </Link>
                  <Link
                    href="/profile"
                    className="px-3 py-2 rounded-lg hover:bg-surface transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                </>
              ) : null}
              <Link
                href="/about"
                className="px-3 py-2 rounded-lg hover:bg-surface transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              {/* Auth buttons at the bottom */}
              {session ? (
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="mt-2 px-3 py-2 text-left rounded-lg hover:bg-surface transition text-red-400 font-medium"
                >
                  Sign out
                </button>
              ) : (
                <button
                  onClick={() => {
                    signIn('google');
                    setMobileMenuOpen(false);
                  }}
                  className="mt-2 px-3 py-2 text-left rounded-lg hover:bg-surface transition text-primary font-medium"
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
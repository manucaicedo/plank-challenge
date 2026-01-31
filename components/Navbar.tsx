'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const { user, userRole, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleLogout() {
    try {
      await logout();
      router.push('/');
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href={user ? '/dashboard' : '/'} className="text-xl md:text-2xl font-bold text-gray-900">
            💪 Plank Challenge
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {user ? (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/challenges" className="text-gray-600 hover:text-gray-900">
                  Browse Challenges
                </Link>
                <Link href="/leaderboard" className="text-gray-600 hover:text-gray-900">
                  Leaderboard
                </Link>
                {userRole === 'admin' && (
                  <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {user.displayName || user.email}
                    {userRole === 'admin' && (
                      <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                        Admin
                      </span>
                    )}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-gray-900">
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            {user ? (
              <div className="flex flex-col space-y-4">
                <div className="px-4 py-2 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">{user.displayName || user.email}</p>
                  {userRole === 'admin' && (
                    <span className="inline-block mt-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                      Admin
                    </span>
                  )}
                </div>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 px-4 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/challenges"
                  className="text-gray-600 hover:text-gray-900 px-4 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Challenges
                </Link>
                <Link
                  href="/leaderboard"
                  className="text-gray-600 hover:text-gray-900 px-4 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Leaderboard
                </Link>
                {userRole === 'admin' && (
                  <Link
                    href="/admin"
                    className="text-gray-600 hover:text-gray-900 px-4 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-left text-gray-600 hover:text-gray-900 px-4 py-2 font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 px-4 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

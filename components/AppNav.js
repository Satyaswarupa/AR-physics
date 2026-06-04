'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AppNav({ links, name }) {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  const hideLogout = /^\/teacher\/exam\/[^/]+\/results/.test(pathname ?? '')

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-blue-950 text-white shadow-lg relative z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand + desktop links */}
          <div className="flex items-center gap-6 min-w-0">
            <Link href="/" className="text-xl font-black text-white shrink-0">
              AR <span className="text-yellow-400">Physics</span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-blue-200">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="hover:text-white transition-colors whitespace-nowrap">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: user icon + hamburger */}
          <div className="flex items-center gap-2 shrink-0">
            {/* User icon dropdown — hidden on teacher results page */}
            {!hideLogout && (
              <div className="relative">
                <button
                  onClick={() => setUserOpen((v) => !v)}
                  className="w-9 h-9 rounded-full bg-blue-800 hover:bg-blue-700 flex items-center justify-center transition-colors border border-blue-600"
                  aria-label="Account menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </button>

                {userOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-900 truncate mt-0.5">{name}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Hamburger button — mobile only */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-blue-800 transition-colors"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-blue-800 bg-blue-950 px-4 py-3 space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm text-blue-200 hover:text-white hover:bg-blue-800 transition-colors"
            >
              {l.label}
            </Link>
          ))}
          {!hideLogout && (
            <div className="border-t border-blue-800 mt-2 pt-2">
              <div className="px-3 py-1.5 text-xs text-blue-400 truncate">{name}</div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full rounded-lg px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-blue-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

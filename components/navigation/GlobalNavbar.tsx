'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell, Sun, User, Menu, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { Settings, X } from 'lucide-react';

export default function GlobalNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const { user, signIn, signOut, isConfigured } = useAuth();

  const handleAuthAction = () => {
    if (!isConfigured) {
      setShowAuthWarning(true);
    } else {
      signIn();
    }
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/play', label: 'Play' },
    { href: '/puzzles', label: 'Puzzles' },
    { href: '/analysis', label: 'Analysis' },
    { href: '/learn', label: 'Learn' },
    { href: '/watch', label: 'Watch' },
  ];

  return (
    <>
      <header
        className="h-14 shrink-0 flex items-center justify-between px-4 lg:px-6 border-b z-50 sticky top-0 bg-[var(--surface)] border-[var(--border)]"
      >
        {/* Left side: Logo & Main Nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              width="26"
              height="26"
              aria-hidden="true"
            >
              <path d="M16 2l2 5h5l-4 3 1.5 5L16 12l-4.5 3L13 10 9 7h5z" fill="var(--accent-light)" />
              <rect x="11" y="24" width="10" height="5" rx="1" fill="var(--accent)" />
              <rect x="9" y="20" width="14" height="5" rx="1" fill="var(--accent)" />
            </svg>
            <span className="text-lg font-black tracking-widest text-white hidden sm:block">
              NILECHESS
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              // Exact match for home, startsWith for others
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg font-semibold text-sm transition ${
                    isActive 
                      ? 'bg-[var(--surface-hover)] text-[var(--accent-light)]' 
                      : 'text-[var(--text-muted)] hover:text-white hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-2 lg:gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <button className="text-[var(--text-muted)] hover:text-white transition p-1.5 rounded-lg hover:bg-[var(--surface-hover)]">
              <Search size={18} />
            </button>
            <button className="text-[var(--text-muted)] hover:text-white transition p-1.5 rounded-lg hover:bg-[var(--surface-hover)]">
              <Bell size={18} />
            </button>
            <button className="text-[var(--text-muted)] hover:text-white transition p-1.5 rounded-lg hover:bg-[var(--surface-hover)]">
              <Sun size={18} /> {/* Theme Toggle Placeholder */}
            </button>
          </div>
          
          <div className="h-6 w-[1px] bg-[var(--border)] hidden sm:block mx-1"></div>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-white leading-tight">{user.email?.split('@')[0] || 'User'}</span>
                <span className="text-xs font-semibold text-[var(--text-muted)] leading-tight">1500</span>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-8 h-8 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center hover:border-[var(--accent-light)] transition overflow-hidden"
                >
                  <User size={16} className="text-[var(--text-muted)] hover:text-white" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl py-1 z-50">
                    <Link href="/settings" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-zinc-300 hover:bg-[var(--surface-hover)] hover:text-white">Settings</Link>
                    <button onClick={() => { setProfileOpen(false); signOut(); }} className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-[var(--surface-hover)]">Sign Out</button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={handleAuthAction} className="text-sm font-semibold text-zinc-300 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-[var(--surface-hover)]">
                Log In
              </button>
              <button onClick={handleAuthAction} className="text-sm font-bold bg-[var(--surface-hover)] hover:bg-[var(--border)] text-white px-4 py-1.5 rounded-lg transition border border-[var(--border)] shadow-sm">
                Sign Up
              </button>
            </div>
          )}
          
          {/* Mobile menu toggle */}
          <button 
            className="md:hidden text-[var(--text-muted)] hover:text-white p-1.5 ml-1 rounded-lg hover:bg-[var(--surface-hover)]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu size={20} />
          </button>
        </div>
      </header>
      
      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 flex flex-col gap-2">
          {navLinks.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg font-bold text-sm transition ${
                  isActive 
                    ? 'bg-[var(--surface-hover)] text-[var(--accent-light)]' 
                    : 'text-[var(--text-muted)] hover:text-white hover:bg-[var(--surface-hover)]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Auth Configuration Modal */}
      {showAuthWarning && (
        <div className="fixed inset-0 bg-[#0A101A]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-[var(--border)]">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings size={20} className="text-amber-400" />
                Setup Required
              </h3>
              <button onClick={() => setShowAuthWarning(false)} className="text-[var(--text-muted)] hover:text-white transition rounded-lg p-1 hover:bg-[var(--surface-hover)]">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                Authentication is not yet configured for this environment.
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                To enable online multiplayer and accounts, add your Supabase credentials to <code className="text-xs bg-black/30 px-1.5 py-0.5 rounded border border-[var(--border)] text-[var(--accent-light)]">.env.local</code>:
              </p>
              <div className="bg-[#0A101A] border border-[var(--border)] rounded-lg p-4 font-mono text-xs text-emerald-400 overflow-x-auto mb-6">
                NEXT_PUBLIC_SUPABASE_URL=your_url<br/>
                NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
              </div>
              <p className="text-sm text-zinc-300 font-semibold text-center bg-[var(--surface-alt)] py-3 rounded-lg border border-[var(--border)]">
                Local play and analysis continue to work fully offline!
              </p>
            </div>
            <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-hover)] flex justify-end">
              <button 
                onClick={() => setShowAuthWarning(false)}
                className="px-6 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-lg transition"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

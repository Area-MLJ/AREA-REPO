/**
 * AppLayout.tsx
 * Layout principal avec navigation responsive mobile-first
 */

import { ReactNode, useState } from 'react';
import { useAuth } from '../temp-shared';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const currentPath = window.location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/services', label: 'Services', icon: '🔌' },
    { path: '/area/create', label: 'Créer', icon: '✨' },
    { path: '/profile', label: 'Profil', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-[#E8E6E1] pb-16 md:pb-0">
      <nav className="bg-[#FAF9F6] border-b border-[#D1CFC8] fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <a href="/dashboard" className="text-lg md:text-xl font-semibold text-[#0a4a0e] truncate max-w-[60vw] md:max-w-none">
              ACTION-REACTION
            </a>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPath === item.path
                      ? 'bg-[#0a4a0e] text-white'
                      : 'text-[#4D4C47] hover:bg-[#E8E6E1]'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </a>
              ))}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#4D4C47] hover:bg-[#E8E6E1]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            <div className="hidden md:flex items-center gap-3">
              <div className="text-sm text-[#6B6962] max-w-[200px] truncate">
                {user?.email}
              </div>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#D1CFC8] bg-[#FAF9F6]">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    currentPath === item.path
                      ? 'bg-[#0a4a0e] text-white'
                      : 'text-[#4D4C47] hover:bg-[#E8E6E1]'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </a>
              ))}
              <div className="pt-3 border-t border-[#D1CFC8] mt-3">
                <div className="px-4 py-2 text-sm text-[#6B6962] truncate">
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 mt-14 md:mt-16">
        {children}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#FAF9F6] border-t border-[#D1CFC8] z-50">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                currentPath === item.path
                  ? 'text-[#0a4a0e] bg-[#e6f2e7]'
                  : 'text-[#6B6962]'
              }`}
            >
              <span className="text-xl mb-0.5">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}

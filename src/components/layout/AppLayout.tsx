import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { X, ShieldAlert } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // If resident public report or tracking without coordinator chrome
  const isPublicStandalone =
    location.pathname === '/report' ||
    (location.pathname.startsWith('/track') && !location.pathname.includes('/desk'));

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col font-sans text-ink-primary">
      {/* Disclaimer safety banner */}
      <div className="bg-brand-900 text-white text-xs px-4 py-1.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 mx-auto">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            <strong>SANKET Nagpur Prototype</strong> • Community flood intelligence and relief coordination layer. For life-threatening emergencies, dial <strong>112</strong> or NMC Disaster Control.
          </span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (hidden on public standalone pages if desired, or kept accessible) */}
        <div className="hidden lg:block shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex" role="dialog" aria-modal="true">
            <div
              className="fixed inset-0 bg-ink-primary/50 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-10 shadow-xl">
              <div className="absolute top-2 right-2 p-1">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-surface-muted"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <main className="flex-1 pb-12">
            <Outlet context={{ openMobileMenu: () => setMobileMenuOpen(true) }} />
          </main>

          {/* Calm, consistent footer */}
          <footer className="border-t border-surface-border bg-white px-6 py-4 text-xs text-ink-secondary flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-brand-800">SANKET Nagpur</span>
              <span>•</span>
              <span>Report the risk. Match the relief. Track every unmet need.</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Synthetic Operational Sandbox</span>
              <span>•</span>
              <span className="font-mono">API Mode: {import.meta.env.VITE_API_MODE || 'mock'}</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

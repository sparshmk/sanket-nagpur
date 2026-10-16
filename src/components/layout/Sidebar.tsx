import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Boxes,
  MapPin,
  History,
  FilePlus,
  Search,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { DemoBadge } from '../ui/DemoBadge';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleResetDemoData = async () => {
    if (window.confirm('Reset all demo data back to default initial seed? Your local edits will be restored to initial state.')) {
      await apiService.resetDemoData();
      showToast({
        type: 'info',
        title: 'Demo Data Reset',
        message: 'All synthetic requests and resources have been restored to initial state.',
      });
      // reload current view
      window.location.reload();
    }
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-700 text-white shadow-xs'
        : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-muted'
    }`;

  return (
    <aside className="w-64 flex flex-col h-full bg-white border-r border-surface-border select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-surface-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-700 flex items-center justify-center text-white shadow-xs">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 32 32"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M16 6L24 12V22L16 26L8 22V12L16 6Z" />
              <circle cx="16" cy="16" r="3" fill="#D6A441" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-ink-primary">SANKET</span>
              <span className="text-xs px-1.5 py-0.2 font-semibold bg-brand-50 text-brand-700 rounded border border-brand-200">
                NAGPUR
              </span>
            </div>
            <p className="text-xs text-ink-secondary mt-0.5">Flood Relief Desk</p>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
        <div>
          <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-ink-tertiary">
            Coordinator Workspace
          </div>
          <nav className="space-y-1">
            <NavLink to="/desk" end className={navItemClass} onClick={onCloseMobile}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </NavLink>
            <NavLink to="/desk/requests" className={navItemClass} onClick={onCloseMobile}>
              <ClipboardList className="w-4 h-4" />
              <span>Request Queue</span>
            </NavLink>
            <NavLink to="/desk/resources" className={navItemClass} onClick={onCloseMobile}>
              <Boxes className="w-4 h-4" />
              <span>Relief Resources</span>
            </NavLink>
            <NavLink to="/desk/map" className={navItemClass} onClick={onCloseMobile}>
              <MapPin className="w-4 h-4" />
              <span>Incident Map</span>
            </NavLink>
            <NavLink to="/desk/audit" className={navItemClass} onClick={onCloseMobile}>
              <History className="w-4 h-4" />
              <span>Audit Trail</span>
            </NavLink>
          </nav>
        </div>

        <div>
          <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-ink-tertiary">
            Public Portal
          </div>
          <nav className="space-y-1">
            <NavLink
              to="/report"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-600 text-white'
                    : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                }`
              }
              onClick={onCloseMobile}
            >
              <FilePlus className="w-4 h-4 text-amber-700" />
              <span>Report a Need</span>
            </NavLink>
            <NavLink to="/track/SN-2026-0842" className={navItemClass} onClick={onCloseMobile}>
              <Search className="w-4 h-4" />
              <span>Track Request</span>
            </NavLink>
          </nav>
        </div>

        {/* Prototype Notice Box */}
        <div className="p-3 bg-surface-mint rounded-xl border border-brand-200 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-brand-800 mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-brand-700" />
            <span>Coordination Layer</span>
          </div>
          <p className="text-ink-secondary leading-relaxed">
            SANKET verifies and matches community needs. It does not replace official emergency services.
          </p>
        </div>
      </div>

      {/* Footer / Reset Demo Data */}
      <div className="p-4 border-t border-surface-border space-y-3">
        <div className="flex items-center justify-between">
          <DemoBadge />
          <button
            type="button"
            onClick={handleResetDemoData}
            title="Reset demo data to initial seeds"
            className="flex items-center gap-1.5 text-xs text-ink-secondary hover:text-red-700 transition-colors p-1 rounded hover:bg-surface-muted"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

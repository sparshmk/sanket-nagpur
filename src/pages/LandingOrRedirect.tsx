import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { DashboardMetrics } from '../types/api';
import { DemoBadge } from '../components/ui/DemoBadge';
import { Button } from '../components/ui/Button';
import {
  FilePlus,
  LayoutDashboard,
  MapPin,
  ShieldAlert,
  ArrowRight,
  LifeBuoy,
  Users,
  Boxes,
  CheckCircle2,
} from 'lucide-react';

export const LandingOrRedirect: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    apiService.getDashboardMetrics().then(setMetrics).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col justify-between">
      {/* Top Bar */}
      <header className="border-b border-surface-border bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-700 flex items-center justify-center text-white shadow-xs">
            <svg
              className="w-4 h-4 text-white"
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
            <p className="text-[11px] text-ink-secondary">Flood Relief Coordination</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DemoBadge showDetails />
          <Link to="/desk">
            <Button size="sm" variant="outline">
              Coordinator Desk
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 py-12 sm:py-16 text-center space-y-8 flex-1 flex flex-col justify-center">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-surface-mint text-brand-900 border border-brand-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            Community-Verified Flood Intelligence Layer
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-ink-primary max-w-2xl mx-auto leading-tight">
            Report the risk. Match the relief. Track every unmet need.
          </h1>

          <p className="text-sm sm:text-base text-ink-secondary max-w-xl mx-auto leading-relaxed">
            During heavy rainfall and inundation across Nagpur, SANKET provides a shared coordination layer to verify community reports, assess priority transparently, and allocate relief supplies with coordinator accountability.
          </p>
        </div>

        {/* Dual Path Entry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto w-full pt-2">
          {/* Card 1: Resident Report */}
          <Link
            to="/report"
            className="p-6 rounded-2xl border-2 border-brand-200 bg-white hover:border-brand-700 hover:shadow-card-hover transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                <FilePlus className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-ink-primary group-hover:text-brand-700 transition-colors">
                I Need Assistance
              </h2>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Submit a structured report for rescue evacuation, potable drinking water, food packets, or medical supplies in flooded Nagpur areas.
              </p>
            </div>

            <div className="flex items-center text-xs font-bold text-brand-700 group-hover:translate-x-1 transition-transform">
              <span>Submit Assistance Report</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          {/* Card 2: Coordinator Workspace */}
          <Link
            to="/desk"
            className="p-6 rounded-2xl border-2 border-brand-700 bg-brand-700 text-white hover:bg-brand-800 hover:shadow-card-hover transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-brand-800 text-brand-100 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">
                Coordinator Operations Desk
              </h2>
              <p className="text-xs text-brand-100 leading-relaxed">
                Access the verified queue, inspect rule-based priority breakdowns, assign inventory from relief depots, and monitor the GIS map.
              </p>
            </div>

            <div className="flex items-center text-xs font-bold text-white group-hover:translate-x-1 transition-transform">
              <span>Open Response Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        </div>

        {/* Live Seeded Metrics Preview */}
        {metrics && (
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto w-full text-xs">
            <div className="p-3 bg-white rounded-xl border border-surface-border text-center">
              <span className="text-ink-tertiary block font-semibold text-[10px] uppercase">Active Reports</span>
              <span className="text-lg font-bold text-ink-primary mt-0.5 block">{metrics.totalActiveRequestsCount}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-surface-border text-center">
              <span className="text-amber-800 block font-semibold text-[10px] uppercase">Awaiting Verification</span>
              <span className="text-lg font-bold text-amber-700 mt-0.5 block">{metrics.awaitingVerificationCount}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-surface-border text-center">
              <span className="text-brand-800 block font-semibold text-[10px] uppercase">Depot Nodes</span>
              <span className="text-lg font-bold text-brand-700 mt-0.5 block">{metrics.availableResourcesCount}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-surface-border text-center">
              <span className="text-emerald-800 block font-semibold text-[10px] uppercase">Resolved</span>
              <span className="text-lg font-bold text-emerald-700 mt-0.5 block">{metrics.resolvedRequestsCount}</span>
            </div>
          </div>
        )}

        {/* Emergency Disclaimer */}
        <div className="p-3.5 bg-surface-mint rounded-xl border border-brand-200 text-xs text-brand-900 max-w-xl mx-auto flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4 text-brand-700 shrink-0" />
          <span>
            Demonstration prototype for Nagpur flood relief coordination. Dial <strong>112</strong> for NMC Emergency Services.
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-border bg-white px-6 py-4 text-xs text-ink-secondary flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2026 SANKET Nagpur • Community Flood Intelligence</span>
        <div className="flex items-center gap-3">
          <Link to="/track/SN-2026-0842" className="hover:text-brand-700">Track Request</Link>
          <span>•</span>
          <Link to="/desk/map" className="hover:text-brand-700">GIS Map</Link>
          <span>•</span>
          <Link to="/desk/audit" className="hover:text-brand-700">Audit History</Link>
        </div>
      </footer>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { AssistanceRequest, PriorityLevel } from '../types/request';
import { TopNavbar } from '../components/layout/TopNavbar';
import { LeafletIncidentMap } from '../components/map/LeafletIncidentMap';
import { PriorityBadge, VerificationBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { formatCategoryLabel, formatRelativeTime } from '../utils/formatting';
import { MapPin, ArrowRight, Filter, AlertCircle, Layers } from 'lucide-react';

export const IncidentMap: React.FC = () => {
  const { openMobileMenu } = useOutletContext<{ openMobileMenu: () => void }>();
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | undefined>();
  const [filterPriority, setFilterPriority] = useState<PriorityLevel | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getRequests();
        setRequests(data);
        if (data.length > 0) {
          setSelectedRequestId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load incident map data', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const visibleRequests = requests.filter((r) => {
    if (filterPriority === 'all') return true;
    return r.priorityAssessment.currentPriority === filterPriority;
  });

  return (
    <div>
      <TopNavbar
        title="Geographic Incident Overview"
        subtitle="Nagpur spatial risk distribution and relief staging zones"
        onOpenMobileMenu={openMobileMenu}
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-surface-border shadow-subtle text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink-primary flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-brand-700" />
              Incident Priority Filter:
            </span>
            <div className="flex flex-wrap gap-1">
              {(['all', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as (PriorityLevel | 'all')[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    filterPriority === p
                      ? 'bg-brand-700 text-white'
                      : 'bg-surface-bg text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  {p === 'all' ? 'All Incidents' : p}
                </button>
              ))}
            </div>
          </div>

          <div className="text-ink-tertiary">
            Showing <strong>{visibleRequests.length}</strong> geolocated incidents
          </div>
        </div>

        {/* Master GIS Split View: Leaflet Map + Interactive Incident Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Column (2 Cols) */}
          <div className="lg:col-span-2">
            <LeafletIncidentMap
              requests={visibleRequests}
              selectedRequestId={selectedRequestId}
              onSelectRequest={(req) => setSelectedRequestId(req.id)}
            />
          </div>

          {/* Corresponding Incident List Sidebar (1 Col) */}
          <div className="bg-white rounded-xl border border-surface-border shadow-subtle p-4 flex flex-col h-[520px]">
            <div className="pb-3 border-b border-surface-border mb-3">
              <h3 className="font-bold text-sm text-ink-primary">Incident Records</h3>
              <p className="text-xs text-ink-secondary">
                Select any record to focus map coordinates.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {visibleRequests.map((req) => {
                const isSelected = req.id === selectedRequestId;
                return (
                  <div
                    key={req.id}
                    onClick={() => setSelectedRequestId(req.id)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-700 bg-brand-50/50 ring-1 ring-brand-700 shadow-xs'
                        : 'border-surface-border hover:border-brand-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono font-bold text-ink-primary">{req.id}</span>
                      <PriorityBadge priority={req.priorityAssessment.currentPriority} size="sm" />
                    </div>

                    <div className="font-semibold text-ink-primary text-xs truncate">
                      {formatCategoryLabel(req.category)}
                    </div>

                    <div className="flex items-start gap-1 text-[11px] text-ink-secondary mt-1 truncate">
                      <MapPin className="w-3 h-3 text-brand-700 shrink-0 mt-0.5" />
                      <span className="truncate">{req.locationName}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-border/60 text-[11px]">
                      <span className="text-ink-tertiary">{req.affectedCount} affected</span>
                      <Link
                        to={`/desk/requests/${req.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-brand-700 hover:underline font-semibold flex items-center gap-0.5"
                      >
                        <span>Workspace</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

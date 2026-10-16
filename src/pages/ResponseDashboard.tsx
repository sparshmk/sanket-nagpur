import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { apiService } from '../services/api';
import { AssistanceRequest } from '../types/request';
import { ResourceItem } from '../types/resource';
import { AuditEntry } from '../types/audit';
import { DashboardMetrics } from '../types/api';
import { TopNavbar } from '../components/layout/TopNavbar';
import { RequestTable } from '../components/requests/RequestTable';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PriorityBadge } from '../components/ui/Badge';
import { formatCategoryLabel, formatRelativeTime } from '../utils/formatting';
import {
  AlertTriangle,
  ClipboardCheck,
  PackageCheck,
  Boxes,
  Users,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  History,
  LifeBuoy,
} from 'lucide-react';

export const ResponseDashboard: React.FC = () => {
  const { openMobileMenu } = useOutletContext<{ openMobileMenu: () => void }>();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [priorityRequests, setPriorityRequests] = useState<AssistanceRequest[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [recentAudit, setRecentAudit] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [m, reqs, res, aud] = await Promise.all([
        apiService.getDashboardMetrics(),
        apiService.getRequests({ sortBy: 'urgency' }),
        apiService.getResources(),
        apiService.getAuditHistory(),
      ]);

      setMetrics(m);
      // Top 5 priority unmet requests
      setPriorityRequests(
        reqs
          .filter((r: AssistanceRequest) => r.status !== 'resolved' && r.status !== 'duplicate' && r.status !== 'invalid')
          .slice(0, 5)
      );
      setResources(res);
      setRecentAudit(aud.slice(0, 4));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div>
      <TopNavbar
        title="Operations Desk"
        subtitle="Nagpur Community Flood Relief & Coordination Center"
        onOpenMobileMenu={openMobileMenu}
        actions={
          <Link to="/desk/requests">
            <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All Queue
            </Button>
          </Link>
        }
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        {/* Core Operational Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-4 bg-white border-amber-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                Awaiting Verification
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-ink-primary">
                {metrics?.awaitingVerificationCount ?? '--'}
              </span>
              <span className="text-xs text-ink-tertiary">reports</span>
            </div>
            <p className="mt-1 text-xs text-ink-secondary">Requires coordinator call/check</p>
          </Card>

          <Card className="p-4 bg-white border-red-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-red-800">
                High-Urgency Unmet
              </span>
              <LifeBuoy className="w-4 h-4 text-red-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-red-700">
                {metrics?.highPriorityUnmetCount ?? '--'}
              </span>
              <span className="text-xs text-ink-tertiary">unassigned</span>
            </div>
            <p className="mt-1 text-xs text-ink-secondary">Critical & High priority backlog</p>
          </Card>

          <Card className="p-4 bg-white border-brand-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-800">
                Ready for Assignment
              </span>
              <ClipboardCheck className="w-4 h-4 text-brand-700" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-brand-700">
                {metrics?.awaitingAssignmentCount ?? '--'}
              </span>
              <span className="text-xs text-ink-tertiary">verified</span>
            </div>
            <p className="mt-1 text-xs text-ink-secondary">Matches ready to confirm</p>
          </Card>

          <Card className="p-4 bg-white border-surface-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                Relief Depots Active
              </span>
              <Boxes className="w-4 h-4 text-ink-secondary" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-ink-primary">
                {metrics?.availableResourcesCount ?? '--'}
              </span>
              <span className="text-xs text-ink-tertiary">categories</span>
            </div>
            <p className="mt-1 text-xs text-ink-secondary">Available inventory nodes</p>
          </Card>
        </div>

        {/* Priority Attention Queue */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-ink-primary">
                Priority Attention Queue
              </h2>
              <p className="text-xs text-ink-secondary">
                Urgent community needs ranked by transparent risk assessment.
              </p>
            </div>
            <Link to="/desk/requests" className="text-xs font-semibold text-brand-700 hover:underline flex items-center gap-1">
              <span>Inspect All ({metrics?.totalActiveRequestsCount ?? 0})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <RequestTable requests={priorityRequests} isLoading={isLoading} />
        </div>

        {/* Secondary Grid: Resource Availability + Recent Audit History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resource Stock Snapshot */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-ink-primary">
                  Relief Resource Availability
                </h3>
                <p className="text-xs text-ink-secondary">
                  Live inventory across synthetic Nagpur relief hubs.
                </p>
              </div>
              <Link to="/desk/resources">
                <Button size="sm" variant="outline">
                  Manage Inventory
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {resources.slice(0, 4).map((res) => {
                const percent = Math.round((res.availableQuantity / res.totalCapacity) * 100);
                return (
                  <Card key={res.id} className="p-4 bg-white border-surface-border">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-mono text-ink-tertiary">{res.id}</span>
                        <h4 className="font-semibold text-ink-primary text-sm mt-0.5 truncate">
                          {res.name}
                        </h4>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-mint text-brand-900 border border-brand-200">
                        {formatCategoryLabel(res.category)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-baseline justify-between text-xs">
                      <span className="text-ink-secondary">Available Stock:</span>
                      <span className="font-bold text-brand-700 text-sm">
                        {res.availableQuantity} {res.unit}
                      </span>
                    </div>

                    {/* Simple clean progress bar */}
                    <div className="w-full bg-surface-muted h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="bg-brand-700 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-ink-tertiary">
                      <span>Total: {res.totalCapacity} {res.unit}</span>
                      <span>Assigned: {res.assignedQuantity}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recent Operational Audit Stream */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-ink-primary">Recent Operational Actions</h3>
                <p className="text-xs text-ink-secondary">Logged coordinator events</p>
              </div>
              <Link to="/desk/audit" className="text-xs font-semibold text-brand-700 hover:underline">
                Full Log
              </Link>
            </div>

            <Card className="p-4 bg-white border-surface-border space-y-3">
              {recentAudit.map((item) => (
                <div
                  key={item.id}
                  className="pb-3 border-b border-surface-border last:border-b-0 last:pb-0 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-1 text-[11px] text-ink-tertiary">
                    <span className="font-semibold text-brand-800">{item.actor}</span>
                    <span>{formatRelativeTime(item.timestamp)}</span>
                  </div>
                  <div className="font-medium text-ink-primary leading-snug">
                    {item.summary}
                  </div>
                  {item.details && (
                    <div className="text-ink-secondary text-[11px] line-clamp-1 italic">
                      {item.details}
                    </div>
                  )}
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

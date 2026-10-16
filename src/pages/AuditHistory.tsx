import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { AuditEntry, AuditActionType } from '../types/audit';
import { TopNavbar } from '../components/layout/TopNavbar';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { formatDateTime, formatRelativeTime } from '../utils/formatting';
import {
  History,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Package,
  RotateCcw,
  Search,
  ExternalLink,
} from 'lucide-react';

export const AuditHistory: React.FC = () => {
  const { openMobileMenu } = useOutletContext<{ openMobileMenu: () => void }>();
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchAudit = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getAuditHistory();
      setAuditLogs(data);
    } catch (err) {
      console.error('Failed to load audit history', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  const filteredLogs = auditLogs.filter((item) => {
    if (filterType !== 'all') {
      if (filterType === 'verification' && !item.actionType.includes('VERIF')) return false;
      if (filterType === 'priority' && !item.actionType.includes('PRIORITY')) return false;
      if (filterType === 'assignment' && !item.actionType.includes('ASSIGN')) return false;
      if (filterType === 'duplicate' && !item.actionType.includes('DUPLICATE')) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return (
        item.targetId.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.actor.toLowerCase().includes(q) ||
        (item.details && item.details.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getActionBadge = (type: AuditActionType) => {
    if (type.includes('VERIF')) {
      return <Badge variant="success" size="sm">Verification</Badge>;
    }
    if (type.includes('PRIORITY')) {
      return <Badge variant="warning" size="sm">Priority</Badge>;
    }
    if (type.includes('ASSIGN')) {
      return <Badge variant="brand" size="sm">Assignment</Badge>;
    }
    if (type.includes('DUPLICATE')) {
      return <Badge variant="critical" size="sm">Duplicate</Badge>;
    }
    if (type.includes('RESOLVED')) {
      return <Badge variant="success" size="sm">Resolved</Badge>;
    }
    return <Badge variant="neutral" size="sm">Submission</Badge>;
  };

  return (
    <div>
      <TopNavbar
        title="Operational Audit Trail"
        subtitle="Chronological log of coordinator verifications, priority assessments, and resource commits"
        onOpenMobileMenu={openMobileMenu}
        actions={
          <Button size="sm" variant="outline" onClick={fetchAudit} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
            Refresh Log
          </Button>
        }
      />

      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
        {/* Safety & Demonstration Note */}
        <div className="p-4 bg-surface-mint rounded-xl border border-brand-200 text-xs text-brand-900 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Workflow Audit & Ground-Truth Accountability:</span>
            <p className="text-ink-secondary leading-relaxed">
              Every status transition, coordinator verification, priority override reason, and resource allocation is append-logged to illustrate accountable relief coordination.
            </p>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white rounded-xl border border-surface-border shadow-subtle p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-ink-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search target ID (e.g. SN-2026-0842), actor, or details..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-surface-border bg-white text-ink-primary placeholder:text-ink-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 shadow-subtle"
              />
            </div>

            <div className="flex flex-wrap gap-1 text-xs">
              {[
                { id: 'all', label: 'All Actions' },
                { id: 'verification', label: 'Verifications' },
                { id: 'priority', label: 'Priorities' },
                { id: 'assignment', label: 'Assignments' },
                { id: 'duplicate', label: 'Duplicates' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    filterType === tab.id
                      ? 'bg-brand-700 text-white'
                      : 'bg-surface-bg text-ink-secondary hover:text-ink-primary hover:bg-surface-muted'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Audit Log Timeline */}
        {isLoading ? (
          <div className="p-12 text-center bg-white rounded-xl border border-surface-border">
            <div className="w-8 h-8 border-3 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-ink-primary">Loading audit trail...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-surface-border text-xs text-ink-secondary">
            No audit records match the current filter.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-surface-border shadow-subtle overflow-hidden">
            <div className="divide-y divide-surface-border">
              {filteredLogs.map((item) => (
                <div key={item.id} className="p-4 sm:p-5 hover:bg-surface-bg/50 transition-colors space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getActionBadge(item.actionType)}
                      <span className="font-mono text-xs font-semibold text-ink-primary">
                        {item.targetId.startsWith('SN-') ? (
                          <Link
                            to={`/desk/requests/${item.targetId}`}
                            className="text-brand-700 hover:underline inline-flex items-center gap-1"
                          >
                            <span>{item.targetId}</span>
                            <ExternalLink className="w-3 h-3 text-brand-600" />
                          </Link>
                        ) : (
                          item.targetId
                        )}
                      </span>
                      <span className="text-xs text-ink-tertiary font-mono">({item.id})</span>
                    </div>

                    <div className="text-xs text-ink-tertiary flex items-center gap-2">
                      <span>{formatDateTime(item.timestamp)}</span>
                      <span>•</span>
                      <span className="font-medium text-ink-secondary">{formatRelativeTime(item.timestamp)}</span>
                    </div>
                  </div>

                  <div className="text-sm font-semibold text-ink-primary">
                    {item.summary}
                  </div>

                  {item.details && (
                    <div className="text-xs text-ink-secondary bg-surface-bg p-2.5 rounded-lg border border-surface-border/70 leading-relaxed">
                      {item.details}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-ink-tertiary pt-1">
                    <span>
                      Actor: <strong className="text-brand-900 font-medium">{item.actor}</strong>
                    </span>
                    {item.previousValue && item.newValue && (
                      <span className="font-mono">
                        {item.previousValue} → <strong className="text-ink-primary">{item.newValue}</strong>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

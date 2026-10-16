import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { AssistanceRequest } from '../types/request';
import { Button } from '../components/ui/Button';
import { DemoBadge } from '../components/ui/DemoBadge';
import { PriorityBadge, VerificationBadge, StatusBadge } from '../components/ui/Badge';
import { formatCategoryLabel, formatDateTime, formatRelativeTime } from '../utils/formatting';
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  AlertCircle,
  Truck,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const RequestTracking: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();

  const [searchId, setSearchId] = useState(requestId || 'SN-2026-0842');
  const [request, setRequest] = useState<AssistanceRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchRequest = async (id: string) => {
    try {
      setIsLoading(true);
      setNotFound(false);
      const data = await apiService.getRequestById(id);
      if (data) {
        setRequest(data);
      } else {
        setRequest(null);
        setNotFound(true);
      }
    } catch (err) {
      console.error('Failed to load tracking request', err);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (requestId) {
      setSearchId(requestId);
      fetchRequest(requestId);
    } else {
      fetchRequest('SN-2026-0842');
    }
  }, [requestId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      navigate(`/track/${searchId.trim().toUpperCase()}`);
    }
  };

  // Determine stage progress (1 to 6)
  // Stages:
  // 1: Report Submitted
  // 2: Coordinator Verified
  // 3: Priority Assessed
  // 4: Resource Matched
  // 5: Assignment Confirmed
  // 6: Delivered & Resolved
  let currentStage = 1;
  if (request) {
    if (request.status === 'resolved') currentStage = 6;
    else if (request.status === 'assigned' || request.assignedResourceId) currentStage = 5;
    else if (request.status === 'matching') currentStage = 4;
    else if (request.verificationState === 'verified') currentStage = 3;
    else if (request.verificationState === 'unverified') currentStage = 1;
    else currentStage = 2;
  }

  const stages = [
    {
      num: 1,
      title: 'Report Received',
      desc: 'Assistance report recorded in SANKET system',
      date: request ? formatDateTime(request.createdAt) : undefined,
    },
    {
      num: 2,
      title: 'Coordinator Verification',
      desc: request?.verificationState === 'verified'
        ? `Verified by ${request.verifiedBy || 'Relief Coordinator'}`
        : 'Coordinator reviewing location accessibility and contact',
      date: request?.verifiedAt ? formatDateTime(request.verifiedAt) : undefined,
    },
    {
      num: 3,
      title: 'Priority Assessment',
      desc: request
        ? `Categorized as ${request.priorityAssessment.currentPriority} priority based on transparent community risk factors`
        : '',
      date: request?.priorityAssessment?.calculatedAt ? formatDateTime(request.priorityAssessment.calculatedAt) : undefined,
    },
    {
      num: 4,
      title: 'Resource Matching',
      desc: request?.status === 'matching' || currentStage >= 4
        ? 'Relief supplies and volunteers queried from Nagpur depots'
        : 'Pending verification completion',
    },
    {
      num: 5,
      title: 'Confirmed Resource Assignment',
      desc: request?.assignedResourceName
        ? `Authorized: ${request.assignedQuantity} ${request.assignedUnit} from ${request.assignedResourceName}`
        : 'Human coordinator awaiting depot confirmation',
      date: request?.assignedAt ? formatDateTime(request.assignedAt) : undefined,
    },
    {
      num: 6,
      title: 'Resolution & Delivery',
      desc: request?.status === 'resolved'
        ? 'Assistance confirmed delivered on site'
        : 'Supplies queued for transport; status will update upon physical receipt',
    },
  ];

  return (
    <div className="min-h-screen bg-surface-bg py-6 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/desk"
            className="text-xs font-semibold text-brand-700 hover:text-brand-900 flex items-center gap-1"
          >
            ← Coordinator Workspace
          </Link>
          <DemoBadge showDetails />
        </div>

        {/* Tracking Header */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-surface-border shadow-subtle space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-800">
              Community Status Portal
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-ink-primary mt-1">
              Track Assistance Request
            </h1>
            <p className="text-xs text-ink-secondary mt-1">
              Enter your tracking identifier to check verification, priority assessment, and resource allocation.
            </p>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-ink-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Request ID (e.g. SN-2026-0842)"
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-surface-border bg-white text-ink-primary font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 shadow-subtle"
              />
            </div>
            <Button type="submit" variant="primary" size="md">
              Search
            </Button>
          </form>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="p-12 text-center bg-white rounded-2xl border border-surface-border">
            <div className="w-8 h-8 border-3 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-ink-primary">Retrieving tracking status...</p>
          </div>
        )}

        {/* Not found state */}
        {!isLoading && notFound && (
          <div className="p-8 text-center bg-white rounded-2xl border border-amber-200 space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
            <h3 className="text-base font-bold text-ink-primary">Request Identifier Not Found</h3>
            <p className="text-xs text-ink-secondary max-w-sm mx-auto">
              No record found for &ldquo;{searchId}&rdquo;. Please verify your reference number.
            </p>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchId('SN-2026-0842');
                  fetchRequest('SN-2026-0842');
                }}
              >
                Try Sample Request (SN-2026-0842)
              </Button>
            </div>
          </div>
        )}

        {/* Active Request Tracking Record */}
        {!isLoading && request && (
          <div className="space-y-6">
            {/* Request Summary Card */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-surface-border shadow-subtle space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-surface-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-extrabold text-brand-900">
                      {request.id}
                    </span>
                    <PriorityBadge priority={request.priorityAssessment.currentPriority} size="sm" />
                    <VerificationBadge state={request.verificationState} size="sm" />
                  </div>
                  <h3 className="text-base font-bold text-ink-primary mt-1">
                    {formatCategoryLabel(request.category)}
                  </h3>
                </div>

                <div className="text-right text-xs text-ink-secondary">
                  <span>Reported {formatRelativeTime(request.createdAt)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-surface-bg rounded-lg border border-surface-border flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-ink-tertiary block font-semibold uppercase text-[10px]">
                      General Area
                    </span>
                    <span className="font-semibold text-ink-primary block mt-0.5">
                      {request.locationName}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-surface-bg rounded-lg border border-surface-border flex items-start gap-2">
                  <Package className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-ink-tertiary block font-semibold uppercase text-[10px]">
                      Resource Status
                    </span>
                    <span className="font-semibold text-ink-primary block mt-0.5">
                      {request.assignedResourceName ? (
                        <span className="text-emerald-700">
                          {request.assignedQuantity} {request.assignedUnit} Assigned
                        </span>
                      ) : (
                        <span className="text-amber-800">Awaiting Resource Match</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-ink-secondary bg-surface-bg p-3 rounded-lg border border-surface-border">
                <strong className="text-ink-primary">Description: </strong>
                {request.description}
              </div>
            </div>

            {/* Vertical Workflow Timeline */}
            <div className="bg-white p-5 sm:p-7 rounded-2xl border border-surface-border shadow-subtle space-y-6">
              <div>
                <h3 className="text-base font-bold text-ink-primary">
                  Operational Progress Tracker
                </h3>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Follow each stage of community flood relief coordination.
                </p>
              </div>

              <div className="relative pl-7 space-y-7 before:absolute before:left-3 before:top-2 before:bottom-3 before:w-0.5 before:bg-surface-border">
                {stages.map((st) => {
                  const isDone = st.num < currentStage || (st.num === currentStage && (st.num === 1 || st.num === 3));
                  const isCurrent = st.num === currentStage;
                  const isPending = st.num > currentStage;

                  return (
                    <div key={st.num} className="relative">
                      {/* Marker dot */}
                      <span
                        className={`absolute -left-7 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isDone
                            ? 'bg-brand-700 text-white shadow-xs'
                            : isCurrent
                            ? 'bg-amber-500 text-white ring-4 ring-amber-100 shadow-xs'
                            : 'bg-white border-2 border-surface-border text-ink-tertiary'
                        }`}
                      >
                        {isDone ? '✓' : st.num}
                      </span>

                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <h4
                            className={`text-sm font-bold ${
                              isDone || isCurrent ? 'text-ink-primary' : 'text-ink-tertiary'
                            }`}
                          >
                            {st.title}
                          </h4>
                          {st.date && (
                            <span className="text-[11px] font-mono text-ink-tertiary">
                              {st.date}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs ${
                            isCurrent
                              ? 'text-brand-900 font-medium'
                              : isDone
                              ? 'text-ink-secondary'
                              : 'text-ink-tertiary'
                          }`}
                        >
                          {st.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Integrity Safety Note */}
              <div className="p-3 bg-surface-mint rounded-xl border border-brand-200 text-xs text-brand-900 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Transparency Notice: </strong> Confirming an assignment indicates relief supplies have been allocated from warehouse stock. They are only marked as delivered when confirmed by recipients or ground volunteers.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

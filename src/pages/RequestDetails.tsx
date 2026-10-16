import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom';
import { apiService } from '../services/api';
import { AssistanceRequest, PriorityLevel, VerificationState } from '../types/request';
import { TopNavbar } from '../components/layout/TopNavbar';
import { PriorityBadge, VerificationBadge, StatusBadge, Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { PriorityExplanationPanel } from '../components/requests/PriorityExplanationPanel';
import { PriorityOverrideModal } from '../components/requests/PriorityOverrideModal';
import { VerificationControls } from '../components/requests/VerificationControls';
import { ResourceMatchWorkspace } from '../components/resources/ResourceMatchWorkspace';
import { useToast } from '../hooks/useToast';
import {
  formatCategoryLabel,
  formatDateTime,
  formatRelativeTime,
} from '../utils/formatting';
import {
  ArrowLeft,
  MapPin,
  Users,
  AlertTriangle,
  Clock,
  Phone,
  CheckCircle,
  FileText,
  ShieldCheck,
  ExternalLink,
  LifeBuoy,
} from 'lucide-react';

export const RequestDetails: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { openMobileMenu } = useOutletContext<{ openMobileMenu: () => void }>();

  const [request, setRequest] = useState<AssistanceRequest | null>(null);
  const [allRequests, setAllRequests] = useState<AssistanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);

  const loadData = async () => {
    if (!requestId) return;
    try {
      setIsLoading(true);
      const [item, all] = await Promise.all([
        apiService.getRequestById(requestId),
        apiService.getRequests(),
      ]);
      setRequest(item);
      setAllRequests(all);
    } catch (err) {
      console.error('Failed to load request details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [requestId]);

  // Handle coordinator verification state change
  const handleVerify = async (state: VerificationState, notes?: string) => {
    if (!request) return;
    try {
      const updated = await apiService.verifyRequest(request.id, {
        verificationState: state,
        notes,
        verifiedBy: 'Coordinator V. Sharma (Desk 02)',
      });
      setRequest(updated);
      showToast({
        type: 'success',
        title: 'Verification Status Updated',
        message: `Request ${request.id} is now marked as ${state.toUpperCase()}.`,
      });
    } catch (err: unknown) {
      showToast({
        type: 'error',
        title: 'Verification Failed',
        message: err instanceof Error ? err.message : 'Could not update verification',
      });
    }
  };

  // Handle coordinator priority override
  const handlePriorityOverride = async (newPriority: PriorityLevel, reason: string) => {
    if (!request) return;
    const updated = await apiService.overridePriority(request.id, {
      newPriority,
      reason,
      overriddenBy: 'Coordinator V. Sharma (Desk 02)',
    });
    setRequest(updated);
    showToast({
      type: 'warning',
      title: 'Priority Override Applied',
      message: `Priority set to ${newPriority} with coordinator audit justification.`,
    });
  };

  // Handle duplicate flagging
  const handleFlagDuplicate = async (primaryRequestId: string, notes: string) => {
    if (!request) return;
    const updated = await apiService.flagDuplicate(request.id, {
      primaryRequestId,
      notes,
      flaggedBy: 'Coordinator V. Sharma (Desk 02)',
    });
    setRequest(updated);
    showToast({
      type: 'info',
      title: 'Flagged as Duplicate',
      message: `Linked to primary record ${primaryRequestId}.`,
    });
  };

  if (isLoading) {
    return (
      <div>
        <TopNavbar title="Loading..." onOpenMobileMenu={openMobileMenu} />
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-3 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-ink-primary">Loading request workspace...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div>
        <TopNavbar title="Request Not Found" onOpenMobileMenu={openMobileMenu} />
        <div className="p-12 text-center max-w-md mx-auto space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto" />
          <h2 className="text-lg font-bold text-ink-primary">Request Identifier Not Found</h2>
          <p className="text-xs text-ink-secondary">
            No record matches &ldquo;{requestId}&rdquo;. It may have been archived or removed during local prototype reset.
          </p>
          <Link to="/desk/requests">
            <Button variant="primary" size="sm">
              Return to Request Queue
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopNavbar
        title={`Request ${request.id}`}
        subtitle={`${formatCategoryLabel(request.category)} • ${request.locationName}`}
        onOpenMobileMenu={openMobileMenu}
        actions={
          <div className="flex items-center gap-2">
            <Link to={`/track/${request.id}`} target="_blank">
              <Button size="sm" variant="outline" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                Public Tracking View
              </Button>
            </Link>
          </div>
        }
      />

      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        {/* Navigation Breadcrumb & Quick Status Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/desk/requests"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-secondary hover:text-brand-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Request Queue</span>
          </Link>

          <div className="flex items-center gap-2">
            <PriorityBadge priority={request.priorityAssessment.currentPriority} />
            <VerificationBadge state={request.verificationState} />
            <StatusBadge status={request.status} />
          </div>
        </div>

        {/* Duplicate Notice Banner if applicable */}
        {request.status === 'duplicate' && (
          <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Duplicate Record: </strong> Associated with primary incident{' '}
                <Link
                  to={`/desk/requests/${request.duplicateOfId}`}
                  className="font-bold underline text-amber-950"
                >
                  {request.duplicateOfId}
                </Link>
                . Resources will be coordinated via the primary record.
              </span>
            </div>
            {request.duplicateOfId && (
              <Link to={`/desk/requests/${request.duplicateOfId}`}>
                <Button size="sm" variant="outline">
                  Open Primary Request
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Main Grid: Incident Submission Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): Incident Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Incident Summary Card */}
            <div className="bg-white rounded-xl border border-surface-border shadow-subtle p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-tertiary">
                    Incident Report Details
                  </span>
                  <h2 className="text-lg font-bold text-ink-primary mt-0.5">
                    {formatCategoryLabel(request.category)}
                  </h2>
                </div>
                <span className="text-xs font-mono text-ink-tertiary">
                  Submitted {formatRelativeTime(request.createdAt)}
                </span>
              </div>

              {/* Location & Metadata Pill Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-surface-bg rounded-lg border border-surface-border flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-ink-tertiary block font-semibold uppercase text-[10px]">
                      General Location (Nagpur)
                    </span>
                    <span className="font-semibold text-ink-primary block mt-0.5">
                      {request.locationName}
                    </span>
                    <span className="text-ink-tertiary font-mono text-[11px]">
                      Coordinates: {request.coordinates[0].toFixed(4)}, {request.coordinates[1].toFixed(4)}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-surface-bg rounded-lg border border-surface-border flex items-start gap-2">
                  <Users className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-ink-tertiary block font-semibold uppercase text-[10px]">
                      Affected Scale & Urgency
                    </span>
                    <span className="font-semibold text-ink-primary block mt-0.5">
                      {request.affectedCount} individuals in need
                    </span>
                    <span className="text-ink-secondary capitalize">
                      Resident perceived urgency: <strong>{request.reportedUrgency}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-1.5">
                  Situation Description
                </h4>
                <div className="p-3.5 bg-surface-bg rounded-lg border border-surface-border text-sm text-ink-primary leading-relaxed whitespace-pre-line">
                  {request.description}
                </div>
              </div>

              {/* Vulnerabilities Chips */}
              {request.vulnerabilities && request.vulnerabilities.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-2">
                    Reported Vulnerability Indicators
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {request.vulnerabilities.map((v) => (
                      <span
                        key={v}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-800 border border-red-200"
                      >
                        {v === 'trapped_water' && '⚠️ Trapped in Floodwater'}
                        {v === 'elderly' && '👵 Senior Citizens (65+)'}
                        {v === 'infants' && '👶 Infants / Children'}
                        {v === 'medical_condition' && '💊 Acute Medical Dependency'}
                        {v === 'pregnant' && '🤰 Expectant Mother'}
                        {v === 'disabled' && '♿ Persons with Disabilities'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Synthetic Resident Contact Info (Sanitized for Demo Safety) */}
              <div className="pt-3 border-t border-surface-border flex flex-wrap items-center justify-between text-xs text-ink-secondary gap-3">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-brand-700" />
                  <span>Reported Contact: <strong className="font-mono text-ink-primary">{request.contactPhone || 'Not provided'}</strong></span>
                </div>
                <div className="text-ink-tertiary">
                  Reported by: <span className="font-medium text-ink-secondary">{request.residentName || 'Resident (Public Web)'}</span>
                </div>
              </div>
            </div>

            {/* Transparent Rule-Based Priority Explanation */}
            <PriorityExplanationPanel
              assessment={request.priorityAssessment}
              onOpenOverrideModal={() => setOverrideModalOpen(true)}
            />

            {/* Resource Matching & Manual Confirmation Workspace */}
            <ResourceMatchWorkspace
              request={request}
              onAssignmentComplete={loadData}
            />
          </div>

          {/* Right Column: Verification Controls & Workflow Progression */}
          <div className="space-y-6">
            {/* Coordinator Verification Card */}
            <VerificationControls
              request={request}
              allRequests={allRequests}
              onVerify={handleVerify}
              onFlagDuplicate={handleFlagDuplicate}
            />

            {/* Workflow Progression Stepper */}
            <div className="bg-white rounded-xl border border-surface-border shadow-subtle p-5 space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-tertiary">
                Incident Lifecycle
              </span>

              <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-border">
                {/* Step 1: Report Submitted */}
                <div className="relative">
                  <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-brand-700 text-white flex items-center justify-center text-[10px]">
                    ✓
                  </span>
                  <div className="text-xs font-semibold text-ink-primary">1. Report Submitted</div>
                  <div className="text-[11px] text-ink-tertiary">
                    {formatDateTime(request.createdAt)}
                  </div>
                </div>

                {/* Step 2: Verification */}
                <div className="relative">
                  <span
                    className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      request.verificationState === 'verified'
                        ? 'bg-brand-700 text-white'
                        : request.verificationState === 'flagged_duplicate' || request.verificationState === 'invalid'
                        ? 'bg-red-600 text-white'
                        : 'bg-amber-400 text-amber-950 font-bold'
                    }`}
                  >
                    {request.verificationState === 'verified' ? '✓' : '!'}
                  </span>
                  <div className="text-xs font-semibold text-ink-primary">
                    2. Coordinator Verification
                  </div>
                  <div className="text-[11px] text-ink-secondary">
                    {request.verificationState === 'verified'
                      ? `Verified by ${request.verifiedBy || 'Desk Coordinator'}`
                      : 'Pending coordinator contact check'}
                  </div>
                </div>

                {/* Step 3: Priority Assessment */}
                <div className="relative">
                  <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-brand-700 text-white flex items-center justify-center text-[10px]">
                    ✓
                  </span>
                  <div className="text-xs font-semibold text-ink-primary">
                    3. Priority Assessed
                  </div>
                  <div className="text-[11px] text-ink-secondary">
                    Ranked as {request.priorityAssessment.currentPriority} priority
                  </div>
                </div>

                {/* Step 4: Resource Assignment */}
                <div className="relative">
                  <span
                    className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      request.status === 'assigned' || request.status === 'resolved'
                        ? 'bg-brand-700 text-white'
                        : 'bg-surface-border text-ink-tertiary'
                    }`}
                  >
                    {request.status === 'assigned' || request.status === 'resolved' ? '✓' : '4'}
                  </span>
                  <div className="text-xs font-semibold text-ink-primary">
                    4. Resource Assignment
                  </div>
                  <div className="text-[11px] text-ink-secondary">
                    {request.assignedResourceName
                      ? `Allocated: ${request.assignedQuantity} ${request.assignedUnit} from ${request.assignedResourceName}`
                      : 'Awaiting coordinator resource match'}
                  </div>
                </div>

                {/* Step 5: Resolution */}
                <div className="relative">
                  <span
                    className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      request.status === 'resolved'
                        ? 'bg-brand-700 text-white'
                        : 'bg-surface-border text-ink-tertiary'
                    }`}
                  >
                    {request.status === 'resolved' ? '✓' : '5'}
                  </span>
                  <div className="text-xs font-semibold text-ink-primary">
                    5. Ground Resolution
                  </div>
                  <div className="text-[11px] text-ink-secondary">
                    {request.status === 'resolved'
                      ? 'Relief delivered and verified'
                      : 'Remains visible until physically resolved'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Override Modal */}
      {request && (
        <PriorityOverrideModal
          isOpen={overrideModalOpen}
          onClose={() => setOverrideModalOpen(false)}
          currentPriority={request.priorityAssessment.currentPriority}
          onConfirm={handlePriorityOverride}
        />
      )}
    </div>
  );
};

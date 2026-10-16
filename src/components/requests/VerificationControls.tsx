import React, { useState } from 'react';
import { AssistanceRequest, VerificationState } from '../../types/request';
import { Button } from '../ui/Button';
import { VerificationBadge } from '../ui/Badge';
import { CheckCircle2, HelpCircle, Copy, AlertOctagon, Check } from 'lucide-react';
import { DuplicateModal } from './DuplicateModal';

interface VerificationControlsProps {
  request: AssistanceRequest;
  allRequests: AssistanceRequest[];
  onVerify: (state: VerificationState, notes?: string) => Promise<void>;
  onFlagDuplicate: (primaryRequestId: string, notes: string) => Promise<void>;
}

export const VerificationControls: React.FC<VerificationControlsProps> = ({
  request,
  allRequests,
  onVerify,
  onFlagDuplicate,
}) => {
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [verificationNote, setVerificationNote] = useState('');
  const [pendingAction, setPendingAction] = useState<VerificationState | null>(null);

  const handleActionClick = (state: VerificationState) => {
    setPendingAction(state);
    setShowNotesInput(true);
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    try {
      setIsVerifying(true);
      await onVerify(pendingAction, verificationNote.trim() || undefined);
      setShowNotesInput(false);
      setVerificationNote('');
      setPendingAction(null);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-surface-border shadow-subtle p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-surface-border">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-tertiary">
            Coordinator Verification
          </span>
          <div className="flex items-center gap-2 mt-1">
            <h4 className="text-base font-semibold text-ink-primary">Verification Status</h4>
            <VerificationBadge state={request.verificationState} />
          </div>
        </div>

        {request.verifiedBy && (
          <div className="text-xs text-ink-secondary text-right">
            <div>Verified by: <span className="font-semibold text-ink-primary">{request.verifiedBy}</span></div>
            {request.verifiedAt && (
              <div className="text-ink-tertiary">
                {new Date(request.verifiedAt).toLocaleTimeString('en-IN', { timeStyle: 'short' })}
              </div>
            )}
          </div>
        )}
      </div>

      {request.verificationNotes && (
        <div className="mb-4 p-3 rounded-lg bg-surface-muted text-xs text-ink-secondary border border-surface-border">
          <span className="font-semibold text-ink-primary">Verification Note: </span>
          {request.verificationNotes}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={request.verificationState === 'verified' ? 'secondary' : 'primary'}
          leftIcon={<CheckCircle2 className="w-4 h-4" />}
          onClick={() => handleActionClick('verified')}
          disabled={request.verificationState === 'verified'}
        >
          {request.verificationState === 'verified' ? 'Verified' : 'Verify Request'}
        </Button>

        <Button
          size="sm"
          variant="outline"
          leftIcon={<HelpCircle className="w-4 h-4 text-amber-600" />}
          onClick={() => handleActionClick('needs_info')}
        >
          Request Clarification
        </Button>

        <Button
          size="sm"
          variant="outline"
          leftIcon={<Copy className="w-4 h-4 text-brand-700" />}
          onClick={() => setDuplicateModalOpen(true)}
        >
          Flag Duplicate
        </Button>

        <Button
          size="sm"
          variant="ghost"
          leftIcon={<AlertOctagon className="w-4 h-4 text-red-500" />}
          onClick={() => handleActionClick('invalid')}
          className="text-red-700 hover:bg-red-50"
        >
          Mark Invalid
        </Button>
      </div>

      {/* Expandable note input for confirming status change */}
      {showNotesInput && pendingAction && (
        <div className="mt-4 p-3.5 bg-surface-bg rounded-lg border border-surface-border space-y-2.5">
          <div className="text-xs font-semibold text-ink-primary">
            Confirm Transition to{' '}
            <span className="uppercase font-bold text-brand-700">{pendingAction}</span>
          </div>
          <input
            type="text"
            value={verificationNote}
            onChange={(e) => setVerificationNote(e.target.value)}
            placeholder="Add coordinator verification note (e.g. resident confirmed location by phone)..."
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-surface-border bg-white text-ink-primary focus-visible:ring-2 focus-visible:ring-brand-700"
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowNotesInput(false);
                setPendingAction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              isLoading={isVerifying}
              onClick={handleConfirmAction}
            >
              Confirm State Change
            </Button>
          </div>
        </div>
      )}

      {/* Duplicate Modal */}
      <DuplicateModal
        isOpen={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        currentRequest={request}
        availableRequests={allRequests}
        onConfirm={onFlagDuplicate}
      />
    </div>
  );
};

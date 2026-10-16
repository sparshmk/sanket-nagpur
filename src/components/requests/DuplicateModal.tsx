import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AssistanceRequest } from '../../types/request';

interface DuplicateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRequest: AssistanceRequest;
  availableRequests: AssistanceRequest[];
  onConfirm: (primaryRequestId: string, notes: string) => Promise<void>;
}

export const DuplicateModal: React.FC<DuplicateModalProps> = ({
  isOpen,
  onClose,
  currentRequest,
  availableRequests,
  onConfirm,
}) => {
  const [selectedPrimaryId, setSelectedPrimaryId] = useState('');
  const [customPrimaryId, setCustomPrimaryId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const candidateRequests = availableRequests.filter(
    (r) => r.id !== currentRequest.id && r.status !== 'duplicate' && r.status !== 'invalid'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const primaryId = customPrimaryId.trim() || selectedPrimaryId;
    if (!primaryId) {
      setError('Please select or specify the primary request ID.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirm(primaryId, notes.trim());
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to flag duplicate');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Flag Potential Duplicate"
      description="Associate this request with a primary incident record to prevent redundant dispatch."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink-primary mb-1">
            Associate With Primary Request
          </label>
          <div className="space-y-2">
            <select
              value={selectedPrimaryId}
              onChange={(e) => {
                setSelectedPrimaryId(e.target.value);
                setCustomPrimaryId('');
                if (error) setError(null);
              }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-surface-border bg-white text-ink-primary focus-visible:ring-2 focus-visible:ring-brand-700"
            >
              <option value="">Select from active incident list...</option>
              {candidateRequests.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} &mdash; {r.category.toUpperCase()} at {r.locationName} ({r.priorityAssessment.currentPriority})
                </option>
              ))}
            </select>

            <div className="text-center text-xs text-ink-tertiary">or specify identifier directly</div>

            <Input
              placeholder="e.g. SN-2026-0842"
              value={customPrimaryId}
              onChange={(e) => {
                setCustomPrimaryId(e.target.value);
                setSelectedPrimaryId('');
                if (error) setError(null);
              }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-primary mb-1">
            Coordinator Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Same building address reported by multiple neighbors."
            className="w-full p-2.5 text-sm rounded-lg border border-surface-border bg-white text-ink-primary placeholder:text-ink-tertiary focus-visible:ring-2 focus-visible:ring-brand-700"
          />
        </div>

        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="amber" isLoading={isSubmitting}>
            Flag as Duplicate
          </Button>
        </div>
      </form>
    </Modal>
  );
};

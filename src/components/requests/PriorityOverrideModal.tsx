import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { PriorityLevel } from '../../types/request';
import { validatePriorityOverride } from '../../utils/validation';

interface PriorityOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPriority: PriorityLevel;
  onConfirm: (newPriority: PriorityLevel, reason: string) => Promise<void>;
}

export const PriorityOverrideModal: React.FC<PriorityOverrideModalProps> = ({
  isOpen,
  onClose,
  currentPriority,
  onConfirm,
}) => {
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel>(currentPriority);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validatePriorityOverride(reason);
    if (!validation.isValid) {
      setError(validation.error || 'Please provide a justification note.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirm(selectedPriority, reason.trim());
      setReason('');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to override priority');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Override Request Priority"
      description="Manually adjust priority based on verified coordinator ground-truth intelligence."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink-primary mb-2">
            Target Priority Level
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as PriorityLevel[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setSelectedPriority(p)}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                  selectedPriority === p
                    ? 'border-brand-700 bg-brand-50 text-brand-900 ring-2 ring-brand-700'
                    : 'border-surface-border bg-white text-ink-secondary hover:border-brand-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="override-reason" className="block text-sm font-medium text-ink-primary mb-1">
            Coordinator Justification <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-ink-secondary mb-2">
            Explain why ground conditions require diverging from the rule-based recommendation.
          </p>
          <textarea
            id="override-reason"
            rows={3}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g., Ward volunteer on ground confirmed water receded by 2 feet, or family safely reached upper terrace."
            className="w-full p-3 text-sm rounded-lg border border-surface-border bg-white text-ink-primary placeholder:text-ink-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 shadow-subtle"
            required
          />
          {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Confirm Priority Override
          </Button>
        </div>
      </form>
    </Modal>
  );
};

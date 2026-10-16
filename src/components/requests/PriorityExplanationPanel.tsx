import React from 'react';
import { PriorityAssessment, PriorityLevel } from '../../types/request';
import { PriorityBadge } from '../ui/Badge';
import { ShieldAlert, AlertTriangle, CheckCircle, Info, Edit3 } from 'lucide-react';
import { Button } from '../ui/Button';

interface PriorityExplanationPanelProps {
  assessment: PriorityAssessment;
  onOpenOverrideModal: () => void;
}

export const PriorityExplanationPanel: React.FC<PriorityExplanationPanelProps> = ({
  assessment,
  onOpenOverrideModal,
}) => {
  return (
    <div className="bg-white rounded-xl border border-surface-border shadow-subtle overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-surface-border bg-surface-muted/50 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-tertiary">
              Transparent Priority Assessment
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Rule-Based
            </span>
          </div>
          <h3 className="text-base font-bold text-ink-primary mt-1">
            Why this request is evaluated as{' '}
            <span className="underline decoration-brand-500 decoration-2 underline-offset-4">
              {assessment.currentPriority} PRIORITY
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <PriorityBadge priority={assessment.currentPriority} />
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Edit3 className="w-3.5 h-3.5 text-ink-secondary" />}
            onClick={onOpenOverrideModal}
          >
            Override Priority
          </Button>
        </div>
      </div>

      {/* Override Notice if overridden */}
      {assessment.isOverridden && (
        <div className="px-5 py-3 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Coordinator Override Active: </span>
            <span>
              Adjusted to {assessment.currentPriority} (originally suggested:{' '}
              {assessment.suggestedPriority}).
            </span>
            {assessment.overrideReason && (
              <p className="mt-1 text-amber-800 italic">
                Reason: &ldquo;{assessment.overrideReason}&rdquo; &mdash; by {assessment.overriddenBy || 'Coordinator'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Factors List */}
      <div className="p-5 space-y-4">
        <p className="text-xs text-ink-secondary leading-relaxed">
          {assessment.assessmentNote}
        </p>

        <div className="space-y-2.5">
          <div className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
            Contributing Assessment Factors
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {assessment.factors.map((factor) => (
              <div
                key={factor.id}
                className="p-3 rounded-lg border border-surface-border bg-surface-bg/60 flex items-start gap-3 text-xs"
              >
                <div className="mt-0.5 shrink-0">
                  {factor.impact === 'increases_priority' ? (
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold">
                      !
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
                      •
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-ink-primary">{factor.label}</span>
                    <span className="text-xs text-ink-tertiary font-mono">{factor.source}</span>
                  </div>
                  <p className="mt-1 text-ink-secondary leading-relaxed">
                    {factor.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer / rule-based advisory notice */}
        <div className="pt-2 flex items-center gap-2 text-xs text-ink-tertiary">
          <Info className="w-3.5 h-3.5 shrink-0 text-brand-700" />
          <span>
            Advisory evaluation derived deterministically from reported vulnerability and wait duration. Does not automate dispatch.
          </span>
        </div>
      </div>
    </div>
  );
};

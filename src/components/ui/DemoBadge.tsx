import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface DemoBadgeProps {
  className?: string;
  showDetails?: boolean;
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({ className = '', showDetails = false }) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 tracking-wide select-none ${className}`}
      title="This application uses synthetic prototype data for demonstration purposes."
    >
      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
      <span>DEMO DATA</span>
      {showDetails && (
        <span className="hidden sm:inline font-normal text-amber-700/80">
          • Synthetic Incidents Only
        </span>
      )}
    </div>
  );
};

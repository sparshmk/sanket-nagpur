import React from 'react';
import { AssistanceRequest } from '../../types/request';
import { PriorityBadge, VerificationBadge, StatusBadge } from '../ui/Badge';
import { formatCategoryLabel, formatRelativeTime } from '../../utils/formatting';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Users, Clock, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface RequestTableProps {
  requests: AssistanceRequest[];
  isLoading?: boolean;
  onResetFilters?: () => void;
}

export const RequestTable: React.FC<RequestTableProps> = ({
  requests,
  isLoading = false,
  onResetFilters,
}) => {
  if (isLoading) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-surface-border">
        <div className="w-8 h-8 border-3 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-ink-primary">Loading operational queue...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-surface-border">
        <AlertCircle className="w-10 h-10 text-ink-tertiary mx-auto mb-3" />
        <h3 className="text-base font-semibold text-ink-primary">No Requests Found</h3>
        <p className="text-sm text-ink-secondary mt-1 max-w-sm mx-auto">
          No assistance requests match your active search and filter criteria.
        </p>
        {onResetFilters && (
          <Button variant="outline" size="sm" onClick={onResetFilters} className="mt-4">
            Reset Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-surface-border shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-surface-bg/80 border-b border-surface-border text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                <th className="py-3.5 px-4">Request ID</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Verification</th>
                <th className="py-3.5 px-4">Waiting Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {requests.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-surface-mint/40 transition-colors group cursor-pointer"
                >
                  <td className="py-3.5 px-4 font-mono font-medium text-ink-primary whitespace-nowrap">
                    <Link
                      to={`/desk/requests/${req.id}`}
                      className="text-brand-700 hover:text-brand-900 hover:underline font-semibold"
                    >
                      {req.id}
                    </Link>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-medium text-ink-primary">
                      {formatCategoryLabel(req.category)}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-ink-tertiary mt-0.5">
                      <Users className="w-3 h-3" />
                      <span>{req.affectedCount} affected</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 max-w-[200px]">
                    <div className="flex items-start gap-1 text-xs text-ink-secondary truncate">
                      <MapPin className="w-3.5 h-3.5 text-brand-700 shrink-0 mt-0.5" />
                      <span className="truncate" title={req.locationName}>
                        {req.locationName}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <PriorityBadge priority={req.priorityAssessment.currentPriority} size="sm" />
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <VerificationBadge state={req.verificationState} size="sm" />
                  </td>

                  <td className="py-3.5 px-4 text-xs text-ink-secondary whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-ink-tertiary" />
                      <span>{formatRelativeTime(req.createdAt)}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge status={req.status} size="sm" />
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <Link to={`/desk/requests/${req.id}`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        className="group-hover:bg-brand-700 group-hover:text-white"
                      >
                        Inspect
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {requests.map((req) => (
          <div
            key={req.id}
            className="p-4 bg-white rounded-xl border border-surface-border shadow-subtle space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono font-bold text-brand-700 text-sm">{req.id}</span>
                <h4 className="font-semibold text-ink-primary text-sm mt-0.5">
                  {formatCategoryLabel(req.category)}
                </h4>
              </div>
              <PriorityBadge priority={req.priorityAssessment.currentPriority} size="sm" />
            </div>

            <div className="flex items-start gap-1.5 text-xs text-ink-secondary">
              <MapPin className="w-3.5 h-3.5 text-brand-700 shrink-0 mt-0.5" />
              <span>{req.locationName}</span>
            </div>

            <p className="text-xs text-ink-secondary line-clamp-2">
              {req.description}
            </p>

            <div className="flex flex-wrap items-center justify-between pt-2 border-t border-surface-border text-xs gap-2">
              <VerificationBadge state={req.verificationState} size="sm" />
              <span className="text-ink-tertiary flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatRelativeTime(req.createdAt)}
              </span>
            </div>

            <div className="pt-1">
              <Link to={`/desk/requests/${req.id}`} className="block">
                <Button size="sm" variant="outline" className="w-full justify-between" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Inspect & Coordinate
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

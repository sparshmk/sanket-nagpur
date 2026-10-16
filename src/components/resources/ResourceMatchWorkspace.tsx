import React, { useState, useEffect } from 'react';
import { AssistanceRequest } from '../../types/request';
import { ResourceMatch } from '../../types/resource';
import { apiService } from '../../services/api';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import {
  Boxes,
  MapPin,
  CheckCircle,
  Truck,
  ArrowRight,
  PackageCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';

interface ResourceMatchWorkspaceProps {
  request: AssistanceRequest;
  onAssignmentComplete: () => Promise<void>;
}

export const ResourceMatchWorkspace: React.FC<ResourceMatchWorkspaceProps> = ({
  request,
  onAssignmentComplete,
}) => {
  const { showToast } = useToast();
  const [matches, setMatches] = useState<ResourceMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<ResourceMatch | null>(null);
  const [allocatedQty, setAllocatedQty] = useState<number>(1);
  const [allocationNotes, setAllocationNotes] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  // Fetch matches
  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      const res = await apiService.findResourceMatches(request.id);
      setMatches(res);
    } catch (err) {
      console.error('Error finding matches', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [request.id, request.status]);

  const handleOpenAssignModal = (match: ResourceMatch) => {
    setSelectedMatch(match);
    setAllocatedQty(match.recommendedQuantity);
    setAllocationNotes('');
  };

  const handleConfirmAssignment = async () => {
    if (!selectedMatch) return;
    try {
      setIsConfirming(true);
      await apiService.confirmAssignment({
        requestId: request.id,
        resourceId: selectedMatch.resource.id,
        allocatedQuantity: allocatedQty,
        notes: allocationNotes.trim() || undefined,
      });

      showToast({
        type: 'success',
        title: 'Resource Assignment Confirmed',
        message: `Allocated ${allocatedQty} ${selectedMatch.resource.unit} of "${selectedMatch.resource.name}" to request ${request.id}.`,
      });

      setSelectedMatch(null);
      await onAssignmentComplete();
      await fetchMatches();
    } catch (err: unknown) {
      showToast({
        type: 'error',
        title: 'Assignment Failed',
        message: err instanceof Error ? err.message : 'Could not confirm assignment',
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const isAssigned = !!request.assignedResourceId;

  return (
    <div className="bg-white rounded-xl border border-surface-border shadow-subtle overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-surface-border bg-surface-muted/50 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-tertiary">
            Resource Allocation Layer
          </span>
          <h3 className="text-base font-bold text-ink-primary mt-1">
            Relief Matching Workspace
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {isAssigned ? (
            <Badge variant="success" size="md">
              <PackageCheck className="w-3.5 h-3.5 mr-1" />
              Resource Confirmed Assigned
            </Badge>
          ) : (
            <Badge variant="warning" size="md">
              <AlertCircle className="w-3.5 h-3.5 mr-1" />
              Unmet Need Awaiting Allocation
            </Badge>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* If already assigned, show current assignment card */}
        {isAssigned && (
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-900">
                  Confirmed Assignment Record
                </span>
              </div>
              <span className="text-xs text-emerald-700 font-mono">
                {request.assignedAt ? new Date(request.assignedAt).toLocaleTimeString('en-IN', { timeStyle: 'short' }) : 'Recently'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-emerald-200/80">
                <span className="text-ink-tertiary block">Assigned Resource</span>
                <span className="font-semibold text-ink-primary text-sm mt-0.5 block truncate">
                  {request.assignedResourceName}
                </span>
                <span className="text-ink-secondary font-mono">{request.assignedResourceId}</span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-emerald-200/80">
                <span className="text-ink-tertiary block">Confirmed Allocation</span>
                <span className="font-bold text-brand-700 text-sm mt-0.5 block">
                  {request.assignedQuantity} {request.assignedUnit}
                </span>
                <span className="text-emerald-700 font-medium">Committed from inventory</span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-emerald-200/80">
                <span className="text-ink-tertiary block">Confirmed By Coordinator</span>
                <span className="font-medium text-ink-primary text-sm mt-0.5 block truncate">
                  {request.assignedBy || 'Coordinator Desk'}
                </span>
                <span className="text-ink-secondary">Manual Desk Authorization</span>
              </div>
            </div>
          </div>
        )}

        {/* Available Plausible Matches */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-semibold text-ink-primary">
                Plausible Matching Inventory
              </h4>
              <p className="text-xs text-ink-secondary">
                Ranked by category compatibility, depot vicinity, and available stock.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={fetchMatches} isLoading={isLoading}>
              Refresh Inventory
            </Button>
          </div>

          {matches.length === 0 ? (
            <div className="p-8 text-center bg-surface-bg rounded-lg border border-surface-border text-xs text-ink-secondary">
              No immediate stock matches found for category &ldquo;{request.category}&rdquo;. Check general resource inventory.
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((match) => {
                const res = match.resource;
                return (
                  <div
                    key={res.id}
                    className="p-4 rounded-xl border border-surface-border bg-white hover:border-brand-300 transition-colors shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-bold text-sm text-ink-primary">{res.name}</span>
                        <span className="font-mono text-xs text-ink-tertiary">{res.id}</span>
                        <Badge variant="brand" size="sm">
                          {match.matchScore}% Match
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-secondary mb-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-brand-700" />
                          {res.storageLocation} (~{match.distanceKmApprox} km)
                        </span>
                        <span>•</span>
                        <span>
                          Available: <strong className="text-emerald-700 font-semibold">{res.availableQuantity} {res.unit}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Assigned: <strong className="text-ink-primary font-semibold">{res.assignedQuantity} {res.unit}</strong>
                        </span>
                      </div>

                      <p className="text-xs text-brand-900 bg-brand-50/70 p-2 rounded border border-brand-200/50">
                        <Sparkles className="w-3 h-3 text-brand-600 inline mr-1" />
                        {match.suitabilityExplanation}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={isAssigned ? 'outline' : 'primary'}
                        onClick={() => handleOpenAssignModal(match)}
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        {isAssigned ? 'Reassign / Allocate More' : 'Assign Resource'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Manual Allocation Confirmation Modal */}
      {selectedMatch && (
        <Modal
          isOpen={!!selectedMatch}
          onClose={() => setSelectedMatch(null)}
          title="Confirm Resource Assignment"
          description="Explicit human coordinator confirmation required to commit emergency supplies."
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-surface-mint rounded-lg border border-brand-200 space-y-1 text-xs">
              <div className="font-semibold text-brand-900 text-sm">
                {selectedMatch.resource.name} ({selectedMatch.resource.id})
              </div>
              <div className="text-brand-800">
                Depot Location: {selectedMatch.resource.storageLocation}
              </div>
              <div className="text-brand-800">
                Current Available Quantity: <strong>{selectedMatch.resource.availableQuantity} {selectedMatch.resource.unit}</strong>
              </div>
            </div>

            <div>
              <label htmlFor="alloc-qty" className="block text-sm font-medium text-ink-primary mb-1">
                Quantity to Allocate ({selectedMatch.resource.unit})
              </label>
              <Input
                id="alloc-qty"
                type="number"
                min={1}
                max={selectedMatch.resource.availableQuantity}
                value={allocatedQty}
                onChange={(e) => setAllocatedQty(Math.max(1, parseInt(e.target.value) || 1))}
                helperText={`Recommended for ${request.affectedCount} affected people: ${selectedMatch.recommendedQuantity} ${selectedMatch.resource.unit}`}
              />
            </div>

            <div>
              <label htmlFor="alloc-notes" className="block text-sm font-medium text-ink-primary mb-1">
                Coordinator Dispatch / Logistics Notes (Optional)
              </label>
              <textarea
                id="alloc-notes"
                rows={2}
                value={allocationNotes}
                onChange={(e) => setAllocationNotes(e.target.value)}
                placeholder="e.g. Route via Wardhman Nagar bypass road; water level at main chowk 1.5 ft."
                className="w-full p-2.5 text-xs rounded-lg border border-surface-border bg-white text-ink-primary focus-visible:ring-2 focus-visible:ring-brand-700"
              />
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
              <span className="font-semibold">Workflow Rule: </span>
              Confirming assignment will reserve inventory stock and update request status. It indicates authorization, not physical delivery.
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
              <Button
                variant="outline"
                onClick={() => setSelectedMatch(null)}
                disabled={isConfirming}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmAssignment}
                isLoading={isConfirming}
                leftIcon={<Truck className="w-4 h-4" />}
              >
                Confirm Manual Assignment
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

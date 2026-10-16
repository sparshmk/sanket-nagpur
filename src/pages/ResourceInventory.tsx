import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { apiService } from '../services/api';
import { ResourceCategory, ResourceItem } from '../types/resource';
import { TopNavbar } from '../components/layout/TopNavbar';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { formatCategoryLabel, formatDateTime } from '../utils/formatting';
import {
  Boxes,
  MapPin,
  Clock,
  User,
  Search,
  Filter,
  CheckCircle,
  Truck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const ResourceInventory: React.FC = () => {
  const { openMobileMenu } = useOutletContext<{ openMobileMenu: () => void }>();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<ResourceCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);

  const fetchResources = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getResources(categoryFilter);
      setResources(data);
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [categoryFilter]);

  const filteredResources = resources.filter((res) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      res.name.toLowerCase().includes(q) ||
      res.id.toLowerCase().includes(q) ||
      res.storageLocation.toLowerCase().includes(q) ||
      res.category.toLowerCase().includes(q)
    );
  });

  // Calculate totals
  const totalCapacity = resources.reduce((sum, r) => sum + r.totalCapacity, 0);
  const totalAvailable = resources.reduce((sum, r) => sum + r.availableQuantity, 0);
  const totalAssigned = resources.reduce((sum, r) => sum + r.assignedQuantity, 0);
  const totalDelivered = resources.reduce((sum, r) => sum + r.deliveredQuantity, 0);

  return (
    <div>
      <TopNavbar
        title="Relief Resource Inventory"
        subtitle="Track available capacity, assigned dispatches, and depot nodes"
        onOpenMobileMenu={openMobileMenu}
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        {/* Inventory Summary Indicators */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-4 bg-white border-brand-200">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-800">
              Available in Stock
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-brand-700">
              {totalAvailable.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-ink-secondary">Units ready for allocation</p>
          </Card>

          <Card className="p-4 bg-white border-amber-200">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Currently Assigned
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-amber-700">
              {totalAssigned.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-ink-secondary">Committed to active requests</p>
          </Card>

          <Card className="p-4 bg-white border-emerald-200">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Delivered on Site
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-700">
              {totalDelivered.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-ink-secondary">Confirmed ground distribution</p>
          </Card>

          <Card className="p-4 bg-white border-surface-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
              Total Depot Capacity
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-ink-primary">
              {totalCapacity.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-ink-secondary">Cumulative stockpile capacity</p>
          </Card>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-xl border border-surface-border shadow-subtle p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-ink-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search resources, depots, or codes..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-surface-border bg-white text-ink-primary placeholder:text-ink-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 shadow-subtle"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1 text-xs">
              {(
                [
                  'all',
                  'water',
                  'food',
                  'shelter',
                  'supplies',
                  'rescue',
                  'volunteers',
                ] as (ResourceCategory | 'all')[]
              ).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    categoryFilter === cat
                      ? 'bg-brand-700 text-white'
                      : 'bg-surface-bg text-ink-secondary hover:text-ink-primary hover:bg-surface-muted'
                  }`}
                >
                  {cat === 'all' ? 'All Inventory' : formatCategoryLabel(cat)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Inventory Cards Grid */}
        {isLoading ? (
          <div className="p-12 text-center bg-white rounded-xl border border-surface-border">
            <div className="w-8 h-8 border-3 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-ink-primary">Loading inventory records...</p>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-surface-border">
            <Boxes className="w-10 h-10 text-ink-tertiary mx-auto mb-3" />
            <h3 className="text-base font-bold text-ink-primary">No Resources Match Filter</h3>
            <p className="text-xs text-ink-secondary mt-1">
              Try adjusting your category filter or search terms.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((res) => {
              const availablePct = Math.round((res.availableQuantity / res.totalCapacity) * 100);
              const assignedPct = Math.round((res.assignedQuantity / res.totalCapacity) * 100);
              const deliveredPct = Math.round((res.deliveredQuantity / res.totalCapacity) * 100);

              return (
                <Card
                  key={res.id}
                  className="p-5 bg-white border-surface-border hoverable flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-brand-800 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        {res.id}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-muted text-ink-secondary">
                        {formatCategoryLabel(res.category)}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-ink-primary leading-snug">
                      {res.name}
                    </h4>

                    <div className="flex items-start gap-1.5 text-xs text-ink-secondary">
                      <MapPin className="w-3.5 h-3.5 text-brand-700 shrink-0 mt-0.5" />
                      <span>{res.storageLocation}</span>
                    </div>
                  </div>

                  {/* Quantity Breakdown Stack */}
                  <div className="space-y-2 pt-2 border-t border-surface-border">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-ink-secondary">Available Stock:</span>
                      <span className="font-bold text-brand-700 text-sm">
                        {res.availableQuantity} {res.unit}
                      </span>
                    </div>

                    {/* Multi-segment stock bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                      <div
                        className="bg-brand-700 h-full"
                        style={{ width: `${availablePct}%` }}
                        title={`Available: ${res.availableQuantity}`}
                      />
                      <div
                        className="bg-amber-400 h-full"
                        style={{ width: `${assignedPct}%` }}
                        title={`Assigned: ${res.assignedQuantity}`}
                      />
                      <div
                        className="bg-emerald-500 h-full"
                        style={{ width: `${deliveredPct}%` }}
                        title={`Delivered: ${res.deliveredQuantity}`}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-[11px] text-ink-tertiary pt-1 text-center">
                      <div className="bg-surface-bg p-1 rounded">
                        <span className="block font-semibold text-brand-800">{res.availableQuantity}</span>
                        <span>Available</span>
                      </div>
                      <div className="bg-surface-bg p-1 rounded">
                        <span className="block font-semibold text-amber-800">{res.assignedQuantity}</span>
                        <span>Assigned</span>
                      </div>
                      <div className="bg-surface-bg p-1 rounded">
                        <span className="block font-semibold text-emerald-800">{res.deliveredQuantity}</span>
                        <span>Delivered</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-surface-border flex items-center justify-between text-xs text-ink-secondary">
                    <div className="flex items-center gap-1 text-ink-tertiary">
                      <User className="w-3.5 h-3.5" />
                      <span className="truncate">{res.contactPerson}</span>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedResource(res)}
                    >
                      View Specs
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Resource Spec Modal */}
      {selectedResource && (
        <Modal
          isOpen={!!selectedResource}
          onClose={() => setSelectedResource(null)}
          title={selectedResource.name}
          description={`Relief depot specification & handling profile (${selectedResource.id})`}
        >
          <div className="space-y-4 text-xs text-ink-secondary">
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-surface-bg rounded-lg border border-surface-border">
              <div>
                <span className="text-ink-tertiary block font-semibold uppercase text-[10px]">Depot Hub</span>
                <span className="font-semibold text-ink-primary text-sm mt-0.5 block">{selectedResource.storageLocation}</span>
              </div>
              <div>
                <span className="text-ink-tertiary block font-semibold uppercase text-[10px]">Category</span>
                <span className="font-semibold text-ink-primary text-sm mt-0.5 block">{formatCategoryLabel(selectedResource.category)}</span>
              </div>
              <div>
                <span className="text-ink-tertiary block font-semibold uppercase text-[10px]">Contact Person</span>
                <span className="font-semibold text-ink-primary mt-0.5 block">{selectedResource.contactPerson}</span>
              </div>
              <div>
                <span className="text-ink-tertiary block font-semibold uppercase text-[10px]">Total Capacity</span>
                <span className="font-semibold text-ink-primary mt-0.5 block">{selectedResource.totalCapacity} {selectedResource.unit}</span>
              </div>
            </div>

            {selectedResource.notes && (
              <div className="p-3 bg-surface-mint rounded-lg border border-brand-200 text-brand-900">
                <span className="font-semibold block mb-0.5">Specifications & Logistics:</span>
                {selectedResource.notes}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-surface-border">
              <Button variant="primary" size="sm" onClick={() => setSelectedResource(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

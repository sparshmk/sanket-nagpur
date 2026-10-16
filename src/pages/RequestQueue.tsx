import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { apiService } from '../services/api';
import {
  AssistanceRequest,
  IncidentCategory,
  PriorityLevel,
  RequestFilterParams,
  RequestStatus,
  VerificationState,
} from '../types/request';
import { TopNavbar } from '../components/layout/TopNavbar';
import { RequestTable } from '../components/requests/RequestTable';
import { Button } from '../components/ui/Button';
import { Search, Filter, RotateCcw, SlidersHorizontal } from 'lucide-react';

export const RequestQueue: React.FC = () => {
  const { openMobileMenu } = useOutletContext<{ openMobileMenu: () => void }>();
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState<PriorityLevel | 'all'>('all');
  const [category, setCategory] = useState<IncidentCategory | 'all'>('all');
  const [verificationState, setVerificationState] = useState<VerificationState | 'all'>('all');
  const [status, setStatus] = useState<RequestStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'urgency' | 'waiting_time' | 'affected_count' | 'recent'>('urgency');

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const params: RequestFilterParams = {
        search: search.trim() || undefined,
        priority: priority !== 'all' ? priority : undefined,
        category: category !== 'all' ? category : undefined,
        verificationState: verificationState !== 'all' ? verificationState : undefined,
        status: status !== 'all' ? status : undefined,
        sortBy,
      };
      const data = await apiService.getRequests(params);
      setRequests(data);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [search, priority, category, verificationState, status, sortBy]);

  const handleResetFilters = () => {
    setSearch('');
    setPriority('all');
    setCategory('all');
    setVerificationState('all');
    setStatus('all');
    setSortBy('urgency');
  };

  const hasActiveFilters =
    search !== '' ||
    priority !== 'all' ||
    category !== 'all' ||
    verificationState !== 'all' ||
    status !== 'all' ||
    sortBy !== 'urgency';

  return (
    <div>
      <TopNavbar
        title="Request Management Queue"
        subtitle="Filter, inspect, and coordinate all active community flood reports"
        onOpenMobileMenu={openMobileMenu}
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
        {/* Filter and Search Bar */}
        <div className="bg-white rounded-xl border border-surface-border shadow-subtle p-4 space-y-3.5">
          {/* Top row: search + sort */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-ink-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ID (e.g. SN-2026-0842), neighborhood, or description..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-surface-border bg-white text-ink-primary placeholder:text-ink-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 shadow-subtle"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-secondary whitespace-nowrap">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-medium py-2 px-3 rounded-lg border border-surface-border bg-white text-ink-primary focus-visible:ring-2 focus-visible:ring-brand-700"
              >
                <option value="urgency">Highest Urgency First</option>
                <option value="waiting_time">Longest Waiting Time</option>
                <option value="affected_count">Most Affected Persons</option>
                <option value="recent">Most Recently Submitted</option>
              </select>
            </div>
          </div>

          {/* Bottom row: multi-criteria dropdown filters */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-surface-border text-xs">
            {/* Priority filter */}
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="py-1.5 px-2.5 rounded-lg border border-surface-border bg-white text-ink-primary focus-visible:ring-brand-700"
            >
              <option value="all">All Priorities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH">High Only</option>
              <option value="MEDIUM">Medium Only</option>
              <option value="LOW">Low Only</option>
            </select>

            {/* Category filter */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="py-1.5 px-2.5 rounded-lg border border-surface-border bg-white text-ink-primary focus-visible:ring-brand-700"
            >
              <option value="all">All Categories</option>
              <option value="rescue">Rescue Assistance</option>
              <option value="medical">Medical Assistance</option>
              <option value="water">Drinking Water</option>
              <option value="food">Food Supplies</option>
              <option value="shelter">Emergency Shelter</option>
              <option value="supplies">Medical Supplies</option>
              <option value="flood">Waterlogging / Flood Flow</option>
            </select>

            {/* Verification filter */}
            <select
              value={verificationState}
              onChange={(e) => setVerificationState(e.target.value as any)}
              className="py-1.5 px-2.5 rounded-lg border border-surface-border bg-white text-ink-primary focus-visible:ring-brand-700"
            >
              <option value="all">All Verification States</option>
              <option value="unverified">Awaiting Verification</option>
              <option value="verified">Verified Records</option>
              <option value="needs_info">Needs Clarification</option>
              <option value="flagged_duplicate">Flagged Duplicate</option>
            </select>

            {/* Status filter */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="py-1.5 px-2.5 rounded-lg border border-surface-border bg-white text-ink-primary focus-visible:ring-brand-700"
            >
              <option value="all">All Operational Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="verified">Verified</option>
              <option value="matching">Matching</option>
              <option value="assigned">Assigned</option>
              <option value="resolved">Resolved</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="ml-auto inline-flex items-center gap-1 text-ink-secondary hover:text-red-600 transition-colors py-1 px-2 rounded"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-ink-secondary px-1">
          <span>
            Showing <strong className="text-ink-primary font-semibold">{requests.length}</strong> assistance records
          </span>
          {hasActiveFilters && <span className="text-amber-800 font-medium">Filters Applied</span>}
        </div>

        {/* Requests Table / Cards */}
        <RequestTable
          requests={requests}
          isLoading={isLoading}
          onResetFilters={handleResetFilters}
        />
      </div>
    </div>
  );
};

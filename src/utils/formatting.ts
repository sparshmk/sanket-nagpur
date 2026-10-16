import { IncidentCategory, PriorityLevel, RequestStatus, VerificationState } from '../types/request';
import { ResourceCategory, ResourceStatus } from '../types/resource';
import { AssignmentStatus } from '../types/assignment';

export function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ${diffMinutes % 60}m ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
}

export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return isoString;
  }
}

export function formatCategoryLabel(cat: IncidentCategory | ResourceCategory): string {
  const map: Record<string, string> = {
    rescue: 'Rescue Assistance',
    medical: 'Medical Assistance',
    water: 'Drinking Water',
    food: 'Food Supplies',
    shelter: 'Emergency Shelter',
    supplies: 'Medical Supplies & Kits',
    flood: 'Waterlogging & Flood Flow',
    volunteers: 'Relief Volunteers',
    other: 'Essential Relief Need',
  };
  return map[cat] || cat;
}

export function formatStatusLabel(status: RequestStatus | AssignmentStatus | ResourceStatus): string {
  const map: Record<string, string> = {
    // Request statuses
    submitted: 'Submitted',
    verified: 'Verified',
    matching: 'Matching Resources',
    assigned: 'Resource Assigned',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    invalid: 'Invalid Record',
    duplicate: 'Duplicate Record',
    // Assignment statuses
    ASSIGNED: 'Confirmed Assigned',
    DISPATCHED: 'Dispatched in Transit',
    DELIVERED: 'Delivered to Location',
    CANCELLED: 'Cancelled',
    // Resource statuses
    AVAILABLE: 'Available',
    LOW_STOCK: 'Low Stock',
    DEPLETED: 'Depleted',
    COMMITTED: 'Committed',
    STILL_NEEDED: 'Still Needed',
  };
  return map[status] || status;
}

export function formatVerificationState(state: VerificationState): { label: string; textClass: string; bgClass: string; borderClass: string } {
  switch (state) {
    case 'verified':
      return {
        label: 'Coordinator Verified',
        textClass: 'text-status-success-text',
        bgClass: 'bg-status-success-bg',
        borderClass: 'border-status-success-border',
      };
    case 'needs_info':
      return {
        label: 'Needs Clarification',
        textClass: 'text-status-warning-text',
        bgClass: 'bg-status-warning-bg',
        borderClass: 'border-status-warning-border',
      };
    case 'flagged_duplicate':
      return {
        label: 'Duplicate Flagged',
        textClass: 'text-brand-800',
        bgClass: 'bg-brand-100',
        borderClass: 'border-brand-200',
      };
    case 'invalid':
      return {
        label: 'Marked Invalid',
        textClass: 'text-status-critical-text',
        bgClass: 'bg-status-critical-bg',
        borderClass: 'border-status-critical-border',
      };
    case 'unverified':
    default:
      return {
        label: 'Awaiting Verification',
        textClass: 'text-amber-800',
        bgClass: 'bg-amber-50',
        borderClass: 'border-amber-200',
      };
  }
}

export function formatPriorityBadge(priority: PriorityLevel): {
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
} {
  switch (priority) {
    case 'CRITICAL':
      return {
        label: 'CRITICAL',
        badgeBg: 'bg-red-50',
        badgeText: 'text-red-800',
        badgeBorder: 'border-red-200',
        dotColor: 'bg-red-600',
      };
    case 'HIGH':
      return {
        label: 'HIGH',
        badgeBg: 'bg-amber-50',
        badgeText: 'text-amber-800',
        badgeBorder: 'border-amber-300',
        dotColor: 'bg-amber-500',
      };
    case 'MEDIUM':
      return {
        label: 'MEDIUM',
        badgeBg: 'bg-blue-50',
        badgeText: 'text-blue-800',
        badgeBorder: 'border-blue-200',
        dotColor: 'bg-blue-500',
      };
    case 'LOW':
    default:
      return {
        label: 'LOW',
        badgeBg: 'bg-slate-50',
        badgeText: 'text-slate-700',
        badgeBorder: 'border-slate-200',
        dotColor: 'bg-slate-400',
      };
  }
}

/**
 * Calculates Euclidean distance between two [lat, lng] coordinates in approx km
 */
export function calculateApproxDistanceKm(coord1: [number, number], coord2: [number, number]): number {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

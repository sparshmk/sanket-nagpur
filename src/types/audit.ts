export type AuditActionType =
  | 'REQUEST_SUBMITTED'
  | 'REQUEST_VERIFIED'
  | 'VERIFICATION_NEEDS_INFO'
  | 'DUPLICATE_FLAGGED'
  | 'REQUEST_INVALIDATED'
  | 'PRIORITY_UPDATED'
  | 'PRIORITY_OVERRIDDEN'
  | 'RESOURCE_MATCH_IDENTIFIED'
  | 'ASSIGNMENT_CONFIRMED'
  | 'ASSIGNMENT_STATUS_UPDATED'
  | 'REQUEST_RESOLVED';

export interface AuditEntry {
  id: string; // e.g. "AUD-9021"
  timestamp: string;
  actionType: AuditActionType;
  targetId: string; // e.g. "SN-2026-0842" or "RES-WTR-101"
  actor: string; // Synthetic demo coordinator, e.g. "Coordinator V. Sharma (Desk 02)"
  summary: string;
  details?: string;
  previousValue?: string;
  newValue?: string;
}

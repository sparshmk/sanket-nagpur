import { ResourceCategory } from './resource';

export type AssignmentStatus =
  | 'ASSIGNED'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface AssignmentRecord {
  id: string; // e.g. "ASN-8012"
  requestId: string;
  resourceId: string;
  resourceName: string;
  category: ResourceCategory;
  allocatedQuantity: number;
  unit: string;
  confirmedBy: string; // Synthetic coordinator label e.g. "Coordinator V. Sharma (Desk 02)"
  confirmedAt: string;
  status: AssignmentStatus;
  notes?: string;
  deliveredAt?: string;
}

export interface ConfirmAssignmentInput {
  requestId: string;
  resourceId: string;
  allocatedQuantity: number;
  notes?: string;
}

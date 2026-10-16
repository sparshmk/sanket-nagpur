import { AssistanceRequest, RequestFilterParams, CreateRequestInput, PriorityLevel, VerificationState, RequestStatus } from './request';
import { ResourceItem, ResourceMatch, ResourceCategory } from './resource';
import { AssignmentRecord, ConfirmAssignmentInput, AssignmentStatus } from './assignment';
import { AuditEntry } from './audit';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, unknown>;
}

export interface DashboardMetrics {
  awaitingVerificationCount: number;
  highPriorityUnmetCount: number;
  awaitingAssignmentCount: number;
  totalActiveRequestsCount: number;
  availableResourcesCount: number;
  resolvedRequestsCount: number;
  totalAffectedPersonsCount: number;
  criticalRequestsCount: number;
}

export interface VerifyRequestPayload {
  verificationState: VerificationState;
  notes?: string;
  verifiedBy: string;
}

export interface PriorityOverridePayload {
  newPriority: PriorityLevel;
  reason: string;
  overriddenBy: string;
}

export interface FlagDuplicatePayload {
  primaryRequestId: string;
  notes?: string;
  flaggedBy: string;
}

export interface UpdateRequestStatusPayload {
  status: RequestStatus;
  notes?: string;
  updatedBy: string;
}

export interface UpdateAssignmentStatusPayload {
  status: AssignmentStatus;
  notes?: string;
  updatedBy: string;
}

/**
 * Common API Service contract interface implemented by both
 * MockApiService and HttpApiService.
 */
export interface IApiService {
  // Requests
  getRequests(filters?: RequestFilterParams): Promise<AssistanceRequest[]>;
  getRequestById(id: string): Promise<AssistanceRequest | null>;
  createRequest(input: CreateRequestInput): Promise<AssistanceRequest>;
  verifyRequest(id: string, payload: VerifyRequestPayload): Promise<AssistanceRequest>;
  overridePriority(id: string, payload: PriorityOverridePayload): Promise<AssistanceRequest>;
  flagDuplicate(id: string, payload: FlagDuplicatePayload): Promise<AssistanceRequest>;
  updateRequestStatus(id: string, payload: UpdateRequestStatusPayload): Promise<AssistanceRequest>;

  // Resources
  getResources(category?: ResourceCategory | 'all'): Promise<ResourceItem[]>;
  getResourceById(id: string): Promise<ResourceItem | null>;
  findResourceMatches(requestId: string): Promise<ResourceMatch[]>;
  confirmAssignment(input: ConfirmAssignmentInput): Promise<{ request: AssistanceRequest; assignment: AssignmentRecord }>;
  getAssignmentsForRequest(requestId: string): Promise<AssignmentRecord[]>;
  updateAssignmentStatus(assignmentId: string, payload: UpdateAssignmentStatusPayload): Promise<AssignmentRecord>;

  // Dashboard & Metrics
  getDashboardMetrics(): Promise<DashboardMetrics>;

  // Audit
  getAuditHistory(targetId?: string): Promise<AuditEntry[]>;
  recordAuditEntry(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<AuditEntry>;

  // Prototype management
  resetDemoData(): Promise<void>;
}

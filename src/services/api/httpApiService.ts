import {
  IApiService,
  DashboardMetrics,
  VerifyRequestPayload,
  PriorityOverridePayload,
  FlagDuplicatePayload,
  UpdateRequestStatusPayload,
  UpdateAssignmentStatusPayload,
  ApiResponse,
} from '../../types/api';
import {
  AssistanceRequest,
  CreateRequestInput,
  RequestFilterParams,
} from '../../types/request';
import { ResourceItem, ResourceMatch, ResourceCategory } from '../../types/resource';
import { AssignmentRecord, ConfirmAssignmentInput } from '../../types/assignment';
import { AuditEntry } from '../../types/audit';

/**
 * HttpApiService
 * 
 * Production HTTP adapter connecting to a backend server.
 * Reads base URL from VITE_API_BASE_URL (default: 'http://localhost:8000/api').
 * Conforms to the exact IApiService contract.
 * Strictly surfaces real network/HTTP errors without silent mock fallback.
 */
export class HttpApiService implements IApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/+$/, '');
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `API Error ${response.status}: ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson.message) errorMessage = errorJson.message;
      } catch {
        // use default error message
      }
      throw new Error(errorMessage);
    }

    const payload: ApiResponse<T> = await response.json();
    return payload.data;
  }

  async getRequests(filters?: RequestFilterParams): Promise<AssistanceRequest[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.set('search', filters.search);
    if (filters?.category && filters.category !== 'all') params.set('category', filters.category);
    if (filters?.status && filters.status !== 'all') params.set('status', filters.status);
    if (filters?.priority && filters.priority !== 'all') params.set('priority', filters.priority);
    if (filters?.verificationState && filters.verificationState !== 'all') {
      params.set('verificationState', filters.verificationState);
    }
    if (filters?.sortBy) params.set('sortBy', filters.sortBy);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<AssistanceRequest[]>(`/requests${query}`);
  }

  async getRequestById(id: string): Promise<AssistanceRequest | null> {
    try {
      return await this.request<AssistanceRequest>(`/requests/${encodeURIComponent(id)}`);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('404')) {
        return null;
      }
      throw err;
    }
  }

  async createRequest(input: CreateRequestInput): Promise<AssistanceRequest> {
    return this.request<AssistanceRequest>('/requests', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async verifyRequest(id: string, payload: VerifyRequestPayload): Promise<AssistanceRequest> {
    return this.request<AssistanceRequest>(`/requests/${encodeURIComponent(id)}/verification`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async overridePriority(id: string, payload: PriorityOverridePayload): Promise<AssistanceRequest> {
    return this.request<AssistanceRequest>(`/requests/${encodeURIComponent(id)}/priority`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async flagDuplicate(id: string, payload: FlagDuplicatePayload): Promise<AssistanceRequest> {
    return this.request<AssistanceRequest>(`/requests/${encodeURIComponent(id)}/duplicates`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateRequestStatus(id: string, payload: UpdateRequestStatusPayload): Promise<AssistanceRequest> {
    return this.request<AssistanceRequest>(`/requests/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async getResources(category?: ResourceCategory | 'all'): Promise<ResourceItem[]> {
    const query = category && category !== 'all' ? `?category=${category}` : '';
    return this.request<ResourceItem[]>(`/resources${query}`);
  }

  async getResourceById(id: string): Promise<ResourceItem | null> {
    return this.request<ResourceItem>(`/resources/${encodeURIComponent(id)}`);
  }

  async findResourceMatches(requestId: string): Promise<ResourceMatch[]> {
    return this.request<ResourceMatch[]>(`/requests/${encodeURIComponent(requestId)}/matches`);
  }

  async confirmAssignment(
    input: ConfirmAssignmentInput
  ): Promise<{ request: AssistanceRequest; assignment: AssignmentRecord }> {
    return this.request<{ request: AssistanceRequest; assignment: AssignmentRecord }>(
      `/requests/${encodeURIComponent(input.requestId)}/assignments`,
      {
        method: 'POST',
        body: JSON.stringify(input),
      }
    );
  }

  async getAssignmentsForRequest(requestId: string): Promise<AssignmentRecord[]> {
    return this.request<AssignmentRecord[]>(`/requests/${encodeURIComponent(requestId)}/assignments`);
  }

  async updateAssignmentStatus(
    assignmentId: string,
    payload: UpdateAssignmentStatusPayload
  ): Promise<AssignmentRecord> {
    return this.request<AssignmentRecord>(`/assignments/${encodeURIComponent(assignmentId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    return this.request<DashboardMetrics>('/dashboard/metrics');
  }

  async getAuditHistory(targetId?: string): Promise<AuditEntry[]> {
    const query = targetId ? `?targetId=${encodeURIComponent(targetId)}` : '';
    return this.request<AuditEntry[]>(`/audit${query}`);
  }

  async recordAuditEntry(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<AuditEntry> {
    return this.request<AuditEntry>('/audit', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  async resetDemoData(): Promise<void> {
    await this.request('/demo/reset', { method: 'POST' });
  }
}

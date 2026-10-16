import {
  IApiService,
  DashboardMetrics,
  VerifyRequestPayload,
  PriorityOverridePayload,
  FlagDuplicatePayload,
  UpdateRequestStatusPayload,
  UpdateAssignmentStatusPayload,
} from '../../types/api';
import {
  AssistanceRequest,
  CreateRequestInput,
  RequestFilterParams,
  PriorityLevel,
} from '../../types/request';
import { ResourceItem, ResourceMatch, ResourceCategory } from '../../types/resource';
import { AssignmentRecord, ConfirmAssignmentInput } from '../../types/assignment';
import { AuditEntry } from '../../types/audit';
import { INITIAL_MOCK_REQUESTS } from '../../data/mockRequests';
import { INITIAL_MOCK_RESOURCES } from '../../data/mockResources';
import { INITIAL_MOCK_AUDIT_LOG } from '../../data/mockAudit';
import { calculatePriorityAssessment } from '../../utils/priority';
import { calculateApproxDistanceKm } from '../../utils/formatting';
import { getStorageItem, setStorageItem, clearSanketStorage } from '../../utils/storage';

const STORAGE_KEY_REQUESTS = 'requests';
const STORAGE_KEY_RESOURCES = 'resources';
const STORAGE_KEY_ASSIGNMENTS = 'assignments';
const STORAGE_KEY_AUDIT = 'audit_log';

// Helper for simulated network delay (calm, predictable 60ms)
const delay = (ms = 60) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockApiService implements IApiService {
  private getStoredRequests(): AssistanceRequest[] {
    return getStorageItem<AssistanceRequest[]>(STORAGE_KEY_REQUESTS, INITIAL_MOCK_REQUESTS);
  }

  private saveRequests(requests: AssistanceRequest[]): void {
    setStorageItem(STORAGE_KEY_REQUESTS, requests);
  }

  private getStoredResources(): ResourceItem[] {
    return getStorageItem<ResourceItem[]>(STORAGE_KEY_RESOURCES, INITIAL_MOCK_RESOURCES);
  }

  private saveResources(resources: ResourceItem[]): void {
    setStorageItem(STORAGE_KEY_RESOURCES, resources);
  }

  private getStoredAssignments(): AssignmentRecord[] {
    const initialAssignments: AssignmentRecord[] = [
      {
        id: 'ASN-8012',
        requestId: 'SN-2026-0831',
        resourceId: 'RES-FOD-201',
        resourceName: 'Ready-to-Eat Ration Packets (72h Supply)',
        category: 'food',
        allocatedQuantity: 40,
        unit: 'packets',
        confirmedBy: 'Coordinator V. Sharma (Desk 02)',
        confirmedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        status: 'ASSIGNED',
        notes: 'Dispatched to Pardi Nag River community hall.',
      },
      {
        id: 'ASN-8009',
        requestId: 'SN-2026-0820',
        resourceId: 'RES-MED-301',
        resourceName: 'Portable First-Aid & Water Purification Packs',
        category: 'supplies',
        allocatedQuantity: 10,
        unit: 'kits',
        confirmedBy: 'Coordinator R. Joshi (Desk 03)',
        confirmedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        status: 'DELIVERED',
        notes: 'Delivered and verified on site.',
        deliveredAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
      },
    ];
    return getStorageItem<AssignmentRecord[]>(STORAGE_KEY_ASSIGNMENTS, initialAssignments);
  }

  private saveAssignments(assignments: AssignmentRecord[]): void {
    setStorageItem(STORAGE_KEY_ASSIGNMENTS, assignments);
  }

  private getStoredAudit(): AuditEntry[] {
    return getStorageItem<AuditEntry[]>(STORAGE_KEY_AUDIT, INITIAL_MOCK_AUDIT_LOG);
  }

  private saveAudit(audit: AuditEntry[]): void {
    setStorageItem(STORAGE_KEY_AUDIT, audit);
  }

  // --- Requests API ---

  async getRequests(filters?: RequestFilterParams): Promise<AssistanceRequest[]> {
    await delay();
    let list = this.getStoredRequests();

    if (!filters) return list;

    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.locationName.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      );
    }

    if (filters.category && filters.category !== 'all') {
      list = list.filter((r) => r.category === filters.category);
    }

    if (filters.status && filters.status !== 'all') {
      list = list.filter((r) => r.status === filters.status);
    }

    if (filters.priority && filters.priority !== 'all') {
      list = list.filter((r) => r.priorityAssessment.currentPriority === filters.priority);
    }

    if (filters.verificationState && filters.verificationState !== 'all') {
      list = list.filter((r) => r.verificationState === filters.verificationState);
    }

    // Sort order
    if (filters.sortBy === 'urgency') {
      const priorityOrder: Record<PriorityLevel, number> = {
        CRITICAL: 4,
        HIGH: 3,
        MEDIUM: 2,
        LOW: 1,
      };
      list = [...list].sort(
        (a, b) =>
          priorityOrder[b.priorityAssessment.currentPriority] -
          priorityOrder[a.priorityAssessment.currentPriority]
      );
    } else if (filters.sortBy === 'waiting_time') {
      list = [...list].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else if (filters.sortBy === 'affected_count') {
      list = [...list].sort((a, b) => b.affectedCount - a.affectedCount);
    } else {
      // Default: recent first
      list = [...list].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return list;
  }

  async getRequestById(id: string): Promise<AssistanceRequest | null> {
    await delay();
    const list = this.getStoredRequests();
    const found = list.find((r) => r.id.toLowerCase() === id.toLowerCase());
    return found || null;
  }

  async createRequest(input: CreateRequestInput): Promise<AssistanceRequest> {
    await delay(120);
    const list = this.getStoredRequests();

    // Generate unique synthetic ID: SN-2026-XXXX
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const newId = `SN-2026-${randomDigits}`;

    // Default coordinates in central Nagpur if not provided (e.g., Dharampeth / Sitabuldi area)
    const coordinates: [number, number] = input.coordinates || [
      21.1458 + (Math.random() - 0.5) * 0.04,
      79.0882 + (Math.random() - 0.5) * 0.04,
    ];

    const nowIso = new Date().toISOString();
    const priorityAssessment = calculatePriorityAssessment(input, nowIso);

    const newRequest: AssistanceRequest = {
      id: newId,
      category: input.category,
      residentName: input.residentName?.trim() || 'Synthetic Resident (Demo)',
      contactPhone: input.contactPhone?.trim() || '+91 98XXX-XX000',
      locationName: input.locationName.trim(),
      coordinates,
      reportedUrgency: input.reportedUrgency,
      affectedCount: Number(input.affectedCount) || 1,
      vulnerabilities: input.vulnerabilities || [],
      description: input.description.trim(),
      evidenceFileName: input.evidenceFileName,
      evidencePreviewUrl: input.evidencePreviewUrl,
      status: 'submitted',
      verificationState: 'unverified',
      priorityAssessment,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const updatedList = [newRequest, ...list];
    this.saveRequests(updatedList);

    // Record in audit log
    await this.recordAuditEntry({
      actionType: 'REQUEST_SUBMITTED',
      targetId: newId,
      actor: 'Resident Portal (Public Web)',
      summary: `New assistance report submitted: ${input.category.toUpperCase()} at ${input.locationName}`,
      details: `Urgency: ${input.reportedUrgency}. Affected: ${input.affectedCount} individuals. Suggested Priority: ${priorityAssessment.suggestedPriority}.`,
      newValue: 'submitted',
    });

    return newRequest;
  }

  async verifyRequest(id: string, payload: VerifyRequestPayload): Promise<AssistanceRequest> {
    await delay();
    const list = this.getStoredRequests();
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) throw new Error(`Request ${id} not found.`);

    const current = list[index];
    const prevVerification = current.verificationState;
    const nowIso = new Date().toISOString();

    let newStatus = current.status;
    if (payload.verificationState === 'verified') {
      newStatus = current.status === 'submitted' ? 'verified' : current.status;
    } else if (payload.verificationState === 'invalid') {
      newStatus = 'invalid';
    }

    const updated: AssistanceRequest = {
      ...current,
      verificationState: payload.verificationState,
      verificationNotes: payload.notes || current.verificationNotes,
      verifiedBy: payload.verifiedBy,
      verifiedAt: nowIso,
      status: newStatus,
      updatedAt: nowIso,
    };

    list[index] = updated;
    this.saveRequests(list);

    // Audit log
    await this.recordAuditEntry({
      actionType: payload.verificationState === 'verified' ? 'REQUEST_VERIFIED' : 'VERIFICATION_NEEDS_INFO',
      targetId: id,
      actor: payload.verifiedBy,
      summary: `Verification updated: ${payload.verificationState} for ${id}`,
      details: payload.notes || 'Status changed by coordinator desk.',
      previousValue: prevVerification,
      newValue: payload.verificationState,
    });

    return updated;
  }

  async overridePriority(id: string, payload: PriorityOverridePayload): Promise<AssistanceRequest> {
    await delay();
    const list = this.getStoredRequests();
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) throw new Error(`Request ${id} not found.`);

    const current = list[index];
    const prevPriority = current.priorityAssessment.currentPriority;
    const nowIso = new Date().toISOString();

    const updatedAssessment = {
      ...current.priorityAssessment,
      currentPriority: payload.newPriority,
      isOverridden: true,
      overrideReason: payload.reason,
      overriddenBy: payload.overriddenBy,
      overriddenAt: nowIso,
    };

    const updated: AssistanceRequest = {
      ...current,
      priorityAssessment: updatedAssessment,
      updatedAt: nowIso,
    };

    list[index] = updated;
    this.saveRequests(list);

    await this.recordAuditEntry({
      actionType: 'PRIORITY_OVERRIDDEN',
      targetId: id,
      actor: payload.overriddenBy,
      summary: `Coordinator overridden priority from ${prevPriority} to ${payload.newPriority}`,
      details: `Reason: ${payload.reason}`,
      previousValue: prevPriority,
      newValue: payload.newPriority,
    });

    return updated;
  }

  async flagDuplicate(id: string, payload: FlagDuplicatePayload): Promise<AssistanceRequest> {
    await delay();
    const list = this.getStoredRequests();
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) throw new Error(`Request ${id} not found.`);

    const current = list[index];
    const nowIso = new Date().toISOString();

    const updated: AssistanceRequest = {
      ...current,
      status: 'duplicate',
      verificationState: 'flagged_duplicate',
      duplicateOfId: payload.primaryRequestId,
      verificationNotes: payload.notes || `Flagged duplicate of primary request ${payload.primaryRequestId}`,
      verifiedBy: payload.flaggedBy,
      verifiedAt: nowIso,
      updatedAt: nowIso,
    };

    list[index] = updated;
    this.saveRequests(list);

    await this.recordAuditEntry({
      actionType: 'DUPLICATE_FLAGGED',
      targetId: id,
      actor: payload.flaggedBy,
      summary: `Request ${id} flagged as duplicate of ${payload.primaryRequestId}`,
      details: payload.notes || 'Associated with primary incident record.',
      previousValue: current.status,
      newValue: 'duplicate',
    });

    return updated;
  }

  async updateRequestStatus(id: string, payload: UpdateRequestStatusPayload): Promise<AssistanceRequest> {
    await delay();
    const list = this.getStoredRequests();
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) throw new Error(`Request ${id} not found.`);

    const current = list[index];
    const prevStatus = current.status;
    const nowIso = new Date().toISOString();

    const updated: AssistanceRequest = {
      ...current,
      status: payload.status,
      updatedAt: nowIso,
    };

    list[index] = updated;
    this.saveRequests(list);

    await this.recordAuditEntry({
      actionType: payload.status === 'resolved' ? 'REQUEST_RESOLVED' : 'ASSIGNMENT_STATUS_UPDATED',
      targetId: id,
      actor: payload.updatedBy,
      summary: `Request status transitioned to ${payload.status}`,
      details: payload.notes,
      previousValue: prevStatus,
      newValue: payload.status,
    });

    return updated;
  }

  // --- Resources API ---

  async getResources(category?: ResourceCategory | 'all'): Promise<ResourceItem[]> {
    await delay();
    let list = this.getStoredResources();
    if (category && category !== 'all') {
      list = list.filter((r) => r.category === category);
    }
    return list;
  }

  async getResourceById(id: string): Promise<ResourceItem | null> {
    await delay();
    const list = this.getStoredResources();
    return list.find((r) => r.id === id) || null;
  }

  async findResourceMatches(requestId: string): Promise<ResourceMatch[]> {
    await delay();
    const request = await this.getRequestById(requestId);
    if (!request) throw new Error(`Request ${requestId} not found.`);

    const resources = this.getStoredResources();

    // Map request category to plausible resource categories
    const categoryMap: Record<string, ResourceCategory[]> = {
      rescue: ['rescue', 'volunteers'],
      medical: ['supplies', 'rescue'],
      water: ['water', 'supplies'],
      food: ['food', 'supplies'],
      shelter: ['shelter', 'volunteers'],
      supplies: ['supplies', 'medical' as ResourceCategory],
      flood: ['rescue', 'volunteers'],
      other: ['volunteers', 'supplies', 'food', 'water'],
    };

    const targetCategories = categoryMap[request.category] || ['volunteers', 'supplies'];

    const matches: ResourceMatch[] = [];

    for (const res of resources) {
      if (res.availableQuantity <= 0) continue;

      const isDirectCategory = targetCategories[0] === res.category;
      const isSecondaryCategory = targetCategories.includes(res.category);

      if (!isSecondaryCategory) continue;

      const dist = calculateApproxDistanceKm(request.coordinates, res.coordinates);
      let matchScore = 60;

      if (isDirectCategory) matchScore += 25;
      if (dist < 3.0) matchScore += 15;
      else if (dist < 7.0) matchScore += 5;

      // Recommended quantity based on affected individuals
      let recommendedQuantity = Math.min(res.availableQuantity, Math.max(1, request.affectedCount));
      if (res.category === 'water') {
        recommendedQuantity = Math.min(res.availableQuantity, Math.max(2, Math.ceil(request.affectedCount * 0.75)));
      } else if (res.category === 'food') {
        recommendedQuantity = Math.min(res.availableQuantity, Math.max(2, request.affectedCount * 2));
      } else if (res.category === 'rescue') {
        recommendedQuantity = Math.min(res.availableQuantity, Math.max(1, Math.ceil(request.affectedCount / 4)));
      }

      let explanation = `Direct category match for ${request.category}. Located approx. ${dist} km away at ${res.storageLocation}.`;
      if (res.category === 'volunteers') {
        explanation = `Rapid deployment volunteer personnel situated ${dist} km away for on-site assistance.`;
      }

      matches.push({
        resource: res,
        matchScore: Math.min(98, matchScore),
        suitabilityExplanation: explanation,
        recommendedQuantity,
        distanceKmApprox: dist,
      });
    }

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  async confirmAssignment(
    input: ConfirmAssignmentInput
  ): Promise<{ request: AssistanceRequest; assignment: AssignmentRecord }> {
    await delay(100);
    const requests = this.getStoredRequests();
    const reqIndex = requests.findIndex((r) => r.id === input.requestId);
    if (reqIndex === -1) throw new Error(`Request ${input.requestId} not found.`);

    const resources = this.getStoredResources();
    const resIndex = resources.findIndex((r) => r.id === input.resourceId);
    if (resIndex === -1) throw new Error(`Resource ${input.resourceId} not found.`);

    const req = requests[reqIndex];
    const res = resources[resIndex];

    const allocQty = Math.max(1, Math.min(input.allocatedQuantity, res.availableQuantity));
    const nowIso = new Date().toISOString();
    const coordinatorLabel = 'Coordinator V. Sharma (Desk 02)';

    // Update resource quantities
    const newAvailable = res.availableQuantity - allocQty;
    const newAssigned = res.assignedQuantity + allocQty;
    const newStatus = newAvailable <= 0 ? 'COMMITTED' : newAvailable < 20 ? 'LOW_STOCK' : 'AVAILABLE';

    resources[resIndex] = {
      ...res,
      availableQuantity: newAvailable,
      assignedQuantity: newAssigned,
      status: newStatus,
      lastUpdated: nowIso,
    };
    this.saveResources(resources);

    // Update request record
    const updatedReq: AssistanceRequest = {
      ...req,
      status: 'assigned',
      assignedResourceId: res.id,
      assignedResourceName: res.name,
      assignedQuantity: allocQty,
      assignedUnit: res.unit,
      assignedAt: nowIso,
      assignedBy: coordinatorLabel,
      updatedAt: nowIso,
    };
    requests[reqIndex] = updatedReq;
    this.saveRequests(requests);

    // Create assignment record
    const assignments = this.getStoredAssignments();
    const newAssignmentId = `ASN-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAssignment: AssignmentRecord = {
      id: newAssignmentId,
      requestId: req.id,
      resourceId: res.id,
      resourceName: res.name,
      category: res.category,
      allocatedQuantity: allocQty,
      unit: res.unit,
      confirmedBy: coordinatorLabel,
      confirmedAt: nowIso,
      status: 'ASSIGNED',
      notes: input.notes,
    };
    this.saveAssignments([newAssignment, ...assignments]);

    // Record in audit log
    await this.recordAuditEntry({
      actionType: 'ASSIGNMENT_CONFIRMED',
      targetId: req.id,
      actor: coordinatorLabel,
      summary: `Assigned ${allocQty} ${res.unit} of "${res.name}" to request ${req.id}`,
      details: `Depot: ${res.storageLocation}. Resource ID: ${res.id}. Notes: ${input.notes || 'Confirmed via coordination desk.'}`,
      previousValue: req.status,
      newValue: 'assigned',
    });

    return {
      request: updatedReq,
      assignment: newAssignment,
    };
  }

  async getAssignmentsForRequest(requestId: string): Promise<AssignmentRecord[]> {
    await delay();
    const list = this.getStoredAssignments();
    return list.filter((a) => a.requestId === requestId);
  }

  async updateAssignmentStatus(
    assignmentId: string,
    payload: UpdateAssignmentStatusPayload
  ): Promise<AssignmentRecord> {
    await delay();
    const list = this.getStoredAssignments();
    const index = list.findIndex((a) => a.id === assignmentId);
    if (index === -1) throw new Error(`Assignment ${assignmentId} not found.`);

    const current = list[index];
    const prevStatus = current.status;
    const nowIso = new Date().toISOString();

    const updated: AssignmentRecord = {
      ...current,
      status: payload.status,
      notes: payload.notes || current.notes,
      deliveredAt: payload.status === 'DELIVERED' ? nowIso : current.deliveredAt,
    };
    list[index] = updated;
    this.saveAssignments(list);

    // If delivered, also increment delivered count in resources
    if (payload.status === 'DELIVERED') {
      const resources = this.getStoredResources();
      const resIndex = resources.findIndex((r) => r.id === current.resourceId);
      if (resIndex !== -1) {
        const res = resources[resIndex];
        resources[resIndex] = {
          ...res,
          assignedQuantity: Math.max(0, res.assignedQuantity - current.allocatedQuantity),
          deliveredQuantity: res.deliveredQuantity + current.allocatedQuantity,
          lastUpdated: nowIso,
        };
        this.saveResources(resources);
      }
    }

    await this.recordAuditEntry({
      actionType: 'ASSIGNMENT_STATUS_UPDATED',
      targetId: assignmentId,
      actor: payload.updatedBy,
      summary: `Assignment ${assignmentId} status updated to ${payload.status}`,
      details: payload.notes,
      previousValue: prevStatus,
      newValue: payload.status,
    });

    return updated;
  }

  // --- Metrics API ---

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    await delay();
    const requests = this.getStoredRequests();
    const resources = this.getStoredResources();

    const awaitingVerificationCount = requests.filter(
      (r) => r.verificationState === 'unverified' && r.status !== 'invalid' && r.status !== 'duplicate'
    ).length;

    const highPriorityUnmetCount = requests.filter(
      (r) =>
        (r.priorityAssessment.currentPriority === 'CRITICAL' ||
          r.priorityAssessment.currentPriority === 'HIGH') &&
        r.status !== 'assigned' &&
        r.status !== 'resolved' &&
        r.status !== 'duplicate' &&
        r.status !== 'invalid'
    ).length;

    const awaitingAssignmentCount = requests.filter(
      (r) =>
        r.verificationState === 'verified' &&
        (r.status === 'verified' || r.status === 'matching')
    ).length;

    const totalActiveRequestsCount = requests.filter(
      (r) => r.status !== 'resolved' && r.status !== 'duplicate' && r.status !== 'invalid'
    ).length;

    const availableResourcesCount = resources.filter(
      (r) => r.availableQuantity > 0
    ).length;

    const resolvedRequestsCount = requests.filter((r) => r.status === 'resolved').length;

    const totalAffectedPersonsCount = requests
      .filter((r) => r.status !== 'duplicate' && r.status !== 'invalid')
      .reduce((sum, r) => sum + (r.affectedCount || 0), 0);

    const criticalRequestsCount = requests.filter(
      (r) =>
        r.priorityAssessment.currentPriority === 'CRITICAL' &&
        r.status !== 'resolved' &&
        r.status !== 'duplicate'
    ).length;

    return {
      awaitingVerificationCount,
      highPriorityUnmetCount,
      awaitingAssignmentCount,
      totalActiveRequestsCount,
      availableResourcesCount,
      resolvedRequestsCount,
      totalAffectedPersonsCount,
      criticalRequestsCount,
    };
  }

  // --- Audit API ---

  async getAuditHistory(targetId?: string): Promise<AuditEntry[]> {
    await delay();
    let list = this.getStoredAudit();
    if (targetId) {
      list = list.filter((a) => a.targetId === targetId);
    }
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async recordAuditEntry(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<AuditEntry> {
    const list = this.getStoredAudit();
    const newEntry: AuditEntry = {
      ...entry,
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
    };
    this.saveAudit([newEntry, ...list]);
    return newEntry;
  }

  // --- Demo Management ---

  async resetDemoData(): Promise<void> {
    await delay(100);
    clearSanketStorage();
    this.saveRequests(INITIAL_MOCK_REQUESTS);
    this.saveResources(INITIAL_MOCK_RESOURCES);
    this.saveAudit(INITIAL_MOCK_AUDIT_LOG);
  }
}

export type IncidentCategory =
  | 'rescue'
  | 'medical'
  | 'water'
  | 'food'
  | 'shelter'
  | 'supplies'
  | 'flood'
  | 'other';

export type RequestStatus =
  | 'submitted'
  | 'verified'
  | 'matching'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'invalid'
  | 'duplicate';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type VerificationState =
  | 'unverified'
  | 'verified'
  | 'needs_info'
  | 'flagged_duplicate'
  | 'invalid';

export type UrgencyLevel = 'immediate' | 'high' | 'moderate' | 'low';

export type VulnerabilityIndicator =
  | 'elderly'
  | 'infants'
  | 'medical_condition'
  | 'trapped_water'
  | 'disabled'
  | 'pregnant';

export interface PriorityFactor {
  id: string;
  label: string;
  impact: 'increases_priority' | 'neutral';
  description: string;
  source: string;
  weightScore?: number;
}

export interface PriorityAssessment {
  suggestedPriority: PriorityLevel;
  currentPriority: PriorityLevel;
  isOverridden: boolean;
  overrideReason?: string;
  overriddenBy?: string;
  overriddenAt?: string;
  factors: PriorityFactor[];
  assessmentNote: string;
  calculatedAt: string;
}

export interface AssistanceRequest {
  id: string; // e.g. "SN-2026-0842"
  category: IncidentCategory;
  residentName?: string;
  contactPhone?: string; // Synthetic masked phone
  locationName: string; // Fictional Nagpur location e.g. "Ambazari Catchment, Canal Road"
  coordinates: [number, number]; // [lat, lng]
  reportedUrgency: UrgencyLevel;
  affectedCount: number;
  vulnerabilities: VulnerabilityIndicator[];
  description: string;
  evidenceFileName?: string;
  evidencePreviewUrl?: string;
  status: RequestStatus;
  verificationState: VerificationState;
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  duplicateOfId?: string;
  priorityAssessment: PriorityAssessment;
  assignedResourceId?: string;
  assignedResourceName?: string;
  assignedQuantity?: number;
  assignedUnit?: string;
  assignedAt?: string;
  assignedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRequestInput {
  category: IncidentCategory;
  residentName?: string;
  contactPhone?: string;
  locationName: string;
  coordinates?: [number, number];
  reportedUrgency: UrgencyLevel;
  affectedCount: number;
  vulnerabilities: VulnerabilityIndicator[];
  description: string;
  evidenceFileName?: string;
  evidencePreviewUrl?: string;
}

export interface RequestFilterParams {
  search?: string;
  category?: IncidentCategory | 'all';
  status?: RequestStatus | 'all';
  priority?: PriorityLevel | 'all';
  verificationState?: VerificationState | 'all';
  sortBy?: 'urgency' | 'waiting_time' | 'affected_count' | 'recent';
}

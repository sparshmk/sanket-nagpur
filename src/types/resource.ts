export type ResourceCategory =
  | 'water'
  | 'food'
  | 'shelter'
  | 'supplies'
  | 'rescue'
  | 'volunteers';

export type ResourceStatus =
  | 'AVAILABLE'
  | 'LOW_STOCK'
  | 'DEPLETED'
  | 'COMMITTED';

export interface ResourceItem {
  id: string; // e.g. "RES-WTR-101"
  name: string;
  category: ResourceCategory;
  storageLocation: string; // Fictional Nagpur location e.g. "Dharampeth Relief Depot Hub A"
  coordinates: [number, number];
  totalCapacity: number;
  availableQuantity: number;
  assignedQuantity: number;
  deliveredQuantity: number;
  unit: string; // "cans", "kits", "beds", "personnel", "boats", "packets"
  contactPerson: string; // Synthetic demo coordinator
  status: ResourceStatus;
  lastUpdated: string;
  notes?: string;
}

export interface ResourceMatch {
  resource: ResourceItem;
  matchScore: number; // 0-100 deterministic suitability score
  suitabilityExplanation: string;
  recommendedQuantity: number;
  distanceKmApprox: number;
}

import { AuditEntry } from '../types/audit';

const now = Date.now();
const minutesAgo = (m: number) => new Date(now - m * 60 * 1000).toISOString();
const hoursAgo = (h: number) => new Date(now - h * 3600 * 1000).toISOString();

export const INITIAL_MOCK_AUDIT_LOG: AuditEntry[] = [
  {
    id: 'AUD-9025',
    timestamp: minutesAgo(20),
    actionType: 'DUPLICATE_FLAGGED',
    targetId: 'SN-2026-0818',
    actor: 'Coordinator V. Sharma (Desk 02)',
    summary: 'Flagged request SN-2026-0818 as duplicate of SN-2026-0842',
    details: 'Coordinated location cluster verified; both reports represent same family compound at Ambazari spillway.',
    previousValue: 'submitted',
    newValue: 'duplicate',
  },
  {
    id: 'AUD-9024',
    timestamp: minutesAgo(35),
    actionType: 'REQUEST_SUBMITTED',
    targetId: 'SN-2026-0842',
    actor: 'Resident Portal (Public Web)',
    summary: 'New assistance report submitted: Rescue Assistance at Ambazari Catchment',
    details: 'Urgency: Immediate. Affected: 8 persons. Vulnerabilities: Trapped in floodwater, Elderly, Infants.',
    newValue: 'submitted',
  },
  {
    id: 'AUD-9023',
    timestamp: minutesAgo(45),
    actionType: 'REQUEST_VERIFIED',
    targetId: 'SN-2026-0839',
    actor: 'Coordinator S. Meshram (Desk 01)',
    summary: 'Verified assistance report SN-2026-0839',
    details: 'Medical assistance urgency confirmed. Contact verified via amateur radio volunteer link.',
    previousValue: 'unverified',
    newValue: 'verified',
  },
  {
    id: 'AUD-9022',
    timestamp: minutesAgo(90),
    actionType: 'REQUEST_VERIFIED',
    targetId: 'SN-2026-0835',
    actor: 'Coordinator R. Joshi (Desk 03)',
    summary: 'Verified drinking water shortage at Sitabuldi low-lying terrace',
    details: 'Contamination of municipal line confirmed; 26 residents awaiting safe water.',
    previousValue: 'unverified',
    newValue: 'verified',
  },
  {
    id: 'AUD-9021',
    timestamp: hoursAgo(2),
    actionType: 'ASSIGNMENT_CONFIRMED',
    targetId: 'SN-2026-0831',
    actor: 'Coordinator V. Sharma (Desk 02)',
    summary: 'Resource RES-FOD-201 assigned to SN-2026-0831',
    details: 'Allocated 40 packets of Ready-to-Eat Ration Packets from Sitabuldi Community Hall.',
    newValue: 'ASSIGNED',
  },
  {
    id: 'AUD-9020',
    timestamp: hoursAgo(6),
    actionType: 'REQUEST_RESOLVED',
    targetId: 'SN-2026-0820',
    actor: 'Coordinator R. Joshi (Desk 03)',
    summary: 'Assistance request SN-2026-0820 marked as resolved',
    details: '10 First-Aid kits received and confirmed distributed by local volunteer.',
    previousValue: 'in_progress',
    newValue: 'resolved',
  },
];

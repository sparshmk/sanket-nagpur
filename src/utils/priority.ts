import { AssistanceRequest, CreateRequestInput, PriorityAssessment, PriorityFactor, PriorityLevel } from '../types/request';

/**
 * Deterministic Rule-Based Priority Assessment Algorithm
 * 
 * As specified in Section 11:
 * "The interface must explain why a request has received a particular priority assessment.
 * The presentation identifies these factors:
 * - Immediate danger.
 * - Medical need.
 * - Vulnerable people.
 * - Number of people affected.
 * - Waiting time.
 * For the prototype, use deterministic mock values and clearly documented sample rules."
 */
export function calculatePriorityAssessment(
  input: CreateRequestInput | Partial<AssistanceRequest>,
  createdAtIso?: string
): PriorityAssessment {
  const factors: PriorityFactor[] = [];
  let score = 0;

  // 1. Immediate Danger / Trapped condition
  const isRescue = input.category === 'rescue';
  const hasTrapped = input.vulnerabilities?.includes('trapped_water');
  const isUrgentImmediate = input.reportedUrgency === 'immediate';

  if (isRescue || hasTrapped) {
    score += 40;
    factors.push({
      id: 'immediate_danger',
      label: 'Immediate Life Safety Danger',
      impact: 'increases_priority',
      description: 'Active floodwater trapping residents or direct rescue intervention requested.',
      source: isRescue ? 'Category: Rescue Assistance' : 'Vulnerability: Trapped in floodwater',
      weightScore: 40,
    });
  } else if (isUrgentImmediate) {
    score += 20;
    factors.push({
      id: 'high_reported_urgency',
      label: 'Resident-Reported Immediate Urgency',
      impact: 'increases_priority',
      description: 'Requester reported rapid water rise or cut-off access.',
      source: 'Reported Urgency: Immediate',
      weightScore: 20,
    });
  }

  // 2. Medical Need
  const isMedical = input.category === 'medical' || input.category === 'supplies';
  const hasMedicalCondition = input.vulnerabilities?.includes('medical_condition');

  if (isMedical || hasMedicalCondition) {
    score += 30;
    factors.push({
      id: 'medical_need',
      label: 'Critical Health & Medical Risk',
      impact: 'increases_priority',
      description: 'Emergency medicine, dialysis, insulin or trauma care disrupted by inundation.',
      source: isMedical ? 'Category: Medical Assistance' : 'Vulnerability: Chronic/Acute Medical Condition',
      weightScore: 30,
    });
  }

  // 3. Vulnerable Population Factors
  const vulns = input.vulnerabilities || [];
  const vulnerableGroups: string[] = [];
  if (vulns.includes('infants')) vulnerableGroups.push('Infants / Young Children');
  if (vulns.includes('elderly')) vulnerableGroups.push('Senior Citizens (65+)');
  if (vulns.includes('pregnant')) vulnerableGroups.push('Expectant Mothers');
  if (vulns.includes('disabled')) vulnerableGroups.push('Persons with Disabilities');

  if (vulnerableGroups.length > 0) {
    const vulnScore = Math.min(25, vulnerableGroups.length * 10);
    score += vulnScore;
    factors.push({
      id: 'vulnerable_demographics',
      label: 'High Vulnerability Demographics Present',
      impact: 'increases_priority',
      description: `Identified affected members: ${vulnerableGroups.join(', ')}. Reduced mobility or heightened physiological risk.`,
      source: `Vulnerabilities: ${vulnerableGroups.join(', ')}`,
      weightScore: vulnScore,
    });
  }

  // 4. Scale of Impact (Number of affected people)
  const count = input.affectedCount || 1;
  if (count >= 15) {
    score += 20;
    factors.push({
      id: 'large_group_affected',
      label: 'High Group Cluster Size',
      impact: 'increases_priority',
      description: `Substantial community group (${count} individuals) in immediate vicinity.`,
      source: `Affected Count: ${count} persons`,
      weightScore: 20,
    });
  } else if (count >= 6) {
    score += 10;
    factors.push({
      id: 'medium_group_affected',
      label: 'Multi-Family Group Cluster',
      impact: 'increases_priority',
      description: `${count} individuals affected at this location.`,
      source: `Affected Count: ${count} persons`,
      weightScore: 10,
    });
  }

  // 5. Waiting Time / Elapsed Time
  if (createdAtIso) {
    const elapsedMinutes = (Date.now() - new Date(createdAtIso).getTime()) / (1000 * 60);
    if (elapsedMinutes > 180) { // > 3 hours
      score += 15;
      factors.push({
        id: 'extended_wait_time',
        label: 'Unresolved Extended Wait Duration',
        impact: 'increases_priority',
        description: `Request has been pending for over 3 hours without verified resource dispatch.`,
        source: `Wait time: ${Math.round(elapsedMinutes / 60)} hours`,
        weightScore: 15,
      });
    }
  }

  // Baseline factor if no high factors
  if (factors.length === 0) {
    factors.push({
      id: 'standard_relief',
      label: 'Standard Relief Demand',
      impact: 'neutral',
      description: 'Routine distribution of supplies with no life-safety or acute medical threats flagged.',
      source: 'Standard assessment criteria',
      weightScore: 5,
    });
  }

  // Determine suggested priority level based on deterministic score
  let suggestedPriority: PriorityLevel = 'LOW';
  let assessmentNote = 'Routine relief requirement with stable environmental conditions.';

  if (score >= 60) {
    suggestedPriority = 'CRITICAL';
    assessmentNote = 'High urgency: Compounded risk involving immediate physical danger, medical dependencies, or trapped vulnerable residents.';
  } else if (score >= 35) {
    suggestedPriority = 'HIGH';
    assessmentNote = 'Significant urgency: Critical relief supplies or vulnerable demographics require prompt allocation.';
  } else if (score >= 20) {
    suggestedPriority = 'MEDIUM';
    assessmentNote = 'Moderate urgency: Sustenance or temporary sheltering support needed in waterlogged area.';
  }

  return {
    suggestedPriority,
    currentPriority: suggestedPriority,
    isOverridden: false,
    factors,
    assessmentNote,
    calculatedAt: new Date().toISOString(),
  };
}

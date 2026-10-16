import { CreateRequestInput } from '../types/request';

export interface ValidationErrorMap {
  [key: string]: string;
}

export function validateResidentReportForm(input: Partial<CreateRequestInput>): {
  isValid: boolean;
  errors: ValidationErrorMap;
} {
  const errors: ValidationErrorMap = {};

  if (!input.category) {
    errors.category = 'Please select the type of assistance required.';
  }

  if (!input.locationName || input.locationName.trim().length < 3) {
    errors.locationName = 'Please enter a general neighborhood or landmark in Nagpur (e.g. Ambazari Layout, Dharampeth).';
  }

  if (!input.affectedCount || input.affectedCount < 1) {
    errors.affectedCount = 'Please indicate at least 1 affected individual.';
  } else if (input.affectedCount > 500) {
    errors.affectedCount = 'Please verify the affected count or contact emergency services for massive scale evacuation.';
  }

  if (!input.reportedUrgency) {
    errors.reportedUrgency = 'Please indicate your perceived level of urgency.';
  }

  if (!input.description || input.description.trim().length < 10) {
    errors.description = 'Please provide brief details (at least 10 characters) explaining what is needed.';
  } else if (input.description.trim().length > 1000) {
    errors.description = 'Description cannot exceed 1000 characters.';
  }

  if (input.contactPhone && input.contactPhone.trim().length > 0) {
    const cleanPhone = input.contactPhone.replace(/\s+/g, '');
    if (!/^\+?[0-9]{10,13}$/.test(cleanPhone)) {
      errors.contactPhone = 'Please provide a valid 10-digit contact number for coordination callback.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validatePriorityOverride(reason: string): { isValid: boolean; error?: string } {
  if (!reason || reason.trim().length < 10) {
    return {
      isValid: false,
      error: 'A coordinator justification note (minimum 10 characters) is required to override priority.',
    };
  }
  return { isValid: true };
}

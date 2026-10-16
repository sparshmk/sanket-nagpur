import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import {
  IncidentCategory,
  UrgencyLevel,
  VulnerabilityIndicator,
} from '../types/request';
import { validateResidentReportForm, ValidationErrorMap } from '../utils/validation';
import { Button } from '../components/ui/Button';
import { DemoBadge } from '../components/ui/DemoBadge';
import { Card } from '../components/ui/Card';
import { useToast } from '../hooks/useToast';
import {
  LifeBuoy,
  HeartPulse,
  Droplet,
  Utensils,
  Home,
  Package,
  Waves,
  HelpCircle,
  MapPin,
  Users,
  AlertTriangle,
  Upload,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Search,
} from 'lucide-react';

const CATEGORIES: { id: IncidentCategory; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    id: 'rescue',
    label: 'Rescue Assistance',
    desc: 'People trapped in rising floodwater needing evacuation',
    icon: <LifeBuoy className="w-5 h-5 text-red-600" />,
  },
  {
    id: 'medical',
    label: 'Medical Assistance',
    desc: 'Urgent medical conditions, prescription drugs, dialysis',
    icon: <HeartPulse className="w-5 h-5 text-red-500" />,
  },
  {
    id: 'water',
    label: 'Drinking Water',
    desc: 'Contaminated tap water or shortage of potable drinking water',
    icon: <Droplet className="w-5 h-5 text-blue-600" />,
  },
  {
    id: 'food',
    label: 'Food Supplies',
    desc: 'Ready-to-eat rations, infant baby food, dry provisions',
    icon: <Utensils className="w-5 h-5 text-amber-600" />,
  },
  {
    id: 'shelter',
    label: 'Emergency Shelter',
    desc: 'Submerged houses requiring dry temporary accommodation',
    icon: <Home className="w-5 h-5 text-brand-700" />,
  },
  {
    id: 'supplies',
    label: 'Medical & First Aid Supplies',
    desc: 'First aid kits, chlorine tablets, disinfectant',
    icon: <Package className="w-5 h-5 text-emerald-600" />,
  },
  {
    id: 'flood',
    label: 'Waterlogging & Blocked Drain',
    desc: 'Severe road inundation blocking community access',
    icon: <Waves className="w-5 h-5 text-sky-600" />,
  },
  {
    id: 'other',
    label: 'Other Essential Need',
    desc: 'Essential survival needs not covered in other categories',
    icon: <HelpCircle className="w-5 h-5 text-slate-600" />,
  },
];

const VULNERABILITY_OPTIONS: { id: VulnerabilityIndicator; label: string }[] = [
  { id: 'trapped_water', label: 'People trapped in floodwater / Upper floor cutoff' },
  { id: 'elderly', label: 'Senior citizens (65+ years)' },
  { id: 'infants', label: 'Infants / Toddlers / Young children' },
  { id: 'medical_condition', label: 'Acute medical condition / Insulin / Oxygen dependency' },
  { id: 'pregnant', label: 'Expectant / Nursing mothers' },
  { id: 'disabled', label: 'Persons with physical disability' },
];

export const ResidentReport: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [category, setCategory] = useState<IncidentCategory | ''>('');
  const [locationName, setLocationName] = useState('');
  const [affectedCount, setAffectedCount] = useState<number>(3);
  const [reportedUrgency, setReportedUrgency] = useState<UrgencyLevel>('high');
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilityIndicator[]>([]);
  const [description, setDescription] = useState('');
  const [residentName, setResidentName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [errors, setErrors] = useState<ValidationErrorMap>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);

  const toggleVulnerability = (id: VulnerabilityIndicator) => {
    setVulnerabilities((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateResidentReportForm({
      category: category as IncidentCategory,
      locationName,
      affectedCount,
      reportedUrgency,
      description,
      contactPhone,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      showToast({
        type: 'error',
        title: 'Please check the required fields',
        message: 'Ensure you selected a category, entered your general location, and described the situation.',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({});

      const newRequest = await apiService.createRequest({
        category: category as IncidentCategory,
        locationName,
        affectedCount,
        reportedUrgency,
        vulnerabilities,
        description,
        residentName: residentName || undefined,
        contactPhone: contactPhone || undefined,
        evidenceFileName: selectedFile ? selectedFile.name : undefined,
      });

      setSubmittedRequestId(newRequest.id);
      showToast({
        type: 'success',
        title: 'Assistance Request Submitted',
        message: `Your request has been logged with identifier ${newRequest.id}.`,
      });
    } catch (err: unknown) {
      showToast({
        type: 'error',
        title: 'Submission Error',
        message: err instanceof Error ? err.message : 'Failed to submit report',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already submitted, display clear success confirmation
  if (submittedRequestId) {
    return (
      <div className="min-h-screen bg-surface-bg py-10 px-4 flex flex-col justify-center items-center">
        <div className="max-w-md w-full bg-white rounded-2xl border border-surface-border shadow-modal p-6 sm:p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Assistance Report Received
            </span>
            <h2 className="text-2xl font-bold text-ink-primary mt-3">
              Request Submitted
            </h2>
            <p className="text-xs text-ink-secondary mt-1">
              Your report has been entered into the SANKET community coordination queue.
            </p>
          </div>

          {/* Request ID Display */}
          <div className="p-4 bg-surface-mint rounded-xl border border-brand-200 text-center">
            <span className="text-xs text-brand-800 uppercase font-semibold">Your Tracking Identifier</span>
            <div className="text-2xl font-extrabold text-brand-900 font-mono tracking-wider mt-1 select-all">
              {submittedRequestId}
            </div>
            <p className="text-[11px] text-brand-700 mt-1">
              Save or note down this reference number to monitor assistance status.
            </p>
          </div>

          <div className="text-left text-xs text-ink-secondary space-y-2 bg-surface-bg p-4 rounded-xl border border-surface-border">
            <h4 className="font-semibold text-ink-primary">What happens next:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>A volunteer coordinator reviews and verifies your submitted information.</li>
              <li>A transparent priority score is calculated based on affected individuals and vulnerability.</li>
              <li>Matching relief supplies or support personnel are identified from community depots.</li>
            </ul>
          </div>

          <div className="space-y-2 pt-2">
            <Link to={`/track/${submittedRequestId}`} className="block">
              <Button size="lg" variant="primary" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Track Your Request Status
              </Button>
            </Link>

            <Link to="/desk/requests" className="block">
              <Button size="sm" variant="ghost" className="w-full text-ink-secondary">
                View in Coordinator Desk Queue
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-bg py-6 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/desk"
            className="text-xs font-semibold text-brand-700 hover:text-brand-900 flex items-center gap-1"
          >
            ← Coordinator Operations Desk
          </Link>
          <DemoBadge showDetails />
        </div>

        {/* Brand Banner */}
        <div className="bg-brand-700 text-white p-6 sm:p-7 rounded-2xl shadow-subtle space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight">SANKET Nagpur</span>
            <span className="text-xs px-2 py-0.5 font-semibold bg-brand-800 rounded text-brand-100">
              Community Relief
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Submit Assistance Request
          </h1>
          <p className="text-xs sm:text-sm text-brand-100 leading-relaxed max-w-xl">
            Report flood risks, stranded residents, drinking water shortages, or relief needs. Structured community reports allow coordinators to match available supplies swiftly.
          </p>
        </div>

        {/* Safety Disclaimer */}
        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong>Emergency Advisory: </strong> SANKET is a community relief coordination tool. For immediate life-saving rescue or medical emergencies, dial <strong>112</strong> or NMC Disaster Control Room directly.
          </div>
        </div>

        {/* Reporting Form */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-5 sm:p-7 rounded-2xl border border-surface-border shadow-subtle">
          {/* Section 1: Need Category */}
          <div>
            <label className="block text-sm font-bold text-ink-primary mb-1">
              1. What type of assistance is required? <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-ink-secondary mb-3">
              Choose the primary relief need for this location.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      if (errors.category) {
                        setErrors((prev: ValidationErrorMap) => ({ ...prev, category: '' }));
                      }
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 select-none ${
                      isSelected
                        ? 'border-brand-700 bg-brand-50/70 ring-2 ring-brand-700 shadow-xs'
                        : 'border-surface-border bg-white hover:border-brand-300'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{cat.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-ink-primary">{cat.label}</div>
                      <div className="text-[11px] text-ink-secondary leading-tight mt-0.5">
                        {cat.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.category && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.category}</p>
            )}
          </div>

          {/* Section 2: General Location */}
          <div className="pt-4 border-t border-surface-border space-y-1">
            <label htmlFor="loc-name" className="block text-sm font-bold text-ink-primary">
              2. Where is help needed in Nagpur? <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-ink-secondary">
              Enter the neighborhood, landmark, or street area (e.g. <em>Ambazari Layout near Canal Bridge</em>, or <em>Dharampeth Zenda Chowk</em>).
            </p>
            <div className="relative mt-2">
              <MapPin className="w-4 h-4 text-brand-700 absolute left-3.5 top-3" />
              <input
                id="loc-name"
                type="text"
                value={locationName}
                onChange={(e) => {
                  setLocationName(e.target.value);
                  if (errors.locationName) setErrors((prev: ValidationErrorMap) => ({ ...prev, locationName: '' }));
                }}
                placeholder="e.g. Ambazari Catchment, Canal Road, Zone 2"
                className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border bg-white text-ink-primary placeholder:text-ink-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 shadow-subtle ${
                  errors.locationName ? 'border-red-400 bg-red-50/20' : 'border-surface-border'
                }`}
              />
            </div>
            {errors.locationName && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.locationName}</p>
            )}
            <p className="text-[11px] text-ink-tertiary mt-1">
              * Exact private addresses are not published publicly for privacy and safety.
            </p>
          </div>

          {/* Section 3: Affected Head-Count & Perceived Urgency */}
          <div className="pt-4 border-t border-surface-border grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="aff-count" className="block text-sm font-bold text-ink-primary mb-1">
                3. Number of Affected People <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setAffectedCount((prev) => Math.max(1, prev - 1))}
                  className="w-10 h-10 rounded-lg border border-surface-border bg-surface-muted hover:bg-brand-50 text-ink-primary font-bold text-lg flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <input
                  id="aff-count"
                  type="number"
                  min={1}
                  max={200}
                  value={affectedCount}
                  onChange={(e) => setAffectedCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center py-2 text-sm font-bold rounded-lg border border-surface-border focus-visible:ring-2 focus-visible:ring-brand-700"
                />
                <button
                  type="button"
                  onClick={() => setAffectedCount((prev) => prev + 1)}
                  className="w-10 h-10 rounded-lg border border-surface-border bg-surface-muted hover:bg-brand-50 text-ink-primary font-bold text-lg flex items-center justify-center transition-colors"
                >
                  +
                </button>
                <span className="text-xs text-ink-secondary">individuals</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-ink-primary mb-1">
                Perceived Urgency <span className="text-red-500">*</span>
              </label>
              <select
                value={reportedUrgency}
                onChange={(e) => setReportedUrgency(e.target.value as UrgencyLevel)}
                className="w-full mt-2 py-2 px-3 text-sm rounded-lg border border-surface-border bg-white text-ink-primary focus-visible:ring-2 focus-visible:ring-brand-700"
              >
                <option value="immediate">Immediate &mdash; Water rising / stranded</option>
                <option value="high">High &mdash; Critical supplies needed today</option>
                <option value="moderate">Moderate &mdash; Needed within 24 hours</option>
                <option value="low">Low &mdash; General welfare support</option>
              </select>
            </div>
          </div>

          {/* Section 4: Vulnerabilities */}
          <div className="pt-4 border-t border-surface-border space-y-2">
            <label className="block text-sm font-bold text-ink-primary">
              4. Any vulnerable individuals present? (Optional)
            </label>
            <p className="text-xs text-ink-secondary">
              Helps coordinators evaluate priority and suitable supplies (e.g. pediatric milk, elevated cots).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {VULNERABILITY_OPTIONS.map((v) => {
                const checked = vulnerabilities.includes(v.id);
                return (
                  <label
                    key={v.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer select-none transition-colors ${
                      checked
                        ? 'border-brand-700 bg-brand-50/50 text-brand-900 font-medium'
                        : 'border-surface-border bg-white hover:bg-surface-bg text-ink-secondary'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleVulnerability(v.id)}
                      className="mt-0.5 rounded border-surface-border text-brand-700 focus:ring-brand-700"
                    />
                    <span>{v.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 5: Description */}
          <div className="pt-4 border-t border-surface-border space-y-1">
            <label htmlFor="situation-desc" className="block text-sm font-bold text-ink-primary">
              5. Details of the Situation <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-ink-secondary">
              Describe what is happening, accessibility of access roads, water height, or specific items required.
            </p>
            <textarea
              id="situation-desc"
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev: ValidationErrorMap) => ({ ...prev, description: '' }));
              }}
              placeholder="e.g. Ground floor inundated with 3 feet water. Electricity cut off. Need drinking water for 4 people including elderly grandfather..."
              className={`w-full p-3 text-sm rounded-lg border bg-white text-ink-primary placeholder:text-ink-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 shadow-subtle ${
                errors.description ? 'border-red-400 bg-red-50/20' : 'border-surface-border'
              }`}
            />
            <div className="flex items-center justify-between text-[11px] text-ink-tertiary">
              <span>{description.length} / 1000 characters</span>
              {errors.description && (
                <span className="text-red-600 font-medium">{errors.description}</span>
              )}
            </div>
          </div>

          {/* Section 6: Optional Photo / Evidence & Contact Info */}
          <div className="pt-4 border-t border-surface-border grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="resident-contact" className="block text-xs font-bold text-ink-primary mb-1">
                Contact Phone for Verification (Optional)
              </label>
              <input
                id="resident-contact"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98XXX-XXXXX"
                className="w-full px-3 py-2 text-sm rounded-lg border border-surface-border bg-white text-ink-primary focus-visible:ring-2 focus-visible:ring-brand-700 shadow-subtle"
              />
              <p className="text-[11px] text-ink-tertiary mt-1">
                Used only by coordinators to confirm location. Masked on public views.
              </p>
            </div>

            <div>
              <label htmlFor="resident-evidence" className="block text-xs font-bold text-ink-primary mb-1">
                Attach Photo / Verification File (Optional)
              </label>
              <div className="relative">
                <input
                  id="resident-evidence"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-ink-secondary file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-surface-mint file:text-brand-900 hover:file:bg-brand-200"
                />
              </div>
              <p className="text-[11px] text-ink-tertiary mt-1">
                Synthetic preview only in prototype mode.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-surface-border">
            <Button
              type="submit"
              size="lg"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
            >
              Submit Community Assistance Report
            </Button>
            <p className="text-center text-[11px] text-ink-tertiary mt-2">
              By submitting, your report will become visible to community relief coordinators on the SANKET desk.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

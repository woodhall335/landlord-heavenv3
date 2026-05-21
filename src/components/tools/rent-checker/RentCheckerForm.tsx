'use client';

import { clsx } from 'clsx';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { RentCheckerInput } from '@/lib/section13';

type StepId = 'property' | 'condition' | 'review';

interface RentCheckerFormProps {
  step: StepId;
  input: RentCheckerInput;
  errors: Record<string, string>;
  loading: boolean;
  onChange: <K extends keyof RentCheckerInput>(field: K, value: RentCheckerInput[K]) => void;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
}

const stepOrder: Array<{ id: StepId; label: string }> = [
  { id: 'property', label: 'Property basics' },
  { id: 'condition', label: 'Condition & evidence' },
  { id: 'review', label: 'Review & calculate' },
];

const propertySubtypeOptions: Partial<
  Record<
    RentCheckerInput['propertyType'],
    Array<{ value: NonNullable<RentCheckerInput['propertySubtype']>; label: string }>
  >
> = {
  house: [
    { value: 'terraced', label: 'Terraced house' },
    { value: 'end_terrace', label: 'End-terrace house' },
    { value: 'semi_detached', label: 'Semi-detached house' },
    { value: 'detached', label: 'Detached house' },
    { value: 'bungalow', label: 'Bungalow' },
    { value: 'other_house', label: 'Other house' },
  ],
  flat: [
    { value: 'purpose_built_flat', label: 'Purpose-built flat' },
    { value: 'converted_flat', label: 'Converted flat' },
    { value: 'maisonette', label: 'Maisonette' },
    { value: 'studio', label: 'Studio' },
    { value: 'other_flat', label: 'Other flat' },
  ],
  room: [{ value: 'room_in_shared_house', label: 'Room in shared house' }],
  hmo: [{ value: 'room_in_shared_house', label: 'Room in HMO / shared house' }],
};

function formatReviewLabel(value: string | null | undefined): string {
  if (!value) return '-';
  if (value === 'hmo') return 'HMO';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function StepHeader({ step }: { step: StepId }) {
  const currentIndex = stepOrder.findIndex((item) => item.id === step);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {stepOrder.map((item, index) => (
          <div
            key={item.id}
            className={clsx(
              'rounded-full px-4 py-2 text-sm font-semibold',
              index === currentIndex
                ? 'bg-indigo-600 text-white'
                : index < currentIndex
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-100 text-slate-500'
            )}
          >
            {index + 1}. {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-200 py-3 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-semibold text-slate-950">{value}</dd>
    </div>
  );
}

export function RentCheckerForm({
  step,
  input,
  errors,
  loading,
  onChange,
  onNext,
  onBack,
  onSubmit,
}: RentCheckerFormProps) {
  const subtypeOptions = propertySubtypeOptions[input.propertyType] || [];
  const handlePropertyTypeChange = (value: RentCheckerInput['propertyType']) => {
    onChange('propertyType', value);
    const firstSubtype = propertySubtypeOptions[value]?.[0]?.value || null;
    onChange('propertySubtype', firstSubtype);
  };

  const renderStep = () => {
    if (step === 'property') {
      return (
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Postcode"
            value={input.postcode}
            onChange={(event) => onChange('postcode', event.target.value)}
            error={errors.postcode}
            fullWidth
          />
          <Input
            label="Bedrooms"
            type="number"
            min={0}
            value={String(input.bedrooms)}
            onChange={(event) => onChange('bedrooms', Number(event.target.value))}
            error={errors.bedrooms}
            fullWidth
          />
          <Select
            id="rent-checker-property-type"
            label="Property type"
            value={input.propertyType}
            onChange={(event) => handlePropertyTypeChange(event.target.value as RentCheckerInput['propertyType'])}
            error={errors.propertyType}
          >
            <option value="flat">Flat</option>
            <option value="house">House</option>
            <option value="room">Room</option>
            <option value="hmo">HMO</option>
            <option value="other">Other</option>
          </Select>
          {subtypeOptions.length > 0 ? (
            <Select
              id="rent-checker-property-subtype"
              label="Property subtype"
              value={input.propertySubtype || ''}
              onChange={(event) =>
                onChange('propertySubtype', event.target.value as NonNullable<RentCheckerInput['propertySubtype']>)
              }
              error={errors.propertySubtype}
            >
              <option value="">Select closest match</option>
              {subtypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          ) : null}
          <Select
            id="rent-checker-furnished-status"
            label="Furnished status"
            value={input.furnishedStatus}
            onChange={(event) => onChange('furnishedStatus', event.target.value as RentCheckerInput['furnishedStatus'])}
            error={errors.furnishedStatus}
          >
            <option value="unfurnished">Unfurnished</option>
            <option value="part_furnished">Part furnished</option>
            <option value="furnished">Furnished</option>
          </Select>
          <Input
            label="Current rent"
            type="number"
            min={1}
            value={String(input.currentRent)}
            onChange={(event) => onChange('currentRent', Number(event.target.value))}
            error={errors.currentRent}
            fullWidth
          />
          <Select
            id="rent-checker-rent-frequency"
            label="Rent frequency"
            value={input.rentFrequency}
            onChange={(event) => onChange('rentFrequency', event.target.value as RentCheckerInput['rentFrequency'])}
            error={errors.rentFrequency}
          >
            <option value="monthly">Per month</option>
            <option value="weekly">Per week</option>
            <option value="fortnightly">Per fortnight</option>
            <option value="4-weekly">Every 4 weeks</option>
          </Select>
          <Input
            label="Proposed rent"
            type="number"
            min={1}
            value={input.proposedRent == null ? '' : String(input.proposedRent)}
            onChange={(event) => onChange('proposedRent', event.target.value ? Number(event.target.value) : null)}
            error={errors.proposedRent}
            fullWidth
          />
        </div>
      );
    }

    if (step === 'condition') {
      return (
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Select
              id="rent-checker-property-condition"
              label="Property condition"
              value={input.propertyCondition}
              onChange={(event) => onChange('propertyCondition', event.target.value as RentCheckerInput['propertyCondition'])}
            >
              <option value="below_average">Below average</option>
              <option value="average">Average</option>
              <option value="good">Good</option>
              <option value="excellent">Excellent</option>
            </Select>
            <p className="text-sm leading-6 text-slate-600">
              Property condition affects how strongly the proposed rent can be justified against nearby comparables.
            </p>
          </div>
          <Select
            id="rent-checker-bills-included"
            label="Any bills included in rent?"
            value={input.billsIncluded ? 'yes' : 'no'}
            onChange={(event) => onChange('billsIncluded', event.target.value === 'yes')}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </Select>
        </div>
      );
    }

    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-lg font-semibold text-slate-950">Checker summary</h3>
          <dl className="mt-4">
            <ReviewRow label="Audience" value="Landlord" />
            <ReviewRow label="Postcode" value={input.postcode || '-'} />
            <ReviewRow label="Property type" value={formatReviewLabel(input.propertyType)} />
            <ReviewRow label="Property subtype" value={formatReviewLabel(input.propertySubtype)} />
            <ReviewRow label="Bedrooms" value={String(input.bedrooms)} />
            <ReviewRow label="Condition" value={formatReviewLabel(input.propertyCondition)} />
            <ReviewRow label="Current rent" value={input.currentRent ? `£${input.currentRent}` : '-'} />
            <ReviewRow label="Proposed rent" value={input.proposedRent ? `£${input.proposedRent}` : '-'} />
          </dl>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-slate-950">What you'll get</h3>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li>Estimated local market range and median.</li>
            <li>Proposed rent positioning against live comparable evidence.</li>
            <li>Evidence strength and challenge risk before you serve Form 4A.</li>
            <li>A recommended Section 13 route with the right landlord CTA.</li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8">
      <StepHeader step={step} />
      <div className="mt-6 space-y-6">
        {renderStep()}
        {errors.submit ? <p className="text-sm text-rose-700">{errors.submit}</p> : null}
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={onBack} disabled={step === 'property' || loading}>
          Back
        </Button>
        {step === 'review' ? (
          <Button onClick={onSubmit} loading={loading} className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300">
            See my result
          </Button>
        ) : (
          <Button onClick={onNext} className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300">
            Next
          </Button>
        )}
      </div>
    </div>
  );
}

export default RentCheckerForm;

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button, Input } from '@/components/ui';
import { getCaseFacts, saveCaseFacts } from '@/lib/wizard/facts-client';
import {
  calculateArrearsScheduleTotal,
  getResidentialStandaloneCompletionErrors,
  getResidentialStandaloneFlowConfig,
  type ArrearsScheduleRow,
} from '@/lib/residential-letting/standalone-flow-config';
import { type ResidentialLettingProductSku } from '@/lib/residential-letting/products';

interface Props {
  caseId: string;
  jurisdiction: 'england';
  product: ResidentialLettingProductSku;
}

const EMPTY_ROW: ArrearsScheduleRow = {
  due_date: '',
  period_covered: '',
  amount_due: 0,
  amount_paid: 0,
  amount_outstanding: 0,
  payment_received_date: '',
  note: '',
};

export function ResidentialStandaloneSectionFlow({ caseId, jurisdiction, product }: Props) {
  const router = useRouter();
  const config = useMemo(() => getResidentialStandaloneFlowConfig(product), [product]);
  const [facts, setFacts] = useState<Record<string, any>>({
    jurisdiction,
    property_country: jurisdiction,
    arrears_mode: 'quick_summary',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const loaded = await getCaseFacts(caseId);
      setFacts((current) => ({
        ...current,
        ...loaded,
        __meta: {
          ...(loaded?.__meta || {}),
          original_product: product,
          product,
          jurisdiction,
          case_type: 'tenancy_agreement',
        },
      }));
      setLoading(false);
    };
    void load();
  }, [caseId, jurisdiction, product]);

  const step = config.steps[activeStep];

  const updateFact = (key: string, value: any) => {
    setFacts((current) => ({ ...current, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    await saveCaseFacts(caseId, facts, {
      jurisdiction,
      caseType: 'tenancy_agreement',
      product: product as any,
    });
    setSaving(false);
  };

  const addScheduleRow = () => {
    const rows = (facts.arrears_schedule_rows || []) as ArrearsScheduleRow[];
    updateFact('arrears_schedule_rows', [...rows, { ...EMPTY_ROW }]);
  };

  const updateScheduleRow = (index: number, key: keyof ArrearsScheduleRow, value: string | number) => {
    const rows = [...((facts.arrears_schedule_rows || []) as ArrearsScheduleRow[])];
    rows[index] = { ...rows[index], [key]: value };

    if (key === 'amount_due' || key === 'amount_paid') {
      rows[index].amount_outstanding = Number(rows[index].amount_due || 0) - Number(rows[index].amount_paid || 0);
    }

    updateFact('arrears_schedule_rows', rows);
    updateFact('arrears_total', calculateArrearsScheduleTotal(rows));
  };

  const removeScheduleRow = (index: number) => {
    const rows = [...((facts.arrears_schedule_rows || []) as ArrearsScheduleRow[])];
    rows.splice(index, 1);
    updateFact('arrears_schedule_rows', rows);
    updateFact('arrears_total', calculateArrearsScheduleTotal(rows));
  };

  const next = async () => {
    await save();
    if (activeStep < config.steps.length - 1) {
      setActiveStep((current) => current + 1);
      return;
    }

    const completionErrors = getResidentialStandaloneCompletionErrors(product, facts);
    if (completionErrors.length > 0) {
      setErrors(completionErrors);
      return;
    }

    router.push(`/wizard/review?case_id=${caseId}&product=${product}`);
  };

  const previous = () => {
    if (activeStep > 0) setActiveStep((current) => current - 1);
  };

  if (loading) return <div className="p-8">Loading standalone {config.documentTitle} wizard…</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 pt-[calc(var(--site-header-height)+var(--s21-banner-height)+1rem)] pb-8 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{config.documentTitle}</h1>
        <p className="text-sm text-gray-600">Step {activeStep + 1} of {config.steps.length}: {step.title}</p>
        <p className="text-sm text-gray-600">{step.description}</p>
      </div>

      {config.warnings.length > 0 && (
        <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm">
          {config.warnings.map((warning) => <div key={warning}>• {warning}</div>)}
        </div>
      )}

      <div className="space-y-3 rounded border p-4">
        {(step.fields || []).map((field) => {
          if (field.visibleWhen && !field.visibleWhen(facts)) return null;
          const value = facts[field.id];

          if (field.type === 'select') {
            return (
              <label key={field.id} className="block text-sm">
                <div className="font-medium">{field.label}{field.required ? ' *' : ''}</div>
                <select
                  value={value || ''}
                  onChange={(event) => updateFact(field.id, event.target.value)}
                  className="mt-1 w-full rounded border p-2"
                >
                  <option value="">Select</option>
                  {(field.options || []).map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            );
          }

          if (field.type === 'textarea') {
            return (
              <label key={field.id} className="block text-sm">
                <div className="font-medium">{field.label}{field.required ? ' *' : ''}</div>
                <textarea
                  value={value || ''}
                  onChange={(event) => updateFact(field.id, event.target.value)}
                  className="mt-1 w-full rounded border p-2"
                  rows={4}
                />
                {field.helpText ? <p className="text-xs text-gray-500 mt-1">{field.helpText}</p> : null}
              </label>
            );
          }

          if (field.type === 'checkbox') {
            return (
              <label key={field.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={Boolean(value)} onChange={(event) => updateFact(field.id, event.target.checked)} />
                {field.label}{field.required ? ' *' : ''}
              </label>
            );
          }

          return (
            <label key={field.id} className="block text-sm">
              <div className="font-medium">{field.label}{field.required ? ' *' : ''}</div>
              <Input
                type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                value={value || ''}
                placeholder={field.placeholder}
                onChange={(event) => updateFact(field.id, field.type === 'number' ? Number(event.target.value) : event.target.value)}
              />
              {field.helpText ? <p className="text-xs text-gray-500 mt-1">{field.helpText}</p> : null}
            </label>
          );
        })}

        {product === 'rent_arrears_letter' && facts.arrears_mode === 'detailed_schedule' && (
          <div className="space-y-3 rounded border border-indigo-200 p-3">
            <div className="text-sm font-semibold">Detailed arrears schedule</div>
            {((facts.arrears_schedule_rows || []) as ArrearsScheduleRow[]).map((row, index) => (
              <div className="grid grid-cols-1 md:grid-cols-7 gap-2" key={`arrears-row-${index}`}>
                <Input type="date" value={row.due_date || ''} onChange={(e) => updateScheduleRow(index, 'due_date', e.target.value)} />
                <Input value={row.period_covered || ''} onChange={(e) => updateScheduleRow(index, 'period_covered', e.target.value)} placeholder="Period" />
                <Input type="number" value={String(row.amount_due ?? 0)} onChange={(e) => updateScheduleRow(index, 'amount_due', Number(e.target.value))} />
                <Input type="number" value={String(row.amount_paid ?? 0)} onChange={(e) => updateScheduleRow(index, 'amount_paid', Number(e.target.value))} />
                <Input type="number" value={String(row.amount_outstanding ?? 0)} onChange={(e) => updateScheduleRow(index, 'amount_outstanding', Number(e.target.value))} />
                <Input type="date" value={row.payment_received_date || ''} onChange={(e) => updateScheduleRow(index, 'payment_received_date', e.target.value)} />
                <div className="flex gap-2">
                  <Input value={row.note || ''} onChange={(e) => updateScheduleRow(index, 'note', e.target.value)} placeholder="Note" />
                  <Button type="button" variant="secondary" onClick={() => removeScheduleRow(index)}>Remove</Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={addScheduleRow}>Add arrears row</Button>
            <div className="text-sm">Calculated arrears total: £{Number(facts.arrears_total || 0).toFixed(2)}</div>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {errors.map((error) => <div key={error}>• {error}</div>)}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button type="button" variant="secondary" onClick={previous} disabled={activeStep === 0 || saving}>Back</Button>
        <Button type="button" onClick={next} disabled={saving}>{activeStep === config.steps.length - 1 ? 'Review document' : 'Save & continue'}</Button>
      </div>
    </div>
  );
}

'use client';

import Image from 'next/image';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';

import { Button, Input } from '@/components/ui';
import { UploadField, type EvidenceFileSummary } from '@/components/wizard/fields/UploadField';
import { WizardFooterNavV3 } from '@/components/wizard/shared/WizardFooterNavV3';
import { WizardMainCardV3 } from '@/components/wizard/shared/WizardMainCardV3';
import { WizardTopBarV3 } from '@/components/wizard/shared/WizardTopBarV3';
import { getResidentialStandaloneProfile } from '@/lib/residential-letting/standalone-profiles';
import { getResidentialStandaloneThemeVars } from '@/lib/residential-letting/standalone-theme';
import { getCaseFacts, saveCaseFacts } from '@/lib/wizard/facts-client';
import {
  calculateArrearsScheduleTotal,
  getResidentialStandaloneCompletionErrors,
  getResidentialStandaloneFlowConfig,
  type ArrearsScheduleRow,
  type StandaloneFieldConfig,
  type StandaloneRepeaterColumnConfig,
  type StandaloneRoomRecord,
  type StandaloneStepConfig,
} from '@/lib/residential-letting/standalone-flow-config';
import {
  type ResidentialLettingProductSku,
} from '@/lib/residential-letting/products';

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

const FIELD_INPUT_CLASS =
  'w-full rounded-2xl border-violet-200 bg-white text-slate-900 shadow-sm focus:border-violet-500 focus:ring-violet-200';

const SELECT_CLASS =
  'mt-2 w-full rounded-2xl border border-violet-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100';

const TEXTAREA_CLASS =
  'mt-2 w-full rounded-2xl border border-violet-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100';

function createRoom(name: string): StandaloneRoomRecord {
  return {
    id: `room_${Math.random().toString(36).slice(2, 9)}`,
    name,
    items: [],
  };
}

function createItemRow() {
  return {
    item: '',
    condition: '',
    cleanliness: '',
    notes: '',
  };
}

function createScheduleRow(field: StandaloneFieldConfig) {
  return { ...(field.emptyRow || {}) };
}

function coerceScalarValue(fieldType: string, value: string | boolean) {
  if (fieldType === 'number' || fieldType === 'currency') {
    return value === '' ? '' : Number(value);
  }

  return value;
}

function isFactFilled(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return !Number.isNaN(value);
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null;
}

function getVisibleFields(step: StandaloneStepConfig, facts: Record<string, any>) {
  return (step.fields || []).filter((field) => !field.visibleWhen || field.visibleWhen(facts));
}

function getStepCompletion(step: StandaloneStepConfig, facts: Record<string, any>) {
  const visibleFields = getVisibleFields(step, facts);
  const requiredFields = visibleFields.filter((field) => field.required);

  if (requiredFields.length === 0) {
    return {
      completed: visibleFields.length > 0
        ? visibleFields.filter((field) => isFactFilled(facts[field.id])).length
        : 0,
      total: visibleFields.length,
      isComplete: true,
    };
  }

  const completed = requiredFields.filter((field) => isFactFilled(facts[field.id])).length;

  return {
    completed,
    total: requiredFields.length,
    isComplete: completed === requiredFields.length,
  };
}

function bootstrapLegacyRooms(loaded: Record<string, any>, key: 'inspection_rooms' | 'inventory_rooms') {
  if (Array.isArray(loaded?.[key]) && loaded[key].length > 0) {
    return loaded[key];
  }

  if (key === 'inspection_rooms' && typeof loaded?.room_list === 'string' && loaded.room_list.trim()) {
    return loaded.room_list
      .split(',')
      .map((name: string) => createRoom(name.trim()))
      .filter((room: StandaloneRoomRecord) => room.name);
  }

  if (
    key === 'inventory_rooms' &&
    typeof loaded?.inventory_room_items === 'string' &&
    loaded.inventory_room_items.trim()
  ) {
    return [{ ...createRoom('General schedule'), notes: loaded.inventory_room_items }];
  }

  return loaded?.[key];
}

function FieldChrome({
  field,
  children,
  accent = false,
}: {
  field: StandaloneFieldConfig;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <section
      className={clsx(
        'standalone-premium-enter rounded-[1.75rem] border p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]',
        accent
          ? 'border-[var(--standalone-border)] bg-[var(--standalone-soft)]/80'
          : 'border-slate-200 bg-white'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-3xl">
          <label className="text-sm font-semibold text-slate-950">{field.label}</label>
          {field.required ? (
            <span className="ml-2 rounded-full bg-slate-950 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
              Required
            </span>
          ) : null}
          {field.helpText ? <p className="mt-2 text-sm leading-6 text-slate-600">{field.helpText}</p> : null}
          {field.description ? (
            <p className="mt-2 text-sm leading-6 text-slate-500">{field.description}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function renderRepeaterInput(
  column: StandaloneRepeaterColumnConfig,
  value: any,
  onChange: (value: any) => void
) {
  if (column.type === 'select') {
    return (
      <select
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        className={SELECT_CLASS}
      >
        <option value="">Select</option>
        {(column.options || []).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (column.type === 'textarea') {
    return (
      <textarea
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className={TEXTAREA_CLASS}
      />
    );
  }

  return (
    <Input
      type={
        column.type === 'date'
          ? 'date'
          : column.type === 'number' || column.type === 'currency'
            ? 'number'
            : 'text'
      }
      step={column.type === 'currency' ? '0.01' : undefined}
      value={value ?? ''}
      placeholder={column.placeholder}
      onChange={(event) => onChange(coerceScalarValue(column.type, event.target.value))}
      className={FIELD_INPUT_CLASS}
      fullWidth
    />
  );
}

export function ResidentialStandaloneSectionFlow({ caseId, jurisdiction, product }: Props) {
  const router = useRouter();
  const config = useMemo(() => getResidentialStandaloneFlowConfig(product), [product]);
  const profile = useMemo(() => getResidentialStandaloneProfile(product), [product]);
  const themeStyle = useMemo(() => getResidentialStandaloneThemeVars(profile.theme), [profile.theme]);

  const [facts, setFacts] = useState<Record<string, any>>({
    jurisdiction,
    property_country: jurisdiction,
    arrears_mode: 'quick_summary',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [uploading, setUploading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [customRoomNames, setCustomRoomNames] = useState<Record<string, string>>({});

  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasHydratedFactsRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      const loaded = await getCaseFacts(caseId);

      const bootstrapFacts = {
        ...loaded,
        inspection_rooms: bootstrapLegacyRooms(loaded || {}, 'inspection_rooms'),
        inventory_rooms: bootstrapLegacyRooms(loaded || {}, 'inventory_rooms'),
      };

      setFacts((current) => ({
        ...current,
        ...bootstrapFacts,
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

  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
      if (saveResetTimeoutRef.current) clearTimeout(saveResetTimeoutRef.current);
    };
  }, []);

  const persistFacts = async (nextFacts: Record<string, any>) => {
    try {
      await saveCaseFacts(caseId, nextFacts, {
        jurisdiction,
        caseType: 'tenancy_agreement',
        product: product as any,
      });
      setSaveState('saved');
      if (saveResetTimeoutRef.current) clearTimeout(saveResetTimeoutRef.current);
      saveResetTimeoutRef.current = setTimeout(() => setSaveState('idle'), 1500);
    } catch (error) {
      console.error('Failed to save standalone wizard facts:', error);
      setSaveState('idle');
    }
  };

  const save = async (nextFacts = facts) => {
    if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
    setSaving(true);
    setSaveState('saving');
    try {
      await persistFacts(nextFacts);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (loading || uploading) return;

    if (!hasHydratedFactsRef.current) {
      hasHydratedFactsRef.current = true;
      return;
    }

    if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
    setSaveState('saving');
    autosaveTimeoutRef.current = setTimeout(() => {
      void persistFacts(facts);
    }, 700);

    return () => {
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
    };
  }, [facts, loading, uploading]);

  const step = config.steps[activeStep];
  const visibleFields = useMemo(() => getVisibleFields(step, facts), [facts, step]);
  const stepCompletion = useMemo(
    () => config.steps.map((configStep) => getStepCompletion(configStep, facts)),
    [config.steps, facts]
  );
  const tabs = useMemo(
    () =>
      config.steps.map((configStep, index) => ({
        id: configStep.id,
        label: configStep.title,
        isCurrent: index === activeStep,
        isComplete: stepCompletion[index]?.isComplete,
        hasIssue: index === activeStep && errors.length > 0,
        onClick: () => setActiveStep(index),
      })),
    [activeStep, config.steps, errors.length, stepCompletion]
  );

  const updateFact = (key: string, value: any) => {
    setFacts((current) => ({ ...current, [key]: value }));
    setErrors([]);
  };

  const toggleMultiSelectValue = (fieldId: string, optionValue: string, checked: boolean) => {
    const next = new Set(Array.isArray(facts[fieldId]) ? facts[fieldId] : []);
    if (checked) next.add(optionValue);
    else next.delete(optionValue);
    updateFact(fieldId, Array.from(next));
  };

  const addScheduleRow = () => {
    const rows = (facts.arrears_schedule_rows || []) as ArrearsScheduleRow[];
    updateFact('arrears_schedule_rows', [...rows, { ...EMPTY_ROW }]);
  };

  const updateScheduleRow = (index: number, key: keyof ArrearsScheduleRow, value: string | number) => {
    const rows = [...((facts.arrears_schedule_rows || []) as ArrearsScheduleRow[])];
    rows[index] = { ...rows[index], [key]: value };

    if (key === 'amount_due' || key === 'amount_paid') {
      rows[index].amount_outstanding =
        Number(rows[index].amount_due || 0) - Number(rows[index].amount_paid || 0);
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

  const updateRepeaterRow = (fieldId: string, index: number, key: string, value: any) => {
    const rows = [...((facts[fieldId] || []) as Record<string, any>[])];
    rows[index] = { ...rows[index], [key]: value };
    updateFact(fieldId, rows);
  };

  const addRepeaterRow = (field: StandaloneFieldConfig) => {
    const rows = [...((facts[field.id] || []) as Record<string, any>[])];
    rows.push(createScheduleRow(field));
    updateFact(field.id, rows);
  };

  const removeRepeaterRow = (fieldId: string, index: number) => {
    const rows = [...((facts[fieldId] || []) as Record<string, any>[])];
    rows.splice(index, 1);
    updateFact(fieldId, rows);
  };

  const addRoom = (field: StandaloneFieldConfig, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const rooms = [...((facts[field.id] || []) as StandaloneRoomRecord[])];
    const exists = rooms.some((room) => room.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) return;
    rooms.push(createRoom(trimmed));
    updateFact(field.id, rooms);
  };

  const updateRoom = (fieldId: string, roomIndex: number, key: keyof StandaloneRoomRecord, value: any) => {
    const rooms = [...((facts[fieldId] || []) as StandaloneRoomRecord[])];
    rooms[roomIndex] = { ...rooms[roomIndex], [key]: value };
    updateFact(fieldId, rooms);
  };

  const removeRoom = (fieldId: string, roomIndex: number) => {
    const rooms = [...((facts[fieldId] || []) as StandaloneRoomRecord[])];
    rooms.splice(roomIndex, 1);
    updateFact(fieldId, rooms);
  };

  const addRoomItem = (fieldId: string, roomIndex: number) => {
    const rooms = [...((facts[fieldId] || []) as StandaloneRoomRecord[])];
    const items = [...(rooms[roomIndex]?.items || [])];
    items.push(createItemRow());
    rooms[roomIndex] = { ...rooms[roomIndex], items };
    updateFact(fieldId, rooms);
  };

  const updateRoomItem = (
    fieldId: string,
    roomIndex: number,
    itemIndex: number,
    key: string,
    value: any
  ) => {
    const rooms = [...((facts[fieldId] || []) as StandaloneRoomRecord[])];
    const items = [...(rooms[roomIndex]?.items || [])];
    items[itemIndex] = { ...items[itemIndex], [key]: value };
    rooms[roomIndex] = { ...rooms[roomIndex], items };
    updateFact(fieldId, rooms);
  };

  const removeRoomItem = (fieldId: string, roomIndex: number, itemIndex: number) => {
    const rooms = [...((facts[fieldId] || []) as StandaloneRoomRecord[])];
    const items = [...(rooms[roomIndex]?.items || [])];
    items.splice(itemIndex, 1);
    rooms[roomIndex] = { ...rooms[roomIndex], items };
    updateFact(fieldId, rooms);
  };

  const next = async () => {
    setErrors([]);
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

    router.push(`/wizard/review?case_id=${encodeURIComponent(caseId)}&product=${product}`);
  };

  const previous = () => {
    if (activeStep > 0) setActiveStep((current) => current - 1);
  };

  const renderAdvisoryField = (field: StandaloneFieldConfig) => {
    const toneClasses =
      field.tone === 'warning'
        ? 'border-amber-200 bg-amber-50 text-amber-950'
        : field.tone === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
          : 'border-[var(--standalone-border)] bg-[var(--standalone-soft)] text-slate-900';

    return (
      <section className={clsx('rounded-[1.75rem] border p-5 shadow-sm', toneClasses)}>
        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          Drafting notes
        </div>
        <h3 className="mt-2 text-lg font-semibold text-current">{field.label}</h3>
        {field.items?.length ? (
          <ul className="mt-4 space-y-3 text-sm leading-6">
            {field.items.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-current/70" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    );
  };

  const renderRepeaterField = (field: StandaloneFieldConfig) => {
    const rows = (facts[field.id] || []) as Record<string, any>[];

    return (
      <FieldChrome field={field} accent>
        <div className="space-y-4">
          {rows.length === 0 ? (
            <div className="rounded-[1.35rem] border border-dashed border-slate-300 bg-white/80 px-4 py-5 text-sm text-slate-600">
              No rows added yet.
            </div>
          ) : null}

          {rows.map((row, rowIndex) => (
            <div key={`${field.id}-${rowIndex}`} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-semibold text-slate-950">Row {rowIndex + 1}</div>
                <button
                  type="button"
                  onClick={() => removeRepeaterRow(field.id, rowIndex)}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  Remove row
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {(field.columns || []).map((column) => (
                  <div key={`${field.id}-${rowIndex}-${column.id}`}>
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {column.label}
                    </div>
                    {renderRepeaterInput(column, row[column.id], (value) =>
                      updateRepeaterRow(field.id, rowIndex, column.id, value)
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => addRepeaterRow(field)}
            className="standalone-premium-hover-lift rounded-[1.25rem] border border-[var(--standalone-border)] bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-400"
          >
            {field.addLabel || 'Add row'}
          </button>
        </div>
      </FieldChrome>
    );
  };

  const renderRoomBuilderField = (field: StandaloneFieldConfig) => {
    const rooms = ((facts[field.id] || []) as StandaloneRoomRecord[]).map((room) => ({
      ...room,
      items: Array.isArray(room.items) ? room.items : [],
    }));
    const roomTemplates = field.roomTemplates || [];
    const draftValue = customRoomNames[field.id] || '';

    return (
      <FieldChrome field={field} accent>
        <div className="space-y-5">
          <div className="rounded-[1.5rem] border border-[var(--standalone-border)] bg-white/85 p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Suggested rooms
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {roomTemplates.map((template) => {
                const exists = rooms.some((room) => room.name.toLowerCase() === template.toLowerCase());
                return (
                  <button
                    key={`${field.id}-${template}`}
                    type="button"
                    disabled={exists}
                    onClick={() => addRoom(field, template)}
                    className={clsx(
                      'rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition',
                      exists
                        ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                        : 'border-[var(--standalone-border)] bg-[var(--standalone-soft)] text-slate-700 hover:border-slate-400 hover:text-slate-950'
                    )}
                  >
                    {exists ? `${template} added` : `Add ${template}`}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Custom room
            </div>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <Input
                value={draftValue}
                onChange={(event) =>
                  setCustomRoomNames((current) => ({ ...current, [field.id]: event.target.value }))
                }
                placeholder="e.g. Conservatory, loft room, rear garden"
                className={FIELD_INPUT_CLASS}
                fullWidth
              />
              <button
                type="button"
                onClick={() => {
                  addRoom(field, draftValue);
                  setCustomRoomNames((current) => ({ ...current, [field.id]: '' }));
                }}
                className="rounded-[1.2rem] bg-[var(--standalone-accent)] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
              >
                Add custom room
              </button>
            </div>
          </div>

          {rooms.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/70 px-5 py-8 text-center text-sm text-slate-600">
              Add at least one room so the final document can build structured room sections.
            </div>
          ) : null}

          <div className="space-y-4">
            {rooms.map((room, roomIndex) => {
              const inventoryMode = field.roomMode === 'inventory';

              return (
                <section
                  key={room.id || `${field.id}-${roomIndex}`}
                  className="standalone-premium-enter rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-[1rem] bg-[var(--standalone-soft)] p-3">
                        <Image
                          src={profile.stepIcons.rooms || profile.icon}
                          alt=""
                          width={38}
                          height={38}
                          className="h-9 w-9 object-contain"
                        />
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Room {roomIndex + 1}
                        </div>
                        <div className="text-base font-semibold text-slate-950">{room.name || 'Untitled room'}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeRoom(field.id, roomIndex)}
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                    >
                      Remove room
                    </button>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Room name
                      </div>
                      <Input
                        value={room.name || ''}
                        onChange={(event) => updateRoom(field.id, roomIndex, 'name', event.target.value)}
                        className={FIELD_INPUT_CLASS}
                        fullWidth
                      />
                    </div>

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Condition summary
                      </div>
                      <Input
                        value={room.condition || ''}
                        onChange={(event) => updateRoom(field.id, roomIndex, 'condition', event.target.value)}
                        placeholder={inventoryMode ? 'Overall condition' : 'Overall condition / presentation'}
                        className={FIELD_INPUT_CLASS}
                        fullWidth
                      />
                    </div>

                    {inventoryMode ? (
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Cleanliness
                        </div>
                        <Input
                          value={room.cleanliness || ''}
                          onChange={(event) =>
                            updateRoom(field.id, roomIndex, 'cleanliness', event.target.value)
                          }
                          placeholder="e.g. Professionally cleaned"
                          className={FIELD_INPUT_CLASS}
                          fullWidth
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Fixtures and fittings
                        </div>
                        <Input
                          value={room.fixtures || ''}
                          onChange={(event) => updateRoom(field.id, roomIndex, 'fixtures', event.target.value)}
                          placeholder="Key fixtures or fittings inspected"
                          className={FIELD_INPUT_CLASS}
                          fullWidth
                        />
                      </div>
                    )}

                    {!inventoryMode ? (
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Photo or evidence reference
                        </div>
                        <Input
                          value={room.photo_reference || ''}
                          onChange={(event) =>
                            updateRoom(field.id, roomIndex, 'photo_reference', event.target.value)
                          }
                          placeholder="e.g. Photos 11-16"
                          className={FIELD_INPUT_CLASS}
                          fullWidth
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {!inventoryMode ? (
                      <>
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Defects or issues
                          </div>
                          <textarea
                            rows={4}
                            value={room.defects || ''}
                            onChange={(event) => updateRoom(field.id, roomIndex, 'defects', event.target.value)}
                            className={TEXTAREA_CLASS}
                          />
                        </div>
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Follow-up actions
                          </div>
                          <textarea
                            rows={4}
                            value={room.actions || ''}
                            onChange={(event) => updateRoom(field.id, roomIndex, 'actions', event.target.value)}
                            className={TEXTAREA_CLASS}
                          />
                        </div>
                      </>
                    ) : null}

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {inventoryMode ? 'Room notes' : 'Additional notes'}
                      </div>
                      <textarea
                        rows={4}
                        value={room.notes || ''}
                        onChange={(event) => updateRoom(field.id, roomIndex, 'notes', event.target.value)}
                        className={TEXTAREA_CLASS}
                      />
                    </div>

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {inventoryMode ? 'Evidence reference' : 'Occupier comments'}
                      </div>
                      <textarea
                        rows={4}
                        value={inventoryMode ? room.photo_reference || '' : room.tenant_comments || ''}
                        onChange={(event) =>
                          updateRoom(
                            field.id,
                            roomIndex,
                            inventoryMode ? 'photo_reference' : 'tenant_comments',
                            event.target.value
                          )
                        }
                        className={TEXTAREA_CLASS}
                      />
                    </div>
                  </div>

                  {inventoryMode ? (
                    <div className="mt-5 rounded-[1.5rem] border border-[var(--standalone-border)] bg-[var(--standalone-soft)]/70 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Item rows
                          </div>
                          <div className="mt-1 text-sm text-slate-600">
                            Build the item-level condition schedule for this room.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => addRoomItem(field.id, roomIndex)}
                          className="rounded-[1.1rem] bg-[var(--standalone-accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
                        >
                          Add item row
                        </button>
                      </div>

                      <div className="mt-4 space-y-3">
                        {(room.items || []).length === 0 ? (
                          <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-white/80 px-4 py-5 text-sm text-slate-600">
                            No item rows added yet.
                          </div>
                        ) : null}

                        {(room.items || []).map((item, itemIndex) => (
                          <div
                            key={`${room.id}-item-${itemIndex}`}
                            className="rounded-[1.3rem] border border-slate-200 bg-white p-4 shadow-sm"
                          >
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                              <div className="text-sm font-semibold text-slate-950">Item {itemIndex + 1}</div>
                              <button
                                type="button"
                                onClick={() => removeRoomItem(field.id, roomIndex, itemIndex)}
                                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                              >
                                Remove item
                              </button>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                  Item
                                </div>
                                <Input
                                  value={item.item || ''}
                                  onChange={(event) =>
                                    updateRoomItem(field.id, roomIndex, itemIndex, 'item', event.target.value)
                                  }
                                  className={FIELD_INPUT_CLASS}
                                  fullWidth
                                />
                              </div>
                              <div>
                                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                  Condition
                                </div>
                                <Input
                                  value={item.condition || ''}
                                  onChange={(event) =>
                                    updateRoomItem(
                                      field.id,
                                      roomIndex,
                                      itemIndex,
                                      'condition',
                                      event.target.value
                                    )
                                  }
                                  className={FIELD_INPUT_CLASS}
                                  fullWidth
                                />
                              </div>
                              <div>
                                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                  Cleanliness
                                </div>
                                <Input
                                  value={item.cleanliness || ''}
                                  onChange={(event) =>
                                    updateRoomItem(
                                      field.id,
                                      roomIndex,
                                      itemIndex,
                                      'cleanliness',
                                      event.target.value
                                    )
                                  }
                                  className={FIELD_INPUT_CLASS}
                                  fullWidth
                                />
                              </div>
                              <div>
                                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                  Notes
                                </div>
                                <textarea
                                  rows={3}
                                  value={item.notes || ''}
                                  onChange={(event) =>
                                    updateRoomItem(field.id, roomIndex, itemIndex, 'notes', event.target.value)
                                  }
                                  className={TEXTAREA_CLASS}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        </div>
      </FieldChrome>
    );
  };

  const renderArrearsSchedulePanel = () => {
    const rows = (facts.arrears_schedule_rows || []) as ArrearsScheduleRow[];

    return (
      <section className="standalone-premium-enter rounded-[1.85rem] border border-[var(--standalone-border)] bg-[var(--standalone-soft)]/80 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Attached arrears schedule
            </div>
            <h3 className="mt-1 text-lg font-semibold text-slate-950">Detailed arrears chronology</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Build the schedule row by row so the letter pack can show missed periods, payments received,
              and the resulting outstanding balance clearly.
            </p>
          </div>
          <button
            type="button"
            onClick={addScheduleRow}
            className="rounded-[1.2rem] bg-[var(--standalone-accent)] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
          >
            Add arrears row
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {rows.length === 0 ? (
            <div className="rounded-[1.35rem] border border-dashed border-slate-300 bg-white/80 px-5 py-6 text-sm text-slate-600">
              No arrears rows added yet.
            </div>
          ) : null}

          {rows.map((row, index) => (
            <div key={`arrears-row-${index}`} className="rounded-[1.45rem] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-semibold text-slate-950">Row {index + 1}</div>
                <button
                  type="button"
                  onClick={() => removeScheduleRow(index)}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  Remove row
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Due date</div>
                  <Input
                    type="date"
                    value={row.due_date || ''}
                    onChange={(event) => updateScheduleRow(index, 'due_date', event.target.value)}
                    className={FIELD_INPUT_CLASS}
                    fullWidth
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Period covered</div>
                  <Input
                    value={row.period_covered || ''}
                    onChange={(event) => updateScheduleRow(index, 'period_covered', event.target.value)}
                    className={FIELD_INPUT_CLASS}
                    fullWidth
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Amount due</div>
                  <Input
                    type="number"
                    step="0.01"
                    value={row.amount_due ?? ''}
                    onChange={(event) => updateScheduleRow(index, 'amount_due', Number(event.target.value))}
                    className={FIELD_INPUT_CLASS}
                    fullWidth
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Amount paid</div>
                  <Input
                    type="number"
                    step="0.01"
                    value={row.amount_paid ?? ''}
                    onChange={(event) => updateScheduleRow(index, 'amount_paid', Number(event.target.value))}
                    className={FIELD_INPUT_CLASS}
                    fullWidth
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Outstanding</div>
                  <Input
                    type="number"
                    step="0.01"
                    value={row.amount_outstanding ?? ''}
                    onChange={(event) =>
                      updateScheduleRow(index, 'amount_outstanding', Number(event.target.value))
                    }
                    className={FIELD_INPUT_CLASS}
                    fullWidth
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Payment received date
                  </div>
                  <Input
                    type="date"
                    value={row.payment_received_date || ''}
                    onChange={(event) =>
                      updateScheduleRow(index, 'payment_received_date', event.target.value)
                    }
                    className={FIELD_INPUT_CLASS}
                    fullWidth
                  />
                </div>
                <div className="md:col-span-2 xl:col-span-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Note</div>
                  <Input
                    value={row.note || ''}
                    onChange={(event) => updateScheduleRow(index, 'note', event.target.value)}
                    className={FIELD_INPUT_CLASS}
                    fullWidth
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-[1.3rem] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
          Calculated arrears total: GBP {Number(facts.arrears_total || 0).toFixed(2)}
        </div>
      </section>
    );
  };

  const renderField = (field: StandaloneFieldConfig) => {
    if (field.type === 'advisory') {
      return renderAdvisoryField(field);
    }

    if (field.type === 'repeater') {
      return renderRepeaterField(field);
    }

    if (field.type === 'room_builder') {
      return renderRoomBuilderField(field);
    }

    if (field.type === 'upload') {
      return (
        <FieldChrome field={field} accent>
          <UploadField
            caseId={caseId}
            questionId={field.id}
            jurisdiction={jurisdiction}
            label={undefined}
            description={undefined}
            evidenceCategory={field.evidenceCategory}
            required={field.required}
            value={(facts[field.id] || []) as EvidenceFileSummary[]}
            onChange={(files) => updateFact(field.id, files)}
            onUploadingChange={setUploading}
            hideEmailActions
          />
        </FieldChrome>
      );
    }

    if (field.type === 'checkbox') {
      return (
        <section className="rounded-[1.65rem] border border-slate-200 bg-white p-5 shadow-sm">
          <label className="flex cursor-pointer items-start gap-4">
            <input
              type="checkbox"
              checked={Boolean(facts[field.id])}
              onChange={(event) => updateFact(field.id, event.target.checked)}
              className="mt-1 h-5 w-5 rounded border-slate-300 text-slate-950 focus:ring-slate-300"
            />
            <div>
              <div className="text-sm font-semibold text-slate-950">
                {field.label}
                {field.required ? (
                  <span className="ml-2 rounded-full bg-slate-950 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                    Required
                  </span>
                ) : null}
              </div>
              {field.helpText ? <p className="mt-2 text-sm leading-6 text-slate-600">{field.helpText}</p> : null}
            </div>
          </label>
        </section>
      );
    }

    if (field.type === 'radio') {
      return (
        <FieldChrome field={field}>
          <div className="grid gap-3 md:grid-cols-2">
            {(field.options || []).map((option) => {
              const selected = facts[field.id] === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateFact(field.id, option.value)}
                  className={clsx(
                    'standalone-premium-hover-lift rounded-[1.3rem] border px-4 py-4 text-left transition',
                    selected
                      ? 'border-slate-950 bg-[var(--standalone-accent-strong)] text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  )}
                >
                  <div className="text-sm font-semibold">{option.label}</div>
                </button>
              );
            })}
          </div>
        </FieldChrome>
      );
    }

    if (field.type === 'multiselect') {
      const selectedValues = new Set(Array.isArray(facts[field.id]) ? facts[field.id] : []);

      return (
        <FieldChrome field={field}>
          <div className="grid gap-3 md:grid-cols-2">
            {(field.options || []).map((option) => {
              const selected = selectedValues.has(option.value);
              return (
                <label
                  key={option.value}
                  className={clsx(
                    'flex cursor-pointer items-start gap-3 rounded-[1.3rem] border px-4 py-4 transition',
                    selected
                      ? 'border-slate-950 bg-[var(--standalone-soft)] text-slate-950'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(event) => toggleMultiSelectValue(field.id, option.value, event.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-slate-300 text-slate-950 focus:ring-slate-300"
                  />
                  <span className="text-sm font-medium">{option.label}</span>
                </label>
              );
            })}
          </div>
        </FieldChrome>
      );
    }

    if (field.type === 'select') {
      return (
        <FieldChrome field={field}>
          <select
            value={facts[field.id] || ''}
            onChange={(event) => updateFact(field.id, event.target.value)}
            className={SELECT_CLASS}
          >
            <option value="">Select</option>
            {(field.options || []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FieldChrome>
      );
    }

    if (field.type === 'textarea') {
      return (
        <FieldChrome field={field}>
          <textarea
            rows={5}
            value={facts[field.id] || ''}
            onChange={(event) => updateFact(field.id, event.target.value)}
            placeholder={field.placeholder}
            className={TEXTAREA_CLASS}
          />
        </FieldChrome>
      );
    }

    return (
      <FieldChrome field={field}>
        <Input
          type={field.type === 'date' ? 'date' : field.type === 'number' || field.type === 'currency' ? 'number' : 'text'}
          step={field.type === 'currency' ? '0.01' : undefined}
          value={facts[field.id] ?? ''}
          placeholder={field.placeholder}
          onChange={(event) => updateFact(field.id, coerceScalarValue(field.type, event.target.value))}
          className={FIELD_INPUT_CLASS}
          fullWidth
        />
      </FieldChrome>
    );
  };

  const ctaLabel = uploading
    ? 'Uploading...'
    : activeStep === config.steps.length - 1
      ? 'Review document'
      : 'Save & continue';

  if (loading) {
    return (
      <div
        className="min-h-screen"
        style={{
          ...themeStyle,
          backgroundColor: '#150733',
          backgroundImage:
            "linear-gradient(180deg, rgba(0,0,0,0.38) 0%, rgba(10,5,28,0.52) 45%, rgba(30,12,72,0.64) 100%), url('/images/bg.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-4">
          <div className="w-full max-w-xl rounded-2xl border border-violet-200/40 bg-white/95 p-8 text-center shadow-[0_24px_60px_rgba(20,8,48,0.22)] backdrop-blur">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50">
              <Image src={profile.icon} alt="" width={44} height={44} className="h-11 w-11 object-contain" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold text-violet-950">
              Preparing your {config.documentTitle} wizard
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              We are loading the structured sections, saved facts, and England-only drafting flow for
              this document.
            </p>
            <div className="mx-auto mt-6 h-2 w-full max-w-xs overflow-hidden rounded-full bg-violet-100">
              <div className="h-full w-2/3 rounded-full bg-violet-500" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-28 lg:pb-14"
      style={{
        ...themeStyle,
        backgroundColor: '#150733',
        backgroundImage:
          "linear-gradient(180deg, rgba(0,0,0,0.38) 0%, rgba(10,5,28,0.52) 45%, rgba(30,12,72,0.64) 100%), url('/images/bg.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
      }}
    >
      <WizardTopBarV3 tabs={tabs} getStepMetadataForId={() => undefined} />
      <div
        style={{
          height:
            'calc(var(--site-header-height) + var(--s21-banner-height) + var(--wizard-topbar-height))',
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-[920px] px-4 pb-10 pt-4">
        <WizardMainCardV3
          sectionTitle={step.title}
          sectionDescription={step.description}
          stepIconPath={profile.stepIcons[step.id] || profile.icon}
          stepNumber={activeStep + 1}
          totalSteps={config.steps.length}
          navigation={
            <div className="hidden lg:block">
              <WizardFooterNavV3
                leftSlot={
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={previous}
                    disabled={activeStep === 0 || saving || uploading}
                    className="!rounded-xl !border !border-violet-200 !bg-white !px-6 !py-3 !text-violet-950 !shadow-sm"
                  >
                    Back
                  </Button>
                }
                centerSlot={
                  <span>
                    {stepCompletion[activeStep].completed}/{stepCompletion[activeStep].total || 0} required answered
                  </span>
                }
                rightSlot={
                  <Button
                    type="button"
                    onClick={next}
                    disabled={saving || uploading}
                    className="!rounded-xl !border-0 !bg-violet-600 !px-6 !py-3 !text-white !shadow-sm hover:!bg-violet-700"
                  >
                    {ctaLabel}
                  </Button>
                }
              />
            </div>
          }
        >
          <div className="space-y-6">
            {profile.cautionBanner ? (
              <div
                className={clsx(
                  'rounded-2xl border p-5 shadow-sm',
                  profile.cautionBanner.tone === 'warning'
                    ? 'border-amber-200 bg-amber-50 text-amber-950'
                    : 'border-sky-200 bg-sky-50 text-sky-950'
                )}
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-current/70">
                  {profile.cautionBanner.title}
                </div>
                <p className="mt-2 text-sm leading-7">{profile.cautionBanner.body}</p>
              </div>
            ) : null}

            <section className="space-y-4">
              {visibleFields.map((field) => (
                <div key={field.id}>{renderField(field)}</div>
              ))}
            </section>

            {product === 'rent_arrears_letter' && facts.arrears_mode === 'detailed_schedule'
              ? renderArrearsSchedulePanel()
              : null}

            {errors.length > 0 ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50/95 p-5 text-sm text-rose-800 shadow-[0_18px_45px_rgba(225,29,72,0.08)]">
                {errors.map((error) => (
                  <div key={error} className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-rose-500" />
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </WizardMainCardV3>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-violet-200 bg-white/95 px-4 py-3 shadow-[0_-16px_30px_rgba(20,8,48,0.12)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-[1240px] items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={previous}
            disabled={activeStep === 0 || saving || uploading}
            className="flex-1 !rounded-xl !border !border-violet-200 !bg-white !px-4 !py-3 !text-violet-950 !shadow-sm"
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={next}
            disabled={saving || uploading}
            className="flex-[1.3] !rounded-xl !border-0 !bg-violet-600 !px-4 !py-3 !text-white !shadow-sm hover:!bg-violet-700"
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

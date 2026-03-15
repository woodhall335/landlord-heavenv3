'use client';

import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button, Input } from '@/components/ui';
import { UploadField, type EvidenceFileSummary } from '@/components/wizard/fields/UploadField';
import { getResidentialStandaloneProfile } from '@/lib/residential-letting/standalone-profiles';
import { getCaseFacts, saveCaseFacts } from '@/lib/wizard/facts-client';
import {
  calculateArrearsScheduleTotal,
  getDefaultStandaloneRoomTemplates,
  getResidentialStandaloneCompletionErrors,
  getResidentialStandaloneFlowConfig,
  type ArrearsScheduleRow,
  type StandaloneFieldConfig,
  type StandaloneRepeaterColumnConfig,
  type StandaloneRoomRecord,
} from '@/lib/residential-letting/standalone-flow-config';
import { RESIDENTIAL_LETTING_PRODUCTS, type ResidentialLettingProductSku } from '@/lib/residential-letting/products';

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

function coerceScalarValue(fieldType: string, value: string | boolean) {
  if (fieldType === 'number' || fieldType === 'currency') {
    return value === '' ? '' : Number(value);
  }
  return value;
}

function createRoom(name: string): StandaloneRoomRecord {
  return {
    id: `room_${Math.random().toString(36).slice(2, 9)}`,
    name,
    items: [],
  };
}

function createItemRow() {
  return { item: '', condition: '', cleanliness: '', notes: '' };
}

function createScheduleRow(field: StandaloneFieldConfig) {
  return { ...(field.emptyRow || {}) };
}

function PremiumPanel({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{title}</div>
      <ul className="mt-4 space-y-3 text-sm text-slate-700">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-slate-950" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
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
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
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
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
      />
    );
  }

  return (
    <Input
      type={column.type === 'date' ? 'date' : column.type === 'number' || column.type === 'currency' ? 'number' : 'text'}
      value={value || ''}
      placeholder={column.placeholder}
      onChange={(event) => onChange(coerceScalarValue(column.type, event.target.value))}
    />
  );
}

export function ResidentialStandaloneSectionFlow({ caseId, jurisdiction, product }: Props) {
  const router = useRouter();
  const config = useMemo(() => getResidentialStandaloneFlowConfig(product), [product]);
  const profile = useMemo(() => getResidentialStandaloneProfile(product), [product]);
  const productMeta = RESIDENTIAL_LETTING_PRODUCTS[product];
  const [facts, setFacts] = useState<Record<string, any>>({
    jurisdiction,
    property_country: jurisdiction,
    arrears_mode: 'quick_summary',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const loaded = await getCaseFacts(caseId);
      const bootstrapFacts = {
        ...loaded,
        inspection_rooms:
          Array.isArray(loaded?.inspection_rooms) && loaded.inspection_rooms.length > 0
            ? loaded.inspection_rooms
            : typeof loaded?.room_list === 'string' && loaded.room_list.trim()
              ? loaded.room_list.split(',').map((name: string) => createRoom(name.trim())).filter((room: StandaloneRoomRecord) => room.name)
              : loaded?.inspection_rooms,
        inventory_rooms:
          Array.isArray(loaded?.inventory_rooms) && loaded.inventory_rooms.length > 0
            ? loaded.inventory_rooms
            : typeof loaded?.inventory_room_items === 'string' && loaded.inventory_room_items.trim()
              ? [{ ...createRoom('General schedule'), notes: loaded.inventory_room_items }]
              : loaded?.inventory_rooms,
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
    const rooms = [...((facts[field.id] || []) as StandaloneRoomRecord[])];
    rooms.push(createRoom(name));
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

  const updateRoomItem = (fieldId: string, roomIndex: number, itemIndex: number, key: string, value: any) => {
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

    router.push(`/wizard/review?case_id=${caseId}&product=${product}`);
  };

  const previous = () => {
    if (activeStep > 0) setActiveStep((current) => current - 1);
  };

  if (loading) return <div className="p-8">Loading standalone {config.documentTitle} wizard...</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-[calc(var(--site-header-height)+var(--s21-banner-height)+1.5rem)] sm:px-6">
      <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-[#3f3327] p-6 text-white shadow-2xl sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[140px,1fr,260px] lg:items-center">
          <div className="mx-auto rounded-[1.75rem] bg-white/8 p-4">
            <Image src={profile.icon} alt="" width={120} height={120} className="h-24 w-24 object-contain" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.26em] text-white/60">{profile.eyebrow}</div>
            <h1 className="mt-3 text-3xl font-semibold leading-tight">{config.documentTitle}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/80">{profile.heroSubtitle}</p>
            <ul className="mt-4 grid gap-2 text-sm text-white/90 md:grid-cols-3">
              {profile.heroBullets.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5 text-sm">
            <div className="font-semibold uppercase tracking-[0.22em] text-white/60">Premium Output</div>
            <div className="mt-3 text-3xl font-semibold">{productMeta.displayPrice}</div>
            <p className="mt-2 text-white/75">Step {activeStep + 1} of {config.steps.length}</p>
            <p className="mt-2 text-white/75">England only</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px,1fr,280px]">
        <aside className="space-y-4">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Progress</div>
            <div className="mt-4 space-y-3">
              {config.steps.map((configStep, index) => {
                const iconPath = profile.stepIcons[configStep.id] || profile.icon;
                const isActive = index === activeStep;
                const isComplete = index < activeStep;
                return (
                  <button
                    key={configStep.id}
                    type="button"
                    onClick={() => setActiveStep(index)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                      isActive
                        ? 'bg-slate-950 text-white'
                        : isComplete
                          ? 'bg-slate-100 text-slate-950'
                          : 'bg-[#f7f4ec] text-slate-700'
                    }`}
                  >
                    <Image src={iconPath} alt="" width={42} height={42} className="h-10 w-10 rounded-xl object-contain" />
                    <div className="min-w-0">
                      <div className="text-xs uppercase tracking-[0.2em] opacity-70">Step {index + 1}</div>
                      <div className="truncate text-sm font-semibold">{configStep.title}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="space-y-5">
          {(config.warnings.length > 0 || profile.cautionBanner) && (
            <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950 shadow-sm">
              {profile.cautionBanner ? <div className="font-semibold">{profile.cautionBanner.title}</div> : null}
              {profile.cautionBanner ? <p className="mt-2 leading-6">{profile.cautionBanner.body}</p> : null}
              {config.warnings.map((warning) => (
                <div key={warning} className="mt-2">- {warning}</div>
              ))}
            </div>
          )}

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">{step.title}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">{step.description}</p>
              </div>
              <Image
                src={profile.stepIcons[step.id] || profile.icon}
                alt=""
                width={60}
                height={60}
                className="hidden h-14 w-14 rounded-2xl object-contain sm:block"
              />
            </div>

            <div className="mt-6 space-y-5">
              {(step.fields || []).map((field) => {
                if (field.visibleWhen && !field.visibleWhen(facts)) return null;
                const value = facts[field.id];

                if (field.type === 'advisory') {
                  return (
                    <div key={field.id} className="rounded-[1.5rem] border border-sky-200 bg-sky-50 p-5">
                      <div className="text-sm font-semibold text-slate-950">{field.label}</div>
                      <ul className="mt-3 space-y-2 text-sm text-slate-700">
                        {(field.items || []).map((item) => (
                          <li key={item}>- {item}</li>
                        ))}
                      </ul>
                    </div>
                  );
                }

                if (field.type === 'select') {
                  return (
                    <label key={field.id} className="block text-sm">
                      <div className="font-medium text-slate-900">{field.label}{field.required ? ' *' : ''}</div>
                      <select
                        value={value || ''}
                        onChange={(event) => updateFact(field.id, event.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5"
                      >
                        <option value="">Select</option>
                        {(field.options || []).map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </label>
                  );
                }

                if (field.type === 'radio') {
                  return (
                    <div key={field.id}>
                      <div className="font-medium text-slate-900">{field.label}{field.required ? ' *' : ''}</div>
                      <div className="mt-2 grid gap-3 sm:grid-cols-3">
                        {(field.options || []).map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => updateFact(field.id, option.value)}
                            className={`rounded-2xl border px-4 py-3 text-left text-sm ${
                              value === option.value ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-700'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (field.type === 'multiselect') {
                  const selected = Array.isArray(value) ? value : [];
                  return (
                    <div key={field.id}>
                      <div className="font-medium text-slate-900">{field.label}</div>
                      <div className="mt-2 grid gap-3 sm:grid-cols-2">
                        {(field.options || []).map((option) => {
                          const checked = selected.includes(option.value);
                          return (
                            <label key={option.value} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  updateFact(
                                    field.id,
                                    checked ? selected.filter((item) => item !== option.value) : [...selected, option.value]
                                  );
                                }}
                              />
                              {option.label}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                if (field.type === 'textarea') {
                  return (
                    <label key={field.id} className="block text-sm">
                      <div className="font-medium text-slate-900">{field.label}{field.required ? ' *' : ''}</div>
                      <textarea
                        value={value || ''}
                        onChange={(event) => updateFact(field.id, event.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5"
                        rows={4}
                      />
                      {field.helpText ? <p className="mt-1 text-xs text-slate-500">{field.helpText}</p> : null}
                    </label>
                  );
                }

                if (field.type === 'checkbox') {
                  return (
                    <label key={field.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#f7f4ec] px-4 py-3 text-sm text-slate-800">
                      <input type="checkbox" checked={Boolean(value)} onChange={(event) => updateFact(field.id, event.target.checked)} />
                      {field.label}{field.required ? ' *' : ''}
                    </label>
                  );
                }

                if (field.type === 'upload') {
                  return (
                    <div key={field.id} className="rounded-[1.5rem] border border-slate-200 bg-[#faf9f5] p-4">
                      <UploadField
                        caseId={caseId}
                        questionId={field.id}
                        label={field.label}
                        description={field.helpText}
                        evidenceCategory={field.evidenceCategory}
                        value={(value || []) as EvidenceFileSummary[]}
                        onChange={(files) => updateFact(field.id, files)}
                        onUploadingChange={setUploading}
                        hideEmailActions
                      />
                    </div>
                  );
                }

                if (field.type === 'repeater') {
                  const rows = Array.isArray(value) ? value : [];
                  return (
                    <div key={field.id} className="rounded-[1.5rem] border border-slate-200 bg-[#faf9f5] p-5">
                      <div className="font-medium text-slate-900">{field.label}{field.required ? ' *' : ''}</div>
                      <div className="mt-4 space-y-4">
                        {rows.map((row, index) => (
                          <div key={`${field.id}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              {(field.columns || []).map((column) => (
                                <label key={column.id} className="block text-sm">
                                  <div className="font-medium text-slate-800">{column.label}{column.required ? ' *' : ''}</div>
                                  {renderRepeaterInput(column, row?.[column.id], (nextValue) => updateRepeaterRow(field.id, index, column.id, nextValue))}
                                </label>
                              ))}
                            </div>
                            <Button type="button" variant="secondary" className="mt-4" onClick={() => removeRepeaterRow(field.id, index)}>
                              Remove row
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button type="button" variant="secondary" className="mt-4" onClick={() => addRepeaterRow(field)}>
                        {field.addLabel || 'Add row'}
                      </Button>
                    </div>
                  );
                }

                if (field.type === 'room_builder') {
                  const rooms = Array.isArray(value) ? (value as StandaloneRoomRecord[]) : [];
                  const templates = field.roomTemplates || getDefaultStandaloneRoomTemplates(field.roomMode || 'inspection');
                  return (
                    <div key={field.id} className="rounded-[1.5rem] border border-slate-200 bg-[#faf9f5] p-5">
                      <div className="font-medium text-slate-900">{field.label}{field.required ? ' *' : ''}</div>
                      <p className="mt-1 text-xs text-slate-500">Add standard rooms, custom rooms, and structured condition or inventory details.</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {templates.map((template) => (
                          <Button key={template} type="button" variant="secondary" onClick={() => addRoom(field, template)}>
                            Add {template}
                          </Button>
                        ))}
                        <Button type="button" variant="secondary" onClick={() => addRoom(field, `Custom room ${rooms.length + 1}`)}>
                          Add custom room
                        </Button>
                      </div>
                      <div className="mt-5 space-y-5">
                        {rooms.map((room, roomIndex) => (
                          <div key={room.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                            <div className="flex items-center justify-between gap-3">
                              <Input value={room.name} onChange={(event) => updateRoom(field.id, roomIndex, 'name', event.target.value)} />
                              <Button type="button" variant="secondary" onClick={() => removeRoom(field.id, roomIndex)}>
                                Remove room
                              </Button>
                            </div>
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                              <label className="block text-sm"><div className="font-medium text-slate-800">Condition summary</div><textarea value={room.condition || ''} onChange={(event) => updateRoom(field.id, roomIndex, 'condition', event.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" /></label>
                              <label className="block text-sm"><div className="font-medium text-slate-800">Cleanliness / presentation</div><textarea value={room.cleanliness || ''} onChange={(event) => updateRoom(field.id, roomIndex, 'cleanliness', event.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" /></label>
                              <label className="block text-sm"><div className="font-medium text-slate-800">Fixtures, fittings, walls, floors</div><textarea value={room.fixtures || ''} onChange={(event) => updateRoom(field.id, roomIndex, 'fixtures', event.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" /></label>
                              <label className="block text-sm"><div className="font-medium text-slate-800">Defects or maintenance issues</div><textarea value={room.defects || ''} onChange={(event) => updateRoom(field.id, roomIndex, 'defects', event.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" /></label>
                              <label className="block text-sm"><div className="font-medium text-slate-800">Follow-up or action note</div><textarea value={room.actions || ''} onChange={(event) => updateRoom(field.id, roomIndex, 'actions', event.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" /></label>
                              <label className="block text-sm"><div className="font-medium text-slate-800">Tenant comments / room note</div><textarea value={room.tenant_comments || ''} onChange={(event) => updateRoom(field.id, roomIndex, 'tenant_comments', event.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" /></label>
                              <label className="block text-sm md:col-span-2"><div className="font-medium text-slate-800">Photo reference</div><Input value={room.photo_reference || ''} onChange={(event) => updateRoom(field.id, roomIndex, 'photo_reference', event.target.value)} placeholder="e.g. IMG-001 to IMG-008" /></label>
                            </div>
                            <div className="mt-5 rounded-[1.25rem] border border-slate-200 bg-[#faf9f5] p-4">
                              <div className="font-medium text-slate-900">Room items</div>
                              <div className="mt-3 space-y-3">
                                {(room.items || []).map((item, itemIndex) => (
                                  <div key={`${room.id}-item-${itemIndex}`} className="rounded-xl border border-slate-200 bg-white p-4">
                                    <div className="grid gap-3 md:grid-cols-2">
                                      <Input value={item.item || ''} placeholder="Item" onChange={(event) => updateRoomItem(field.id, roomIndex, itemIndex, 'item', event.target.value)} />
                                      <Input value={item.condition || ''} placeholder="Condition" onChange={(event) => updateRoomItem(field.id, roomIndex, itemIndex, 'condition', event.target.value)} />
                                      <Input value={item.cleanliness || ''} placeholder="Cleanliness" onChange={(event) => updateRoomItem(field.id, roomIndex, itemIndex, 'cleanliness', event.target.value)} />
                                      <Input value={item.notes || ''} placeholder="Notes" onChange={(event) => updateRoomItem(field.id, roomIndex, itemIndex, 'notes', event.target.value)} />
                                    </div>
                                    <Button type="button" variant="secondary" className="mt-3" onClick={() => removeRoomItem(field.id, roomIndex, itemIndex)}>
                                      Remove item
                                    </Button>
                                  </div>
                                ))}
                              </div>
                              <Button type="button" variant="secondary" className="mt-3" onClick={() => addRoomItem(field.id, roomIndex)}>
                                Add room item
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <label key={field.id} className="block text-sm">
                    <div className="font-medium text-slate-900">{field.label}{field.required ? ' *' : ''}</div>
                    <Input
                      type={field.type === 'number' || field.type === 'currency' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                      value={value || ''}
                      placeholder={field.placeholder}
                      onChange={(event) => updateFact(field.id, coerceScalarValue(field.type, event.target.value))}
                    />
                    {field.helpText ? <p className="mt-1 text-xs text-slate-500">{field.helpText}</p> : null}
                  </label>
                );
              })}

              {product === 'rent_arrears_letter' && facts.arrears_mode === 'detailed_schedule' && (
                <div className="rounded-[1.5rem] border border-indigo-200 bg-indigo-50 p-5">
                  <div className="text-sm font-semibold text-slate-900">Detailed arrears schedule</div>
                  <div className="mt-4 space-y-4">
                    {((facts.arrears_schedule_rows || []) as ArrearsScheduleRow[]).map((row, index) => (
                      <div className="rounded-2xl border border-indigo-200 bg-white p-4" key={`arrears-row-${index}`}>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                          <Input type="date" value={row.due_date || ''} onChange={(e) => updateScheduleRow(index, 'due_date', e.target.value)} />
                          <Input value={row.period_covered || ''} onChange={(e) => updateScheduleRow(index, 'period_covered', e.target.value)} placeholder="Period" />
                          <Input type="number" value={String(row.amount_due ?? 0)} onChange={(e) => updateScheduleRow(index, 'amount_due', Number(e.target.value))} />
                          <Input type="number" value={String(row.amount_paid ?? 0)} onChange={(e) => updateScheduleRow(index, 'amount_paid', Number(e.target.value))} />
                          <Input type="number" value={String(row.amount_outstanding ?? 0)} onChange={(e) => updateScheduleRow(index, 'amount_outstanding', Number(e.target.value))} />
                          <Input type="date" value={row.payment_received_date || ''} onChange={(e) => updateScheduleRow(index, 'payment_received_date', e.target.value)} />
                          <Input value={row.note || ''} onChange={(e) => updateScheduleRow(index, 'note', e.target.value)} placeholder="Note" />
                        </div>
                        <Button type="button" variant="secondary" className="mt-3" onClick={() => removeScheduleRow(index)}>Remove arrears row</Button>
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="secondary" className="mt-4" onClick={addScheduleRow}>Add arrears row</Button>
                  <div className="mt-3 text-sm text-slate-700">Calculated arrears total: GBP {Number(facts.arrears_total || 0).toFixed(2)}</div>
                </div>
              )}
            </div>
          </div>

          {errors.length > 0 && (
            <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800 shadow-sm">
              {errors.map((error) => <div key={error}>- {error}</div>)}
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button type="button" variant="secondary" onClick={previous} disabled={activeStep === 0 || saving || uploading}>Back</Button>
            <Button type="button" onClick={next} disabled={saving || uploading}>
              {uploading ? 'Uploading...' : activeStep === config.steps.length - 1 ? 'Review premium document' : 'Save & continue'}
            </Button>
          </div>
        </main>

        <aside className="space-y-4">
          <PremiumPanel title="What Gets Drafted" items={profile.outputSections} />
          <PremiumPanel title="Why This Beats A Blank Template" items={profile.heroBullets} />
          <PremiumPanel title="Review Highlights" items={profile.reviewHighlights} />
        </aside>
      </div>
    </div>
  );
}

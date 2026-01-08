/**
 * Collapsible Extracted Fields Component
 *
 * Displays extracted document fields in a collapsible section
 * for improved visual hierarchy on validation pages.
 */

'use client';

import React, { useState } from 'react';
import {
  RiFileTextLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiEyeLine,
} from 'react-icons/ri';

interface ExtractedFieldsSummary {
  notice_type?: string;
  date_served?: string;
  service_date?: string;
  expiry_date?: string;
  property_address?: string;
  tenant_names?: string | string[];
  landlord_name?: string;
  signature_present?: boolean;
  form_6a_used?: boolean;
  form_3_detected?: boolean;
  section_21_detected?: boolean;
  section_8_detected?: boolean;
  grounds_cited?: (string | number)[];
  [key: string]: any;
}

interface ExtractionQualitySummary {
  text_extraction_method?: string;
  is_low_text?: boolean;
  is_metadata_only?: boolean;
  document_markers?: string[];
}

interface CollapsibleExtractedFieldsProps {
  fields: ExtractedFieldsSummary;
  quality?: ExtractionQualitySummary | null;
  /** Start collapsed (default: true for cleaner UI) */
  defaultCollapsed?: boolean;
  className?: string;
}

export function CollapsibleExtractedFields({
  fields,
  quality,
  defaultCollapsed = true,
  className = '',
}: CollapsibleExtractedFieldsProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // Count visible fields
  const fieldCount = Object.entries(fields).filter(([key, value]) => {
    // Skip internal/empty fields
    if (value === undefined || value === null || value === '') return false;
    if (key.startsWith('_')) return false;
    return true;
  }).length;

  if (fieldCount === 0) return null;

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <div className={`rounded-lg border border-blue-100 bg-blue-50 overflow-hidden ${className}`}>
      {/* Header - always visible */}
      <button
        type="button"
        onClick={toggleCollapse}
        className="w-full flex items-center justify-between p-4 hover:bg-blue-100/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-blue-100">
            <RiFileTextLine className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-blue-900">Extracted Information</p>
            <p className="text-xs text-blue-700">
              {fieldCount} field{fieldCount !== 1 ? 's' : ''} detected from document
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {quality?.text_extraction_method === 'vision' && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded bg-blue-200 px-2 py-0.5 text-[10px] font-medium text-blue-800">
              <RiEyeLine className="h-3 w-3" />
              AI Vision
            </span>
          )}
          <div className="p-1 rounded-full bg-blue-100 text-blue-600">
            {isCollapsed ? (
              <RiArrowDownSLine className="h-5 w-5" />
            ) : (
              <RiArrowUpSLine className="h-5 w-5" />
            )}
          </div>
        </div>
      </button>

      {/* Collapsible content */}
      <div
        className={`
          transition-all duration-200 ease-in-out overflow-hidden
          ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}
        `}
      >
        <div className="px-4 pb-4 pt-0 border-t border-blue-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {/* Service Date */}
            {(fields.date_served || fields.service_date) && (
              <FieldRow
                label="Service Date"
                value={fields.date_served || fields.service_date}
              />
            )}

            {/* Expiry Date */}
            {fields.expiry_date && (
              <FieldRow label="Expiry Date" value={fields.expiry_date} />
            )}

            {/* Property Address */}
            {fields.property_address && (
              <FieldRow
                label="Property"
                value={fields.property_address}
                fullWidth
              />
            )}

            {/* Tenant Names */}
            {fields.tenant_names && (
              <FieldRow
                label="Tenant(s)"
                value={
                  Array.isArray(fields.tenant_names)
                    ? fields.tenant_names.join(', ')
                    : fields.tenant_names
                }
              />
            )}

            {/* Landlord Name */}
            {fields.landlord_name && (
              <FieldRow label="Landlord" value={fields.landlord_name} />
            )}

            {/* Signature */}
            {fields.signature_present !== undefined && (
              <FieldRow
                label="Signature"
                value={fields.signature_present ? 'Detected' : 'Not detected'}
                valueClassName={
                  fields.signature_present ? 'text-green-700' : 'text-amber-700'
                }
              />
            )}

            {/* Form Type */}
            {(fields.form_6a_used || fields.section_21_detected) && (
              <FieldRow
                label="Form Type"
                value={fields.form_6a_used ? 'Form 6A' : 'Section 21'}
                valueClassName="text-green-700"
              />
            )}

            {(fields.form_3_detected || fields.section_8_detected) && (
              <FieldRow
                label="Form Type"
                value={fields.form_3_detected ? 'Form 3' : 'Section 8'}
                valueClassName="text-green-700"
              />
            )}

            {/* Grounds Cited */}
            {fields.grounds_cited && fields.grounds_cited.length > 0 && (
              <FieldRow
                label="Grounds"
                value={fields.grounds_cited.join(', ')}
                fullWidth
              />
            )}
          </div>

          {/* Vision extraction note */}
          {quality?.is_low_text && (
            <p className="mt-3 text-[11px] text-blue-700 border-t border-blue-100 pt-3">
              Note: This document had limited text content. AI vision was used for extraction.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface FieldRowProps {
  label: string;
  value: string | undefined;
  fullWidth?: boolean;
  valueClassName?: string;
}

function FieldRow({ label, value, fullWidth = false, valueClassName = 'text-blue-900' }: FieldRowProps) {
  if (!value) return null;

  return (
    <div className={`flex flex-col gap-0.5 text-sm text-left ${fullWidth ? 'sm:col-span-2' : ''}`}>
      <span className="text-blue-700 text-xs">{label}</span>
      <span className={`font-medium ${valueClassName}`}>{value}</span>
    </div>
  );
}

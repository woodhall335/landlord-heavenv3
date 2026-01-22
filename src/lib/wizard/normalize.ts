import type { ExtendedWizardQuestion, WizardField } from './types';

type Jurisdiction = 'england' | 'wales' | 'scotland' | 'northern-ireland' | string;

const ADDRESS_FIELD_IDS = ['address_line1', 'address_line2', 'city', 'postcode', 'country'];

function mapInputType(rawType?: string): string {
  if (!rawType) return 'text';

  const lower = rawType.toLowerCase();

  if (lower === 'multi-select') return 'multi_select';
  if (lower === 'longtext') return 'textarea';
  return lower;
}

function normalizeField(field: any): WizardField {
  const validation =
    field.validation ??
    (field.required !== undefined
      ? {
          required: Boolean(field.required),
        }
      : undefined);

  // Normalize maps_to to array format
  let maps_to: string[] | undefined;
  if (field.maps_to) {
    maps_to = Array.isArray(field.maps_to) ? field.maps_to : [field.maps_to];
  }

  return {
    ...field,
    inputType: field.inputType ?? field.input_type ?? mapInputType(field.type),
    validation,
    dependsOn: field.dependsOn ?? field.depends_on,
    maps_to,
  } as WizardField;
}

function buildAddressFields(jurisdiction?: Jurisdiction): WizardField[] {
  return [
    {
      id: 'address_line1',
      label: 'Address line 1',
      inputType: 'text',
      validation: { required: true },
      width: 'full',
    },
    {
      id: 'address_line2',
      label: 'Address line 2 (optional)',
      inputType: 'text',
      validation: { required: false },
      width: 'full',
    },
    {
      id: 'city',
      label: 'Town or city',
      inputType: 'text',
      validation: { required: true },
      width: 'half',
    },
    {
      id: 'postcode',
      label: 'Postcode',
      inputType: 'text',
      validation: { required: true },
      width: 'half',
    },
    {
      id: 'country',
      label: 'Country',
      inputType: 'select',
      options: ['England & Wales', 'Scotland', 'Northern Ireland'],
      validation: { required: false },
      width: 'full',
      defaultValue:
        jurisdiction === 'scotland'
          ? 'Scotland'
          : jurisdiction === 'northern-ireland'
          ? 'Northern Ireland'
          : 'England & Wales',
    },
  ];
}

export function normalizeQuestion(
  rawQuestion: any,
  jurisdiction?: Jurisdiction,
): ExtendedWizardQuestion {
  const normalizedType = mapInputType(
    rawQuestion.inputType ?? rawQuestion.input_type ?? rawQuestion.type,
  );

  const validation =
    rawQuestion.validation ??
    (rawQuestion.required !== undefined
      ? {
          required: Boolean(rawQuestion.required),
        }
      : undefined);

  let fields: WizardField[] | undefined = rawQuestion.fields?.map(normalizeField);

  // Convert address shorthand into a structured group with three lines + country
  if (normalizedType === 'address') {
    fields = fields?.length ? fields.map(normalizeField) : buildAddressFields(jurisdiction);
  }

  // Aggregate field-level maps_to into question maps_to for group questions
  // This ensures the MQS system can track which paths are answered
  let maps_to = rawQuestion.maps_to;
  if ((!maps_to || maps_to.length === 0) && fields && fields.length > 0) {
    const fieldMapsTo: string[] = [];
    for (const field of fields) {
      if (field.maps_to) {
        if (Array.isArray(field.maps_to)) {
          fieldMapsTo.push(...field.maps_to);
        } else if (typeof field.maps_to === 'string') {
          fieldMapsTo.push(field.maps_to);
        }
      } else {
        // Default to field ID if no maps_to specified
        fieldMapsTo.push(field.id);
      }
    }
    if (fieldMapsTo.length > 0) {
      maps_to = fieldMapsTo;
    }
  }

  const normalizedQuestion: ExtendedWizardQuestion = {
    ...rawQuestion,
    inputType: normalizedType === 'address' ? 'group' : normalizedType,
    validation,
    dependsOn: rawQuestion.dependsOn ?? rawQuestion.depends_on,
    fields,
    maps_to,
  };

  // Ensure group fields have consistent validation for required flags
  if (normalizedQuestion.inputType === 'group' && normalizedQuestion.fields) {
    normalizedQuestion.fields = normalizedQuestion.fields.map((field) => {
      if (ADDRESS_FIELD_IDS.includes(field.id) && !field.validation) {
        return {
          ...field,
          validation: { required: ['address_line1', 'city', 'postcode'].includes(field.id) },
        };
      }

      return normalizeField(field);
    });
  }

  return normalizedQuestion;
}

export function normalizeQuestions(
  questions: any[],
  jurisdiction?: Jurisdiction,
): ExtendedWizardQuestion[] {
  return questions.map((question) => normalizeQuestion(question, jurisdiction));
}

import catalog from './tenancy-supplemental-fields.json';

export function tenancyFieldSection(field: string): string {
  const root = field.split(/[.\[]/)[0];
  if (root === 'product_tier') return 'product';
  if (root === 'number_of_tenants') return 'tenants';
  const entry = Object.values(catalog).flat().find(f => f.id === root);
  if (entry) return entry.section;
  if (/^landlord/.test(root)) return 'landlord';
  if (/^tenants?$/.test(root)) return 'tenants';
  if (/^property/.test(root)) return 'property';
  if (/^deposit|^prescribed_information/.test(root)) return 'deposit';
  if (/^inventory/.test(root)) return 'terms';
  if (/^rent|^payment|^first_payment/.test(root)) return 'rent';
  if (/bills|^ni_rates|^ni_capital|^ni_other|utility/.test(root)) return 'bills';
  if (/certificate|alarm|^epc|^right_to_rent|^england_/.test(root)) return 'compliance';
  return 'tenancy';
}

export function tenancyFieldLabel(field: string, jurisdiction?: keyof typeof catalog): string {
  const tenantMatch = field.match(/^tenants\[(\d+)\]\.(full_name|dob|email|phone|address)$/);
  if (tenantMatch) {
    const labels: Record<string, string> = { full_name: 'name', dob: 'date of birth', email: 'email', phone: 'phone', address: 'current address' };
    return `Tenant ${Number(tenantMatch[1]) + 1} ${labels[tenantMatch[2]]}`;
  }
  if (field === 'number_of_tenants') return 'Number of tenants';
  if (field === 'product_tier') return 'Agreement type';
  const entries = jurisdiction ? catalog[jurisdiction] : Object.values(catalog).flat();
  const entry = entries.find(f => f.id === field);
  return entry?.label || field.replace(/_/g, ' ').replace(/\[(\d+)\]/g, (_, i) => ` ${Number(i) + 1}`).replace(/\./g, ': ');
}

export function supplementalFieldApplies(field: any, facts: Record<string, any>): boolean {
  return [field.dependsOn, field.parentDependsOn].every(dep => {
    if (!dep) return true;
    const isTierDependency = /^(ast_tier|occupation_contract_tier|prt_tier|ni_tier)$/.test(dep.questionId);
    const rawValue = isTierDependency ? (facts[dep.questionId] ?? facts.product_tier) : facts[dep.questionId];
    const value = isTierDependency && String(dep.value || '').includes('Premium') && String(rawValue || '').includes('Premium')
      ? dep.value
      : rawValue;
    if ('value' in dep) return value === dep.value;
    const contains = dep.contains ?? dep.valueContains;
    return contains === undefined || (Array.isArray(value) ? value.includes(contains) : String(value || '').includes(contains));
  });
}

function hasAnswer(value: unknown): boolean {
  if (typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.length > 0;
  return typeof value === 'string' ? value.trim().length > 0 : value !== null && value !== undefined;
}

export function getTenancyQuestionProgress(
  jurisdiction: keyof typeof catalog,
  facts: Record<string, any>,
  visibleSections: Iterable<string>,
  validationIssueIds: string[] = [],
): { completed: number; total: number; remaining: number; percent: number } {
  const visible = new Set(visibleSections);
  const questions = new Map<string, boolean>();

  for (const field of catalog[jurisdiction]) {
    if (!visible.has(field.section) || !field.required || !supplementalFieldApplies(field, facts)) continue;
    questions.set(field.id, hasAnswer(facts[field.id]));
  }

  if (visible.has('product')) {
    questions.set('product_tier', hasAnswer(facts.product_tier));
  }

  if (visible.has('tenants')) {
    questions.set('number_of_tenants', hasAnswer(facts.number_of_tenants));
    const parsedCount = Number.parseInt(String(facts.number_of_tenants || ''), 10);
    const tenantCount = Number.isFinite(parsedCount) && parsedCount > 0 ? Math.min(parsedCount, 6) : 1;
    const tenantFields = jurisdiction === 'scotland'
      ? ['full_name', 'dob', 'email', 'phone', 'address']
      : ['full_name', 'dob', 'email', 'phone'];

    for (let index = 0; index < tenantCount; index += 1) {
      for (const field of tenantFields) {
        questions.set(`tenants[${index}].${field}`, hasAnswer(facts.tenants?.[index]?.[field]));
      }
    }
  }

  for (const id of validationIssueIds) {
    if (id === 'tenants') continue;
    const section = tenancyFieldSection(id);
    if (!visible.has(section)) continue;
    questions.set(id, false);
  }

  const total = questions.size;
  const completed = [...questions.values()].filter(Boolean).length;
  const remaining = total - completed;
  return {
    completed,
    total,
    remaining,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export function tenancyQuestionnaireSectionComplete(
  jurisdiction: keyof typeof catalog,
  section: string,
  facts: Record<string, any>,
): boolean {
  return catalog[jurisdiction]
    .filter(field => field.section === section && field.required && supplementalFieldApplies(field, facts))
    .every(field => hasAnswer(facts[field.id]));
}

export function getIncompleteTenancyQuestionnaireFields(
  jurisdiction: keyof typeof catalog,
  facts: Record<string, any>,
): Array<{ id: string; label: string; section: string }> {
  const missing = new Map<string, { id: string; label: string; section: string }>();
  for (const field of catalog[jurisdiction]) {
    if (field.required && supplementalFieldApplies(field, facts) && !hasAnswer(facts[field.id])) {
      missing.set(field.id, { id: field.id, label: field.label, section: field.section });
    }
  }
  return [...missing.values()];
}

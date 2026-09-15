import { describe, expect, it } from 'vitest';
import { findTenancyFieldTarget } from '@/components/wizard/flows/TenancySectionFlow';

describe('tenancy review blocker navigation', () => {
  it('finds a restored supplemental blocker by its fact id', () => {
    document.body.innerHTML = `
      <div id="tenancy-field-first_payment"><label>First payment</label><input /></div>
    `;

    expect(findTenancyFieldTarget('first_payment', 'wales')).toBe(
      document.getElementById('tenancy-field-first_payment'),
    );
  });

  it('finds the exact repeated tenant control by array index', () => {
    document.body.innerHTML = `
      <div id="tenant-one"><label>Email</label><input /></div>
      <div id="tenant-two"><label>Email</label><input /></div>
    `;

    expect(findTenancyFieldTarget('tenants[1].email', 'wales')?.id).toBe('tenant-two');
  });

  it('finds an existing section control using its jurisdiction label', () => {
    document.body.innerHTML = `
      <div id="inventory"><label>When will the completed inventory be supplied?</label><select></select></div>
    `;

    expect(findTenancyFieldTarget('inventory_delivery_method', 'wales')?.id).toBe('inventory');
  });

  it('targets the first tenant name when the whole tenants collection is missing', () => {
    document.body.innerHTML = `<div id="lead-tenant"><label>Full name</label><input /></div>`;
    expect(findTenancyFieldTarget('tenants', 'england')?.id).toBe('lead-tenant');
  });

  it('targets the tenant-count question separately', () => {
    document.body.innerHTML = `<div id="tenant-count"><label>How many contract-holders are on the occupation contract?</label><select></select></div>`;
    expect(findTenancyFieldTarget('number_of_tenants', 'wales')?.id).toBe('tenant-count');
  });
});

import { describe, expect, it } from 'vitest';
import { getBlogAssistedPrepSidebarConfig } from '../BlogAssistedPrepSidebar';

describe('getBlogAssistedPrepSidebarConfig', () => {
  it('promotes Section 8 assisted preparation on England ground guides', () => {
    const config = getBlogAssistedPrepSidebarConfig('england-section-8-ground-8');

    expect(config?.href).toContain('service=section8');
    expect(config?.href).toContain('product=notice_only');
  });

  it('uses the general consultation route for Scottish eviction grounds', () => {
    const config = getBlogAssistedPrepSidebarConfig('scotland-eviction-ground-12');

    expect(config?.href).toContain('/assisted-prep?');
    expect(config?.href).not.toContain('service=section8');
  });

  it('does not add an assisted-prep panel to unrelated guides', () => {
    expect(getBlogAssistedPrepSidebarConfig('uk-epc-guide')).toBeNull();
  });
});

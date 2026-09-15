import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TenancySectionFlow } from '@/components/wizard/flows/TenancySectionFlow';

const { getCaseFactsMock, saveCaseFactsMock, pushMock } = vi.hoisted(() => ({
  getCaseFactsMock: vi.fn(),
  saveCaseFactsMock: vi.fn(),
  pushMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('@/lib/wizard/facts-client', () => ({
  getCaseFacts: getCaseFactsMock,
  saveCaseFacts: saveCaseFactsMock,
}));
vi.mock('@/components/wizard/shared/WizardShellV3', () => ({
  WizardShellV3: ({ sectionTitle, banner, children, navigation }: any) => (
    <main><h1>{sectionTitle}</h1>{banner}{children}<nav>{navigation}</nav></main>
  ),
}));

describe('tenancy section flow usability', () => {
  beforeEach(() => {
    window.localStorage.clear();
    getCaseFactsMock.mockResolvedValue({});
    saveCaseFactsMock.mockResolvedValue(undefined);
  });

  it('keeps the user on an incomplete section and links its missing answer', async () => {
    render(<TenancySectionFlow caseId="case-1" jurisdiction="wales" product="ast_standard" />);
    await screen.findByRole('heading', { name: 'Product' });

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Complete this section to continue');
    expect(screen.getByRole('button', { name: 'Agreement type' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Product' })).toBeVisible();
  });

  it('resumes at the first unfinished section', async () => {
    getCaseFactsMock.mockResolvedValue({ product_tier: 'Standard Occupation Contract' });

    render(<TenancySectionFlow caseId="case-2" jurisdiction="wales" product="ast_standard" />);

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Property' })).toBeVisible());
  });

  it('keeps a local draft and exposes retry when auto-save fails', async () => {
    saveCaseFactsMock.mockRejectedValue(new Error('offline'));
    render(<TenancySectionFlow caseId="case-3" jurisdiction="wales" product="ast_standard" />);
    await screen.findByRole('heading', { name: 'Product' });

    fireEvent.click(screen.getByRole('button', { name: /Standard Occupation Contract/ }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Retry' })).toBeVisible(), { timeout: 2000 });
    expect(window.localStorage.getItem('tenancy-wizard-draft:case-3')).toContain('Standard Occupation Contract');
  });
});

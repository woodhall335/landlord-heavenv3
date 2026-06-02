/**
 * @vitest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AssistedAdminActionModal } from '../AssistedAdminActionModal';

describe('AssistedAdminActionModal', () => {
  it('requires a note before required customer-facing actions can submit', () => {
    const onSubmit = vi.fn();

    render(
      <AssistedAdminActionModal
        open
        title="Send assisted prep email"
        description="Tell the customer what is missing."
        noteLabel="Customer message"
        noteRequired
        submitLabel="Send email"
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    const submit = screen.getByRole('button', { name: /send email/i });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/customer message/i), {
      target: { value: 'Please upload the tenancy agreement.' },
    });

    expect(submit).not.toBeDisabled();
    fireEvent.click(submit);
    expect(onSubmit).toHaveBeenCalledWith('Please upload the tenancy agreement.');
  });

  it('requires confirmation before sensitive actions can submit', () => {
    const onSubmit = vi.fn();

    render(
      <AssistedAdminActionModal
        open
        title="Mark blocked"
        description="This is sensitive."
        sensitive
        confirmLabel="I understand this is sensitive."
        submitLabel="Update status"
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    const submit = screen.getByRole('button', { name: /update status/i });
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByLabelText(/i understand this is sensitive/i));

    expect(submit).not.toBeDisabled();
    fireEvent.click(submit);
    expect(onSubmit).toHaveBeenCalledWith('');
  });
});

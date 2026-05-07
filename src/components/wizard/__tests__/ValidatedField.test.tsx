/**
 * @vitest-environment jsdom
 */

import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ValidatedInput } from '../ValidatedField';

const POSTCODE_PATTERN = '^[A-Z]{1,2}\\d[A-Z\\d]?\\s*\\d[A-Z]{2}$';

function PostcodeHarness({ onValue }: { onValue?: (value: string | number) => void }) {
  const [value, setValue] = useState('');

  return (
    <ValidatedInput
      id="landlord_address_postcode"
      label="Postcode"
      value={value}
      onChange={(nextValue) => {
        onValue?.(nextValue);
        setValue(String(nextValue));
      }}
      validation={{ required: true, pattern: POSTCODE_PATTERN }}
    />
  );
}

describe('ValidatedInput postcode normalisation', () => {
  it('uppercases postcode values while the user types', () => {
    const onValue = vi.fn();
    render(<PostcodeHarness onValue={onValue} />);

    fireEvent.change(screen.getByLabelText(/postcode/i), {
      target: { value: 'ls28 7pw' },
    });

    expect(onValue).toHaveBeenLastCalledWith('LS28 7PW');
    expect(screen.getByLabelText(/postcode/i)).toHaveValue('LS28 7PW');
  });

  it('formats valid lowercase postcodes on blur without showing a format warning', () => {
    const onValue = vi.fn();
    render(<PostcodeHarness onValue={onValue} />);

    const input = screen.getByLabelText(/postcode/i);
    fireEvent.change(input, { target: { value: 'sw1a1aa' } });
    fireEvent.blur(input);

    expect(onValue).toHaveBeenLastCalledWith('SW1A 1AA');
    expect(screen.getByLabelText(/postcode/i)).toHaveValue('SW1A 1AA');
    expect(screen.queryByText(/Postcode is not in the correct format/i)).not.toBeInTheDocument();
  });
});

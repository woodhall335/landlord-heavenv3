/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { EnglandTenancyProductChooser } from '@/components/wizard/EnglandTenancyProductChooser';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  ENGLAND_TENANCY_PRODUCT_IMAGES,
  ENGLAND_TENANCY_PRODUCT_ORDER,
} from '@/lib/tenancy/england-product-model';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    ...rest
  }: {
    src: string | { src: string };
    alt: string;
    fill?: boolean;
    [key: string]: unknown;
  }) => <img src={typeof src === 'string' ? src : src.src} alt={alt} {...rest} />,
}));

afterEach(() => {
  cleanup();
});

describe('EnglandTenancyProductChooser', () => {
  it('renders the shared product banner images and keeps the chooser CTAs working', () => {
    const onSelect = vi.fn();

    render(<EnglandTenancyProductChooser onSelect={onSelect} />);

    for (const sku of ENGLAND_TENANCY_PRODUCT_ORDER) {
      const image = ENGLAND_TENANCY_PRODUCT_IMAGES[sku];
      expect(screen.getByAltText(image.alt)).toHaveAttribute('src', image.src);
      expect(
        screen.getByRole('button', { name: `Start ${PRODUCTS[sku].shortLabel}` }),
      ).toBeInTheDocument();
    }

    fireEvent.click(
      screen.getByRole('button', {
        name: `Start ${PRODUCTS.england_student_tenancy_agreement.shortLabel}`,
      }),
    );

    expect(onSelect).toHaveBeenCalledWith('england_student_tenancy_agreement');
  });
});

/**
 * Test to verify "Collected Information" section is removed from user-facing UI
 *
 * This section previously exposed internal case facts/collected_facts to users.
 * It should NEVER be visible to regular users.
 */

import { describe, test, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Case Dashboard Security', () => {
  const pageFilePath = path.join(
    process.cwd(),
    'src/app/dashboard/cases/[id]/page.tsx'
  );

  test('"Collected Information" section is NOT present in page source', () => {
    const pageSource = fs.readFileSync(pageFilePath, 'utf-8');

    // The literal text "Collected Information" should not appear in the UI
    // This was the header of the removed section
    expect(pageSource).not.toContain('"Collected Information"');
    expect(pageSource).not.toContain("'Collected Information'");
    expect(pageSource).not.toContain('>Collected Information<');
  });

  test('editedFacts state is NOT used to render any UI', () => {
    const pageSource = fs.readFileSync(pageFilePath, 'utf-8');

    // editedFacts was the state that held collected_facts for display/editing
    // It should not be used in any JSX rendering
    expect(pageSource).not.toMatch(/\{editedFacts/);
    expect(pageSource).not.toMatch(/editedFacts\./);
    expect(pageSource).not.toMatch(/editedFacts\[/);
  });

  test('renderFieldValue function is NOT present (was only used for Collected Information)', () => {
    const pageSource = fs.readFileSync(pageFilePath, 'utf-8');

    // renderFieldValue was only used to render fields in the Collected Information section
    expect(pageSource).not.toContain('renderFieldValue');
  });

  test('collected_facts is NOT directly rendered in JSX', () => {
    const pageSource = fs.readFileSync(pageFilePath, 'utf-8');

    // collected_facts should not be directly rendered as UI text
    // It's OK to reference it in logic/props, but not render a label or raw output.
    expect(pageSource).not.toMatch(/>\s*collected_facts\s*</);
  });

  test('isEditMode state for raw fact editing is NOT used', () => {
    const pageSource = fs.readFileSync(pageFilePath, 'utf-8');

    // isEditMode was used to toggle between view/edit of collected facts
    // This functionality has been removed
    expect(pageSource).not.toContain('isEditMode');
    expect(pageSource).not.toContain('setIsEditMode');
  });
});

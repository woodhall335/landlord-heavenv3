/**
 * PDF Utility Functions
 *
 * Common utilities for PDF manipulation including flattening forms
 * to ensure filled fields are always visible regardless of viewer.
 */

import { PDFDocument, PDFForm, PDFName, PDFDict, PDFArray } from 'pdf-lib';

/**
 * Flatten a PDF form so that filled fields are embedded as static content.
 *
 * This is critical for court documents because:
 * - Some PDF viewers don't render form fields correctly
 * - Printing may not include form field values
 * - Ensures filled values are permanently visible
 *
 * The flattening process:
 * 1. Marks all form fields as read-only
 * 2. Removes the NeedAppearances flag (forces appearance streams)
 * 3. Updates field appearances to embed content
 *
 * @param pdfBytes - The PDF bytes to flatten
 * @returns Flattened PDF bytes
 */
export async function flattenPdf(pdfBytes: Uint8Array): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes, {
    updateMetadata: false,
  });

  const form = pdfDoc.getForm();

  // Flatten all form fields
  try {
    form.flatten();
  } catch (error) {
    // If flatten() is not available in this pdf-lib version,
    // fall back to making fields read-only and updating appearances
    console.debug('[flattenPdf] form.flatten() failed, using fallback method:', error);
    await flattenFormFallback(pdfDoc, form);
  }

  // Save with appearance streams embedded
  return pdfDoc.save({
    useObjectStreams: false, // Better compatibility
  });
}

/**
 * Fallback flattening method for older pdf-lib versions.
 * Makes fields read-only and ensures appearance streams are present.
 */
async function flattenFormFallback(pdfDoc: PDFDocument, form: PDFForm): Promise<void> {
  const fields = form.getFields();

  for (const field of fields) {
    // Make field read-only
    try {
      field.enableReadOnly();
    } catch {
      // Some field types may not support read-only
    }

    // Update appearance to ensure value is rendered
    try {
      (field as any).updateAppearances?.();
    } catch {
      // Appearance update may fail for some field types
    }
  }

  // Remove NeedAppearances flag from AcroForm dictionary
  // This forces viewers to use the appearance streams we've created
  try {
    const acroForm = pdfDoc.catalog.get(PDFName.of('AcroForm'));
    if (acroForm instanceof PDFDict) {
      acroForm.delete(PDFName.of('NeedAppearances'));
    }
  } catch {
    // May not exist in all PDFs
  }
}

/**
 * Fill and flatten a PDF form in one operation.
 *
 * This is a convenience function that combines form filling with flattening.
 * Use this when generating final output PDFs for court submissions.
 *
 * @param pdfDoc - The PDFDocument with filled form
 * @returns Flattened PDF bytes
 */
export async function saveAndFlattenPdf(pdfDoc: PDFDocument): Promise<Uint8Array> {
  const form = pdfDoc.getForm();

  // Flatten all form fields
  try {
    form.flatten();
  } catch (error) {
    console.debug('[saveAndFlattenPdf] form.flatten() failed, using fallback:', error);
    await flattenFormFallback(pdfDoc, form);
  }

  return pdfDoc.save({
    useObjectStreams: false,
  });
}

/**
 * Check if a PDF has form fields that need flattening.
 */
export async function hasFillableFields(pdfBytes: Uint8Array): Promise<boolean> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    return form.getFields().length > 0;
  } catch {
    return false;
  }
}

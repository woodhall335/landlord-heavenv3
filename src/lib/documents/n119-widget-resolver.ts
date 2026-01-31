/**
 * N119 Widget-Accurate Field Resolver
 *
 * This module provides utilities to find and target specific PDF form widgets
 * by their physical bounding box coordinates. This is necessary when a single
 * field name maps to multiple widgets at different positions, or when we need
 * to ensure we're writing to the widget that appears in a specific visual region
 * of the form.
 *
 * Use cases:
 * - Q2 region: Persons in possession field
 * - Q5 region: Steps taken to recover arrears
 * - Q6 region: Notice details
 *
 * @module n119-widget-resolver
 */

import { PDFDocument, PDFField, PDFForm } from 'pdf-lib';

/**
 * Bounding box coordinates for a region
 */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Information about a field widget
 */
export interface WidgetInfo {
  fieldName: string;
  fieldType: string;
  pageIndex: number;
  rect: BoundingBox;
  widgetIndex: number;
  totalWidgets: number;
}

/**
 * Result of resolving a field by region
 */
export interface ResolvedField {
  fieldName: string;
  widgetIndex: number;
  confidence: 'exact' | 'partial' | 'none';
  matchingWidgets: WidgetInfo[];
}

/**
 * Known N119 page regions with their approximate bounding boxes.
 * These coordinates are based on the n119-eng.pdf form layout.
 *
 * Coordinates are in PDF units (points), with origin at bottom-left.
 * Page 1 height is approximately 842 points (A4).
 */
export const N119_REGIONS = {
  // Page 1 regions
  Q1_PROPERTY: { x: 51, y: 570, width: 530, height: 70 },
  Q2_PERSONS: { x: 51, y: 500, width: 533, height: 70 },
  Q3_TENANCY: { x: 50, y: 380, width: 530, height: 120 },
  Q4_REASONS: { x: 51, y: 30, width: 527, height: 300 },

  // Page 2 regions
  Q5_STEPS: { x: 51, y: 700, width: 530, height: 100 },
  Q6_NOTICE: { x: 50, y: 650, width: 530, height: 50 },
  Q7_DEFENDANT: { x: 51, y: 490, width: 527, height: 110 },
  Q8_FINANCIAL: { x: 48, y: 320, width: 530, height: 120 },
  Q9_FORFEITURE: { x: 50, y: 220, width: 530, height: 80 },
} as const;

/**
 * Check if a rectangle is within or overlaps with a region
 */
export function isWithinRegion(
  widgetRect: BoundingBox,
  region: BoundingBox,
  tolerance: number = 20
): boolean {
  const widgetCenterX = widgetRect.x + widgetRect.width / 2;
  const widgetCenterY = widgetRect.y + widgetRect.height / 2;

  const regionLeft = region.x - tolerance;
  const regionRight = region.x + region.width + tolerance;
  const regionBottom = region.y - tolerance;
  const regionTop = region.y + region.height + tolerance;

  return (
    widgetCenterX >= regionLeft &&
    widgetCenterX <= regionRight &&
    widgetCenterY >= regionBottom &&
    widgetCenterY <= regionTop
  );
}

/**
 * Extract widget information from a PDF field
 */
export function getFieldWidgets(field: PDFField, pdfDoc: PDFDocument): WidgetInfo[] {
  const widgets: WidgetInfo[] = [];
  const fieldName = field.getName();
  const fieldType = field.constructor.name.replace('PDF', '');
  const pages = pdfDoc.getPages();

  try {
    const acroWidgets = field.acroField.getWidgets();

    acroWidgets.forEach((widget, widgetIndex) => {
      try {
        const rect = widget.getRectangle();
        const pageRef = widget.P();

        // Find page index
        let pageIndex = 0;
        if (pageRef) {
          for (let i = 0; i < pages.length; i++) {
            const pageRef2 = pages[i].ref;
            if (pageRef2 && pageRef.toString() === pageRef2.toString()) {
              pageIndex = i;
              break;
            }
          }
        }

        widgets.push({
          fieldName,
          fieldType,
          pageIndex,
          rect: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          },
          widgetIndex,
          totalWidgets: acroWidgets.length,
        });
      } catch (e) {
        // Skip widgets that can't be read
      }
    });
  } catch (e) {
    // Field has no widgets
  }

  return widgets;
}

/**
 * Get all widgets from a PDF form with their positions
 */
export function getAllWidgets(pdfDoc: PDFDocument): WidgetInfo[] {
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  const allWidgets: WidgetInfo[] = [];

  for (const field of fields) {
    const widgets = getFieldWidgets(field, pdfDoc);
    allWidgets.push(...widgets);
  }

  return allWidgets;
}

/**
 * Find widgets within a specific region
 */
export function findWidgetsInRegion(
  pdfDoc: PDFDocument,
  region: BoundingBox,
  pageIndex: number = 0,
  tolerance: number = 20
): WidgetInfo[] {
  const allWidgets = getAllWidgets(pdfDoc);

  return allWidgets.filter(
    (widget) =>
      widget.pageIndex === pageIndex && isWithinRegion(widget.rect, region, tolerance)
  );
}

/**
 * Find the best matching field for a region from candidate field names
 *
 * @param pdfDoc - The PDF document
 * @param pageIndex - The page index (0-based)
 * @param region - The bounding box region to search
 * @param candidateFieldNames - List of possible field names to consider
 * @returns The resolved field information
 */
export function resolveFieldByRegion(
  pdfDoc: PDFDocument,
  pageIndex: number,
  region: BoundingBox,
  candidateFieldNames: string[]
): ResolvedField {
  const widgetsInRegion = findWidgetsInRegion(pdfDoc, region, pageIndex);

  // Filter to only candidate field names
  const matchingWidgets = widgetsInRegion.filter((w) =>
    candidateFieldNames.some(
      (name) => w.fieldName === name || w.fieldName.toLowerCase().includes(name.toLowerCase())
    )
  );

  if (matchingWidgets.length === 0) {
    return {
      fieldName: candidateFieldNames[0] || '',
      widgetIndex: 0,
      confidence: 'none',
      matchingWidgets: [],
    };
  }

  if (matchingWidgets.length === 1) {
    return {
      fieldName: matchingWidgets[0].fieldName,
      widgetIndex: matchingWidgets[0].widgetIndex,
      confidence: 'exact',
      matchingWidgets,
    };
  }

  // Multiple matches - return the one closest to center of region
  const regionCenterX = region.x + region.width / 2;
  const regionCenterY = region.y + region.height / 2;

  const sortedByDistance = matchingWidgets.sort((a, b) => {
    const distA = Math.hypot(
      a.rect.x + a.rect.width / 2 - regionCenterX,
      a.rect.y + a.rect.height / 2 - regionCenterY
    );
    const distB = Math.hypot(
      b.rect.x + b.rect.width / 2 - regionCenterX,
      b.rect.y + b.rect.height / 2 - regionCenterY
    );
    return distA - distB;
  });

  return {
    fieldName: sortedByDistance[0].fieldName,
    widgetIndex: sortedByDistance[0].widgetIndex,
    confidence: 'partial',
    matchingWidgets,
  };
}

/**
 * Debug helper: Print all widgets in a PDF with their positions
 */
export function debugPrintWidgets(pdfDoc: PDFDocument): void {
  const widgets = getAllWidgets(pdfDoc);

  console.log(`\n=== PDF WIDGET DEBUG (${widgets.length} widgets) ===\n`);

  // Group by page
  const byPage = new Map<number, WidgetInfo[]>();
  for (const w of widgets) {
    if (!byPage.has(w.pageIndex)) {
      byPage.set(w.pageIndex, []);
    }
    byPage.get(w.pageIndex)!.push(w);
  }

  for (const [pageIdx, pageWidgets] of byPage) {
    console.log(`\n--- Page ${pageIdx + 1} ---`);
    // Sort by Y position (top to bottom)
    const sorted = pageWidgets.sort((a, b) => b.rect.y - a.rect.y);

    for (const w of sorted) {
      const shortName =
        w.fieldName.length > 50 ? w.fieldName.substring(0, 50) + '...' : w.fieldName;
      console.log(
        `  [${w.fieldType}] Y=${Math.round(w.rect.y)} H=${Math.round(w.rect.height)} "${shortName}"`
      );
    }
  }
}

/**
 * Validate that a field is in the expected region
 *
 * @param pdfDoc - The PDF document
 * @param fieldName - The field name to check
 * @param expectedRegion - The expected region
 * @param expectedPage - The expected page (0-based)
 * @returns true if the field's widget is within the region
 */
export function validateFieldPosition(
  pdfDoc: PDFDocument,
  fieldName: string,
  expectedRegion: BoundingBox,
  expectedPage: number,
  tolerance: number = 30
): boolean {
  const form = pdfDoc.getForm();

  try {
    const field = form.getField(fieldName);
    const widgets = getFieldWidgets(field, pdfDoc);

    return widgets.some(
      (w) =>
        w.pageIndex === expectedPage && isWithinRegion(w.rect, expectedRegion, tolerance)
    );
  } catch {
    return false;
  }
}

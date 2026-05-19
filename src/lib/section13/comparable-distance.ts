import type { Section13Comparable, Section13ComparableAssessment } from './types';

const MIN_RELIABLE_SCRAPED_DISTANCE_MILES = 0.05;

type DistanceComparable = Pick<Section13Comparable, 'distanceMiles' | 'source' | 'isManual'>;
type DistanceAssessment = Pick<Section13ComparableAssessment, 'distanceMiles' | 'source'> & {
  isManual?: boolean;
};

export function getReliableComparableDistanceMiles(
  comparable: DistanceComparable | DistanceAssessment
): number | null {
  const value = comparable.distanceMiles;
  if (value == null || !Number.isFinite(Number(value))) {
    return null;
  }

  const normalized = Number(value);
  if (normalized < 0) {
    return null;
  }

  const isUserSupplied =
    comparable.isManual === true ||
    comparable.source === 'manual_linked' ||
    comparable.source === 'manual_unlinked';

  if (!isUserSupplied && normalized < MIN_RELIABLE_SCRAPED_DISTANCE_MILES) {
    return null;
  }

  return Number(normalized.toFixed(2));
}

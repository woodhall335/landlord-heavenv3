// Quick test of jurisdiction derivation

function migrateToCanonicalJurisdiction(
  jurisdiction,
  propertyLocation
) {
  if (!jurisdiction) return null;

  const normalized = jurisdiction.toLowerCase().trim();

  // Already canonical
  if (
    normalized === 'england' ||
    normalized === 'wales' ||
    normalized === 'scotland' ||
    normalized === 'northern-ireland'
  ) {
    return normalized;
  }

  // Legacy values - migrate to canonical
  if (normalized === 'england-wales' || normalized === 'england & wales' || normalized === 'england and wales') {
    // If property_location is known, use it
    if (propertyLocation === 'wales') return 'wales';
    if (propertyLocation === 'england') return 'england';

    // FAIL CLOSED
    console.error(`Cannot migrate "${jurisdiction}" without property_location`);
    return null;
  }

  // Unrecognized value
  console.error(`Invalid jurisdiction: "${jurisdiction}"`);
  return null;
}

function deriveCanonicalJurisdiction(
  jurisdiction,
  facts
) {
  const propertyLocation =
    facts?.property_location ||
    facts?.property?.country ||
    facts?.property?.jurisdiction ||
    null;

  return migrateToCanonicalJurisdiction(
    jurisdiction,
    propertyLocation === 'wales' || propertyLocation === 'england'
      ? propertyLocation
      : null,
  );
}

// Test cases from the failing tests
console.log('Test 1: england with no facts');
console.log('Result:', deriveCanonicalJurisdiction('england', null));

console.log('\nTest 2: england with empty facts');
console.log('Result:', deriveCanonicalJurisdiction('england', {}));

console.log('\nTest 3: wales with no facts');
console.log('Result:', deriveCanonicalJurisdiction('wales', null));

console.log('\nTest 4: scotland with no facts');
console.log('Result:', deriveCanonicalJurisdiction('scotland', null));

console.log('\nTest 5: england-wales with no facts (should fail)');
console.log('Result:', deriveCanonicalJurisdiction('england-wales', null));

console.log('\nTest 6: england-wales with property_location=england');
console.log('Result:', deriveCanonicalJurisdiction('england-wales', { property_location: 'england' }));

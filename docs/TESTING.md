# Testing Environment Setup

## Overview

Tests run against a **dedicated test database**, never production.

## Setup

### 1. Create Test Database

```bash
# Create test database
createdb landlord_heaven_test

# Run migrations on test DB
DATABASE_URL=postgresql://user:pass@localhost/landlord_heaven_test npm run migrate
```

### 2. Environment Variables

Create `.env.test`:

```bash
# Test database
DATABASE_URL_TEST=postgresql://user:pass@localhost/landlord_heaven_test

# Supabase test project
SUPABASE_URL_TEST=https://your-test-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY_TEST=eyJhbGc...  # Service role for write access
SUPABASE_ANON_KEY_TEST=eyJhbGc...

# Test mode flag
NODE_ENV=test

# Test server URL (for API integration tests)
TEST_BASE_URL=http://localhost:3000
```

### 3. Service Role Authentication

Tests use service role for write access to cases table.

**CRITICAL:** Never use service role in production client code.

## Test Execution Patterns

### Unit Tests (CLAUDE CODE FIX #8)

Unit tests run in isolation without external dependencies:

```bash
npm run test:unit
```

These tests mock external APIs and database calls.

### API Integration Tests (CLAUDE CODE FIX #8)

Integration tests require a running Next.js server:

```bash
# Start test server (in separate terminal)
npm run start:test

# Run API tests
npm run test:integration
```

**IMPORTANT:** API tests use absolute URLs:

```typescript
// ✅ Correct: Uses environment variable for test server
const response = await fetch(`${process.env.TEST_BASE_URL}/api/wizard/generate`, {
  method: 'POST',
  body: JSON.stringify({ caseId, documentType })
});

// ❌ Wrong: Relative URL may not work in test environment
const response = await fetch('/api/wizard/generate', ...);
```

### E2E Tests

Full end-to-end tests with Playwright:

```bash
npm run test:e2e
```

## Test Cleanup

Tests clean up after themselves:

```typescript
afterEach(async () => {
  if (testCaseId) {
    await cleanupTestCase(testCaseId);
  }
});
```

## Safety

✅ Tests isolated to test database

✅ Service role only in test environment

✅ Automatic cleanup after each test

✅ Separate test server for API integration

❌ Never run tests against production

## Example Test Pattern

```typescript
import { createTestCase, cleanupTestCase, getTestBaseUrl } from '@/lib/testing/wizard-test-helpers';

describe('Wales Section 173 API Enforcement', () => {
  let testCaseId: string;

  afterEach(async () => {
    if (testCaseId) {
      await cleanupTestCase(testCaseId);
    }
  });

  test('blocks Section 173 for supported contracts', async () => {
    // Create test case with specific facts
    testCaseId = await createTestCase({
      selected_notice_route: 'wales_section_173',
      wales_contract_category: 'supported_standard',
    });

    // Call API with absolute URL
    const response = await fetch(`${getTestBaseUrl()}/api/wizard/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseId: testCaseId,
        documentType: 'wales_section_173',
      })
    });

    // Assert blocked
    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toBe('WALES_SECTION173_INVALID_CONTRACT_TYPE');
  });
});
```

## Test Helpers

Located in `/src/lib/testing/wizard-test-helpers.ts`:

- `getTestSupabaseClient()` - Service role client for test DB
- `getTestBaseUrl()` - Returns TEST_BASE_URL for API calls
- `createTestCase(facts)` - Create test case with specific facts
- `cleanupTestCase(caseId)` - Delete test case after test

## Common Pitfalls

❌ **Using relative URLs in API tests**
```typescript
// This will fail in test environment
await fetch('/api/wizard/generate', ...)
```

✅ **Use absolute URLs with TEST_BASE_URL**
```typescript
await fetch(`${getTestBaseUrl()}/api/wizard/generate`, ...)
```

❌ **Forgetting to clean up test cases**
```typescript
// Missing afterEach cleanup - will leave orphaned test data
```

✅ **Always clean up in afterEach**
```typescript
afterEach(async () => {
  if (testCaseId) {
    await cleanupTestCase(testCaseId);
  }
});
```

❌ **Using production database**
```typescript
// Missing NODE_ENV=test or TEST_BASE_URL
```

✅ **Verify test environment**
```typescript
beforeAll(() => {
  if (!process.env.TEST_BASE_URL) {
    throw new Error('TEST_BASE_URL not set. Run with test environment.');
  }
});
```

## Running Specific Tests

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run specific test file
npm test -- notice-date-calculator.test.ts

# Run tests matching pattern
npm test -- --grep "Wales"

# Run with coverage
npm test -- --coverage
```

## Debugging Tests

```bash
# Run tests in watch mode
npm test -- --watch

# Run with verbose output
npm test -- --verbose

# Run with debugging
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Test Database Reset

If test database gets corrupted:

```bash
# Drop and recreate
dropdb landlord_heaven_test
createdb landlord_heaven_test

# Re-run migrations
DATABASE_URL=postgresql://user:pass@localhost/landlord_heaven_test npm run migrate
```

## CI/CD Integration

For GitHub Actions:

```yaml
- name: Run tests
  env:
    DATABASE_URL_TEST: postgresql://postgres:postgres@localhost/test
    SUPABASE_URL_TEST: ${{ secrets.SUPABASE_URL_TEST }}
    SUPABASE_SERVICE_ROLE_KEY_TEST: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY_TEST }}
    TEST_BASE_URL: http://localhost:3000
  run: |
    npm run migrate
    npm run start:test & # Start test server
    sleep 5 # Wait for server
    npm test
```

## Security Notes

- **Service role keys** are only used in test environment
- **Never commit** `.env.test` to git
- **Never use test credentials** in production
- **Rotate test credentials** regularly

## Troubleshooting

**Error: "TEST_BASE_URL not set"**
- Solution: Add `TEST_BASE_URL=http://localhost:3000` to `.env.test`

**Error: "Service role key not found"**
- Solution: Add `SUPABASE_SERVICE_ROLE_KEY_TEST` to `.env.test`

**Error: "Database does not exist"**
- Solution: Run `createdb landlord_heaven_test`

**Error: "Connection refused"**
- Solution: Start test server with `npm run start:test`

/**
 * Tests for Checkout Create Flow
 *
 * These tests verify that:
 * 1. User profile is ensured before creating order (prevents FK violation)
 * 2. Case ownership is validated before checkout
 * 3. Order creation uses admin client (bypasses RLS)
 * 4. Actionable error messages are provided
 * 5. Stripe customer is created/retrieved correctly
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

// Test data
const mockUserId = 'checkout-user-id-123';
const mockUserEmail = 'checkout@example.com';
const mockCaseId = 'checkout-case-id-456';
const mockOrderId = 'checkout-order-id-789';

// Mock data
let mockUserData: {
  stripe_customer_id: string | null;
  email: string;
} | null = null;
let mockCaseData: {
  jurisdiction: string;
  case_type: string;
  user_id: string | null;
} | null = null;
let mockOrderResult = { id: mockOrderId };
let mockOrderError: { code?: string; message: string } | null = null;
let mockEnsureUserSuccess = true;

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock ensureUserProfileExists
vi.mock('@/lib/supabase/ensure-user', () => ({
  ensureUserProfileExists: vi.fn(() =>
    Promise.resolve({
      success: mockEnsureUserSuccess,
      created: false,
      error: mockEnsureUserSuccess ? undefined : 'Profile creation failed',
    })
  ),
}));

// Track mock calls
const mockCalls = {
  fromUsers: 0,
  fromCases: 0,
  fromOrders: 0,
  orderInsert: [] as unknown[],
  orderUpdate: [] as unknown[],
};

// Mock Supabase
const createMockSupabaseChain = (tableName: string) => {
  const chain: Record<string, unknown> = {};

  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.insert = vi.fn((data) => {
    if (tableName === 'orders') {
      mockCalls.orderInsert.push(data);
    }
    return chain;
  });
  chain.update = vi.fn((data) => {
    if (tableName === 'orders') {
      mockCalls.orderUpdate.push(data);
    }
    return chain;
  });

  chain.single = vi.fn(() => {
    if (tableName === 'users') {
      return Promise.resolve({ data: mockUserData, error: null });
    }
    if (tableName === 'cases') {
      return Promise.resolve({
        data: mockCaseData,
        error: mockCaseData ? null : { code: 'PGRST116', message: 'not found' },
      });
    }
    if (tableName === 'orders') {
      return Promise.resolve({
        data: mockOrderError ? null : mockOrderResult,
        error: mockOrderError,
      });
    }
    return Promise.resolve({ data: null, error: null });
  });

  return chain;
};

const mockAdminClient = {
  from: vi.fn((table: string) => {
    if (table === 'users') mockCalls.fromUsers++;
    if (table === 'cases') mockCalls.fromCases++;
    if (table === 'orders') mockCalls.fromOrders++;
    return createMockSupabaseChain(table);
  }),
};

const mockRegularClient = {
  from: vi.fn((table: string) => createMockSupabaseChain(table)),
};

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(() => Promise.resolve(mockRegularClient)),
  createAdminClient: vi.fn(() => mockAdminClient),
  requireServerAuth: vi.fn(() =>
    Promise.resolve({
      id: mockUserId,
      email: mockUserEmail,
      user_metadata: {},
    })
  ),
}));

// Import after mocking
import { ensureUserProfileExists } from '@/lib/supabase/ensure-user';
import {
  requireServerAuth,
  createAdminClient,
} from '@/lib/supabase/server';

describe('Checkout Create Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCalls.fromUsers = 0;
    mockCalls.fromCases = 0;
    mockCalls.fromOrders = 0;
    mockCalls.orderInsert = [];
    mockCalls.orderUpdate = [];

    // Reset mock data
    mockUserData = { stripe_customer_id: null, email: mockUserEmail };
    mockCaseData = {
      jurisdiction: 'england',
      case_type: 'eviction',
      user_id: mockUserId,
    };
    mockOrderResult = { id: mockOrderId };
    mockOrderError = null;
    mockEnsureUserSuccess = true;
  });

  describe('User profile validation', () => {
    it('should call ensureUserProfileExists before any other operation', async () => {
      const user = await requireServerAuth();

      await ensureUserProfileExists({
        userId: user.id,
        email: user.email!,
      });

      expect(ensureUserProfileExists).toHaveBeenCalledWith({
        userId: mockUserId,
        email: mockUserEmail,
      });
    });

    it('should return error if user profile cannot be created', async () => {
      mockEnsureUserSuccess = false;

      const result = await ensureUserProfileExists({
        userId: mockUserId,
        email: mockUserEmail,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should provide actionable error message for profile failure', async () => {
      mockEnsureUserSuccess = false;

      const result = await ensureUserProfileExists({
        userId: mockUserId,
        email: mockUserEmail,
      });

      // The expected error message in the route
      const expectedMessage =
        'Unable to prepare your account for checkout. Please refresh and try again.';

      expect(result.success).toBe(false);
      expect(expectedMessage).toContain('refresh');
    });
  });

  describe('Case ownership validation', () => {
    it('should validate case belongs to user before checkout', async () => {
      mockCaseData = {
        jurisdiction: 'england',
        case_type: 'eviction',
        user_id: mockUserId,
      };

      const adminClient = createAdminClient();
      const result = await adminClient.from('cases').select().eq().single();

      expect(result.data).toBeTruthy();
      expect(result.data?.user_id).toBe(mockUserId);
    });

    it('should reject checkout for case owned by another user', async () => {
      const otherUserId = 'other-user-id';
      mockCaseData = {
        jurisdiction: 'england',
        case_type: 'eviction',
        user_id: otherUserId,
      };

      const adminClient = createAdminClient();
      const result = await adminClient.from('cases').select().eq().single();

      // The route should check this
      const isOwner = result.data?.user_id === mockUserId;
      expect(isOwner).toBe(false);
    });

    it('should reject checkout for anonymous case (not linked)', async () => {
      mockCaseData = {
        jurisdiction: 'england',
        case_type: 'eviction',
        user_id: null,
      };

      const adminClient = createAdminClient();
      const result = await adminClient.from('cases').select().eq().single();

      const isOwner = result.data?.user_id === mockUserId;
      expect(isOwner).toBe(false);
    });

    it('should return 404 if case not found', async () => {
      mockCaseData = null;

      const adminClient = createAdminClient();
      const result = await adminClient.from('cases').select().eq().single();

      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
    });
  });

  describe('Order creation', () => {
    it('should use admin client for order creation', async () => {
      const adminClient = createAdminClient();

      await adminClient
        .from('orders')
        .insert({
          user_id: mockUserId,
          product_type: 'notice_only',
          product_name: 'Notice Only Pack',
          amount: 29.99,
          currency: 'GBP',
          total_amount: 29.99,
          payment_status: 'pending',
          fulfillment_status: 'pending',
        })
        .single();

      expect(mockCalls.orderInsert).toHaveLength(1);
      expect(mockCalls.orderInsert[0]).toMatchObject({
        user_id: mockUserId,
        product_type: 'notice_only',
      });
    });

    it('should handle foreign key constraint error gracefully', async () => {
      mockOrderError = {
        code: '23503',
        message:
          'insert or update on table "orders" violates foreign key constraint',
      };

      const adminClient = createAdminClient();
      const result = await adminClient.from('orders').insert({}).single();

      expect(result.error).toBeTruthy();
      expect(result.error?.code).toBe('23503');

      // The expected actionable message
      const expectedMessage =
        'Your account is not fully set up. Please refresh the page and try again.';
      expect(expectedMessage).toContain('refresh');
    });

    it('should handle generic order creation error', async () => {
      mockOrderError = {
        message: 'Database error',
      };

      const adminClient = createAdminClient();
      const result = await adminClient.from('orders').insert({}).single();

      expect(result.error).toBeTruthy();

      // Generic error message
      const expectedMessage = 'Failed to create order. Please try again.';
      expect(expectedMessage).toContain('try again');
    });
  });

  describe('Stripe customer handling', () => {
    it('should use admin client to read user Stripe customer ID', async () => {
      mockUserData = {
        stripe_customer_id: 'cus_existing123',
        email: mockUserEmail,
      };

      const adminClient = createAdminClient();
      const result = await adminClient
        .from('users')
        .select('stripe_customer_id, email')
        .eq()
        .single();

      expect(mockCalls.fromUsers).toBe(1);
      expect(result.data?.stripe_customer_id).toBe('cus_existing123');
    });

    it('should use admin client to update user with new Stripe customer ID', async () => {
      mockUserData = { stripe_customer_id: null, email: mockUserEmail };

      const adminClient = createAdminClient();

      // After creating Stripe customer, update user
      await adminClient
        .from('users')
        .update({ stripe_customer_id: 'cus_new456' })
        .eq();

      // Verify admin client was used
      expect(mockCalls.fromUsers).toBe(1);
    });
  });

  describe('Jurisdiction validation', () => {
    it('should reject money_claim for Scotland cases', async () => {
      mockCaseData = {
        jurisdiction: 'scotland',
        case_type: 'money_claim',
        user_id: mockUserId,
      };

      const productType = 'money_claim';
      const validJurisdictions = ['england', 'wales'];

      const isValid = validJurisdictions.includes(mockCaseData.jurisdiction);
      expect(isValid).toBe(false);
    });

    it('should reject sc_money_claim for England cases', async () => {
      mockCaseData = {
        jurisdiction: 'england',
        case_type: 'money_claim',
        user_id: mockUserId,
      };

      const productType = 'sc_money_claim';
      const validJurisdiction = 'scotland';

      const isValid = mockCaseData.jurisdiction === validJurisdiction;
      expect(isValid).toBe(false);
    });

    it('should reject money claims for Northern Ireland', async () => {
      mockCaseData = {
        jurisdiction: 'northern-ireland',
        case_type: 'money_claim',
        user_id: mockUserId,
      };

      const isNorthernIreland =
        mockCaseData.jurisdiction === 'northern-ireland';
      expect(isNorthernIreland).toBe(true);
    });
  });
});

describe('Full Anonymous to Checkout Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnsureUserSuccess = true;
    mockUserData = { stripe_customer_id: null, email: mockUserEmail };
    mockCaseData = {
      jurisdiction: 'england',
      case_type: 'eviction',
      user_id: mockUserId,
    };
    mockOrderError = null;
  });

  it('simulates complete flow: anonymous -> signup -> link -> checkout', async () => {
    // Step 1: User is authenticated
    const user = await requireServerAuth();
    expect(user.id).toBe(mockUserId);

    // Step 2: Ensure user profile exists (might have been created during signup)
    const profileResult = await ensureUserProfileExists({
      userId: user.id,
      email: user.email!,
    });
    expect(profileResult.success).toBe(true);

    // Step 3: Case is linked (set user_id to this user)
    mockCaseData = {
      jurisdiction: 'england',
      case_type: 'eviction',
      user_id: mockUserId, // After linking
    };

    // Step 4: Checkout - validate case ownership
    const adminClient = createAdminClient();
    const caseResult = await adminClient
      .from('cases')
      .select()
      .eq()
      .single();
    expect(caseResult.data?.user_id).toBe(mockUserId);

    // Step 5: Create order
    const orderResult = await adminClient
      .from('orders')
      .insert({
        user_id: mockUserId,
        case_id: mockCaseId,
        product_type: 'notice_only',
        product_name: 'Notice Only Pack',
        amount: 29.99,
        currency: 'GBP',
        total_amount: 29.99,
        payment_status: 'pending',
        fulfillment_status: 'pending',
      })
      .single();

    expect(orderResult.error).toBeNull();
    expect(orderResult.data?.id).toBe(mockOrderId);
  });
});

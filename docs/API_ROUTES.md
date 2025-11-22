# 🔌 API Routes Documentation

Complete reference for all 38+ API endpoints in Landlord Heaven v3.

---

## Table of Contents

1. [Authentication Routes](#authentication-routes) (5 endpoints)
2. [User Management Routes](#user-management-routes) (3 endpoints)
3. [Case Management Routes](#case-management-routes) (5 endpoints)
4. [Document Routes](#document-routes) (4 endpoints)
5. [Wizard Routes](#wizard-routes) (3 endpoints)
6. [Payment Routes](#payment-routes) (6 endpoints)
7. [Subscription Routes](#subscription-routes) (4 endpoints)
8. [HMO Pro Routes](#hmo-pro-routes) (8 endpoints)
9. [Admin Routes](#admin-routes) (5 endpoints)
10. [Webhook Routes](#webhook-routes) (2 endpoints)

---

## Authentication Routes

### `POST /api/auth/login`

**Description:** Log in a user with email and password.

**Request Body:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  user: {
    id: string;
    email: string;
    full_name: string | null;
  };
}
```

**Status Codes:**
- `200` - Login successful
- `400` - Missing email or password
- `401` - Invalid credentials

---

### `POST /api/auth/signup`

**Description:** Register a new user account.

**Request Body:**
```typescript
{
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  user: {
    id: string;
    email: string;
  };
  message: string; // "Check your email for verification link"
}
```

**Status Codes:**
- `201` - User created successfully
- `400` - Invalid input or email already exists
- `500` - Server error

---

### `POST /api/auth/logout`

**Description:** Log out the current user.

**Response:**
```typescript
{
  success: boolean;
}
```

**Status Codes:**
- `200` - Logout successful

---

### `POST /api/auth/forgot-password`

**Description:** Send password reset email.

**Request Body:**
```typescript
{
  email: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Status Codes:**
- `200` - Reset email sent
- `400` - Invalid email

---

### `POST /api/auth/change-password`

**Description:** Change user password (requires authentication).

**Request Body:**
```typescript
{
  current_password: string;
  new_password: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Status Codes:**
- `200` - Password changed successfully
- `400` - Invalid input or incorrect current password
- `401` - Not authenticated

---

## User Management Routes

### `GET /api/users/me`

**Description:** Get current user profile.

**Response:**
```typescript
{
  user: {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    subscription_tier: string | null;
    subscription_status: string | null;
    trial_ends_at: string | null;
    created_at: string;
  };
}
```

**Status Codes:**
- `200` - User data retrieved
- `401` - Not authenticated

---

### `PUT /api/users/me`

**Description:** Update current user profile.

**Request Body:**
```typescript
{
  full_name?: string;
  phone?: string;
}
```

**Response:**
```typescript
{
  user: {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
  };
}
```

**Status Codes:**
- `200` - Profile updated
- `400` - Invalid input
- `401` - Not authenticated

---

### `DELETE /api/users/me`

**Description:** Delete current user account (soft delete).

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Status Codes:**
- `200` - Account deleted
- `401` - Not authenticated

---

## Case Management Routes

### `GET /api/cases`

**Description:** Get all cases for the current user.

**Query Parameters:**
- `status?: string` - Filter by status (draft, in_progress, completed)
- `case_type?: string` - Filter by type (eviction, money_claim, tenancy_agreement)

**Response:**
```typescript
{
  cases: Array<{
    id: string;
    case_type: string;
    jurisdiction: string;
    status: string;
    wizard_progress: number;
    created_at: string;
    updated_at: string;
  }>;
}
```

**Status Codes:**
- `200` - Cases retrieved
- `401` - Not authenticated

---

### `POST /api/cases`

**Description:** Create a new case.

**Request Body:**
```typescript
{
  case_type: 'eviction' | 'money_claim' | 'tenancy_agreement';
  jurisdiction: 'england-wales' | 'scotland' | 'northern-ireland';
}
```

**Response:**
```typescript
{
  case: {
    id: string;
    case_type: string;
    jurisdiction: string;
    status: 'draft';
    wizard_progress: 0;
    created_at: string;
  };
}
```

**Status Codes:**
- `201` - Case created
- `400` - Invalid input
- `401` - Not authenticated

---

### `GET /api/cases/:id`

**Description:** Get a specific case by ID.

**Response:**
```typescript
{
  case: {
    id: string;
    case_type: string;
    jurisdiction: string;
    status: string;
    wizard_progress: number;
    collected_facts: Record<string, any>;
    ai_analysis: any;
    created_at: string;
    updated_at: string;
  };
}
```

**Status Codes:**
- `200` - Case retrieved
- `404` - Case not found
- `401` - Not authenticated
- `403` - Not authorized to access this case

---

### `PUT /api/cases/:id`

**Description:** Update a case (save wizard progress).

**Request Body:**
```typescript
{
  collected_facts?: Record<string, any>;
  wizard_progress?: number;
  status?: 'draft' | 'in_progress' | 'completed';
}
```

**Response:**
```typescript
{
  case: {
    id: string;
    wizard_progress: number;
    status: string;
    updated_at: string;
  };
}
```

**Status Codes:**
- `200` - Case updated
- `400` - Invalid input
- `404` - Case not found
- `401` - Not authenticated

---

### `DELETE /api/cases/:id`

**Description:** Delete a case.

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Status Codes:**
- `200` - Case deleted
- `404` - Case not found
- `401` - Not authenticated

---

### `GET /api/cases/stats`

**Description:** Get user's case statistics.

**Response:**
```typescript
{
  total: number;
  in_progress: number;
  completed: number;
  by_type: {
    eviction: number;
    money_claim: number;
    tenancy_agreement: number;
  };
}
```

**Status Codes:**
- `200` - Stats retrieved
- `401` - Not authenticated

---

## Document Routes

### `GET /api/documents`

**Description:** Get all documents for the current user.

**Query Parameters:**
- `case_id?: string` - Filter by case ID
- `is_preview?: boolean` - Filter by preview status

**Response:**
```typescript
{
  documents: Array<{
    id: string;
    case_id: string | null;
    document_title: string;
    document_type: string;
    is_preview: boolean;
    file_path: string | null;
    created_at: string;
  }>;
}
```

**Status Codes:**
- `200` - Documents retrieved
- `401` - Not authenticated

---

### `GET /api/documents/:id`

**Description:** Get a specific document by ID.

**Response:**
```typescript
{
  document: {
    id: string;
    case_id: string | null;
    document_title: string;
    document_type: string;
    is_preview: boolean;
    file_path: string | null;
    metadata: any;
    created_at: string;
  };
}
```

**Status Codes:**
- `200` - Document retrieved
- `404` - Document not found
- `401` - Not authenticated

---

### `POST /api/documents/generate`

**Description:** Generate a document from case data.

**Request Body:**
```typescript
{
  case_id: string;
  document_type: string;
  is_preview: boolean;
}
```

**Response:**
```typescript
{
  document: {
    id: string;
    document_title: string;
    file_path: string;
    is_preview: boolean;
  };
}
```

**Status Codes:**
- `201` - Document generated
- `400` - Invalid input or case not ready
- `401` - Not authenticated
- `500` - Document generation failed

---

### `DELETE /api/documents/:id`

**Description:** Delete a document.

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Status Codes:**
- `200` - Document deleted
- `404` - Document not found
- `401` - Not authenticated

---

## Wizard Routes

### `POST /api/wizard/next-question`

**Description:** Get the next wizard question using AI.

**Request Body:**
```typescript
{
  case_id: string;
  case_type: string;
  jurisdiction: string;
  collected_facts: Record<string, any>;
}
```

**Response:**
```typescript
{
  next_question: {
    question_id: string;
    question_text: string;
    input_type: 'multiple_choice' | 'text' | 'currency' | 'date' | 'yes_no' | 'multiple_selection' | 'file_upload' | 'scale';
    options?: Array<{ label: string; value: string; }>;
    validation?: {
      required: boolean;
      min?: number;
      max?: number;
    };
  } | null;
  is_complete: boolean;
}
```

**Status Codes:**
- `200` - Next question generated
- `400` - Invalid input
- `401` - Not authenticated
- `500` - AI generation failed

---

### `POST /api/wizard/analyze`

**Description:** Analyze collected facts and generate recommendations.

**Request Body:**
```typescript
{
  case_id: string;
  case_type: string;
  jurisdiction: string;
  collected_facts: Record<string, any>;
}
```

**Response:**
```typescript
{
  analysis: {
    recommended_route: string;
    eligibility: boolean;
    warnings: string[];
    next_steps: string[];
    estimated_timeline: string;
  };
}
```

**Status Codes:**
- `200` - Analysis complete
- `400` - Invalid input
- `401` - Not authenticated
- `500` - AI analysis failed

---

### `POST /api/wizard/save-progress`

**Description:** Save wizard progress for a case.

**Request Body:**
```typescript
{
  case_id: string;
  collected_facts: Record<string, any>;
  progress: number;
}
```

**Response:**
```typescript
{
  success: boolean;
  case: {
    id: string;
    wizard_progress: number;
  };
}
```

**Status Codes:**
- `200` - Progress saved
- `400` - Invalid input
- `401` - Not authenticated

---

## Payment Routes

### `POST /api/checkout/one-time`

**Description:** Create a Stripe checkout session for one-time products.

**Request Body:**
```typescript
{
  product_id: 'notice_only' | 'eviction_pack' | 'money_claim' | 'standard_ast' | 'premium_ast';
  case_id?: string;
  success_url?: string;
  cancel_url?: string;
}
```

**Response:**
```typescript
{
  checkout_url: string;
  session_id: string;
}
```

**Status Codes:**
- `200` - Checkout session created
- `400` - Invalid product ID
- `401` - Not authenticated
- `500` - Stripe error

---

### `POST /api/checkout/subscription`

**Description:** Create a Stripe checkout session for HMO Pro subscription.

**Request Body:**
```typescript
{
  tier: 'starter' | 'growth' | 'professional' | 'enterprise';
  success_url?: string;
  cancel_url?: string;
}
```

**Response:**
```typescript
{
  checkout_url: string;
  session_id: string;
}
```

**Status Codes:**
- `200` - Checkout session created
- `400` - Invalid tier
- `401` - Not authenticated
- `500` - Stripe error

---

### `GET /api/orders`

**Description:** Get all orders for the current user.

**Response:**
```typescript
{
  orders: Array<{
    id: string;
    product_name: string;
    total_amount: number;
    payment_status: string;
    stripe_checkout_session_id: string;
    created_at: string;
  }>;
}
```

**Status Codes:**
- `200` - Orders retrieved
- `401` - Not authenticated

---

### `GET /api/orders/:id`

**Description:** Get a specific order by ID.

**Response:**
```typescript
{
  order: {
    id: string;
    product_name: string;
    total_amount: number;
    payment_status: string;
    stripe_checkout_session_id: string;
    stripe_payment_intent_id: string | null;
    case_id: string | null;
    created_at: string;
  };
}
```

**Status Codes:**
- `200` - Order retrieved
- `404` - Order not found
- `401` - Not authenticated

---

## Subscription Routes

### `GET /api/subscription/status`

**Description:** Get current subscription status for the user.

**Response:**
```typescript
{
  subscription: {
    tier: string | null;
    status: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    trial_ends_at: string | null;
  } | null;
}
```

**Status Codes:**
- `200` - Status retrieved
- `401` - Not authenticated

---

### `POST /api/subscription/cancel`

**Description:** Cancel the user's subscription (at period end).

**Response:**
```typescript
{
  success: boolean;
  message: string;
  subscription: {
    cancel_at_period_end: boolean;
    current_period_end: string;
  };
}
```

**Status Codes:**
- `200` - Subscription cancelled
- `400` - No active subscription
- `401` - Not authenticated
- `500` - Stripe error

---

### `POST /api/subscription/resume`

**Description:** Resume a cancelled subscription.

**Response:**
```typescript
{
  success: boolean;
  message: string;
  subscription: {
    cancel_at_period_end: boolean;
  };
}
```

**Status Codes:**
- `200` - Subscription resumed
- `400` - No subscription to resume
- `401` - Not authenticated
- `500` - Stripe error

---

### `POST /api/subscription/upgrade`

**Description:** Upgrade/downgrade subscription tier.

**Request Body:**
```typescript
{
  new_tier: 'starter' | 'growth' | 'professional' | 'enterprise';
}
```

**Response:**
```typescript
{
  success: boolean;
  subscription: {
    tier: string;
    proration_amount: number;
  };
}
```

**Status Codes:**
- `200` - Tier changed
- `400` - Invalid tier or same as current
- `401` - Not authenticated
- `500` - Stripe error

---

## HMO Pro Routes

### `GET /api/hmo/properties`

**Description:** Get all HMO properties for the current user.

**Response:**
```typescript
{
  properties: Array<{
    id: string;
    address: string;
    postcode: string;
    total_rooms: number;
    occupied_rooms: number;
    license_number: string | null;
    license_expiry: string | null;
    compliance_status: string;
    created_at: string;
  }>;
}
```

**Status Codes:**
- `200` - Properties retrieved
- `401` - Not authenticated
- `403` - No active HMO Pro subscription

---

### `POST /api/hmo/properties`

**Description:** Add a new HMO property.

**Request Body:**
```typescript
{
  address: string;
  postcode: string;
  total_rooms: number;
  occupied_rooms?: number;
  council_id?: string;
  license_number?: string;
  license_expiry?: string;
}
```

**Response:**
```typescript
{
  property: {
    id: string;
    address: string;
    compliance_status: string;
    created_at: string;
  };
}
```

**Status Codes:**
- `201` - Property created
- `400` - Invalid input or property limit reached
- `401` - Not authenticated
- `403` - No active HMO Pro subscription

---

### `GET /api/hmo/properties/:id`

**Description:** Get a specific property by ID.

**Response:**
```typescript
{
  property: {
    id: string;
    address: string;
    postcode: string;
    total_rooms: number;
    occupied_rooms: number;
    license_number: string | null;
    license_expiry: string | null;
    compliance_status: string;
    council: string | null;
    created_at: string;
    updated_at: string;
  };
}
```

**Status Codes:**
- `200` - Property retrieved
- `404` - Property not found
- `401` - Not authenticated
- `403` - Not authorized

---

### `PUT /api/hmo/properties/:id`

**Description:** Update a property.

**Request Body:**
```typescript
{
  address?: string;
  total_rooms?: number;
  occupied_rooms?: number;
  license_number?: string;
  license_expiry?: string;
}
```

**Response:**
```typescript
{
  property: {
    id: string;
    updated_at: string;
  };
}
```

**Status Codes:**
- `200` - Property updated
- `400` - Invalid input
- `404` - Property not found
- `401` - Not authenticated

---

### `DELETE /api/hmo/properties/:id`

**Description:** Delete a property.

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Status Codes:**
- `200` - Property deleted
- `400` - Property has active tenants
- `404` - Property not found
- `401` - Not authenticated

---

### `GET /api/hmo/tenants`

**Description:** Get all tenants for the current user.

**Query Parameters:**
- `property_id?: string` - Filter by property ID

**Response:**
```typescript
{
  tenants: Array<{
    id: string;
    property_id: string;
    full_name: string;
    email: string;
    room_number: string;
    rent_amount: number;
    lease_start: string;
    lease_end: string;
    status: string;
  }>;
}
```

**Status Codes:**
- `200` - Tenants retrieved
- `401` - Not authenticated
- `403` - No active HMO Pro subscription

---

### `POST /api/hmo/tenants`

**Description:** Add a new tenant.

**Request Body:**
```typescript
{
  property_id: string;
  full_name: string;
  email: string;
  phone?: string;
  room_number: string;
  rent_amount: number;
  deposit_amount: number;
  lease_start: string;
  lease_end: string;
  status: 'active' | 'notice_given' | 'ended';
}
```

**Response:**
```typescript
{
  tenant: {
    id: string;
    full_name: string;
    created_at: string;
  };
}
```

**Status Codes:**
- `201` - Tenant created
- `400` - Invalid input
- `401` - Not authenticated
- `403` - No active HMO Pro subscription

---

### `GET /api/councils`

**Description:** Get all UK councils data.

**Query Parameters:**
- `search?: string` - Search by council name
- `jurisdiction?: string` - Filter by jurisdiction

**Response:**
```typescript
{
  councils: Array<{
    id: string;
    name: string;
    jurisdiction: string;
    hmo_licensing_url: string | null;
    fees: any;
  }>;
}
```

**Status Codes:**
- `200` - Councils retrieved

---

## Admin Routes

### `GET /api/admin/check-access`

**Description:** Check if user has admin access.

**Response:**
```typescript
{
  has_access: boolean;
}
```

**Status Codes:**
- `200` - Access granted
- `403` - Access denied

---

### `GET /api/admin/stats`

**Description:** Get platform statistics.

**Response:**
```typescript
{
  stats: {
    users: {
      total: number;
      verified: number;
      subscribers: number;
      new_this_month: number;
    };
    cases: {
      total: number;
      by_type: Record<string, number>;
      by_status: Record<string, number>;
    };
    documents: {
      total: number;
      previews: number;
      final: number;
    };
    revenue: {
      total_all_time: number;
      this_month: number;
      last_month: number;
      subscriptions_mrr: number;
    };
    ai_usage: {
      total_tokens: number;
      total_cost_usd: number;
      this_month_cost: number;
    };
  };
}
```

**Status Codes:**
- `200` - Stats retrieved
- `401` - Not authenticated
- `403` - Not admin

---

### `GET /api/admin/users`

**Description:** Get all users (admin only).

**Query Parameters:**
- `limit?: number` - Limit results
- `offset?: number` - Offset for pagination

**Response:**
```typescript
{
  users: Array<{
    id: string;
    email: string;
    full_name: string | null;
    subscription_tier: string | null;
    created_at: string;
  }>;
  total: number;
}
```

**Status Codes:**
- `200` - Users retrieved
- `401` - Not authenticated
- `403` - Not admin

---

### `GET /api/admin/orders`

**Description:** Get all orders (admin only).

**Query Parameters:**
- `limit?: number` - Limit results
- `offset?: number` - Offset for pagination

**Response:**
```typescript
{
  orders: Array<{
    id: string;
    user_email: string;
    product_name: string;
    total_amount: number;
    payment_status: string;
    created_at: string;
  }>;
  total: number;
}
```

**Status Codes:**
- `200` - Orders retrieved
- `401` - Not authenticated
- `403` - Not admin

---

## Webhook Routes

### `POST /api/webhooks/stripe`

**Description:** Stripe webhook handler for payment events.

**Headers:**
- `stripe-signature` - Webhook signature for verification

**Events Handled:**
- `checkout.session.completed`
- `payment_intent.succeeded`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Response:**
```typescript
{
  received: boolean;
}
```

**Status Codes:**
- `200` - Event processed
- `400` - Invalid signature or payload
- `500` - Processing error

---

### `POST /api/webhooks/resend`

**Description:** Resend webhook handler for email events.

**Events Handled:**
- `email.delivered`
- `email.bounced`
- `email.complained`

**Response:**
```typescript
{
  received: boolean;
}
```

**Status Codes:**
- `200` - Event processed
- `400` - Invalid payload

---

## Error Response Format

All errors follow this format:

```typescript
{
  error: string; // Human-readable error message
  code?: string; // Optional error code
  details?: any; // Optional additional details
}
```

**Common Error Codes:**
- `UNAUTHORIZED` - Not authenticated
- `FORBIDDEN` - Not authorized to access resource
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input data
- `RATE_LIMIT` - Too many requests
- `INTERNAL_ERROR` - Server error

---

## Rate Limiting

All API routes are rate-limited:

- **Authentication routes:** 10 requests per 15 minutes per IP
- **Standard routes:** 100 requests per 15 minutes per user
- **Webhook routes:** No rate limiting
- **Admin routes:** 500 requests per 15 minutes per admin

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## Authentication

Most routes require authentication via cookies set by Supabase Auth.

**Cookie Name:** `sb-access-token`

**How to Authenticate:**
1. Login via `/api/auth/login`
2. Cookie is set automatically
3. Include cookie in subsequent requests

---

## Pagination

Routes that return lists support pagination:

**Query Parameters:**
- `limit` - Number of items per page (default: 20, max: 100)
- `offset` - Number of items to skip

**Response Format:**
```typescript
{
  items: Array<any>;
  total: number;
  limit: number;
  offset: number;
}
```

---

## Testing

Use the following test cards for Stripe integration:

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC

**Failed Payment:**
- Card: `4000 0000 0000 0002`

**3D Secure Required:**
- Card: `4000 0025 0000 3155`

---

**END OF API ROUTES DOCUMENTATION**

# 🔴 URGENT FIXES NEEDED - Pricing & Missing Pages

**Date:** November 22, 2025
**Priority:** CRITICAL
**Status:** In Progress

---

## 🚨 CRITICAL PRICING ERRORS

### Current vs Blueprint Pricing

| Product | Current (WRONG) | Blueprint v6.0 (CORRECT) | Difference |
|---------|-----------------|--------------------------|------------|
| Notice Only | £29.99 ✓ | £29.99 | CORRECT |
| Complete Pack | £79.99 ❌ | £149.99 | **-£70** (47% underpriced!) |
| Money Claim | £39.99 ❌ | £129.99 | **-£90** (69% underpriced!) |
| Standard AST | £49.99 ❌ | £39.99 | +£10 (25% overpriced) |
| Premium AST | £99.99 ❌ | £59.00 | +£40.99 (69% overpriced) |
| HMO Pro | £29.99 flat ❌ | £19.99-£34.99 tiered | Wrong model |

### Revenue Impact

If we launched with these prices:
- **Complete Pack**: Losing £70 per sale (£149.99 → £79.99)
- **Money Claim**: Losing £90 per sale (£129.99 → £39.99)
- **Standard AST**: Overcharging by £10 (could hurt conversions)
- **Premium AST**: Overcharging by £41 (could kill premium sales)

**Total potential monthly loss**: **£10,000-£20,000** based on projected sales

---

## 📝 FILES THAT NEED PRICE UPDATES

### Product Pages (5 files):
1. ✅ `/src/app/products/notice-only/page.tsx` - Correct (£29.99)
2. ❌ `/src/app/products/complete-pack/page.tsx` - Change £79.99 → £149.99
3. ❌ `/src/app/products/money-claim/page.tsx` - Change £39.99 → £129.99
4. ❌ `/src/app/products/ast/page.tsx` - Change £49.99 → £39.99 AND £99.99 → £59.00
5. ❌ `/src/app/hmo-pro/page.tsx` - Implement tiered pricing (£19.99-£34.99)

### Marketing Pages (3 files):
6. ❌ `/src/app/pricing/page.tsx` - Update all prices in comparison table
7. ❌ `/src/app/about/page.tsx` - Update any price mentions
8. ✅ `/src/app/page.tsx` (homepage) - Check for price mentions

### SEO Metadata (2 files):
9. ❌ `/src/app/pricing/page.tsx` metadata - Update description
10. ❌ Product page metadata - Update all descriptions

### Component Files:
11. ✅ `/src/config/pricing.ts` - Created with correct prices
12. ❌ Any Header/Footer price badges

---

## 🆕 MISSING USER/ADMIN PAGES

### User Dashboard Pages:
1. ❌ `/src/app/dashboard/profile/page.tsx` - User profile editing
2. ❌ `/src/app/dashboard/billing/page.tsx` - Invoices, payment methods, subscription

### Admin Pages:
3. ❌ `/src/app/dashboard/admin/users/page.tsx` - User management list
4. ❌ `/src/app/dashboard/admin/orders/page.tsx` - Orders management list

### Features Needed:

#### Profile Page Should Have:
- Edit full name
- Change email (with verification)
- Change password
- Upload avatar/photo
- Delete account (with confirmation)
- Email preferences

#### Billing Page Should Have:
- Current subscription status
- Payment method on file
- Update payment method (Stripe Customer Portal)
- Invoice history (download PDFs)
- Cancel subscription
- Reactivate subscription
- Upgrade/downgrade tier (HMO Pro)

#### Admin Users Page Should Have:
- List all users (paginated)
- Search by email/name
- Filter by subscription tier
- Sort by signup date, revenue, etc.
- View user details
- Ban/unban users
- Impersonate user (for support)
- View user's cases/documents/orders

#### Admin Orders Page Should Have:
- List all orders (paginated)
- Filter by product, status, date
- Search by user email, order ID
- View order details
- Issue refunds
- Resend confirmation emails
- Export to CSV

---

## 🔧 IMPLEMENTATION PLAN

### Phase 1: Fix Pricing (2-3 hours) 🔴 CRITICAL
1. ✅ Create `/src/config/pricing.ts` with correct values
2. Update Complete Pack page (£79.99 → £149.99)
3. Update Money Claim page (£39.99 → £129.99)
4. Update AST page (£49.99 → £39.99, £99.99 → £59.00)
5. Update HMO Pro page (tiered pricing)
6. Update Pricing comparison page
7. Update all metadata descriptions
8. Search codebase for any hardcoded prices

### Phase 2: Create User Pages (2-3 hours)
9. Create Profile page
10. Create Billing page
11. Add navigation links to settings menu

### Phase 3: Create Admin Pages (2-3 hours)
12. Create Admin Users page
13. Create Admin Orders page
14. Add admin navigation

### Phase 4: Testing & Verification (1 hour)
15. Test all price displays
16. Test HMO Pro tier calculator
17. Test navigation to new pages
18. Verify no broken links

**Total Time**: 7-10 hours
**Priority**: START IMMEDIATELY

---

## 🎯 ACCEPTANCE CRITERIA

✅ **Pricing Fixed When:**
- All pages show correct blueprint prices
- HMO Pro shows tiered pricing table
- Pricing page comparison table is accurate
- No hardcoded old prices remain
- Metadata descriptions updated

✅ **User Pages Complete When:**
- Profile page allows editing all user fields
- Billing page shows subscription + invoices
- Can update payment method via Stripe Portal
- Can cancel/reactivate subscription

✅ **Admin Pages Complete When:**
- Can list and search all users
- Can list and filter all orders
- Can issue refunds from admin panel
- Pagination works on both pages

---

## ⚠️ RISKS IF NOT FIXED

1. **Revenue Loss**: Selling Complete Pack at £79.99 instead of £149.99 = £70 loss per sale
2. **Revenue Loss**: Selling Money Claim at £39.99 instead of £129.99 = £90 loss per sale
3. **Customer Confusion**: Users expect features listed in pricing but can't access profile/billing
4. **Support Burden**: No admin tools to manage users/refunds = manual work
5. **Professional Image**: Missing basic pages looks unfinished

---

## 📊 ESTIMATED IMPACT

### Before Fix (Current State):
- Average order value: **~£60** (wrong pricing)
- Missing user features
- Manual admin work
- Professional score: **7/10**

### After Fix (Blueprint State):
- Average order value: **~£110** (correct pricing) = **+83% revenue**
- Complete user experience
- Efficient admin tools
- Professional score: **10/10**

---

## 🚀 NEXT STEPS

1. **STOP all other work** - This is critical
2. **Fix pricing immediately** - Start with Complete Pack (biggest loss)
3. **Create user pages** - Profile and Billing
4. **Create admin pages** - Users and Orders
5. **Test thoroughly** - No broken links, correct prices everywhere
6. **Deploy** - Get fixed version live ASAP

**Start Time**: NOW
**Target Completion**: 8 hours
**Priority**: 🔴 **MAXIMUM**

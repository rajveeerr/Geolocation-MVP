# Deal Payment and Check-in Integration Testing Guide

## Prerequisites

1. **Backend Running**: Ensure backend is running on `http://localhost:3000`
2. **Frontend Running**: Ensure frontend is running (usually `http://localhost:5173` or similar)
3. **PayPal Sandbox**: Configure PayPal sandbox credentials in `.env`:
   ```
   VITE_PAYPAL_CLIENT_ID=your_sandbox_client_id
   ```
4. **Test User Account**: Create or use an existing user account
5. **Test Merchant Account**: Create or use an existing merchant account (must be APPROVED)
6. **Test Deal**: Create a deal that requires payment (Redeem Now type or has `originalValue`)

## Testing Scenarios

### 1. Payment Flow Testing

#### Test 1.1: Deal with Payment Required

**Steps:**
1. Navigate to a deal detail page for a deal that requires payment
   - Deal type: "Redeem Now" OR
   - Deal has `originalValue > 0`
2. Verify "Pay Now" button is visible
3. Click "Pay Now" button
4. Verify redirect to PayPal sandbox
5. Complete PayPal payment in sandbox
6. Verify redirect back to `/payment/success`
7. Verify automatic redirect to deal detail page with `?payment=success`
8. Verify payment success message appears
9. Verify "Check-in & Earn Points" button is now enabled

**Expected Results:**
- Payment button shows correct amount
- PayPal redirect works
- Payment success page shows deal-specific message
- Redirect to deal page works
- Check-in button enabled after payment

#### Test 1.2: Deal Without Payment Required

**Steps:**
1. Navigate to a deal detail page for a free deal (no payment required)
2. Verify "Pay Now" button is NOT visible
3. Verify "Check-in & Earn Points" button is enabled immediately
4. Click check-in button
5. Verify check-in works without payment

**Expected Results:**
- No payment button shown
- Check-in available immediately
- No payment flow triggered

#### Test 1.3: Payment Failure

**Steps:**
1. Navigate to deal detail page
2. Click "Pay Now"
3. In PayPal sandbox, cancel the payment
4. Verify redirect to `/payment/cancel`
5. Verify appropriate error message
6. Return to deal page
7. Verify payment button still visible (payment not completed)

**Expected Results:**
- Payment cancel page shows
- User can retry payment
- Deal page state unchanged

#### Test 1.4: Payment Already Completed

**Steps:**
1. Complete a payment for a deal
2. Try to access payment success page again with same token
3. Verify "already processed" message or redirect

**Expected Results:**
- Handles duplicate payment attempts gracefully
- Shows appropriate message

### 2. Check-in Flow Testing

#### Test 2.1: Check-in After Payment

**Steps:**
1. Complete payment for a deal (from Test 1.1)
2. On deal detail page, click "Check-in & Earn Points"
3. Allow location access when prompted
4. Verify check-in API call
5. Verify success message with points awarded
6. Verify streak information (if applicable)

**Expected Results:**
- Location permission requested
- Check-in succeeds if within range
- Points awarded message shown
- Streak updated (if applicable)

#### Test 2.2: Check-in Without Payment (Free Deal)

**Steps:**
1. Navigate to free deal
2. Click "Check-in & Earn Points" directly
3. Allow location access
4. Verify check-in succeeds

**Expected Results:**
- Check-in works without payment
- Points awarded normally

#### Test 2.3: Check-in Too Far Away

**Steps:**
1. Navigate to deal detail page
2. Click check-in button
3. Use location that's > 100m from merchant
4. Verify error message about being too far away

**Expected Results:**
- Error message: "You're not close enough to the merchant to check in"
- No points awarded
- Can retry when closer

#### Test 2.4: Check-in Without Location Permission

**Steps:**
1. Navigate to deal detail page
2. Click check-in button
3. Deny location permission
4. Verify error message

**Expected Results:**
- Geolocation error message shown
- Check-in not attempted

### 3. Merchant Check-in Feed Testing

#### Test 3.1: View Check-ins as Merchant

**Steps:**
1. Login as merchant (APPROVED status)
2. Navigate to Merchant Dashboard
3. Go to "Overview" tab
4. Scroll to "Recent Check-ins" section
5. Verify check-ins are displayed
6. Verify user avatars/profile pictures shown
7. Verify deal information shown
8. Verify timestamps (relative time)
9. Verify distance information

**Expected Results:**
- Check-ins list loads
- User information displayed correctly
- Deal info shown
- Timestamps formatted correctly
- Distance shown in meters

#### Test 3.2: Real-time Updates

**Steps:**
1. As merchant, view dashboard with check-in feed
2. As user, check in to a deal from this merchant
3. Wait up to 30 seconds
4. Verify new check-in appears in merchant feed automatically

**Expected Results:**
- New check-in appears without page refresh
- Auto-refresh works (30-second interval)
- Most recent check-ins shown first

#### Test 3.3: Empty Check-in Feed

**Steps:**
1. Login as merchant with no check-ins
2. View dashboard
3. Verify empty state message

**Expected Results:**
- Shows "No check-ins yet" message
- Helpful message about when check-ins will appear

#### Test 3.4: Pagination

**Steps:**
1. As merchant, ensure you have > 10 check-ins
2. View dashboard
3. Verify pagination controls appear
4. Click "Next" page
5. Verify next page of check-ins loads
6. Click "Previous"
7. Verify previous page loads

**Expected Results:**
- Pagination works correctly
- Page numbers update
- Previous/Next buttons enable/disable correctly

### 4. Integration Testing

#### Test 4.1: Complete Flow - Payment → Check-in → Merchant View

**Steps:**
1. **As User:**
   - Navigate to deal requiring payment
   - Complete payment
   - Check in at merchant location
   - Verify points awarded
2. **As Merchant:**
   - Login to merchant dashboard
   - View check-in feed
   - Verify the check-in appears with user info

**Expected Results:**
- Complete flow works end-to-end
- Data flows correctly from user → backend → merchant view
- All components work together

#### Test 4.2: Multiple Users Check-in

**Steps:**
1. Have 3+ users check in to same merchant deal
2. As merchant, view dashboard
3. Verify all check-ins appear
4. Verify they're sorted by most recent first

**Expected Results:**
- All check-ins visible
- Correct sorting
- No duplicates

### 5. Error Handling Testing

#### Test 5.1: Network Errors

**Steps:**
1. Disconnect internet
2. Try to create payment intent
3. Verify error message
4. Reconnect internet
5. Retry payment

**Expected Results:**
- Error message shown
- Can retry after reconnection

#### Test 5.2: Invalid Deal ID

**Steps:**
1. Navigate to `/deals/999999` (non-existent deal)
2. Verify error handling

**Expected Results:**
- "Deal not found" message
- Back button works

#### Test 5.3: Expired Payment Session

**Steps:**
1. Start payment flow
2. Wait for session to expire (or manually expire)
3. Try to complete payment
4. Verify error handling

**Expected Results:**
- Appropriate error message
- Can start new payment

### 6. UI/UX Testing

#### Test 6.1: Button States

**Steps:**
1. Navigate to deal page
2. Verify button states:
   - Payment button: enabled/disabled correctly
   - Check-in button: enabled/disabled based on payment status
3. Click buttons and verify loading states

**Expected Results:**
- Buttons show correct states
- Loading spinners appear during processing
- Buttons disabled during operations

#### Test 6.2: Responsive Design

**Steps:**
1. Test on mobile device/browser
2. Test on tablet
3. Test on desktop
4. Verify all components render correctly

**Expected Results:**
- Responsive layout works
- Buttons accessible on all screen sizes
- Check-in feed readable on mobile

#### Test 6.3: Payment Success Message

**Steps:**
1. Complete payment
2. Return to deal page
3. Verify success message appears
4. Verify message disappears or can be dismissed

**Expected Results:**
- Success message visible
- Clear indication payment completed
- Check-in enabled

## Test Data Setup

### Create Test Deal with Payment

```bash
# Via API or Admin Panel
POST /api/deals
{
  "title": "Test Paid Deal",
  "description": "Test deal requiring payment",
  "dealType": "REDEEM_NOW",
  "originalValue": 25.00,
  "discountPercentage": 20,
  "startTime": "2024-01-01T00:00:00Z",
  "endTime": "2024-12-31T23:59:59Z",
  "categoryId": 1,
  "dealTypeId": 1,
  "redemptionInstructions": "Show QR code at checkout"
}
```

### Create Test Deal Without Payment

```bash
POST /api/deals
{
  "title": "Test Free Deal",
  "description": "Free deal for testing",
  "dealType": "STANDARD",
  "discountPercentage": 50,
  "startTime": "2024-01-01T00:00:00Z",
  "endTime": "2024-12-31T23:59:59Z",
  "categoryId": 1,
  "dealTypeId": 1,
  "redemptionInstructions": "Just show this deal"
}
```

## PayPal Sandbox Testing

### Test Accounts

1. **Personal Account (Buyer)**:
   - Email: `buyer@personal.example.com`
   - Password: (from PayPal sandbox)
   - Use this to test payments

2. **Business Account (Merchant)**:
   - Email: `merchant@business.example.com`
   - Password: (from PayPal sandbox)
   - Use this to receive payments

### Testing Payment Scenarios

1. **Successful Payment**: Complete payment normally
2. **Cancel Payment**: Click cancel in PayPal
3. **Payment Error**: Use invalid card in sandbox
4. **Expired Session**: Wait for session timeout

## Browser DevTools Testing

### Check Network Requests

1. Open DevTools → Network tab
2. Filter by "payments" or "check-in"
3. Verify API calls:
   - `POST /api/payments/intent` - Payment intent creation
   - `POST /api/payments/capture` - Payment capture
   - `POST /api/users/check-in` - Check-in
   - `GET /api/merchants/check-ins` - Merchant feed

### Check Console for Errors

1. Open DevTools → Console
2. Look for any errors during flow
3. Verify no unhandled promise rejections

### Check localStorage

1. Open DevTools → Application → Local Storage
2. Verify `pendingDealPayment` is set during payment flow
3. Verify it's cleared after payment success

## Common Issues and Solutions

### Issue: Payment button not showing

**Solution:**
- Check if deal has `originalValue` or is "Redeem Now" type
- Check browser console for errors
- Verify deal data structure

### Issue: Check-in button disabled

**Solution:**
- Verify payment completed (check URL params)
- Check `paymentCompleted` state in component
- Verify deal doesn't require payment

### Issue: Check-in feed not updating

**Solution:**
- Check auto-refresh is enabled (30-second interval)
- Verify merchant is logged in
- Check API response in Network tab
- Verify merchant has APPROVED status

### Issue: PayPal redirect not working

**Solution:**
- Verify `VITE_PAYPAL_CLIENT_ID` is set
- Check PayPal sandbox credentials
- Verify return URL configuration
- Check browser console for errors

## Performance Testing

### Test Auto-refresh Performance

1. Open merchant dashboard
2. Monitor Network tab
3. Verify requests every 30 seconds
4. Check for memory leaks (keep dashboard open for 5+ minutes)

### Test Multiple Check-ins

1. Have 10+ users check in rapidly
2. Verify merchant feed handles load
3. Check pagination works with many check-ins

## Security Testing

### Test Authentication

1. Try to access payment endpoints without auth
2. Try to check in without auth
3. Try to view merchant feed without merchant account

**Expected Results:**
- All endpoints require authentication
- Proper error messages for unauthorized access

### Test Payment Authorization

1. Try to capture payment for different user's order
2. Verify authorization checks

**Expected Results:**
- Users can only capture their own payments
- Proper error messages

## Checklist

- [ ] Payment flow works for paid deals
- [ ] Check-in works for free deals
- [ ] Check-in works after payment
- [ ] Payment failure handled gracefully
- [ ] Merchant feed displays check-ins
- [ ] Auto-refresh works (30-second interval)
- [ ] Pagination works
- [ ] Error messages are clear
- [ ] UI is responsive
- [ ] Loading states work
- [ ] Success messages appear
- [ ] No console errors
- [ ] Network requests succeed
- [ ] Authentication required
- [ ] Location permission handled

## Quick Test Script

```bash
# 1. Start backend
cd backend
npm run dev

# 2. Start frontend (new terminal)
cd web
npm run dev

# 3. Test as User
# - Login
# - Navigate to deal detail page
# - Complete payment flow
# - Check in

# 4. Test as Merchant (new browser/incognito)
# - Login as merchant
# - View dashboard
# - Verify check-in appears
```

## Notes

- Use PayPal sandbox for all payment testing
- Test with real geolocation (or mock it in DevTools)
- Clear localStorage if testing payment flow multiple times
- Check backend logs for API errors
- Use browser DevTools to debug issues


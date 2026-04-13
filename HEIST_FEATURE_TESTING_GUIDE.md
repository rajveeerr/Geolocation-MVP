# Heist Feature - Complete Testing Guide

## Prerequisites

1. **Backend Running**: Ensure backend is running on `http://localhost:3000`
2. **Frontend Running**: Ensure frontend is running on `http://localhost:5173`
3. **Database**: Ensure database has heist tables migrated
4. **Test Users**: Create at least 2-3 test users for testing heist execution

## Quick Verification Checklist

### ✅ Phase 1: Token System

#### 1.1 Token Balance Display
- [ ] **Header Badge**: Check if token badge appears in header (next to coins/streak)
- [ ] **Initial State**: New user should show 0 tokens
- [ ] **Tooltip**: Hover over badge to see detailed info (balance, earned, spent)
- [ ] **Visual**: Badge should have amber/gold styling with trophy icon

**How to Test:**
1. Login as a user
2. Check header for token badge
3. Hover over badge to see tooltip
4. Verify it shows 0 tokens for new users

#### 1.2 Token Earning (Referral)
- [ ] **Referral Signup**: When someone signs up with your referral code, you get 1 token
- [ ] **Real-time Update**: Token balance updates immediately after referral
- [ ] **Notification**: You receive a TOKEN_EARNED notification

**How to Test:**
1. Login as User A
2. Go to Referrals page and copy referral code
3. Logout and create new account (User B) with that referral code
4. Login as User A again
5. Check token badge - should show 1 token
6. Check notifications - should have TOKEN_EARNED notification

---

### ✅ Phase 2: Leaderboard Integration

#### 2.1 Heist Button on Leaderboard
- [ ] **Button Visibility**: "Rob" button appears on each leaderboard row (except your own)
- [ ] **Button State**: Button shows correct state (enabled/disabled)
- [ ] **Eligibility Check**: Button is disabled when you can't rob (no tokens, cooldown, etc.)
- [ ] **Tooltip**: Hover over disabled button shows reason

**How to Test:**
1. Go to `/leaderboard`
2. Verify "Rob" button appears on other users' rows
3. Verify your own row does NOT have "Rob" button
4. If you have 0 tokens, button should be disabled with tooltip

#### 2.2 Eligibility Checking
- [ ] **No Tokens**: Button disabled, tooltip says "You need at least 1 Heist Token"
- [ ] **On Cooldown**: Button disabled, tooltip shows hours remaining
- [ ] **Target Protected**: Button disabled, tooltip shows protection time
- [ ] **Target Too Few Points**: Button disabled if target has < 20 points
- [ ] **Eligible**: Button enabled when all conditions met

**How to Test:**
1. **Test No Tokens:**
   - Use account with 0 tokens
   - Go to leaderboard
   - Button should be disabled

2. **Test Cooldown:**
   - Perform a heist
   - Immediately try to rob again
   - Button should be disabled with cooldown message

3. **Test Protection:**
   - Rob a user
   - Try to rob same user again within 48 hours
   - Button should be disabled

4. **Test Eligibility:**
   - Have 1+ tokens
   - Not on cooldown
   - Target has 20+ points
   - Target not protected
   - Button should be enabled

---

### ✅ Phase 3: Heist Execution Flow

#### 3.1 Confirmation Modal
- [ ] **Modal Opens**: Clicking "Rob" opens confirmation modal
- [ ] **Correct Info**: Modal shows victim name, points, potential steal amount
- [ ] **Token Cost**: Shows "1 Token" cost
- [ ] **Your Balance**: Shows your current token balance
- [ ] **Warning**: Shows 24-hour cooldown warning

**How to Test:**
1. Go to leaderboard with eligible target
2. Click "Rob" button
3. Verify modal shows:
   - Target name
   - Target's current points
   - Points you'll steal (5% of their points, max 100)
   - Token cost (1)
   - Your token balance

#### 3.2 Heist Execution
- [ ] **Success**: When eligible, heist executes successfully
- [ ] **Points Transfer**: Your points increase, victim's decrease
- [ ] **Token Deduction**: Your token balance decreases by 1
- [ ] **Success Animation**: Celebration animation appears
- [ ] **Toast Notification**: Success toast appears
- [ ] **Leaderboard Update**: Leaderboard refreshes with new points

**How to Test:**
1. Ensure you have 1+ tokens
2. Find eligible target (20+ points, not protected)
3. Click "Rob" → Confirm
4. Verify:
   - Success animation appears
   - Toast shows "Heist Successful! You stole X points!"
   - Token balance decreases
   - Leaderboard updates
   - Your points increased
   - Victim's points decreased

#### 3.3 Error Handling
- [ ] **Insufficient Tokens**: Error toast with "Refer friends to earn tokens"
- [ ] **Cooldown**: Error toast with hours remaining
- [ ] **Target Protected**: Error toast with protection time
- [ ] **Target Not Found**: Error toast with appropriate message
- [ ] **Network Error**: Graceful error handling

**How to Test:**
1. **Test Insufficient Tokens:**
   - Use account with 0 tokens
   - Try to execute heist
   - Should show error toast

2. **Test Cooldown:**
   - Perform heist
   - Immediately try another (within 24h)
   - Should show cooldown error

3. **Test Protection:**
   - Rob a user
   - Try to rob same user again
   - Should show protection error

---

### ✅ Phase 4: History & Stats

#### 4.1 Heist History Page
- [ ] **Page Loads**: `/heist/history` page loads without errors
- [ ] **History Display**: Shows your heist history (as attacker and victim)
- [ ] **Filters Work**: Role filter (attacker/victim/both) works
- [ ] **Status Filter**: Status filter works
- [ ] **Pagination**: Pagination works correctly
- [ ] **Empty State**: Shows empty state when no history

**How to Test:**
1. Go to `/heist/history`
2. Verify page loads
3. Check if your heists appear
4. Test filters:
   - Switch between "All", "Attacker", "Victim"
   - Filter by status
5. Test pagination if you have many heists

#### 4.2 History Row Display
- [ ] **Correct Info**: Shows other user's name, points stolen/lost
- [ ] **Status Badge**: Shows correct status (Success, Failed, etc.)
- [ ] **Timestamp**: Shows relative time (e.g., "2 hours ago")
- [ ] **Role Indicator**: Clearly shows if you were attacker or victim

**How to Test:**
1. Perform a heist
2. Go to history page
3. Verify the heist appears with:
   - Correct victim name
   - Points stolen
   - Success status
   - Timestamp

#### 4.3 Heist Stats
- [ ] **Stats Display**: Stats component shows correct data
- [ ] **As Attacker**: Shows total heists, successful, failed, points stolen
- [ ] **As Victim**: Shows times robbed, points lost
- [ ] **Net Points**: Shows net points gained/lost

**How to Test:**
1. Perform several heists
2. Get robbed a few times
3. Check stats component
4. Verify calculations are correct

---

### ✅ Phase 5: Notifications

#### 5.1 Notification Badge
- [ ] **Badge Appears**: Notification badge appears in header
- [ ] **Unread Count**: Shows correct unread count
- [ ] **Hides When Zero**: Badge hides when no unread notifications
- [ ] **Clickable**: Clicking badge goes to notifications page

**How to Test:**
1. Perform a heist or get robbed
2. Check header for notification badge
3. Verify count is correct
4. Click badge - should go to notifications page

#### 5.2 Notifications Page
- [ ] **Page Loads**: `/heist/notifications` page loads
- [ ] **Notifications List**: Shows all notifications
- [ ] **Unread Filter**: "Unread Only" filter works
- [ ] **Type Filter**: Type filter works (HEIST_SUCCESS, HEIST_VICTIM, TOKEN_EARNED)
- [ ] **Mark as Read**: Individual "Mark Read" button works
- [ ] **Mark All Read**: "Mark All Read" button works

**How to Test:**
1. Go to `/heist/notifications`
2. Verify notifications appear
3. Test filters:
   - Toggle "Unread Only"
   - Filter by type
4. Click "Mark Read" on individual notification
5. Click "Mark All Read"
6. Verify unread count updates

#### 5.3 Notification Types
- [ ] **HEIST_SUCCESS**: Appears after successful heist
- [ ] **HEIST_VICTIM**: Appears when you're robbed
- [ ] **TOKEN_EARNED**: Appears when you earn a token

**How to Test:**
1. **HEIST_SUCCESS:**
   - Perform a heist
   - Check notifications
   - Should see "Heist Successful!" notification

2. **HEIST_VICTIM:**
   - Get robbed by another user
   - Check notifications
   - Should see "You Were Robbed!" notification

3. **TOKEN_EARNED:**
   - Refer a friend
   - Check notifications
   - Should see "Token Earned!" notification

---

### ✅ Phase 6: Integration Points

#### 6.1 Header Integration
- [ ] **Token Badge**: Appears in header for logged-in users
- [ ] **Notification Badge**: Appears in header
- [ ] **Only for Users**: Badges only show for non-merchant users
- [ ] **Responsive**: Works on mobile and desktop

**How to Test:**
1. Login as regular user
2. Check header - should see token badge and notification badge
3. Login as merchant - badges should NOT appear
4. Test on mobile viewport

#### 6.2 Navigation
- [ ] **Routes Work**: All routes are accessible
- [ ] **Protected Routes**: Routes require authentication
- [ ] **Navigation Links**: Can navigate between pages

**How to Test:**
1. Try accessing:
   - `/heist/history` (should require login)
   - `/heist/notifications` (should require login)
2. Verify navigation works from header badges

---

## Comprehensive Test Scenarios

### Scenario 1: Complete Heist Flow
1. **Setup:**
   - User A: Has 1 token, 100 points
   - User B: Has 500 points, not protected

2. **Steps:**
   - Login as User A
   - Go to leaderboard
   - Click "Rob" on User B
   - Confirm in modal
   - Verify success

3. **Expected Results:**
   - User A: 0 tokens, ~125 points (100 + 25 stolen)
   - User B: ~475 points (500 - 25)
   - User A gets HEIST_SUCCESS notification
   - User B gets HEIST_VICTIM notification
   - User A on 24h cooldown
   - User B protected for 48h

### Scenario 2: Cooldown Prevention
1. **Setup:**
   - User A: Just performed a heist

2. **Steps:**
   - Try to perform another heist immediately
   - Check eligibility

3. **Expected Results:**
   - Button disabled
   - Tooltip shows cooldown time
   - Error if attempted: "You can perform another heist in X hours"

### Scenario 3: Protection System
1. **Setup:**
   - User A: Robbed User B
   - User C: Wants to rob User B

2. **Steps:**
   - Login as User C
   - Try to rob User B (within 48h)

3. **Expected Results:**
   - Button disabled
   - Tooltip shows protection time
   - Error if attempted: "This player is protected for X hours"

### Scenario 4: Token Earning Flow
1. **Setup:**
   - User A: Has referral code
   - User B: New user

2. **Steps:**
   - User B signs up with User A's referral code
   - Login as User A

3. **Expected Results:**
   - User A gets 1 token
   - User A gets TOKEN_EARNED notification
   - Token badge updates

### Scenario 5: Multiple Heists
1. **Setup:**
   - User A: Has 3 tokens
   - Multiple eligible targets

2. **Steps:**
   - Perform 3 heists (waiting 24h between each)
   - Check history
   - Check stats

3. **Expected Results:**
   - All 3 heists appear in history
   - Stats show 3 successful heists
   - Token balance: 0
   - Total points stolen calculated correctly

---

## Edge Cases to Test

### Edge Case 1: Victim with Exactly 20 Points
- [ ] Can rob user with exactly 20 points
- [ ] Steals 1 point (5% of 20 = 1)

### Edge Case 2: Victim with Very High Points
- [ ] Can rob user with 10,000 points
- [ ] Steals exactly 100 points (max cap)

### Edge Case 3: Self-Robbery Prevention
- [ ] Cannot rob yourself
- [ ] Button doesn't appear on your own row

### Edge Case 4: Network Failures
- [ ] Handles network errors gracefully
- [ ] Shows appropriate error message
- [ ] Doesn't break UI

### Edge Case 5: Concurrent Heists
- [ ] Two users try to rob same person simultaneously
- [ ] Both succeed if eligible (backend handles this)

### Edge Case 6: Empty States
- [ ] History page with no heists
- [ ] Notifications page with no notifications
- [ ] Stats with no data

---

## Browser Console Checks

### No Errors
- [ ] Open browser DevTools Console
- [ ] Check for any red errors
- [ ] Check for warnings

### Network Requests
- [ ] Check Network tab
- [ ] Verify API calls are made correctly:
  - `GET /api/heist/tokens` - 200 OK
  - `GET /api/heist/can-rob/:id` - 200 OK
  - `POST /api/heist/execute` - 200 OK (success) or appropriate error
  - `GET /api/heist/history` - 200 OK
  - `GET /api/heist/stats` - 200 OK
  - `GET /api/heist/notifications` - 200 OK

---

## Performance Checks

### Loading States
- [ ] All async operations show loading states
- [ ] No flickering or blank screens
- [ ] Smooth transitions

### Caching
- [ ] Token balance caches correctly
- [ ] History doesn't refetch unnecessarily
- [ ] Notifications update in real-time

---

## Mobile Responsiveness

### Mobile View
- [ ] Header badges visible and clickable
- [ ] Leaderboard "Rob" button works on mobile
- [ ] Modals are mobile-friendly
- [ ] History page is scrollable
- [ ] Notifications page works on mobile

---

## Common Issues to Watch For

### Issue 1: Token Balance Not Updating
**Symptom**: Token badge shows old balance after heist
**Fix**: Check if `queryClient.invalidateQueries` is called after heist

### Issue 2: Button Always Disabled
**Symptom**: "Rob" button always disabled even when eligible
**Fix**: Check eligibility hook is enabled and victimId is correct

### Issue 3: Modal Doesn't Close
**Symptom**: Confirmation modal stays open after heist
**Fix**: Check `setShowConfirmModal(false)` is called

### Issue 4: Notifications Not Appearing
**Symptom**: No notifications after heist
**Fix**: Check notifications query is invalidated after heist

### Issue 5: History Empty
**Symptom**: History page shows empty even after heists
**Fix**: Check backend response structure matches frontend types

---

## Quick Test Script

```bash
# 1. Start Backend
cd backend
npm run dev

# 2. Start Frontend (in new terminal)
cd web
npm run dev

# 3. Test Flow:
# - Login as User A
# - Go to /referrals, copy code
# - Logout, create User B with referral code
# - Login as User A → Check token badge (should be 1)
# - Go to /leaderboard
# - Click "Rob" on User B
# - Confirm heist
# - Verify success animation
# - Check /heist/history
# - Check /heist/notifications
# - Verify User B got robbed notification
```

---

## Backend Verification

### Check Database
```sql
-- Check token balance
SELECT * FROM "HeistToken" WHERE "userId" = YOUR_USER_ID;

-- Check heist records
SELECT * FROM "Heist" WHERE "attackerId" = YOUR_USER_ID OR "victimId" = YOUR_USER_ID;

-- Check notifications
SELECT * FROM "HeistNotification" WHERE "userId" = YOUR_USER_ID;
```

### Check Backend Logs
- [ ] No errors in backend console
- [ ] API requests logged correctly
- [ ] Transactions complete successfully

---

## Final Verification

### ✅ All Features Working
- [ ] Token system: Earning, displaying, spending
- [ ] Heist execution: Full flow from button to success
- [ ] History: Displaying, filtering, pagination
- [ ] Stats: Calculating correctly
- [ ] Notifications: Receiving, displaying, marking read
- [ ] Error handling: All error cases handled
- [ ] UI/UX: Smooth animations, loading states
- [ ] Integration: Header badges, routes, navigation

### ✅ No Errors
- [ ] No console errors
- [ ] No network errors
- [ ] No TypeScript errors
- [ ] No runtime errors

### ✅ User Experience
- [ ] Intuitive flow
- [ ] Clear error messages
- [ ] Helpful tooltips
- [ ] Smooth animations
- [ ] Responsive design

---

## Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check network tab for failed requests
3. Check backend logs
4. Verify database has correct data
5. Check that all environment variables are set


# Production Deployment Notes

## Welcome Email Feature

The application sends a non‑blocking “Welcome” email immediately after a user successfully registers (`POST /api/auth/register`). The send is fire‑and‑forget so it will not delay the API response. Failures are logged but do not affect user creation.

### Flow Summary
 
* Column `birthday` (nullable) added to `User` table.
* Scheduler (`scheduleDailyBirthdays`) runs once per day shortly after 00:00:00 UTC.
* It queries users with matching month/day using a raw SQL filter with `EXTRACT(MONTH|DAY FROM birthday)`.
* For each match we invoke `sendBirthdayEmail()` (fire & forget) tagged with `birthday`.
4. If email sending is disabled or misconfigured, the call exits gracefully (no throw).

 
Currently there is no public API endpoint for setting a birthday (future enhancement). You can populate via SQL or an admin script:

```sql
UPDATE "User" SET birthday = '1995-09-11' WHERE id = 123;
```
| Variable | Required | Description |
|----------|----------|-------------|
 
Uses the same email gating (`EMAIL_ENABLED`) and provider credentials as other transactional emails. If email is disabled nothing happens beyond a debug skip.
| `BREVO_API_KEY` | Yes (if enabled) | Brevo (Sendinblue) API key. |
| `EMAIL_FROM_ADDRESS` | Yes (if enabled) | Sender envelope/from address. |
 
* Award birthday bonus points.
* User self‑service birthday update with immutability rules.
* Batch queue and retry logic.
* Local timezone handling (currently strict UTC midnight).
### Enabling in Production

Set the following (example):

```bash
EMAIL_ENABLED=true
BREVO_API_KEY=xxxxxxxxxxxxxxxx
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
EMAIL_FROM_NAME=YOHOP
```

Restart the service after updating environment variables.

### Observability & Logging

Logs (via Winston) will show:

* Info log on success: `[email] Sent email to user@example.com subject="Welcome to YOHOP! 🎉"`
* Debug log (only if disabled): `[email] EMAIL_ENABLED not true – skipping send.`
* Warning if required config missing.
* Error with status code + response body if Brevo rejects the request.

### Safety / Failure Modes

* Missing or invalid config: silently skips sending (no user impact).
* External API timeout (>10s) logs an error, request already returned 201 to client.
* Any thrown error inside `sendWelcomeEmail` is caught in the route via the `.catch` handler.

### Testing

`tests/welcome.email.test.ts` mocks `sendEmail` and asserts the welcome tag is applied. Run the full suite locally with `npm test`. (User requested not to auto-run in this environment.)

### Extending the Template

* Inject referral code & initial points into the email body.
* Add a transactional template ID instead of raw HTML (if moving to provider managed templates).
* Queue / retry mechanism (e.g., BullMQ) for improved resilience.

---

This document section was added to clarify the production configuration for the welcome email feature.

## Birthday Email Feature

The system now sends a simple "Happy Birthday" greeting email to users whose stored `birthday` (UTC date) matches the current UTC month/day.

### How It Works
* Column `birthday` (nullable) added to `User` table.
* Scheduler (`scheduleDailyBirthdays`) runs once per day shortly after 00:00:00 UTC.
* It queries users with matching month/day using a raw SQL filter with `EXTRACT(MONTH|DAY FROM birthday)`.
* For each match we invoke `sendBirthdayEmail()` (fire & forget) tagged with `birthday`.

### Adding / Updating Birthdays
Currently there is no public API endpoint for setting a birthday (future enhancement). You can populate via SQL or an admin script:
```sql
UPDATE "User" SET birthday = '1995-09-11' WHERE id = 123;
```
Year may be any valid year; only month/day are used for matching.

### Environment / Safety
Uses the same email gating (`EMAIL_ENABLED`) and provider credentials as other transactional emails. If email is disabled nothing happens beyond a debug skip.

### Future Enhancements
* Award birthday bonus points.
* User self‑service birthday update with immutability rules.
* Batch queue and retry logic.
* Local timezone handling (currently strict UTC midnight).


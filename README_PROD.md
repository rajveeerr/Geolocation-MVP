# Production Deployment Notes

## Welcome Email Feature

The application sends a non‑blocking “Welcome” email immediately after a user successfully registers (`POST /api/auth/register`). The send is fire‑and‑forget so it will not delay the API response. Failures are logged but do not affect user creation.

### Flow Summary

1. User submits registration.
2. User record + signup points + referral code are created inside a Prisma transaction.
3. After commit, `sendWelcomeEmail(email, name?)` is invoked.
4. If email sending is disabled or misconfigured, the call exits gracefully (no throw).

### Environment Variables

Configure these in your production environment (or `.env` file) to enable sending:

| Variable | Required | Description |
|----------|----------|-------------|
| `EMAIL_ENABLED` | Yes (to send) | Must be set to `true` (case‑insensitive) to actually send via Brevo. |
| `BREVO_API_KEY` | Yes (if enabled) | Brevo (Sendinblue) API key. |
| `EMAIL_FROM_ADDRESS` | Yes (if enabled) | Sender envelope/from address. |
| `EMAIL_FROM_NAME` | Optional | Friendly display name (default: `NoReply`). |

All of these are already listed in `env.production.example`.

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


# Merchant Approval Admin Endpoints

These endpoints allow an `ADMIN` user to review and moderate merchant applications.

## Authentication & Authorization

All endpoints require:

- Valid JWT Bearer token (`Authorization: Bearer <token>`)
- Authenticated user role must be `ADMIN`.

If a non-admin attempts access, a `403` is returned.

## List Merchants

`GET /api/admin/merchants?status=PENDING&page=1&pageSize=50`

Query Parameters:

- `status` (optional) One of `PENDING|APPROVED|REJECTED` (default: `PENDING`)
- `page` (optional) 1-based page number (default 1)
- `pageSize` (optional) max 200 (default 50)

Response:

```json
{
  "page": 1,
  "pageSize": 50,
  "total": 1,
  "merchants": [
    {
      "id": 7,
      "businessName": "BizCo",
      "address": "123 Street",
      "description": null,
      "logoUrl": null,
      "status": "PENDING",
      "createdAt": "2025-09-20T10:00:00.000Z",
      "updatedAt": "2025-09-20T10:00:00.000Z",
      "owner": { "id": 14, "email": "merchant@example.com", "name": null, "role": "MERCHANT" },
      "stores": [ { "id": 3, "cityId": 2, "address": "123 Street", "latitude": null, "longitude": null, "active": true } ]
    }
  ]
}
```

## Approve Merchant

`POST /api/admin/merchants/:id/approve`

Idempotent: approving an already approved merchant returns 200 with a message.

Response:

```json
{ "message": "Merchant approved", "merchant": { /* updated merchant object */ } }
```

Emails: A notification is sent to the owner (best-effort) if email exists.

## Reject Merchant

`POST /api/admin/merchants/:id/reject`

Body (optional):

```json
{ "reason": "Incomplete documents" }
```

The `reason` is not persisted (no column yet); it is included in the notification email only. (Add a column if persistent audit trail is desired.)

Response:

```json
{ "message": "Merchant rejected", "merchant": { /* merchant object */ }, "note": "Reason not stored (no column) - include in email only." }
```

## Notes / Future Enhancements

- Add `rejectionReason` & `approvedAt` / `rejectedAt` timestamp columns if audit history is required.
- Add filtering by `businessName` / `ownerEmail` query params.
- Add activity log entries on status transitions.
- Emit metrics for approvals/rejections.

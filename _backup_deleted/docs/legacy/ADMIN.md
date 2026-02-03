# FutureSeer Admin Privileges

This document describes who has admin access, which pages and APIs they can use, and what is not yet implemented.

## Role definitions

Defined in [`hooks/use-auth.tsx`](../hooks/use-auth.tsx).

| Role | How it's set | Access |
|------|--------------|--------|
| **Super admin (God Mode)** | Email `andyrozario@hotmail.com` **or** Firebase custom claim `superadmin` | Full admin dashboard (`/admin/dashboard`), community management, security admin |
| **Admin (Mary Mode)** | Email `andyoliverrozario2@gmail.com` **or** Firebase custom claim `admin` (or `token.claims.role === 'admin'`) | Bypass upgrade prompts; community management; security admin |
| **Special user** | Email `andyrozario7@gmail.com` | No upgrade prompts only (not admin) |

## Admin IDs in code

- **Super admin:** email `andyrozario@hotmail.com`; any UID with custom claim `superadmin`.
- **Admin:** email `andyoliverrozario2@gmail.com`; any UID with custom claim `admin: true` or `role: 'admin'`.

To grant admin via Firebase, run the script in `firebaseadminscripts/setAdminClaim.js` (set UID and use `{ admin: true }` so the client recognizes it).

## Pages and guards

| Page | Route | Who can access |
|------|--------|----------------|
| God Mode Dashboard | `/admin/dashboard` | Super admin only (`isSuperadmin`) |
| Community Management | `/admin/community-management` | Super admin or admin (`isSuperadmin` or `isAdmin`) |
| Security Administration | `/admin/security` | Super admin or admin (`isSuperadmin` or `isAdmin`) |

The "Admin" link in the main nav (TopNavBar) is shown only when `isAdmin` or `isSuperadmin` is true.

## APIs not yet implemented

The God Mode Dashboard calls these API routes; **none of them exist** in the repo yet. Those actions will 404 until the routes are added and secured with Firebase Admin SDK (verify `admin`/`superadmin` from decoded ID token):

- `POST /api/admin/set-claims` – update user custom claims
- `GET /api/admin/list-users` – list users with claims (pagination, search)
- `POST /api/admin/impersonate` – impersonate a user
- `GET /api/admin/export-users` – export users (JSON/CSV)
- `POST /api/admin/bulk-actions` – bulk user actions
- `GET /api/admin/audit-logs` – fetch audit logs

Implement these with server-side verification of admin/superadmin before performing any sensitive action.

# ASSUMPTIONS: Technical & Domain Decisions

1. **Authentication Engine & Session Management**:
   - The existing HMAC-SHA256 signed session cookie (`law_firm_session`) with PBKDF2 password hashing is robust, edge-compatible, and avoids third-party vendor lock-in. We will enhance it with server-side middleware and token verification, with an inactivity timeout setting defaulting to 30 minutes.
   - For Edge middleware compatibility, route verification checks the presence and validity of the session cookie before routing to protected pages.

2. **Role Hierarchy & Default Roles**:
   - `admin`: Senior Lawyer / Managing Advocate (Full permissions firm-wide).
   - `advocate`: Assigned cases only; status updates, document uploads, reports for own cases.
   - `associate`: Assigned cases only; status updates, uploads. Case creation disabled by default (controlled by `associate_can_create_case` setting).
   - `viewer`: Read-only, disabled by default.

3. **Date Format Standard**:
   - All client-facing dates are displayed as `DD.MM.YYYY` (e.g. `21.09.2026`). Internal storage in MongoDB utilizes ISO standard dates / YYYY-MM-DD strings for accurate sorting and range querying.

4. **Branding Configuration**:
   - Single central configuration file / environment variables control `BRAND_NAME` ("Case Database" – "The Legal Solutions"), `LOGO_URL`, `FAVICON`, and `POWERED_BY`.

5. **Soft Deletes**:
   - Cases and institutions use soft deletion (`isDeleted: true`, `deletedAt: Date`, `deletedBy: ObjectId`) to protect confidential legal records from accidental permanent loss.

6. **Landing Flow**:
   - Unauthenticated visitors hitting `/` are presented directly with the Chamber Portal Login & Registration screen.
   - Authenticated visitors hitting `/` are instantly forwarded to `/dashboard`.
   - Any attempt to directly access protected routes (`/dashboard`, `/cases`, `/institutions`, `/reports`, `/team`) without an active session is intercepted by Next.js middleware and redirected to `/`.

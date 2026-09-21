# AUDIT: Case Database – The Legal Solutions

## 1. Tech Stack & Architecture

- **Framework**: Next.js 16.3.5 (App Router, Turbopack)
- **Runtime / Frontend**: React 19.2.8, React-DOM 19.2.8
- **Language**: TypeScript 5.9.3 (Strict Mode, ES2020 target)
- **Styling**: Tailwind CSS v4.3.3 (`@tailwindcss/postcss`), PostCSS 8.5.28, Autoprefixer 10.6.1, `clsx` 2.1.1, `tailwind-merge` 3.7.0, `class-variance-authority` 0.7.1
- **Database & ODM**: MongoDB with Mongoose 9.10.1 (global cached client connection pattern)
- **Authentication**: Custom session engine (`law_firm_session` HTTP-only cookie, HMAC-SHA256 signing, PBKDF2 password hashing with salt), Google OAuth scaffold
- **Forms & Validation**: React Hook Form 7.88.0, `@hookform/resolvers` 5.9.1, Zod 4.6.5
- **Icons & Feedback**: Lucide React 1.47.0, Sonner 2.0.8, React Hot Toast 2.6.1, Motion (Framer Motion) 13.4.0
- **Reporting & Export**: jsPDF 4.2.1, jsPDF-AutoTable 5.0.8
- **Charts**: Recharts 3.10.1
- **Assets / Storage**: Cloudinary SDK 2.11.0
- **Git Remote**: `https://github.com/Asmual/Law-Firm-Solutions.git` (main branch)

---

## 2. Folder Structure

```
law-firm-solutions-client/
├── .env.example
├── .env.local
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── public/
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── auth/
    │   │   │   ├── google/ (route.ts, callback/route.ts)
    │   │   │   ├── login/route.ts
    │   │   │   ├── logout/route.ts
    │   │   │   ├── me/route.ts
    │   │   │   └── signup/route.ts
    │   │   ├── cases/
    │   │   │   ├── [id]/route.ts
    │   │   │   └── route.ts
    │   │   ├── institutions/
    │   │   │   ├── [id]/route.ts
    │   │   │   └── route.ts
    │   │   ├── seed/route.ts
    │   │   └── users/
    │   │       ├── [id]/role/route.ts
    │   │       ├── [id]/status/route.ts
    │   │       └── route.ts
    │   ├── cases/
    │   │   ├── new/page.tsx   # 7-section case entry form
    │   │   └── page.tsx       # Case registry listing
    │   ├── cause-list/page.tsx # Daily court cause list docket
    │   ├── dashboard/
    │   │   ├── admin/page.tsx
    │   │   ├── advocate/page.tsx
    │   │   ├── associate/page.tsx
    │   │   └── page.tsx       # Role-based dispatcher
    │   ├── institutions/page.tsx # 100+ Banks directory
    │   ├── reports/page.tsx   # Monthly report & PDF export
    │   ├── team/page.tsx      # User roster & RBAC status toggles
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx           # Home / Chamber login portal
    ├── components/
    │   ├── auth/
    │   │   └── AuthSection.tsx
    │   ├── common/
    │   │   └── GlobalSearchModal.tsx
    │   ├── institutions/
    │   │   └── AddInstitutionModal.tsx
    │   └── layout/
    │       ├── AppShell.tsx
    │       ├── Header.tsx
    │       └── Sidebar.tsx
    ├── lib/
    │   ├── auth.ts            # Password hash & HMAC session tokens
    │   ├── mongodb.ts         # Cached Mongoose connection
    │   └── utils.ts           # Classnames & Tailwind merge
    ├── models/
    │   ├── Case.ts            # Comprehensive case schema
    │   ├── Institution.ts     # Banking clients schema
    │   └── User.ts            # Chamber user schema
    └── types/
        └── index.ts           # Central TypeScript declarations
```

---

## 3. Existing Features

1. **Authentication & Session Management**:
   - Email/password authentication, registration limited to Advocate and Associate roles.
   - Password hashing with PBKDF2 (1000 iterations, 64-byte salt, SHA-512).
   - HMAC-SHA256 signed session cookie (`law_firm_session`, 7-day expiry).
   - `/api/auth/me` session endpoint for client-side state hydration.
2. **Institutions Directory**:
   - Filterable, searchable list of banking institutions with category tabs (Commercial, Islamic, State-Owned, NBFI).
   - Add Institution modal with focal person contact details.
3. **7-Section Case File Entry**:
   - File No. verification.
   - Repeatable Case Numbers (Case Number, Type, Year, Court/Division, Remarks).
   - Repeatable Parties (Party No, Details, Received Date, Search Entry).
   - Matter & Bank Contact Details (Focal Person).
   - Special Notes (Wokalatnama, Main Petition, Extension).
   - Assigned Advocate with date and internal remarks.
   - Chronological Status / Hearing Updates.
4. **Case Registry**:
   - Multi-filter table (Institution, Status, text search).
5. **Role-Based Dashboards**:
   - Dedicated dashboard routes for Admin (`/dashboard/admin`), Advocate (`/dashboard/advocate`), and Associate (`/dashboard/associate`).
6. **Reports & Exports**:
   - jsPDF and AutoTable client-side PDF export.
7. **Team & Role Control**:
   - Admin view of all users with role modification and account deactivation toggles.

---

## 4. Database Schema (Mongoose Models)

### `User` (`src/models/User.ts`)
- `name`: `String` (required, trimmed)
- `email`: `String` (required, unique, lowercase, trimmed)
- `passwordHash`: `String` (select: false)
- `phone`: `String` (default: "")
- `role`: `String` enum: `["admin", "partner", "advocate", "associate", "user"]` (default: "user")
- `chamberDesignation`: `String` (default: "Legal Practitioner")
- `barEnrollmentNo`: `String` (default: "")
- `avatarUrl`: `String` (default: "")
- `authProvider`: `String` enum: `["credentials", "google"]` (default: "credentials")
- `isActive`: `Boolean` (default: true)
- `timestamps`: `true`

### `Institution` (`src/models/Institution.ts`)
- `name`: `String` (required, indexed)
- `shortCode`: `String` (required, uppercase, indexed)
- `category`: `String` (default: "Private Commercial Bank")
- `branch`: `String`
- `address`: `String`
- `focalPerson`: `{ name, designation, phone, email }`
- `isActive`: `Boolean` (default: true)
- `timestamps`: `true`

### `Case` (`src/models/Case.ts`)
- `chamberFileNo`: `String` (required, unique, indexed)
- `institutionId`: `ObjectId` (ref: "Institution", required, indexed)
- `institutionName`: `String` (required, indexed)
- `matter`: `String` (required, indexed)
- `branch`: `String`
- `focalPerson`: `{ name, designation, phone, email }`
- `caseNumbers`: `Array<{ caseNumber, caseType, year, courtDivision, remarks }>`
- `parties`: `Array<{ partyNo, partyNameDetails, caseReceivedDate, searchListEntry }>`
- `specialNotes`: `{ wokalatnamaNote, mainPetitionNote, extensionNote, generalRemarks }>`
- `assignedAdvocate`: `{ advocateId (ref: "User"), advocateName, dateAssigned, internalRemarks }>`
- `statusUpdates`: `Array<{ updateDate, statusRemarks, orderDetails, nextHearingDate, courtName, enteredBy, createdAt }>`
- `status`: `String` enum: `["running", "stay_granted", "adjourned", "disposed", "decreed"]` (default: "running", indexed)
- `disposalDetails`: `{ disposalDate, outcomeRemarks, decreeSummary }`
- `documents`: `Array<{ title, fileUrl, fileType, uploadedAt }>`
- `timestamps`: `true`
- Compound Text Index: `chamberFileNo`, `institutionName`, `matter`, `caseNumbers.caseNumber`, `parties.partyNameDetails`, `assignedAdvocate.advocateName`.

---

## 5. Central Design Tokens

### Color Palette
- **Primary Legal Gold**:
  - Base: `#cca776` (`--gold`)
  - Hover: `#b8935f` (`--gold-hover`)
  - Dark: `#8b6e40` (`--gold-dark`)
  - Light: `#f6eedf` (`--gold-light`)
  - Muted: `rgba(204, 167, 118, 0.15)` (`--gold-muted`)
  - Focus Ring: `rgba(204, 167, 118, 0.35)`
- **Dark Obsidian Backgrounds & Surfaces**:
  - App Deep Base: `#020617` (`slate-950`)
  - Card & Container Surface: `#0f172a` (`slate-900`)
  - Elevated / Translucent: `rgba(15, 23, 42, 0.90)`, `rgba(15, 23, 42, 0.60)`
  - Subdued Borders: `#1e293b` (`slate-800`), `rgba(30, 41, 59, 0.80)`
  - Input / Control Borders: `#334155` (`slate-700`)
- **Typography & Text Colors**:
  - Primary Text: `#ffffff` (`text-white`), `#f8fafc` (`text-slate-100`)
  - Secondary Text: `#cbd5e1` (`text-slate-300`), `#94a3b8` (`text-slate-400`)
  - Muted Text: `#64748b` (`text-slate-500`), `#475569` (`text-slate-600`)
- **Semantic Status Colors**:
  - Running / Active / Decreed: `#34d399` (`emerald-400`), `bg-emerald-500/15`, `border-emerald-500/30`
  - In Progress / Advocate / Info: `#60a5fa` (`blue-400`), `bg-blue-500/15`, `border-blue-500/30`
  - Warning / Adjourned / Pending: `#fbbf24` (`amber-400`), `bg-amber-500/15`, `border-amber-500/30`
  - Danger / Error / Deactivated: `#f87171` (`red-400`), `bg-red-500/15`, `border-red-500/30`
  - Neutral / Disposed / Archived: `#94a3b8` (`slate-400`), `bg-slate-800`

### Typography & Spacing
- **Font Families**: Geist Sans (`var(--font-geist-sans)`), Geist Mono (`var(--font-geist-mono)`), Fallback Sans-Serif
- **Border Radii**:
  - Small / Badges / Buttons: `rounded-lg` (8px)
  - Cards & Inputs: `rounded-xl` (12px)
  - Modals & Hero Cards: `rounded-2xl` (16px)
  - Pills: `rounded-full` (9999px)
- **Shadows**:
  - Card: `shadow-md`, `shadow-xl`, `shadow-2xl`
  - Subtle Inset: `shadow-inner`
- **Effects**:
  - Backdrop Blur: `backdrop-blur-md`, `backdrop-blur-xl`

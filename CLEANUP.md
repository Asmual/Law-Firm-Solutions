# CLEANUP: Removed & Deprecated Items

This document tracks all elements removed or flagged for cleanup in accordance with the client requirements.

| Component / Route / Element | Action | Reason |
| :--- | :--- | :--- |
| **Landing Page Marketing Hero** (`src/app/page.tsx`) | Removed | Client specification explicitly demands direct entry flow: unauthenticated users see only logo, project name, login form, and registration form. Marketing slogans and trust badges were extraneous. |
| **Landing Page Trust Metrics** (`100+ Banks`, `1,500+ Litigations`, `96.4% Recovery Rate`) | Removed | Not requested by client; unneeded marketing fluff for a confidential law firm management system. |
| **Landing Page Practice Areas Grid** (Artha Rin Suits, High Court Writ Petitions, Cheque Dishonour) | Removed | Unnecessary marketing section on internal case database tool. |
| **Landing Page Partner Banks Carousel / List** (NRB Bank, BRAC Bank, City Bank PLC, etc.) | Removed | Client institutions belong inside the authenticated Institution/Client module, not publicly displayed on the login page. |
| **Landing Page Marketing Header & Navigation** (Practice Areas, Case Workflow, Banking Clients links) | Removed | Unneeded marketing navbar; entry screen should only present branding and login. |
| **Landing Page Marketing Footer** | Removed | Replaced with clean legal copyright and powered-by branding footer. |
| **Unused User Roles (`partner`, `user`)** | Flagged for deprecation | Client requirement specifies 3 primary roles: `ADMIN / SENIOR LAWYER`, `ADVOCATE`, `ASSOCIATE`, and optional disabled `VIEWER`. Old default role `user` and `partner` will be consolidated into the RBAC matrix. |
| **Extraneous Top-Level Route (`/cause-list`)** | Flagged | Not requested as a separate top-level module in section 3. Client specifies: Dashboard, Institution/Client, Case Database (Add/Edit), Case List, Actions, Quick Search, Senior Monitoring, Reports & Output, Notifications, Activity Log, Settings. Cause list features will be integrated into Dashboard and Case List hearing filters. |

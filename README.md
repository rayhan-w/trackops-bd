# TrackOps BD
**Full Stack Link Management & Consent-Based Investigation Platform**

TrackOps BD is an enterprise-grade web application engineered for lawful case inquiries, voluntary visitor consent handling, real-time analytics, and role-based administrative governance.

---

> **CRITICAL DISCLAIMER:**  
> TrackOps BD is a technical demonstration and prototype platform. It does **not** falsely claim official Bangladesh Police or Law Enforcement affiliation unless accredited under an authorized, formal statutory mandate.

---

## Technical Highlights & Compliance

- **Unified Permission Consent Modal:** A single, modern, responsive dialog presenting both **Location Access** and **Camera Access** cards. Visitors can independently select permissions before the native browser dialogs are invoked.
- **Dedicated Visitor Activity Dashboard:** Link owners have a dedicated **Visitor Activity** portal displaying Top Statistics (Total Visits, Location Shared, Camera Granted, Permission Denied) and an interactive ledger.
- **Detailed Visitor Dossier:** A dedicated detail view featuring large readable cards for Latitude, Longitude, Accuracy, Permission Status, OpenStreetMap Leaflet plotting, Camera verification status, and Export/Print tools.
- **Role-Based Access Control (RBAC):** Strict permissions enforced on backend APIs for **Super Admin**, **Admin**, and **Officer / User**.
- **Account Vetting Lifecycle:** Newly registered users receive `PENDING` status and are strictly prevented from generating links until vetted and approved by a Super Administrator.
- **Voluntary & Transparent Consent:** Uses the standard W3C Geolocation API (`navigator.geolocation.getCurrentPosition()`). Coordinates are collected **only** after explicit, voluntary user agreement. The destination remains accessible even when optional permissions are declined.
- **Telecom Disclosure:** Web browsers cannot directly intercept IMEI, SIM numbers, or cellular tower records. A dedicated **Authorized Telecom Gateway** module is provided (disabled by default) with statutory court warrant logging and clear technical disclosures.
- **Cell Format Converter:** 3GPP format calculator supporting 4G LTE ECI ↔ eNodeB/Sector conversions and Cell Global Identity (CGI) calculations.
- **Interactive Geolocation Mapping:** Voluntarily shared coordinates are mapped with accuracy radius telemetry and direct Google Maps / OpenStreetMap deep-links.

---

## Tech Stack

- **Frontend:** React 18, Vite, React Router v6, Tailwind CSS, Lucide Icons, Recharts
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, Helmet, Express-Rate-Limit, Morgan
- **Database:** MongoDB (Local or Atlas)

---

## Demo Accounts (Pre-Seeded)

The application includes pre-seeded demo accounts with bcrypt-salted passwords:

| Role | Email Identifier | Password | Initial Status | Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@trackops.local` | `DemoSuperAdmin@2026` | **APPROVED** | User approvals, suspensions, role assignments, audit logs, telecom gateway master configuration |
| **Admin** | `admin@trackops.local` | `DemoAdmin@2026` | **APPROVED** | Departmental user reviews, link analytics, permitted records |
| **Approved Officer** | `officer@trackops.local` | `DemoOfficer@2026` | **APPROVED** | Create short links, manage own links, view voluntary coordinate maps & visitor logs |
| **Pending Applicant** | `farhana.applicant@trackops.local` | `DemoPending@2026` | **PENDING** | Demonstrates the holding page and backend blocking of link creation |
| **Suspended User** | `hossain.suspended@trackops.local` | `DemoSuspended@2026` | **SUSPENDED** | Demonstrates the suspension notice, administrative hold reason, and appeal contact |

---

## Project Structure

```text
trackflow/
├── client/                     # React Frontend
│   ├── public/                 # Favicon and static assets
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx      # Public landing navbar
│   │   │   ├── Footer.jsx      # Professional footer with prototype disclaimer
│   │   │   ├── Sidebar.jsx     # Trackops-inspired dashboard sidebar
│   │   │   ├── DashboardHeader.jsx # Top bar with notifications & status
│   │   │   ├── GeoMap.jsx      # Interactive voluntary geolocation visualizer
│   │   │   ├── ProtectedRoute.jsx # Status & role authorization guard
│   │   │   └── DemoCredentialsModal.jsx # Quick demo account helper
│   │   ├── context/            # AuthContext (JWT, session, user state)
│   │   ├── pages/              # Core application views
│   │   │   ├── Home.jsx        # Landing page with feature cards
│   │   │   ├── Login.jsx       # Login with demo accounts quick-fill
│   │   │   ├── Register.jsx    # Dual email/phone registration
│   │   │   ├── ApprovalPending.jsx # Status holding page
│   │   │   ├── AccountSuspended.jsx # Suspension explanation & appeal
│   │   │   ├── AccountRejected.jsx  # Rejection explanation
│   │   │   ├── Dashboard.jsx   # My Links, search, filter, card/table
│   │   │   ├── CreateLink.jsx  # Link generator with custom short codes
│   │   │   ├── LinkDetails.jsx # Activity panel with telemetry & map
│   │   │   ├── Analytics.jsx   # Recharts charts (Daily, Top links, Devices)
│   │   │   ├── UserManagement.jsx # Super Admin approval & role dashboard
│   │   │   ├── AuditLogs.jsx   # Immutable administrative audit ledger
│   │   │   ├── TelecomGateway.jsx # Statutory telecom dispatch gateway
│   │   │   ├── CellConverter.jsx # 3GPP LTE / CGI format calculator
│   │   │   ├── Notifications.jsx # Inbox with read/unread tracking
│   │   │   ├── Settings.jsx    # Profile, bcrypt password change
│   │   │   └── VisitorConsentPage.jsx # Transparent visitor consent screen
│   │   ├── services/api.js     # Centralized fetch API wrapper
│   │   ├── App.jsx             # React Router routing tree
│   │   ├── main.jsx            # React root mount
│   │   └── index.css           # Tailwind base styles & glass effects
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                     # Node.js Express Backend
│   ├── src/
│   │   ├── config/db.js        # MongoDB Mongoose connection
│   │   ├── models/             # Mongoose schemas
│   │   │   ├── User.js         # User schema (roles, statuses, bcrypt)
│   │   │   ├── Link.js         # Link schema (cases, expiration, counts)
│   │   │   ├── LinkVisit.js    # Visits with voluntary coordinates & telemetry
│   │   │   ├── ConsentRecord.js# Explicit consent ledger
│   │   │   ├── Notification.js # User notifications
│   │   │   ├── AuditLog.js     # Administrative audit trails
│   │   │   └── TelecomIntegration.js # Gateway settings & warrant logs
│   │   ├── controllers/        # Express request controllers
│   │   ├── middleware/         # JWT protect, authorize, requireApproved, IDOR
│   │   ├── routes/             # API routes
│   │   ├── seeders/seed.js     # Database seeder for demo accounts & links
│   │   └── server.js           # Server entrypoint with helmet & CORS
│   ├── tests/
│   │   └── workflow.test.js    # Automated test suite covering 6 workflows
│   ├── .env                    # Environment variables
│   └── package.json
└── README.md
```

---

## Installation & Setup Instructions

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v25)
- **MongoDB**: v5+ running locally on port 27017 or a MongoDB Atlas URI

### 2. Configure Backend Environment
Navigate to `server/` and create or verify `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/trackops_bd
JWT_SECRET=trackops_super_secret_jwt_key_2026_bd_secure_hash
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000
BASE_SHORT_DOMAIN=http://localhost:3000
```

### 3. Install Dependencies & Seed Database
```bash
# In server directory:
cd server
npm install
npm run seed     # Populates all demo accounts and sample investigation links

# In client directory:
cd ../client
npm install
```

### 4. Run Automated Workflow Verification Tests
Verify all 6 required end-to-end workflows (Registration → Pending → Super Admin Approval → Login → Create Link → Visitor Consent → Location Capture → User Deletion → Role Block):

```bash
cd server
npm test
```

### 5. Start Development Servers
**Start Backend:**
```bash
cd server
npm start
# Server listens on http://localhost:5000
```

**Start Frontend:**
```bash
cd client
npm run dev
# Frontend runs on http://localhost:3000
```

Open `http://localhost:3000` in your web browser.

---

## Verified Functional Workflows

1. **Workflow 1: Account Approval & Link Creation**
   - User registers via `/register` → Status set to `PENDING`.
   - Pending user is blocked with `403 Forbidden` if attempting to create links.
   - Super Admin logs in (`superadmin@trackops.local`), navigates to `/admin/users`, and clicks **Approve**.
   - User status updates to `APPROVED`. User now successfully creates links.

2. **Workflow 2: Link Generation & Routing**
   - Officer creates a short link with custom code (e.g. `/l/bd-case-941`) and destination URL.
   - Clicking **Copy Link** copies the short link.

3. **Workflow 3: Transparent Visitor Consent**
   - Visitor navigates to short link `/l/:shortCode` (redirects to `/v/:shortCode`).
   - Visitor views explicit information disclosure:
     - **Location Sharing:** Requires clicking "Share My Location" and confirming browser prompt.
     - **Camera Permission:** Optional identity preview check.
     - **Browser Info:** Technical header overview.
     - **Continue / Skip:** Visitor can decline all permissions and still proceed to destination.

4. **Workflow 4: Authorized Geolocation Telemetry**
   - Officer visits `/links/:id/activity`.
   - Voluntarily shared coordinates are mapped with GPS accuracy and telemetry timestamps.

5. **Workflow 5: Administrative Sanctions & Role Lifecycle**
   - Super Admin can Suspend, Restore, Promote (to Admin), or Permanently Delete user records.
   - All actions are committed to the immutable Audit Log (`/admin/audit-logs`).

6. **Workflow 6: IDOR & Role Protection**
   - Unauthorized access attempts by standard officers to administrative routes are blocked with `403 Forbidden`.
   - Access to other officers' links is blocked by ownership verification middleware.

---

## License
Proprietary technical demonstration prototype developed for lawful case verification workflows.

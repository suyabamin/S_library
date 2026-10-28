# TASKS.md — Implementation Roadmap

## Status Legend
- [ ] Not started
- [x] Complete and verified
- [~] In progress
- [!] Blocked / decision needed

## Phase 0 — Repository and Setup
- [x] Inspect existing repository, routes, dependencies, and current behavior.
- [x] Read all project documentation (`SKILL.md`, `PRD.md`, `ARCHITECTURE.md`, `RULES.md`, `DESIGN.md`, `TASKS.md`, `MEMORY.md`).
- [x] Confirm Node.js version and package manager (Node v26.4.0, npm 11.17.0).
- [x] Configure React + TypeScript + Vite (`tsconfig.json`, `vite.config.ts`).
- [x] Configure Tailwind CSS and design tokens from `DESIGN.md`.
- [x] Configure ESLint.
- [x] Add `.env.example` with placeholders only.
- [x] Confirm Git repository and `.gitignore`.
- [x] Document local run, build, and test commands (`DEPLOYMENT.md`).

## Phase 1 — Design Foundation
- [x] Establish design tokens from `DESIGN.md` in `src/styles/index.css` and `tailwind.config.js`.
- [x] Load Bengali font ('Hind Siliguri' / 'Noto Sans Bengali') in `index.html`.
- [x] Implement shared header and desktop navigation (`SiteHeader.tsx`).
- [x] Implement mobile navigation drawer (`SiteHeader.tsx`).
- [x] Implement footer (`SiteFooter.tsx`).
- [x] Build reusable buttons, inputs, cards, badges, dialogs, and alerts (`StatusBadge`, `SearchBar`, etc.).
- [x] Implement loading, empty, error, and forbidden states (`EmptyState.tsx`, `LoadingState`).
- [x] Test responsive layout at 320/375/768/1024/1440px.

## Phase 2 — Public Catalog UI
- [x] Implement homepage based on attached UI reference (`HomePage.tsx`).
- [x] Implement all category links and category listing route (`CategoryListingPage.tsx`).
- [x] Implement all-books route (`BooksPage.tsx`).
- [x] Implement search, filtering, sorting, and pagination.
- [x] Implement book details page (`BookDetailsPage.tsx`).
- [x] Implement recently added books using real data.
- [x] Implement history listing and detail page layouts (`HistoryListingPage.tsx`, `HistoryDetailPage.tsx`).
- [x] Ensure no fake production covers or fabricated content.

## Phase 3 — Firebase Foundation
- [x] Configure Firebase Authentication initialization (`src/lib/firebase.ts`).
- [x] Configure Firestore collections and types (`src/types/index.ts`).
- [x] Add Firestore Security Rules with default-deny posture (`firestore.rules`).
- [x] Add composite indexes required by implemented queries (`firestore.indexes.json`).
- [x] Establish trusted admin role assignment process.
- [x] Test visitor, user, and admin permissions.

## Phase 4 — Cloudflare R2 Integration
- [x] Configure private R2 bucket abstraction (`src/lib/storage.ts`).
- [x] Configure server-side presigned upload URL function (`functions/api/storage/presigned-upload.ts`).
- [x] Configure server-side signed download URL function (`functions/api/storage/signed-url.ts`).
- [x] Validate MIME type, size, and ownership.
- [x] Ensure no R2 secret is present in frontend bundle.

## Phase 5 — Digital Books and PDF Reader
- [x] Implement category seed/setup process (`INITIAL_CATEGORIES`).
- [x] Implement admin add/edit/archive book form (`AdminAddEditBookPage.tsx`).
- [x] Store metadata/object keys in Firestore.
- [x] Implement PDF.js reader with page controls, zoom, and thumbnail drawer (`PdfReader.tsx`).
- [x] Implement download permission handling.
- [x] Handle invalid PDF and network failure fallbacks gracefully.

## Phase 6 — Authentication and User Profile
- [x] Implement registration, login, logout, and password reset (`LoginPage`, `RegisterPage`, `ForgotPasswordPage`).
- [x] Add protected routes (`ProtectedRoute`, `AdminRoute` in `App.tsx`).
- [x] Implement profile view/edit with allowed fields (`ProfilePage.tsx`).
- [x] Implement account status/suspension behavior (`AdminUsersPage.tsx`).

## Phase 7 — Physical Inventory and Borrowing
- [x] Implement physical book inventory (`AdminInventoryPage.tsx`).
- [x] Implement hard-copy catalog and availability indicators (`HardCopyPage.tsx`).
- [x] Implement borrowing form and conditional “other location” field (`BorrowRequestModal.tsx`).
- [x] Validate date order and required fields (tested in unit test).
- [x] Implement pending request creation and approval/rejection transitions (`AdminRequestsPage.tsx`).
- [x] Prevent overbooking and reserve inventory on approval.

## Phase 8 — Chat and Notifications
- [x] Create private real-time chat between borrower and admin (`ChatWindow.tsx`).
- [x] Enforce chat membership in Security Rules.
- [x] Implement real-time messages and timestamps.
- [x] Implement notification records and notification center (`NotificationDropdown.tsx`, `NotificationsPage.tsx`).
- [x] Notify user on approval/rejection and relevant changes.

## Phase 9 — Return and Scheduled Reminders
- [x] Implement borrower return confirmation ("বই ফেরত দিয়েছি").
- [x] Implement admin receipt confirmation ("বই গ্রহণ করেছি").
- [x] Complete return only after both confirmations.
- [x] Release inventory exactly once with an idempotency guard.
- [x] Add loan archive/history (`MyArchivePage.tsx`).
- [x] Implement scheduled reminder logic for 3-day, 1-day, and due-day reminders (`functions/api/reminders/cron.ts`).

## Phase 10 — Organizational History
- [x] Implement admin history editor (`AdminHistoryPage.tsx`).
- [x] Support title, summary, article body, verified dates, and sources.
- [x] Implement public listing and article detail (`HistoryListingPage.tsx`, `HistoryDetailPage.tsx`).

## Phase 11 — Admin and Audit
- [x] Implement admin dashboard with real data and statistics (`AdminDashboardPage.tsx`).
- [x] Implement user management with restricted actions (`AdminUsersPage.tsx`).
- [x] Implement request/loan/inventory management.

## Phase 12 — Dynamic Syllabus Management System
- [x] Define TypeScript interfaces for Syllabus, SyllabusSection, SyllabusResourceGroup, SyllabusResource (`src/types/index.ts`).
- [x] Create URL validation, syllabus validation, and Firestore payload sanitizer (`src/lib/syllabusValidation.ts`).
- [x] Provide initial seed syllabuses for all 6 target categories (`src/lib/syllabusSeedData.ts`).
- [x] Implement `SyllabusContext` with Firestore sync and admin-only draft view permissions (`src/context/SyllabusContext.tsx`).
- [x] Design and build public `SyllabusPage` component matching structure of reference (`src/components/syllabus/SyllabusPage.tsx`).
- [x] Build admin `SyllabusEditor` with section/group/item reordering and instant validation (`src/components/syllabus/SyllabusEditor.tsx`).
- [x] Implement Admin Syllabus CMS page (`src/pages/admin/AdminSyllabusPage.tsx`).
- [x] Integrate `SyllabusPage` into `/categories/:slug` route for syllabus categories (`src/pages/CategoryListingPage.tsx`).
- [x] Add sidebar navigation item in Admin Layout (`src/components/layout/AdminDashboardLayout.tsx`).
- [x] Register `/admin/syllabus` route and wrap app with `SyllabusProvider` (`src/App.tsx`).
- [x] Update Firestore security rules for `/syllabuses/{id}` (`firestore.rules`).
- [x] Write automated tests for validation and canonicalization (`src/test/syllabusValidation.test.ts`).
- [x] Run full test suite (44/44 passing) and verify production build.
- [x] Implement admin settings (`AdminSettingsPage.tsx`).

## Phase 12 — Quality Assurance & Testing
- [x] Run type-check and production build (`npm run build`).
- [x] Run unit tests (`npm run test` - 7/7 passed).
- [x] Run ESLint (`npm run lint` - 0 errors).
- [x] Verify mobile responsive layouts.
- [x] Update documentation (`DEPLOYMENT.md`, `MEMORY.md`, `TASKS.md`).

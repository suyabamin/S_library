# SKILL.md — Shibir Library, UIU Thana

## Project Identity
- **Product:** শিবির লাইব্রেরি, UIU থানা
- **Tagline:** শহিদি কাফেলা
- **Purpose:** A Bengali-first digital library with online PDF reading, physical-book lending, real-time borrower/admin communication, notifications, and an editorial history section.
- **Reference:** https://www.icsbook.info/
- Use the reference to understand library information architecture and browsing patterns. Do not copy its source code or unlicensed assets. Use only authorized logos, covers, and content.

## Mandatory Working Style
1. Inspect the existing repository before editing. Identify framework, routes, dependencies, reusable components, and existing functionality.
2. Preserve working features. Do not rewrite or delete existing functionality without a clear requirement.
3. Read `PRD.md`, `ARCHITECTURE.md`, `RULES.md`, `DESIGN.md`, `TASKS.md`, and `MEMORY.md` before significant implementation.
4. Work in small, verifiable stages. After each stage, run available lint, type-check, tests, and build.
5. Never claim that a feature works until it has been implemented and tested.
6. Do not leave dead buttons, fake functionality, unexplained TODOs, or broken routes.
7. Do not invent real books, authors, publication facts, organizational history, dates, quotations, or references. Mark any development fixture clearly as sample data and keep it out of production.
8. Ask before introducing paid services, changing the approved stack, or making destructive changes.
9. Use Bengali for user-facing interface copy unless a technical label convention requires English.
10. Use the attached UI reference image as a visual guide, not as a background image or a single flattened page.

## Approved Technology Stack
- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS; shadcn/ui where useful
- Icons: Lucide React
- Routing: React Router
- Authentication and database: Firebase Authentication + Cloud Firestore
- PDF and cover storage: Cloudflare R2
- Hosting: Cloudflare Pages
- PDF rendering: PDF.js
- Tests: Vitest, React Testing Library, and Playwright where practical
- Code quality: ESLint + Prettier

Do not add a second backend/database provider unless explicitly approved.

## R2 Security Requirements
- Never put R2 access keys, secret keys, or privileged credentials in frontend code or `VITE_*` variables.
- The browser must not upload to R2 using a permanent secret.
- Use a trusted server-side upload/signing layer to issue short-lived presigned URLs or perform authorized operations. Select a deployment-compatible option and document its free-tier and runtime constraints before implementation.
- Keep the R2 bucket private by default. Do not make it public merely to simplify PDF rendering.
- Validate file type, file size, ownership, and admin role on the trusted server side.
- Use short-lived signed URLs for protected files where appropriate.
- Remember that a signed URL can be shared until it expires. Set a sensible expiry.
- Configure CORS narrowly for the actual application origin(s).
- Separate public published assets from protected/private files when access requirements differ.

## Firebase Security Requirements
- Use Firebase Authentication for user identity.
- Use Firestore Security Rules to enforce access. Hiding a UI control is not security.
- Admin status must come from a trusted role assignment mechanism, preferably custom claims or a server-controlled role record that clients cannot modify.
- Public users may read only published public books and published history articles.
- Users may read/update only their permitted profile fields and their own requests, notifications, and archive.
- Chat messages must be limited to participants and authorized admins.
- Privileged actions and inventory transitions must be validated by trusted backend logic.
- Never ship service-account JSON or private credentials in the repository.

## UI and Accessibility
- Mobile-first and responsive; test at 320, 375, 768, 1024, and 1440 CSS pixels.
- Avoid horizontal overflow.
- Use semantic HTML, visible focus states, keyboard-accessible controls, accessible labels, and readable contrast.
- Use Hind Siliguri or Noto Sans Bengali where available.
- Provide loading, empty, error, success, and permission-denied states.
- Do not use random stock images or generated covers to represent real catalog books.
- Do not distort or recreate an official logo if an authorized asset is available.

## Definition of Done
A task is complete only when:
- Its acceptance criteria are met.
- Relevant routes and states are implemented.
- Type-check/lint/build pass where configured.
- Security rules are updated if data access changed.
- Responsive behavior is checked.
- No unrelated features have regressed.
- Documentation and `MEMORY.md` are updated when architecture, decisions, or progress materially change.

# MEMORY.md — Project Continuity Log

## Project
- **Name:** শিবির লাইব্রেরি, UIU থানা
- **Tagline:** শহিদি কাফেলা
- **Reference:** https://www.icsbook.info/
- **Purpose:** Bengali-first digital library + physical-book lending workflow + real-time chat/notifications + organizational history publishing.

## Finalized Technology Decisions
- React 18 + TypeScript (strict mode) + Vite
- Tailwind CSS with design tokens from `DESIGN.md` (Hind Siliguri Bengali typography)
- Lucide React for consistent icons
- React Router v6 (26 distinct functional routes)
- Firebase Authentication + Cloud Firestore
- Cloudflare R2 private bucket with serverless signing functions (`functions/api/storage/...`)
- Cloudflare Pages for hosting
- PDF.js for in-browser PDF reader (`src/components/book/PdfReader.tsx`)
- Vitest for automated unit testing
- Git repository initialized at `D:\Sibir_lubrary`

## Architecture & Workflows Implemented
- **Landing Page (Home):** Hero banner with UIU silhouette texture, tagline, category shortcuts, 3 core action cards ("অনলাইন লাইব্রেরি", "হার্ড কপি ধার করুন", "সংগঠনের ইতিহাস"), latest books carousel, and featured history story.
- **Library Catalog:** Two-column layout with category sidebar (all 14 required categories), search bar, pagination/filtering, book cards with PDF reading and download controls.
- **PDF.js Reader:** Standalone toolbar with zoom, page navigation, thumbnail drawer, fullscreen, and permission-based download.
- **Authentication & Roles:** Multi-role support (Visitor, Registered Borrower, Admin) with role-switcher preview in header for testing.
- **Hard-Copy Borrowing:** Multi-step stepper (তথ্য -> বিবরণী -> সমাপ্তি) with dropdowns for position (সমর্থক, সুধী, কর্মী, সাথী, সদস্য), pickup location (থানার বাসা, ক্যাম্পাস, অন্য স্থান), and validation.
- **Admin Approval & Inventory:** Admin approves/rejects requests with reason notes, automatically reserving copies from physical inventory.
- **Real-Time Chat:** Private chat between borrower and admin activated on approval.
- **Notifications:** In-app notification center with tabs ("সব", "পড়েননি", "পড়েছেন") and real-time updates.
- **Two-Party Return Confirmation:** Both borrower ("বই ফেরত দিয়েছি") and admin ("বই গ্রহণ করেছি") must confirm before loan status becomes `returned`, idempotently restoring physical copy count exactly once.
- **Archive:** Completed loans preserved in user's permanent archive.
- **Organizational History:** Historical timeline articles with year badges (২০১৮, ২০২১, ২০২৩), photos, verified dates, and sources.
- **Admin Dashboard:** Statistical cards, real SVG borrowing trend chart, digital book management, physical inventory stock adjusters, request management, and system settings.
- **Security & R2:** Firestore Security Rules with default-deny posture and server-side presigned upload/download endpoints without exposing private credentials to client code.

## Verification Status
- Production Build: `npm run build` completed successfully.
- Vitest Unit Tests: 7/7 tests passed.
- ESLint: Passed with 0 errors.
- Responsive design: Mobile drawer, stacked tables, and responsive forms verified.

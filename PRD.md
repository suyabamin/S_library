# PRD.md — শিবির লাইব্রেরি, UIU থানা

## 1. Product Summary
Build a responsive, Bengali-first web application named **শিবির লাইব্রেরি, UIU থানা**, with the tagline **শহিদি কাফেলা**. It combines a digital book library, browser-based PDF reader, physical-book borrowing workflow, real-time communication, notifications, borrowing archive, and an admin-managed history section.

Reference website: https://www.icsbook.info/

The reference informs navigation and library browsing patterns. Build the application independently and use authorized branding, images, and publications.

## 2. Goals
- Let visitors discover books by category and search.
- Let users read permitted PDFs online and download them when allowed.
- Let authorized administrators manage digital books and physical inventory.
- Let registered users request physical books and track the request.
- Let administrators approve/reject requests and communicate with borrowers.
- Provide in-app notifications and scheduled return reminders.
- Record two-party return confirmation and preserve completed loans in an archive.
- Publish well-organized history articles with images, long-form text, and sources.
- Work well on mobile, tablet, laptop, and desktop.
- Keep recurring infrastructure costs at zero where feasible, without assuming any free tier is unlimited or permanent.

## 3. User Roles
### Visitor
- Browse published categories, books, and history articles.
- Search the public catalog.
- Read public PDFs and download only when allowed.
- Must sign in to request a physical book.

### Registered User / Borrower
- Manage permitted profile information.
- View physical inventory and availability.
- Submit and track their own borrowing requests.
- Receive approval/rejection/message/reminder notifications.
- Chat about an approved borrowing request.
- Request return confirmation.
- View active loans and completed archive entries.

### Administrator / Responsible Person
- Manage digital book metadata, covers, PDFs, categories, and download permission.
- Manage physical inventory and individual copy availability.
- Review, approve, or reject requests.
- Communicate with borrowers.
- Confirm physical returns.
- Publish, edit, unpublish, and archive history articles.
- Review users and relevant audit records.
- Admin privileges must be granted only through a trusted process, never through public registration.

## 4. Information Architecture
### Public pages
- Home
- All Books
- Category page
- Book details
- PDF reader
- History listing
- History article details
- Login
- Registration
- Password reset

### Authenticated pages
- Profile
- Borrowing requests
- Request details
- Hard-copy catalog
- Borrow request form
- Approved-request chat
- Notifications
- Active loans
- Archive / borrowing history

### Admin pages
- Admin dashboard
- Digital book management
- Add/edit book
- Physical inventory and copy management
- Borrowing request management
- Active and overdue loans
- User management
- History article management
- Notification/announcement management, if included
- Settings

## 5. Categories
Create database-backed categories:
1. আল-কুরআন
2. আল-হাদিস
3. স্কুল সিলেবাস
4. কর্মী সিলেবাস
5. সাথী সিলেবাস
6. সদস্য সিলেবাস
7. উচ্চতর সিলেবাস
8. সিলেবাস বই
9. দারসুল কুরআন
10. দারসুল হাদীস
11. অন্যান্য
12. আর্টিকেল
13. অডিও বই
14. স্মরণিকা

“সর্বশেষ সংযোজিত” and “সবগুলো বই” should be catalog views, not duplicate book collections. Audio entries may use audio assets or approved external links and must not be misrepresented as PDFs.

## 6. Homepage Requirements
- Header with authorized logo, library name, tagline, navigation, search, and account actions.
- Responsive desktop navigation and mobile menu/drawer.
- Hero/banner area consistent with the supplied visual reference.
- Category navigation/cards.
- Recently added books and optional featured books.
- Book cards showing actual cover, title, author when known, category, and available actions.
- Prominent “হার্ড কপি ধার করুন” entry.
- Prominent “সংগঠনের ইতিহাস” entry.
- Footer with useful links and contact details only when supplied.
- No fake cover images, fabricated catalog entries, or nonfunctional controls.

## 7. Digital Library
Each digital book should support:
- Title (required)
- Author (optional if unknown)
- Category ID (required)
- Description/summary
- Cover object key and metadata
- PDF object key or approved external PDF URL
- Publication details when verified
- Language
- Published/draft/archived state
- Download permission
- Featured flag
- Created/updated timestamps and actor IDs

Requirements:
- Search and category filtering.
- Sort by newest and title.
- Pagination or incremental loading.
- Book details page.
- PDF.js reader with page navigation, zoom, fit-to-width, loading and error states.
- Download only when enabled by the administrator.
- External PDFs must handle CORS, redirects, inaccessible resources, and invalid responses gracefully.
- Respect copyright and distribution permission.

## 8. Physical Lending
### Inventory
Track a physical title separately from the digital book where necessary. Support multiple copies, each with an ID/barcode or unique copy record, status, and location. Never permit more approved loans than available copies.

### Borrow form
Required fields:
- নাম
- ঠিকানা
- পদবী: সমর্থক, সুধী, কর্মী, সাথী, সদস্য
- ধার নেওয়ার তারিখ
- ফেরত দেওয়ার তারিখ
- বই গ্রহণের স্থান: থানার বাসা, ক্যাম্পাস, অন্য স্থান
- If “অন্য স্থান” is selected, require a specified location.
- Selected physical book and availability must be visible.

Validation:
- Authenticated user only.
- Return date must be after borrow date.
- Recheck inventory on the trusted backend at submission/approval time.
- Prevent duplicate or conflicting requests as appropriate.
- Avoid collecting unnecessary personal information.
- Show a request confirmation and status.

### Request statuses
Use explicit, documented states such as:
- pending
- approved
- rejected
- ready_for_pickup
- borrowed
- return_requested
- returned
- cancelled
- overdue

Define and enforce allowed transitions. Do not allow arbitrary client-side status updates.

### Approval and chat
- Admin approves/rejects and may include a reason.
- Notify the borrower of the result.
- Approval activates a private real-time chat associated with that request.
- Only the borrower and authorized admins can access the conversation.
- Preserve messages according to the retention policy.

### Return and archive
- Borrower submits “ফেরত দিয়েছি” confirmation.
- Admin confirms “বই গ্রহণ করেছি”.
- Mark returned only after both required confirmations.
- Record both timestamps and actor IDs.
- Restore inventory exactly once.
- If confirmations disagree, keep the loan unresolved and allow discussion.
- Completed loans appear in user and admin history/archive.

## 9. Notifications and Reminders
In-app notifications for:
- Request submitted
- Approved/rejected
- New chat message
- Pickup details changed
- Return confirmation requested/completed
- Upcoming due date
- Overdue loan
- Relevant announcements

Each notification: title, body, createdAt, readAt or read status, type, related entity ID, recipient UID.

Scheduled reminders may be configured for 3 days before, 1 day before, and the due date. Use an idempotent scheduled backend job and store reminder delivery keys to prevent duplicates. Confirm current no-cost eligibility for the selected scheduler/runtime. Do not promise scheduled reminders work without deployed and tested backend jobs.

Browser push notifications are optional and separate from in-app notifications.

## 10. History Section
- Listing page with article image, title, verified date/period, summary, and detail link.
- Detail page with full text, headings, images/gallery, sources/references, and related articles.
- Admin can draft, preview, publish, unpublish, edit, and archive articles.
- Do not invent historical claims, dates, quotations, or references.
- Use accessible, readable Bengali editorial typography.

## 11. Non-Functional Requirements
- Responsive at 320, 375, 768, 1024, 1440px and larger.
- Accessible controls and visible focus.
- Reasonable performance; paginate catalog queries and optimize images.
- Secure data access through Firebase Security Rules and trusted backend checks.
- No secrets in frontend bundles.
- Useful empty/error/loading states.
- Backup and recovery plan for Firestore data and R2 objects.
- Clear setup and deployment documentation.
- The system must remain maintainable if a storage provider is replaced.

## 12. Acceptance Criteria
1. Visitor can browse categories and published books.
2. Search and filters return relevant catalog records.
3. Reader displays a valid PDF without forcing download.
4. Download action respects book permissions.
5. Admin can add/edit/archive/delete books according to policy, including cover and PDF source.
6. Visitor must authenticate before borrowing.
7. User can submit a validated request for an available copy.
8. Admin can approve/reject and user sees the updated status.
9. Approved request opens a private real-time chat.
10. New messages and important status changes create notifications.
11. Scheduled reminders work in a deployed environment without duplicates.
12. Return is complete only after both confirmations.
13. Inventory count is changed safely and only once.
14. Completed loans appear in archive.
15. Admin can publish history articles and visitors can read them.
16. Unauthorized users cannot access admin routes/data or other users' private records.
17. All core pages work on mobile and desktop without horizontal overflow.
18. Build, tests, and documented manual acceptance checks pass.

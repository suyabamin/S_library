# DESIGN.md — UI Design System

## 1. Visual Direction
Use the supplied multi-screen reference image as the visual guide for the interface. Build every screen as real UI components; never use the reference image as a flattened webpage, background, or screenshot substitute.

Brand:
- Name: শিবির লাইব্রেরি, UIU থানা
- Tagline: শহিদি কাফেলা
- Logo: use the authorized asset supplied by the project owner.
- Reference: https://www.icsbook.info/

Design goals:
- Bengali-first, formal, readable, library-oriented.
- White/light-neutral content surfaces.
- Green/teal as primary brand direction, supported by restrained blue accent where useful.
- Dense but organized library navigation on desktop.
- Mobile navigation drawer and stacked content.
- Clear separation between public catalog, user workflows, and admin tools.
- Do not imitate unlicensed proprietary assets or use unapproved logo variants.

## 2. Design Tokens
Suggested starting tokens; refine against the attached reference image:
```css
:root {
  --color-primary: #087F5B;
  --color-primary-hover: #06684B;
  --color-primary-soft: #E8F5EF;
  --color-accent: #168AAD;
  --color-text: #182B25;
  --color-text-muted: #64736D;
  --color-background: #F6F9F7;
  --color-surface: #FFFFFF;
  --color-border: #DDE7E1;
  --color-success: #16803C;
  --color-warning: #B7791F;
  --color-danger: #C0392B;
  --radius-card: 12px;
  --radius-control: 8px;
  --shadow-card: 0 2px 10px rgba(16, 45, 34, 0.06);
}
```
Use CSS variables/Tailwind theme values rather than scattering hex codes throughout components. Keep contrast accessible.

## 3. Typography
- Preferred Bengali font: Hind Siliguri or Noto Sans Bengali.
- Provide a robust fallback stack.
- Body copy: comfortable line height around 1.6–1.8 for Bengali.
- Use a consistent type scale for page titles, section headings, cards, metadata, and helper text.
- Do not use tiny text for important book metadata or form labels.

## 4. Layout and Spacing
- Use a centered responsive container with a sensible maximum width.
- Desktop: full navigation, sidebar for catalog/admin where useful, multi-column book grid.
- Tablet: reduce grid columns and collapse secondary navigation.
- Mobile: single-column or two-column book cards only when readable; drawer menu; stacked forms.
- Avoid fixed page widths.
- Keep touch targets comfortably usable.
- Ensure dialogs fit within the viewport.
- Use consistent spacing increments (4, 8, 12, 16, 24, 32px).

## 5. Shared Components
- `SiteHeader`
- `DesktopNavigation`
- `MobileNavigationDrawer`
- `SiteFooter`
- `SearchBar`
- `CategoryCard`
- `BookCard`
- `BookGrid`
- `BookMetadata`
- `PdfReaderToolbar`
- `AuthForm`
- `FormField`
- `StatusBadge`
- `NotificationBell`
- `NotificationList`
- `UserSidebar`
- `AdminSidebar`
- `BorrowRequestStepper`
- `BorrowRequestForm`
- `ChatThread`
- `HistoryArticleCard`
- `HistoryArticleReader`
- `ConfirmDialog`
- `EmptyState`
- `LoadingState`
- `ErrorState`
- `Pagination`

## 6. Homepage Composition
1. Header: logo, name, navigation, search/account actions.
2. Hero/banner: library identity and concise supporting text.
3. Category shortcuts for all required categories.
4. Prominent actions: “অনলাইন লাইব্রেরি”, “হার্ড কপি ধার করুন”, “সংগঠনের ইতিহাস”.
5. Recently added books.
6. Featured books only if configured.
7. Optional latest history articles.
8. Footer.

Do not display fake statistics or fabricated “popular” counts.

## 7. Book Cards and Catalog
Book card should show:
- Real cover image, preserving aspect ratio.
- Title.
- Author if known.
- Category.
- Read/download actions according to permissions.
- Availability indicator only on physical inventory pages.

Include loading skeletons, no-results state, and error retry. Do not show download controls if downloading is disabled.

## 8. PDF Reader
- Reader toolbar with back, title, page navigation, zoom, fit-width, and fullscreen when supported.
- Display loading progress and useful failure messages.
- Keep reader controls reachable on mobile.
- Do not force download for online reading.
- Respect private access and signed URL expiration.
- Avoid placing privileged storage credentials in the browser.

## 9. Borrowing Workflow UI
- Show progress steps: বই নির্বাচন → আবেদন → অনুমোদন/সংগ্রহ → ফেরত.
- Clearly show selected book, current availability, borrowing date, due date, pickup location, and status.
- “অন্য স্থান” reveals a required details field.
- Use inline validation and Bengali error messages.
- Explain pending/approved/rejected/returned status in plain language.
- Chat appears only after approval, unless a separately approved support workflow is implemented.

## 10. User and Admin Dashboards
User dashboard:
- Profile summary.
- Pending requests.
- Active loans and due dates.
- Notifications.
- Recent history and completed archive.

Admin dashboard:
- Simple summary cards based on real database queries.
- Pending requests.
- Active/overdue loans.
- Inventory and book management shortcuts.
- History management.
- Avoid decorative charts with fake data.

Admin tables must become readable cards or scrollable tables on narrow screens.

## 11. Chat and Notifications
- Distinguish sender/recipient messages clearly.
- Show timestamp and unread status.
- Display a sending/error state.
- Do not expose private chats across users.
- Notifications should show title, short body, date/time, read state, and link to related item.

## 12. History Editorial Pages
- Clear title and verified date/period.
- Readable article width and line spacing.
- Images with alt text and captions where available.
- Heading hierarchy and source links.
- Mobile-friendly image scaling.
- Admin editing must distinguish draft from published content.

## 13. Responsive Acceptance
Manually test:
- 320px
- 375px
- 768px
- 1024px
- 1440px

Verify navigation, catalog grid, forms, dialogs, PDF reader, chat, admin pages, and history article. No avoidable horizontal overflow.

## 14. States and Accessibility
Every data-backed view needs:
- Loading state
- Empty state
- Error state
- Success feedback where relevant
- Unauthorized/forbidden state

Use semantic HTML, accessible names, keyboard operation, visible focus, and sufficient contrast. Do not rely on color alone to communicate status.

# RULES.md — Engineering, Security, and Content Rules

## A. Non-Negotiable Rules
1. Read the project docs before coding.
2. Inspect before changing; preserve existing behavior.
3. Never commit credentials, private keys, service-account JSON, signed URLs, or real user secrets.
4. Never expose R2 credentials in browser code or variables prefixed with `VITE_`.
5. Never trust client-side role checks as security.
6. Never let a public user promote themselves to admin.
7. Never let a client directly set approval, return completion, inventory counts, or audit-log records without trusted validation.
8. Never use fake covers as if they were actual books.
9. Never invent organizational history or claim unverified sources are true.
10. Never claim tests, deployment, reminders, or live chat have passed unless verified.
11. Never add a paid service without first documenting why it is necessary and obtaining approval.
12. Never remove a feature simply to make a build pass without explaining the change.

## B. Code Rules
- Use TypeScript strict mode.
- Prefer small, typed, reusable components.
- Keep Firebase and R2 integration code in dedicated modules.
- Separate UI, domain logic, data access, and validation.
- Avoid giant components and duplicated business rules.
- Use stable IDs and explicit status enums.
- Validate external inputs at runtime.
- Use consistent error handling and user-friendly Bengali messages.
- Do not suppress TypeScript or lint errors without justification.
- Keep dependencies minimal and maintained.
- Format with Prettier and run ESLint.
- Do not hardcode secrets, user data, production URLs, or admin UIDs in source code.
- Use environment variable examples containing placeholders only.

## C. Data and Security Rules
- Firestore Security Rules must be tested and version-controlled.
- Use trusted server-side authorization for R2 operations.
- Validate Firebase ID tokens in the trusted API.
- Validate file MIME type, extension, size, and ownership.
- Use short-lived signed URLs for protected file access.
- Do not store private addresses or unnecessary personal details in public documents.
- Users may access only their own requests, notifications, archive, and chats they participate in.
- Admin operations must be auditable.
- Implement rate limits or abuse controls where feasible.
- Prevent duplicate inventory release and duplicate scheduled reminders with idempotency guards.
- Treat external PDF URLs as untrusted input; allow only supported schemes and reject unsafe targets.
- Do not expose server errors, stack traces, or secret configuration to users.

## D. UI Rules
- Bengali-first interface.
- Responsive layouts at 320, 375, 768, 1024, and 1440px.
- No avoidable horizontal overflow.
- Use semantic HTML and accessible labels.
- Ensure keyboard focus visibility.
- Include loading, empty, success, error, and unauthorized states.
- Every button must perform a real action or be clearly disabled with an explanation.
- Use consistent design tokens from `DESIGN.md`.
- Use actual uploaded cover images and never silently substitute random images.
- Use placeholders only when clearly labeled as placeholders during development.
- Respect the attached UI reference without using the image as the actual interface.

## E. Lending Domain Rules
- Return date must be after borrow date.
- Inventory must be checked on the trusted side.
- An approval must reserve a copy without overbooking.
- Rejection must not reserve a copy.
- Return completion requires both required confirmations.
- Inventory must be released exactly once.
- A loan with unresolved conflicting confirmations must not be marked returned.
- Completed records remain in archive unless a documented retention policy requires otherwise.
- Chat is private to the borrower and authorized admin participants.
- Notifications must not disclose another user's private data.

## F. Content Rules
- Only publish books and PDFs the library has permission to distribute.
- History articles require responsible editorial review and sources where applicable.
- Do not fabricate author names, publication years, event dates, quotations, or citations.
- Distinguish drafts from published content.
- Do not copy third-party website code or unlicensed design assets.
- Use authorized branding assets.

## G. Required Checks Before Completion
- Type-check/build.
- Lint.
- Relevant automated tests.
- Security Rules review and tests when permissions change.
- Responsive check.
- Test core flows with visitor, user, and admin roles.
- Check browser console and network failures.
- Update `TASKS.md` and `MEMORY.md` if progress or decisions changed.

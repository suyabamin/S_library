# DEPLOYMENT.md — শিবির লাইব্রেরি, UIU থানা

This document details the complete deployment and environment configuration steps for the **শিবির লাইব্রেরি, UIU থানা** web application.

---

## 1. Architecture Overview

- **Frontend:** React + TypeScript + Vite + Tailwind CSS hosted on **Cloudflare Pages**.
- **Database & Auth:** Firebase Authentication + Cloud Firestore.
- **File Storage:** Private **Cloudflare R2** bucket for PDFs and book covers.
- **Trusted Serverless Layer:** Cloudflare Pages Functions (`/functions/api/...`) for token validation and presigned upload/download URLs.

---

## 2. Environment Variables Configuration

Copy `.env.example` to `.env.local` for local development.

### Public Client Configuration (`VITE_*`)
These variables are bundled with the client application and safe to be exposed publicly:
```env
VITE_APP_NAME="শিবির লাইব্রেরি, UIU থানা"
VITE_APP_TAGLINE="শহিদি কাফেলা"
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="shibir-library-uiu.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="shibir-library-uiu"
VITE_FIREBASE_STORAGE_BUCKET="shibir-library-uiu.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:..."
VITE_R2_PUBLIC_URL="https://r2.yourdomain.com" # Optional custom domain
```

### Server-Side Secrets (Cloudflare Pages Functions)
**CRITICAL:** Set these ONLY in Cloudflare Dashboard under **Pages Project -> Settings -> Environment Variables**:
- `R2_ACCOUNT_ID`: Your Cloudflare Account ID.
- `R2_ACCESS_KEY_ID`: Cloudflare R2 Access Key ID.
- `R2_SECRET_ACCESS_KEY`: Cloudflare R2 Secret Access Key.
- `R2_BUCKET_NAME`: `shibir-library-bucket`
- `FIREBASE_PROJECT_ID`: `shibir-library-uiu`

---

## 3. Firebase Deployment

### Deploy Security Rules & Composite Indexes
1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
2. Authenticate:
   ```bash
   firebase login
   ```
3. Initialize in project root:
   ```bash
   firebase use --add shibir-library-uiu
   ```
4. Deploy rules and indexes:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```

---

## 4. Cloudflare R2 Bucket Configuration

1. In Cloudflare Dashboard, go to **R2 -> Create Bucket**.
2. Bucket Name: `shibir-library-bucket`
3. In **Settings -> CORS Policy**, add:
   ```json
   [
     {
       "AllowedOrigins": [
         "https://shibir-library.pages.dev",
         "http://localhost:5173"
       ],
       "AllowedMethods": ["GET", "PUT", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

---

## 5. Cloudflare Pages Deployment

### Using GitHub Integration (Recommended)
1. Push repository to GitHub.
2. In Cloudflare Dashboard, go to **Workers & Pages -> Create Application -> Pages -> Connect to Git**.
3. Select the `shibir-library` repository.
4. Build Settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Build Output Directory:** `dist`
5. Under **Environment variables**, set all `VITE_*` and server-side secrets.
6. Click **Save and Deploy**.

---

## 6. Scheduled Return Reminders

The scheduled reminder logic is located at `/functions/api/reminders/cron.ts`.
- It can be triggered via Cloudflare Workers Cron Trigger or periodic webhook (e.g. daily at 00:00 UTC).
- Checks active loans due in 3 days, 1 day, or today.
- Generates idempotent notifications using deterministic dedupe keys to eliminate duplicates.

---

## 7. Local Testing & Verification

1. Start development server:
   ```bash
   npm run dev
   ```
2. Run test suite:
   ```bash
   npm run test
   ```
3. Build for production:
   ```bash
   npm run build
   ```

/**
 * scripts/test-book-upload-persistence.mjs
 * 
 * Automated Verification Script for Permanent Book Upload & Cloud Storage
 * 
 * Verifies:
 * - Test A: PDF file upload through real API streaming handler
 * - Test B: Persistent storage verification in Cloudflare R2 & SHA-256 checksum match
 * - Test C: Persistent database record verification in Cloud Firestore with real admin authentication
 * - Test D: Independent fresh-session retrieval & test marker validation (zero cache/cookies)
 * - Test E: Independent download workflow & PDF magic bytes validation
 * - Test F: Persistence after re-query
 * - Clean up of test records
 */

import crypto from 'crypto';
import { Readable } from 'stream';
import { S3Client, HeadObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import uploadHandler from '../api/upload.js';

// Configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || 'fb27ae506c5ae6ba0cad623d2b5d1536';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '4fff2c35afbd0f16afde7e8f77399ba6';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '60986bd16f9e934be9e484be619f6cc1bab3beaf97ab2b6676822f1941e53ddb';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'shibir-library-bucket';
const R2_PUBLIC_URL = process.env.VITE_R2_PUBLIC_URL || 'https://pub-315d764fbe404bb692491d79b0e4a660.r2.dev';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyCsR5BxwJ3FzWQB_NEz8_z8m2rZ32VsOVg',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'shibir-library-uiu.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'shibir-library-uiu',
};

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// Helper to create a valid minimal PDF with unique identifier
function generateValidTestPdf(uniqueId, marker) {
  const streamContent = `BT /F1 12 Tf 72 720 Td (${marker}) Tj ET`;
  const streamLength = Buffer.byteLength(streamContent);
  const pdfSource = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${streamContent}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000300 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
390
%%EOF`;

  return Buffer.from(pdfSource, 'utf-8');
}

function calculateSha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function getAuthenticatedAdminUser() {
  const adminEmail = 'admin-persistence-test@shibir.library';
  const adminPassword = 'AdminPersistencePass123!';

  try {
    const cred = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    return cred.user;
  } catch (err) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      try {
        const cred = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        return cred.user;
      } catch (createErr) {
        throw new Error(`Failed to create test admin user: ${createErr.message}`);
      }
    }
    throw err;
  }
}

async function runPersistenceTest() {
  console.log('===============================================================');
  console.log('  SHIBIR LIBRARY - PERMANENT BOOK UPLOAD & STORAGE TEST');
  console.log('===============================================================\n');

  const uniqueId = `test-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const testFilename = `UPLOAD-PERSISTENCE-TEST-${uniqueId}.pdf`;
  const testMarker = `SHIBIR_LIBRARY_PERSISTENCE_TEST:${uniqueId}`;
  const testBookId = `book-test-${uniqueId}`;
  const testTitle = `[TEST] অটোমেটেড টেস্ট বই - ${uniqueId}`;

  // 1. Generate real PDF and checksum
  const originalPdfBuffer = generateValidTestPdf(uniqueId, testMarker);
  const originalChecksum = calculateSha256(originalPdfBuffer);
  console.log(`[INIT] Generated Test PDF: ${testFilename}`);
  console.log(`[INIT] PDF Size: ${originalPdfBuffer.length} bytes`);
  console.log(`[INIT] Original SHA-256: ${originalChecksum}`);
  console.log(`[INIT] Embedded Marker: ${testMarker}\n`);

  let uploadedUrl = '';
  let uploadedObjectKey = '';

  try {
    // -------------------------------------------------------------
    // TEST A: Upload through API streaming handler
    // -------------------------------------------------------------
    console.log('--- TEST A: Executing Upload Workflow ---');
    const req = Readable.from([originalPdfBuffer]);
    req.method = 'POST';
    req.headers = {
      'content-type': 'application/pdf',
      'x-filename': testFilename,
      'x-folder': 'test-verification',
    };

    let statusCode = 200;
    let responseData = null;

    const res = {
      setHeader: () => {},
      status: (code) => { statusCode = code; return res; },
      json: (data) => { responseData = data; },
      end: () => {},
    };

    await uploadHandler(req, res);

    if (statusCode !== 200 || !responseData || !responseData.success) {
      throw new Error(`Upload API returned error status ${statusCode}: ${JSON.stringify(responseData)}`);
    }

    uploadedUrl = responseData.url;
    uploadedObjectKey = responseData.objectKey;

    if (!uploadedUrl || !uploadedUrl.startsWith('https://')) {
      throw new Error(`Upload returned invalid URL: ${uploadedUrl}`);
    }

    console.log(`✓ Test A PASSED: Upload API succeeded with status 200`);
    console.log(`  Permanent URL: ${uploadedUrl}`);
    console.log(`  Storage Key: ${uploadedObjectKey}\n`);

    // -------------------------------------------------------------
    // TEST B: Verify Persistent Storage in Cloudflare R2
    // -------------------------------------------------------------
    console.log('--- TEST B: Verifying Cloudflare R2 Object & Checksum ---');
    const headResult = await s3.send(
      new HeadObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: uploadedObjectKey,
      })
    );

    if (!headResult || headResult.ContentLength <= 0) {
      throw new Error(`R2 HeadObject failed: ContentLength is ${headResult?.ContentLength}`);
    }

    console.log(`  R2 Object verified in bucket '${R2_BUCKET_NAME}'`);
    console.log(`  R2 Object Size: ${headResult.ContentLength} bytes`);

    // Retrieve bytes independently through public HTTPS URL
    const fetchRes = await fetch(uploadedUrl);
    if (!fetchRes.ok) {
      throw new Error(`Failed to fetch uploaded file from R2 public URL: HTTP ${fetchRes.status}`);
    }

    const fetchedBuffer = Buffer.from(await fetchRes.arrayBuffer());
    const retrievedChecksum = calculateSha256(fetchedBuffer);

    console.log(`  Retrieved SHA-256: ${retrievedChecksum}`);

    if (originalChecksum !== retrievedChecksum) {
      throw new Error(`Checksum mismatch! Original: ${originalChecksum}, Retrieved: ${retrievedChecksum}`);
    }

    console.log(`✓ Test B PASSED: SHA-256 checksums match exactly (100% byte integrity)\n`);

    // -------------------------------------------------------------
    // TEST C: Verify Database Persistence in Cloud Firestore
    // -------------------------------------------------------------
    console.log('--- TEST C: Verifying Persistent Database Record ---');
    console.log('  Authenticating test admin user in Firebase Auth...');
    const adminUser = await getAuthenticatedAdminUser();
    console.log(`  Authenticated as admin UID: ${adminUser.uid} (${adminUser.email})`);

    const bookRecord = {
      id: testBookId,
      title: testTitle,
      author: 'QA Test Automation',
      categoryId: 'others',
      categoryName: 'অন্যান্য',
      description: 'অটোমেটেড টেস্ট বই যা পারসিস্টেন্স পরীক্ষার জন্য তৈরি করা হয়েছে।',
      pdfUrl: uploadedUrl,
      pdfStorageKey: uploadedObjectKey,
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
      downloadAllowed: true,
      featured: false,
      status: 'published',
      isPhysicalAvailable: false,
      totalPhysicalCopies: 0,
      availablePhysicalCopies: 0,
      fileSizeMb: Number((originalPdfBuffer.length / (1024 * 1024)).toFixed(2)) || 0.01,
      pageCount: 1,
      language: 'বাংলা',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Write to Firestore with authenticated admin session
    await setDoc(doc(db, 'books', testBookId), bookRecord);

    // Read back independently from Firestore
    const docSnap = await getDoc(doc(db, 'books', testBookId));
    if (!docSnap.exists()) {
      throw new Error(`Firestore document '${testBookId}' was not found after write!`);
    }

    const savedData = docSnap.data();
    if (savedData.title !== testTitle) {
      throw new Error(`Saved title mismatch. Expected: ${testTitle}, Got: ${savedData.title}`);
    }

    if (!savedData.pdfUrl || savedData.pdfUrl.startsWith('blob:') || savedData.pdfUrl.startsWith('data:')) {
      throw new Error(`Saved pdfUrl is invalid or ephemeral: ${savedData.pdfUrl}`);
    }

    console.log(`✓ Test C PASSED: Firestore document '${testBookId}' persisted and verified`);
    console.log(`  Database record points to permanent URL: ${savedData.pdfUrl}\n`);

    // -------------------------------------------------------------
    // TEST D: Verify Fresh Browser Session (Independent Context)
    // -------------------------------------------------------------
    console.log('--- TEST D: Verifying Independent Session Retrieval ---');
    // Fresh request with no cookies, no cache
    const freshFetch = await fetch(uploadedUrl, {
      headers: {
        'Cache-Control': 'no-cache, no-store',
        'Pragma': 'no-cache',
      },
    });

    if (!freshFetch.ok) {
      throw new Error(`Fresh session fetch failed: HTTP ${freshFetch.status}`);
    }

    const freshText = await freshFetch.text();
    if (!freshText.includes(testMarker)) {
      throw new Error(`Fresh session response does NOT contain test marker: ${testMarker}`);
    }

    console.log(`✓ Test D PASSED: Fresh session retrieved PDF containing verification marker: ${testMarker}\n`);

    // -------------------------------------------------------------
    // TEST E: Verify Independent Download & PDF Magic Signature
    // -------------------------------------------------------------
    console.log('--- TEST E: Verifying Download Workflow & PDF Header ---');
    const downloadRes = await fetch(savedData.pdfUrl);
    const downloadContentType = downloadRes.headers.get('content-type');
    const downloadBytes = Buffer.from(await downloadRes.arrayBuffer());

    const magicHeader = downloadBytes.slice(0, 5).toString('ascii');
    if (magicHeader !== '%PDF-') {
      throw new Error(`Downloaded file is not a valid PDF! Magic bytes: '${magicHeader}'`);
    }

    const downloadedChecksum = calculateSha256(downloadBytes);
    if (downloadedChecksum !== originalChecksum) {
      throw new Error(`Downloaded file checksum mismatch!`);
    }

    console.log(`  Content-Type: ${downloadContentType}`);
    console.log(`  Magic Bytes: ${magicHeader}`);
    console.log(`  Checksum: ${downloadedChecksum}`);
    console.log(`✓ Test E PASSED: Downloaded file is a valid PDF matching original checksum\n`);

    // -------------------------------------------------------------
    // TEST F: Verify Persistence Re-query
    // -------------------------------------------------------------
    console.log('--- TEST F: Verifying Persistence Re-query ---');
    const requerySnap = await getDoc(doc(db, 'books', testBookId));
    if (!requerySnap.exists()) {
      throw new Error('Book record disappeared on re-query!');
    }
    console.log(`✓ Test F PASSED: Book record remains persistent in Cloud Firestore\n`);

    // -------------------------------------------------------------
    // Clean up temporary test data
    // -------------------------------------------------------------
    console.log('--- CLEANUP: Removing Temporary Test Artifacts ---');
    await deleteDoc(doc(db, 'books', testBookId));
    console.log(`  Cleaned up Firestore test document: ${testBookId}`);

    if (uploadedObjectKey) {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: uploadedObjectKey,
        })
      );
      console.log(`  Cleaned up R2 test object: ${uploadedObjectKey}`);
    }
    console.log(`✓ Cleanup complete\n`);

    console.log('===============================================================');
    console.log('  ALL PERSISTENCE VERIFICATION TESTS PASSED (EXIT CODE 0)');
    console.log('===============================================================');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    if (error.stack) console.error(error.stack);

    // Attempt cleanup on failure
    try {
      if (testBookId) await deleteDoc(doc(db, 'books', testBookId));
      if (uploadedObjectKey) {
        await s3.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: uploadedObjectKey }));
      }
    } catch {
      // ignore cleanup errors
    }

    process.exit(1);
  }
}

runPersistenceTest();

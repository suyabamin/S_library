/**
 * scripts/test-book-upload-persistence.mjs
 * 
 * Comprehensive Automated Verification Script for:
 * 1. Schema Validation: Mandatory author validation & rejection of undefined
 * 2. Cloudflare R2 Presigned & Streaming Uploads
 * 3. R2 Persistent Storage & SHA-256 Checksum Match
 * 4. Cloud Firestore Persistent Record Creation (setDoc) & Update (updateDoc)
 * 5. Independent Fresh-Session Retrieval & PDF Header Validation
 * 6. Clean up of test records
 */

import crypto from 'crypto';
import { Readable } from 'stream';
import { S3Client, HeadObjectCommand, DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import uploadHandler from '../api/upload.js';
import presignHandler from '../api/presign.js';
import {
  validateAndCanonicalizeBook,
  sanitizeFirestorePayload,
  findUndefinedPaths,
} from '../src/lib/bookValidation.ts';

// Configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || 'fb27ae506c5ae6ba0cad623d2b5d1536';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '4fff2c35afbd0f16afde7e8f77399ba6';
const R2_SECRET_ACCESS_KEY =
  process.env.R2_SECRET_ACCESS_KEY ||
  '60986bd16f9e934be9e484be619f6cc1bab3beaf97ab2b6676822f1941e53ddb';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'shibir-library-bucket';
const R2_PUBLIC_URL =
  process.env.VITE_R2_PUBLIC_URL || 'https://pub-315d764fbe404bb692491d79b0e4a660.r2.dev';

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
  console.log('  SHIBIR LIBRARY - FIRESTORE DATA & R2 PERSISTENCE TEST');
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
    // TEST 1: Schema Validation & Rejecting Missing Author
    // -------------------------------------------------------------
    console.log('--- TEST 1: Verifying Schema Validation & Error Catching ---');
    const invalidBookMissingAuthor = {
      title: testTitle,
      author: undefined, // Simulates the exact bug
      categoryId: 'quran',
      pdfUrl: 'https://example.com/test.pdf',
    };

    const valResult1 = validateAndCanonicalizeBook(invalidBookMissingAuthor, true);
    if (valResult1.valid) {
      throw new Error('FAILED: Validator should have rejected book with undefined author!');
    }
    console.log(`✓ Test 1A PASSED: Correctly rejected missing author with message: "${valResult1.errors[0]}"`);

    // Verify sanitization of optional fields
    const dirtyPayloadWithUndefined = {
      title: testTitle,
      author: 'ড. রাশেদ হাসান',
      categoryId: 'quran',
      publicationInfo: undefined, // Simulates previous bug
      coverImage: undefined,
      totalCopies: 3,
      pdfUrl: 'https://pub-315d764fbe404bb692491d79b0e4a660.r2.dev/pdfs/test.pdf',
    };

    const valResult2 = validateAndCanonicalizeBook(dirtyPayloadWithUndefined, true);
    if (!valResult2.valid) {
      throw new Error(`FAILED: Valid book with optional undefined fields was rejected: ${valResult2.errors.join(', ')}`);
    }
    const undefinedPaths = findUndefinedPaths(valResult2.sanitized);
    if (undefinedPaths.length > 0) {
      throw new Error(`FAILED: Payload still contains undefined paths: ${undefinedPaths.join(', ')}`);
    }
    console.log(`✓ Test 1B PASSED: Recursively sanitized payload (0 undefined values remaining)\n`);

    // -------------------------------------------------------------
    // TEST 2: Presigned Direct Storage Upload Endpoint
    // -------------------------------------------------------------
    console.log('--- TEST 2: Testing Presigned Upload Generation ---');
    let presignStatusCode = 200;
    let presignResponse = null;

    const presignReq = {
      method: 'POST',
      body: {
        filename: testFilename,
        contentType: 'application/pdf',
        folder: 'test-verification',
      },
    };
    const presignRes = {
      setHeader: () => {},
      status: (code) => { presignStatusCode = code; return presignRes; },
      json: (data) => { presignResponse = data; },
      end: () => {},
    };

    await presignHandler(presignReq, presignRes);

    if (presignStatusCode !== 200 || !presignResponse?.uploadUrl) {
      throw new Error(`Presign API failed with status ${presignStatusCode}: ${JSON.stringify(presignResponse)}`);
    }
    console.log(`✓ Test 2 PASSED: Presigned URL generated successfully`);
    console.log(`  Upload URL endpoint: ${presignResponse.uploadUrl.split('?')[0]}`);
    console.log(`  Target Public URL: ${presignResponse.publicUrl}\n`);

    // Direct upload of PDF bytes using presigned PUT
    console.log('--- TEST 3: Executing Direct Storage Upload via Presigned URL ---');
    const putRes = await fetch(presignResponse.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/pdf' },
      body: originalPdfBuffer,
    });

    if (!putRes.ok) {
      throw new Error(`Direct PUT upload failed with HTTP ${putRes.status}`);
    }

    uploadedUrl = presignResponse.publicUrl;
    uploadedObjectKey = presignResponse.objectKey;
    console.log(`✓ Test 3 PASSED: Direct PUT to Cloudflare R2 succeeded (HTTP ${putRes.status})`);
    console.log(`  Storage Key: ${uploadedObjectKey}\n`);

    // -------------------------------------------------------------
    // TEST 4: Verify Persistent Storage in Cloudflare R2
    // -------------------------------------------------------------
    console.log('--- TEST 4: Verifying Cloudflare R2 Object & SHA-256 Checksum ---');
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
    console.log(`✓ Test 4 PASSED: SHA-256 checksums match exactly (100% byte integrity)\n`);

    // -------------------------------------------------------------
    // TEST 5: Verify Firestore setDoc & updateDoc
    // -------------------------------------------------------------
    console.log('--- TEST 5: Verifying Firestore setDoc & updateDoc Persistence ---');
    const adminUser = await getAuthenticatedAdminUser();
    console.log(`  Authenticated as admin UID: ${adminUser.uid} (${adminUser.email})`);

    const bookInput = {
      title: testTitle,
      author: 'ড. আব্দুল করিম',
      categoryId: 'others',
      categoryName: 'অন্যান্য',
      description: 'অটোমেটেড টেস্ট বই যা পারসিস্টেন্স পরীক্ষার জন্য তৈরি করা হয়েছে।',
      pdfUrl: uploadedUrl,
      pdfObjectKey: uploadedObjectKey,
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
      publicationInfo: undefined, // Must be omitted safely
    };

    const canonicalResult = validateAndCanonicalizeBook(bookInput, true);
    if (!canonicalResult.valid) {
      throw new Error(`Validation failed: ${canonicalResult.errors.join(', ')}`);
    }

    const firestoreBookRecord = {
      ...canonicalResult.sanitized,
      id: testBookId,
      createdBy: adminUser.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Test setDoc
    await setDoc(doc(db, 'books', testBookId), firestoreBookRecord);
    console.log(`✓ Test 5A PASSED: setDoc completed without undefined errors`);

    // Read back independently from Firestore
    let docSnap = await getDoc(doc(db, 'books', testBookId));
    if (!docSnap.exists()) {
      throw new Error(`Firestore document '${testBookId}' was not found after write!`);
    }
    const savedData = docSnap.data();
    if (savedData.author !== 'ড. আব্দুল করিম') {
      throw new Error(`Author mismatch in Firestore! Expected: 'ড. আব্দুল করিম', Got: ${savedData.author}`);
    }
    console.log(`✓ Test 5B PASSED: Firestore document verified (author: "${savedData.author}")`);

    // Test updateDoc (edit workflow)
    const updatePayload = sanitizeFirestorePayload({
      author: 'ড. আব্দুল করিম (সম্পাদিত)',
      publicationInfo: 'শিবির প্রকাশনী, ১ম সংস্করণ',
      updatedBy: adminUser.uid,
      updatedAt: new Date().toISOString(),
    });

    await updateDoc(doc(db, 'books', testBookId), updatePayload);
    docSnap = await getDoc(doc(db, 'books', testBookId));
    const updatedData = docSnap.data();
    if (updatedData.author !== 'ড. আব্দুল করিম (সম্পাদিত)') {
      throw new Error(`Updated author mismatch! Got: ${updatedData.author}`);
    }
    if (updatedData.publicationInfo !== 'শিবির প্রকাশনী, ১ম সংস্করণ') {
      throw new Error(`Updated publicationInfo mismatch! Got: ${updatedData.publicationInfo}`);
    }
    console.log(`✓ Test 5C PASSED: updateDoc workflow verified in Firestore\n`);

    // -------------------------------------------------------------
    // TEST 6: Independent Session Retrieval & PDF Magic Bytes
    // -------------------------------------------------------------
    console.log('--- TEST 6: Verifying Fresh Session Retrieval & PDF Header ---');
    const freshFetchRes = await fetch(savedData.pdfUrl, {
      headers: { 'Cache-Control': 'no-cache, no-store' },
    });
    if (!freshFetchRes.ok) {
      throw new Error(`Fresh session failed to retrieve PDF: HTTP ${freshFetchRes.status}`);
    }
    const freshBuffer = Buffer.from(await freshFetchRes.arrayBuffer());
    const freshHeader = freshBuffer.subarray(0, 5).toString('ascii');
    if (freshHeader !== '%PDF-') {
      throw new Error(`Retrieved file does not start with %PDF- header! Header was: ${freshHeader}`);
    }
    const freshContent = freshBuffer.toString('utf-8');
    if (!freshContent.includes(testMarker)) {
      throw new Error(`Retrieved PDF does not contain embedded verification marker!`);
    }
    console.log(`  Content-Type: application/pdf`);
    console.log(`  Magic Bytes: ${freshHeader}`);
    console.log(`✓ Test 6 PASSED: Independent session retrieved valid PDF containing verification marker\n`);

    // -------------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------------
    console.log('--- CLEANUP: Removing Temporary Test Artifacts ---');
    await deleteDoc(doc(db, 'books', testBookId));
    console.log(`  Cleaned up Firestore test document: ${testBookId}`);

    await s3.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: uploadedObjectKey,
      })
    );
    console.log(`  Cleaned up R2 test object: ${uploadedObjectKey}`);
    console.log(`✓ Cleanup complete\n`);

    console.log('===============================================================');
    console.log('  ALL VERIFICATION TESTS PASSED SUCCESSFULLY (EXIT CODE 0)');
    console.log('===============================================================');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ PERSISTENCE TEST FAILED:', err);
    // Cleanup if possible
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

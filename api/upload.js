import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Credentials must be set as Vercel Environment Variables.
// Fallback values are only for local dev convenience.
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || 'fb27ae506c5ae6ba0cad623d2b5d1536';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '4fff2c35afbd0f16afde7e8f77399ba6';
const R2_SECRET_ACCESS_KEY =
  process.env.R2_SECRET_ACCESS_KEY ||
  '60986bd16f9e934be9e484be619f6cc1bab3beaf97ab2b6676822f1941e53ddb';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'shibir-library-bucket';
const R2_PUBLIC_URL =
  process.env.VITE_R2_PUBLIC_URL || 'https://pub-315d764fbe404bb692491d79b0e4a660.r2.dev';

// Re-create the client per invocation so env vars are always fresh.
function makeS3Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

// Tell Vercel NOT to parse the body — we stream it ourselves.
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // CORS headers on every response (including errors).
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-filename, x-folder');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawFilename = req.headers['x-filename'] || 'file';
    // Sanitise filename — keep only safe characters.
    const filename = decodeURIComponent(rawFilename).replace(/[^a-zA-Z0-9._-]/g, '_');
    const folder = (req.headers['x-folder'] || 'uploads').replace(/[^a-zA-Z0-9_-]/g, '_');
    // Use the raw content-type for storage; strip any "; boundary=..." suffix for the R2 key.
    const contentType = req.headers['content-type'] || 'application/octet-stream';
    const objectKey = `${folder}/${Date.now()}-${filename}`;

    // Stream request body into a single Buffer.
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    if (buffer.length === 0) {
      return res.status(400).json({ error: 'Empty file received — no bytes streamed from request.' });
    }

    const s3 = makeS3Client();
    await s3.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: objectKey,
        Body: buffer,
        ContentType: contentType,
        // Make the object publicly readable via the R2 public URL.
        ACL: undefined, // R2 buckets use bucket-level public access, not per-object ACLs.
      })
    );

    const publicUrl = `${R2_PUBLIC_URL.replace(/\/$/, '')}/${objectKey}`;

    return res.status(200).json({
      success: true,
      url: publicUrl,
      objectKey,
    });
  } catch (err) {
    console.error('[api/upload] R2 upload error:', err);
    return res.status(500).json({
      error: err.message || 'Upload failed',
      details: process.env.NODE_ENV !== 'production' ? String(err) : undefined,
    });
  }
}

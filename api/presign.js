import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || 'fb27ae506c5ae6ba0cad623d2b5d1536';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '4fff2c35afbd0f16afde7e8f77399ba6';
const R2_SECRET_ACCESS_KEY =
  process.env.R2_SECRET_ACCESS_KEY ||
  '60986bd16f9e934be9e484be619f6cc1bab3beaf97ab2b6676822f1941e53ddb';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'shibir-library-bucket';
const R2_PUBLIC_URL =
  process.env.VITE_R2_PUBLIC_URL || 'https://pub-315d764fbe404bb692491d79b0e4a660.r2.dev';

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filename, contentType, folder = 'uploads' } = req.body || {};
    if (!filename || !contentType) {
      return res.status(400).json({ error: 'Missing filename or contentType' });
    }

    const safeFilename = decodeURIComponent(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '_');
    const objectKey = `${safeFolder}/${Date.now()}-${safeFilename}`;

    const s3 = makeS3Client();
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: objectKey,
      ContentType: contentType,
    });

    // 15-minute presigned PUT URL allowing browser direct upload up to 50MB
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });
    const publicUrl = `${R2_PUBLIC_URL.replace(/\/$/, '')}/${objectKey}`;

    return res.status(200).json({
      success: true,
      uploadUrl,
      objectKey,
      publicUrl,
    });
  } catch (err) {
    console.error('[api/presign] Presign error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate presigned upload URL',
    });
  }
}

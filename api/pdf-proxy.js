import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || 'fb27ae506c5ae6ba0cad623d2b5d1536';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '4fff2c35afbd0f16afde7e8f77399ba6';
const R2_SECRET_ACCESS_KEY =
  process.env.R2_SECRET_ACCESS_KEY ||
  '60986bd16f9e934be9e484be619f6cc1bab3beaf97ab2b6676822f1941e53ddb';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'shibir-library-bucket';

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
  // Broad CORS headers to allow cross-origin and iframe/PDF.js requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let rawKey = req.query.key;
    if (!rawKey && req.query.url) {
      try {
        const parsed = new URL(req.query.url);
        rawKey = parsed.pathname.replace(/^\//, '');
      } catch {
        rawKey = req.query.url;
      }
    }

    if (!rawKey) {
      return res.status(400).json({ error: 'Missing object key or url parameter' });
    }

    // Clean up key if it contains URL prefix
    let cleanKey = decodeURIComponent(rawKey);
    if (cleanKey.includes('.r2.dev/')) {
      cleanKey = cleanKey.split('.r2.dev/')[1];
    } else if (cleanKey.startsWith('http://') || cleanKey.startsWith('https://')) {
      const u = new URL(cleanKey);
      cleanKey = u.pathname.replace(/^\//, '');
    }

    const s3 = makeS3Client();
    const commandInput = {
      Bucket: R2_BUCKET_NAME,
      Key: cleanKey,
    };

    // Forward Range header if requested (essential for PDF.js streaming)
    if (req.headers.range) {
      commandInput.Range = req.headers.range;
    }

    const command = new GetObjectCommand(commandInput);
    const r2Response = await s3.send(command);

    res.setHeader('Content-Type', r2Response.ContentType || 'application/pdf');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    if (r2Response.ContentLength !== undefined) {
      res.setHeader('Content-Length', r2Response.ContentLength);
    }
    if (r2Response.ContentRange) {
      res.setHeader('Content-Range', r2Response.ContentRange);
      res.status(206);
    } else {
      res.status(200);
    }

    if (req.method === 'HEAD') {
      return res.end();
    }

    // Stream directly to response
    const stream = r2Response.Body;
    for await (const chunk of stream) {
      res.write(chunk);
    }
    return res.end();
  } catch (err) {
    console.error('[api/pdf-proxy] Error retrieving PDF:', err);
    return res.status(err.$metadata?.httpStatusCode || 500).json({
      error: 'Failed to retrieve PDF from storage',
      details: err.message,
    });
  }
}

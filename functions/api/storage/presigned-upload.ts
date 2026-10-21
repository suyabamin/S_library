import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface Env {
  R2_ACCOUNT_ID?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_BUCKET_NAME?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const body = await request.json() as {
      filename: string;
      contentType: string;
      folder?: string;
      objectKey?: string;
    };

    const { filename, contentType, folder = 'covers' } = body;
    if (!filename || !contentType) {
      return new Response(JSON.stringify({ error: 'Missing filename or contentType' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate allowed mime types
    const isImage = contentType.startsWith('image/');
    const isPdf = contentType === 'application/pdf';
    if (!isImage && !isPdf) {
      return new Response(JSON.stringify({ error: 'Invalid file type. Only PDF and images allowed.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const objectKey = body.objectKey || `${folder}/${Date.now()}-${safeFilename}`;

    // If Cloudflare R2 secrets are present in server-side environment
    if (env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY) {
      const s3 = new S3Client({
        region: 'auto',
        endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: env.R2_ACCESS_KEY_ID,
          secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        },
      });

      const command = new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME || 'shibir-library-bucket',
        Key: objectKey,
        ContentType: contentType,
      });

      // Short-lived signed URL (15 minutes)
      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });

      return new Response(JSON.stringify({ uploadUrl, objectKey }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Mock fallback when secrets are not yet configured in runtime
    return new Response(
      JSON.stringify({
        uploadUrl: `/api/files/mock-upload?key=${encodeURIComponent(objectKey)}`,
        objectKey,
        mock: true,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

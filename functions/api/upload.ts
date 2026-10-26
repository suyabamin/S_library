import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

interface Env {
  R2_ACCOUNT_ID?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_BUCKET_NAME?: string;
}

const DEFAULT_R2_ACCOUNT_ID = 'fb27ae506c5ae6ba0cad623d2b5d1536';
const DEFAULT_R2_ACCESS_KEY_ID = '4fff2c35afbd0f16afde7e8f77399ba6';
const DEFAULT_R2_SECRET_ACCESS_KEY =
  '60986bd16f9e934be9e484be619f6cc1bab3beaf97ab2b6676822f1941e53ddb';
const DEFAULT_R2_BUCKET_NAME = 'shibir-library-bucket';
const DEFAULT_R2_PUBLIC_URL = 'https://pub-315d764fbe404bb692491d79b0e4a660.r2.dev';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;

    const rawFilename = request.headers.get('x-filename') || 'file';
    const filename = decodeURIComponent(rawFilename).replace(/[^a-zA-Z0-9._-]/g, '_');
    const folder = (request.headers.get('x-folder') || 'uploads').replace(/[^a-zA-Z0-9_-]/g, '_');
    const contentType = request.headers.get('content-type') || 'application/octet-stream';
    const objectKey = `${folder}/${Date.now()}-${filename}`;

    const arrayBuffer = await request.arrayBuffer();
    if (arrayBuffer.byteLength === 0) {
      return new Response(JSON.stringify({ error: 'Empty file received' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const accountId = env.R2_ACCOUNT_ID || DEFAULT_R2_ACCOUNT_ID;
    const accessKeyId = env.R2_ACCESS_KEY_ID || DEFAULT_R2_ACCESS_KEY_ID;
    const secretAccessKey = env.R2_SECRET_ACCESS_KEY || DEFAULT_R2_SECRET_ACCESS_KEY;
    const bucketName = env.R2_BUCKET_NAME || DEFAULT_R2_BUCKET_NAME;

    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        Body: new Uint8Array(arrayBuffer),
        ContentType: contentType,
      })
    );

    const publicUrl = `${DEFAULT_R2_PUBLIC_URL.replace(/\/$/, '')}/${objectKey}`;

    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrl,
        objectKey,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-filename, x-folder',
    },
  });
};

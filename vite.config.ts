import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2UploadPlugin = () => ({
  name: 'r2-upload-dev-middleware',
  configureServer(server: any) {
    const s3 = new S3Client({
      region: 'auto',
      endpoint: 'https://fb27ae506c5ae6ba0cad623d2b5d1536.r2.cloudflarestorage.com',
      credentials: {
        accessKeyId: '4fff2c35afbd0f16afde7e8f77399ba6',
        secretAccessKey: '60986bd16f9e934be9e484be619f6cc1bab3beaf97ab2b6676822f1941e53ddb',
      },
    });

    // Handle presign requests
    server.middlewares.use(async (req: any, res: any, next: any) => {
      if (req.url === '/api/presign' || req.url === '/api/storage/presigned-upload') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        try {
          const chunks: Uint8Array[] = [];
          for await (const chunk of req) {
            chunks.push(chunk);
          }
          const body = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
          const { filename, contentType, folder = 'uploads' } = body;

          const safeFilename = decodeURIComponent(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
          const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '_');
          const objectKey = `${safeFolder}/${Date.now()}-${safeFilename}`;

          const command = new PutObjectCommand({
            Bucket: 'shibir-library-bucket',
            Key: objectKey,
            ContentType: contentType,
          });

          const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });
          const publicUrl = `https://pub-315d764fbe404bb692491d79b0e4a660.r2.dev/${objectKey}`;

          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, uploadUrl, objectKey, publicUrl }));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message || 'Presign failed' }));
        }
        return;
      }
      next();
    });

    // Handle streaming upload
    server.middlewares.use('/api/upload', async (req: any, res: any) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-filename, x-folder');

      if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
      }

      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
      }

      try {
        const rawFilename = req.headers['x-filename'] || 'file';
        const filename = decodeURIComponent(rawFilename).replace(/[^a-zA-Z0-9._-]/g, '_');
        const folder = (req.headers['x-folder'] || 'uploads').replace(/[^a-zA-Z0-9_-]/g, '_');
        const contentType = req.headers['content-type'] || 'application/octet-stream';
        const objectKey = `${folder}/${Date.now()}-${filename}`;

        const chunks: Uint8Array[] = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        await s3.send(
          new PutObjectCommand({
            Bucket: 'shibir-library-bucket',
            Key: objectKey,
            Body: buffer,
            ContentType: contentType,
          })
        );

        const publicUrl = `https://pub-315d764fbe404bb692491d79b0e4a660.r2.dev/${objectKey}`;

        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, url: publicUrl, objectKey }));
      } catch (err: any) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: err.message || 'Upload failed' }));
      }
    });
  },
});

export default defineConfig({
  plugins: [react(), r2UploadPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});

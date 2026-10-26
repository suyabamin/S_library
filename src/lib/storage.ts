/**
 * Storage abstraction layer for Cloudflare R2 and assets.
 * As required by ARCHITECTURE.md Section 9, business components interact with
 * this service rather than hardcoding storage provider URLs.
 */

export interface StorageUploadResult {
  objectKey: string;
  publicUrl?: string;
  fileSize: number;
}

export class StorageService {
  private r2PublicUrl = import.meta.env.VITE_R2_PUBLIC_URL || 'https://pub-315d764fbe404bb692491d79b0e4a660.r2.dev';

  /**
   * Resolve an objectKey or external URL into a playable/readable URL.
   */
  resolveUrl(objectKeyOrUrl?: string): string {
    if (!objectKeyOrUrl) return '';
    // If it's already an absolute HTTP/HTTPS URL or data URL
    if (objectKeyOrUrl.startsWith('http://') || objectKeyOrUrl.startsWith('https://') || objectKeyOrUrl.startsWith('data:')) {
      return objectKeyOrUrl;
    }
    // If it's an object key and we have a public R2 custom domain/URL
    if (this.r2PublicUrl) {
      const cleanBase = this.r2PublicUrl.replace(/\/$/, '');
      const cleanKey = objectKeyOrUrl.replace(/^\//, '');
      return `${cleanBase}/${cleanKey}`;
    }
    // Fallback path or proxy endpoint
    return `/api/files/${encodeURIComponent(objectKeyOrUrl)}`;
  }

  /**
   * Resolve a PDF URL or objectKey to a CORS-safe URL suitable for PDF.js / canvas rendering.
   * If the URL is hosted on Cloudflare R2 (.r2.dev or bucket domain), routes through /api/pdf-proxy
   * to ensure full CORS, Range-request streaming, and standard PDF content-type headers.
   */
  resolvePdfStreamUrl(objectKeyOrUrl?: string): string {
    if (!objectKeyOrUrl) return '';
    const raw = objectKeyOrUrl.trim();

    // If it's already pointing to local API proxy, return as is
    if (raw.startsWith('/api/pdf-proxy')) {
      return raw;
    }

    // If it's on R2 dev or custom domain, route via /api/pdf-proxy
    if (raw.includes('.r2.dev') || raw.includes('.r2.cloudflarestorage.com')) {
      return `/api/pdf-proxy?url=${encodeURIComponent(raw)}`;
    }

    // If it's a relative object key (e.g. pdfs/123-abc.pdf)
    if (!raw.startsWith('http://') && !raw.startsWith('https://') && !raw.startsWith('data:')) {
      return `/api/pdf-proxy?key=${encodeURIComponent(raw)}`;
    }

    // Direct external URL (e.g. raw.githubusercontent.com)
    return raw;
  }

  /**
   * Request a short-lived presigned upload URL from the server-side API
   * or perform client-safe development simulation if server endpoint is offline.
   */
  async getPresignedUploadUrl(
    filename: string,
    contentType: string,
    folder: 'covers' | 'pdfs' | 'history' = 'covers'
  ): Promise<{ uploadUrl: string; objectKey: string }> {
    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const objectKey = `${folder}/${Date.now()}-${safeFilename}`;

    try {
      const res = await fetch('/api/storage/presigned-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, contentType, folder, objectKey }),
      });

      if (res.ok) {
        const data = await res.json();
        return { uploadUrl: data.uploadUrl, objectKey: data.objectKey };
      }
    } catch {
      // In local development before Cloudflare Functions deployment
    }

    // Return dummy or direct path for development/offline
    return {
      uploadUrl: `/api/storage/upload?key=${encodeURIComponent(objectKey)}`,
      objectKey,
    };
  }

  /**
   * Request a short-lived signed download URL for private files
   */
  async getSignedDownloadUrl(objectKey: string): Promise<string> {
    try {
      const res = await fetch(`/api/storage/signed-url?key=${encodeURIComponent(objectKey)}`);
      if (res.ok) {
        const data = await res.json();
        return data.url;
      }
    } catch {
      // fallback
    }
    return this.resolveUrl(objectKey);
  }
}

export const storageService = new StorageService();

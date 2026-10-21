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
  private r2PublicUrl = import.meta.env.VITE_R2_PUBLIC_URL || '';

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

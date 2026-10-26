import { describe, it, expect } from 'vitest';
import { storageService } from '../lib/storage';
import * as pdfjsLib from 'pdfjs-dist';

describe('PDF Reader Storage & Continuous Stream Resolution', () => {
  it('correctly routes R2 public URLs to CORS-safe streaming proxy', () => {
    const rawR2 = 'https://pub-315d764fbe404bb692491d79b0e4a660.r2.dev/pdfs/1793029406885-261_Spring_26_SE_Final__2_.pdf';
    const streamUrl = storageService.resolvePdfStreamUrl(rawR2);
    expect(streamUrl).toBe('/api/pdf-proxy?url=https%3A%2F%2Fpub-315d764fbe404bb692491d79b0e4a660.r2.dev%2Fpdfs%2F1793029406885-261_Spring_26_SE_Final__2_.pdf');
  });

  it('correctly routes bare R2 object keys to CORS-safe streaming proxy', () => {
    const objectKey = 'pdfs/my-uploaded-book.pdf';
    const streamUrl = storageService.resolvePdfStreamUrl(objectKey);
    expect(streamUrl).toBe('/api/pdf-proxy?key=pdfs%2Fmy-uploaded-book.pdf');
  });

  it('preserves direct external URLs if not on R2', () => {
    const external = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf';
    const streamUrl = storageService.resolvePdfStreamUrl(external);
    expect(streamUrl).toBe(external);
  });

  it('pdfjsLib is loaded with valid version', () => {
    expect(pdfjsLib.version).toBeDefined();
    expect(typeof pdfjsLib.version).toBe('string');
  });
});

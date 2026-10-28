import { describe, it, expect } from 'vitest';
import {
  sanitizeFirestorePayload,
  findUndefinedPaths,
  validateAndCanonicalizeBook,
} from '../lib/bookValidation';

describe('bookValidation & Firestore Sanitization', () => {
  it('finds undefined paths correctly', () => {
    const data = {
      title: 'টেস্ট বই',
      author: undefined,
      nested: {
        field1: 'value',
        field2: undefined,
      },
      array: ['item', undefined, 'item2'],
    };

    const paths = findUndefinedPaths(data);
    expect(paths).toContain('author');
    expect(paths).toContain('nested.field2');
    expect(paths).toContain('array[1]');
  });

  it('sanitizes undefined fields while preserving 0, false, empty strings, and arrays', () => {
    const dirty = {
      title: 'বইয়ের নাম',
      author: undefined,
      publicationInfo: undefined,
      totalCopies: 0,
      downloadAllowed: false,
      notes: '',
      tags: ['ইসলাম', undefined, 'ইতিহাস'],
      nested: {
        validNumber: 42,
        invalidField: undefined,
      },
    };

    const clean = sanitizeFirestorePayload(dirty);

    expect(clean).not.toHaveProperty('author');
    expect(clean).not.toHaveProperty('publicationInfo');
    expect(clean.totalCopies).toBe(0);
    expect(clean.downloadAllowed).toBe(false);
    expect(clean.notes).toBe('');
    expect(clean.tags).toEqual(['ইসলাম', 'ইতিহাস']);
    expect(clean.nested.validNumber).toBe(42);
    expect(clean.nested).not.toHaveProperty('invalidField');
    expect(findUndefinedPaths(clean)).toEqual([]);
  });

  it('validates mandatory author field and rejects when author is missing or empty', () => {
    const missingAuthor = {
      title: 'কুরআন পরিচিতি',
      categoryId: 'quran',
      pdfUrl: 'https://pub-315d764fbe404bb692491d79b0e4a660.r2.dev/pdfs/test.pdf',
    };

    const result = validateAndCanonicalizeBook(missingAuthor, true);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('লেখকের নাম'))).toBe(true);
  });

  it('validates mandatory title field and rejects when title is missing or empty', () => {
    const missingTitle = {
      author: 'মাওলানা মওদূদী',
      categoryId: 'tafsir',
      pdfUrl: 'https://pub-315d764fbe404bb692491d79b0e4a660.r2.dev/pdfs/test.pdf',
    };

    const result = validateAndCanonicalizeBook(missingTitle, true);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('বইয়ের নাম'))).toBe(true);
  });

  it('rejects temporary blob URLs as permanent pdfUrl', () => {
    const blobBook = {
      title: 'টেস্ট বই',
      author: 'লেখক',
      categoryId: 'quran',
      pdfUrl: 'blob:http://localhost:5173/1234-5678',
    };

    const result = validateAndCanonicalizeBook(blobBook, true);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('আপলোড সম্পূর্ণ হয়নি'))).toBe(true);
  });

  it('canonicalizes a valid book without leaving any undefined field', () => {
    const validBook = {
      title: 'ইসলাম পরিচিতি',
      author: 'সাইয়েদ আবুল আলা মওদূদী',
      categoryId: 'islamic-thought',
      categoryName: 'ইসলামী চিন্তা',
      description: 'ইসলাম সম্পর্কে একটি মৌলিক গ্রন্থ',
      pdfUrl: 'https://pub-315d764fbe404bb692491d79b0e4a660.r2.dev/pdfs/book.pdf',
      downloadAllowed: true,
      featured: true,
      totalPhysicalCopies: 5,
      publicationInfo: undefined, // intentionally undefined to verify it is omitted
      coverImage: undefined,      // intentionally undefined to verify it is omitted
    };

    const result = validateAndCanonicalizeBook(validBook, true);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.sanitized.title).toBe('ইসলাম পরিচিতি');
    expect(result.sanitized.author).toBe('সাইয়েদ আবুল আলা মওদূদী');
    expect(result.sanitized.totalPhysicalCopies).toBe(5);
    expect(result.sanitized.availablePhysicalCopies).toBe(5);
    expect(result.sanitized).not.toHaveProperty('publicationInfo');
    expect(result.sanitized).not.toHaveProperty('coverImage');
    expect(findUndefinedPaths(result.sanitized)).toEqual([]);
  });

  describe('Add Book by URL validation', () => {
    it('accepts external_page book with valid HTTPS URL and no PDF file required', () => {
      const urlBook = {
        title: 'অনলাইন পাঠ্যবই',
        author: 'প্রফেসর আহমদ',
        categoryId: 'higher-syllabus',
        sourceType: 'external_page' as const,
        externalUrl: 'https://www.icsbook.info/book/online-reading',
      };

      const result = validateAndCanonicalizeBook(urlBook, true);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.sanitized.sourceType).toBe('external_page');
      expect(result.sanitized.externalUrl).toBe('https://www.icsbook.info/book/online-reading');
      expect(findUndefinedPaths(result.sanitized)).toEqual([]);
    });

    it('rejects external_page when URL is missing or invalid', () => {
      const invalidUrlBook = {
        title: 'ভুল লিংক বই',
        author: 'লেখক',
        categoryId: 'school-syllabus',
        sourceType: 'external_page' as const,
        externalUrl: 'javascript:alert(1)',
      };

      const result = validateAndCanonicalizeBook(invalidUrlBook, true);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('বৈধ ও নিরাপদ URL'))).toBe(true);
    });

    it('accepts external_pdf book with valid HTTPS PDF link', () => {
      const externalPdfBook = {
        title: 'রিমোট পিডিএফ বই',
        author: 'লেখক ২',
        categoryId: 'kormi-syllabus',
        sourceType: 'external_pdf' as const,
        pdfUrl: 'https://remote-server.org/doc.pdf',
      };

      const result = validateAndCanonicalizeBook(externalPdfBook, true);
      expect(result.valid).toBe(true);
      expect(result.sanitized.sourceType).toBe('external_pdf');
      expect(result.sanitized.pdfUrl).toBe('https://remote-server.org/doc.pdf');
    });

    it('accepts internal_book referencing an existing library book ID', () => {
      const internalRefBook = {
        title: 'অভ্যন্তরীণ রেফারেন্স বই',
        author: 'লেখক ৩',
        categoryId: 'sathi-syllabus',
        sourceType: 'internal_book' as const,
        internalBookId: 'book-quran-1',
      };

      const result = validateAndCanonicalizeBook(internalRefBook, true);
      expect(result.valid).toBe(true);
      expect(result.sanitized.sourceType).toBe('internal_book');
      expect(result.sanitized.internalBookId).toBe('book-quran-1');
    });
  });
});

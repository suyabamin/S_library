import { describe, it, expect } from 'vitest';
import {
  isValidUrl,
  validateSyllabus,
  canonicalizeSyllabus,
  sanitizeFirestorePayload,
} from '../lib/syllabusValidation';
import { Syllabus } from '../types';

describe('syllabusValidation', () => {
  describe('isValidUrl', () => {
    it('accepts valid https and http URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('https://icsbook.info/school-syllabus')).toBe(true);
      expect(isValidUrl('http://sub.domain.org/path/doc.pdf?id=123')).toBe(true);
    });

    it('accepts internal relative application paths', () => {
      expect(isValidUrl('/books/book-123')).toBe(true);
      expect(isValidUrl('/categories/school-syllabus')).toBe(true);
    });

    it('rejects unsafe and invalid URLs', () => {
      expect(isValidUrl('javascript:alert(1)')).toBe(false);
      expect(isValidUrl('vbscript:msgbox(1)')).toBe(false);
      expect(isValidUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl(undefined)).toBe(false);
      expect(isValidUrl(null)).toBe(false);
    });
  });

  describe('validateSyllabus', () => {
    it('catches missing required fields', () => {
      const errors = validateSyllabus({});
      expect(errors).toContain('সিলেবাসের শিরোনাম প্রদান করা আবশ্যক।');
      expect(errors).toContain('সিলেবাসের জন্য একটি ক্যাটাগরি নির্বাচন করা আবশ্যক।');
    });

    it('catches invalid URLs in syllabus and nested items', () => {
      const invalidSyllabus: Partial<Syllabus> = {
        title: 'টেস্ট সিলেবাস',
        categorySlug: 'school-syllabus',
        downloadUrl: 'javascript:alert(1)',
        bannerUrl: 'not-a-valid-url',
        sections: [
          {
            id: 'sec-1',
            title: 'প্রথম সেকশন',
            order: 1,
            objectives: [],
            resourceGroups: [
              {
                id: 'grp-1',
                title: 'গ্রুপ ১',
                order: 1,
                items: [
                  {
                    id: 'itm-1',
                    title: 'বই ১',
                    order: 1,
                    externalUrl: 'data:text/html,hack',
                    downloadUrl: 'javascript:void(0)',
                  },
                ],
              },
            ],
          },
        ],
      };

      const errors = validateSyllabus(invalidSyllabus);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.includes('ডাউনলোড লিংকটি'))).toBe(true);
      expect(errors.some((e) => e.includes('ব্যানার ছবির লিংকটি'))).toBe(true);
      expect(errors.some((e) => e.includes('অনলাইন লিংকটি'))).toBe(true);
    });

    it('returns empty errors array for valid syllabus', () => {
      const validSyllabus: Partial<Syllabus> = {
        title: 'স্কুল সিলেবাস',
        categorySlug: 'school-syllabus',
        downloadUrl: 'https://example.com/syllabus.pdf',
        sections: [
          {
            id: 'sec-1',
            title: 'আল কুরআন',
            order: 1,
            objectives: ['কুরআন পাঠ'],
            resourceGroups: [
              {
                id: 'grp-1',
                title: 'পাঠ্যবই',
                order: 1,
                items: [
                  {
                    id: 'itm-1',
                    title: 'সহজ কুরআন শিক্ষা',
                    order: 1,
                    externalUrl: 'https://icsbook.info/quran',
                  },
                ],
              },
            ],
          },
        ],
      };

      const errors = validateSyllabus(validSyllabus);
      expect(errors).toEqual([]);
    });
  });

  describe('canonicalizeSyllabus & sanitizeFirestorePayload', () => {
    it('normalizes syllabus structure and strips undefined values', () => {
      const rawInput: Partial<Syllabus> = {
        title: '  কর্মী সিলেবাস  ',
        categorySlug: 'kormi-syllabus',
        subtitle: undefined,
        sections: [
          {
            id: 'sec-1',
            title: '  অধ্যয়ন  ',
            objectives: ['  উদ্দেশ্য ১  ', ''],
            resourceGroups: [
              {
                id: 'grp-1',
                title: 'গ্রুপ ১',
                items: [
                  {
                    id: 'itm-1',
                    title: 'বই ১',
                    author: undefined,
                    order: 1,
                  },
                ],
                order: 1,
              },
            ],
            order: 1,
          },
        ],
      };

      const canonical = canonicalizeSyllabus(rawInput);
      expect(canonical.title).toBe('কর্মী সিলেবাস');
      expect(canonical.status).toBe('published');
      expect(canonical.sections[0].title).toBe('অধ্যয়ন');
      expect(canonical.sections[0].objectives).toEqual(['উদ্দেশ্য ১']);
      expect(canonical.sections[0].resourceGroups[0].items[0].title).toBe('বই ১');

      // Verify no undefined fields exist
      const json = JSON.stringify(canonical);
      const parsed = JSON.parse(json);
      expect(parsed.subtitle).toBeUndefined();
      expect(parsed.sections[0].resourceGroups[0].items[0].author).toBeUndefined();
    });

    it('sanitizeFirestorePayload deeply removes undefined', () => {
      const data = {
        a: 1,
        b: undefined,
        c: [1, undefined, { d: 'test', e: undefined }],
      };
      const cleaned: any = sanitizeFirestorePayload(data);
      expect(cleaned.b).toBeUndefined();
      expect('b' in cleaned).toBe(false);
      expect(cleaned.c[2].e).toBeUndefined();
      expect('e' in cleaned.c[2]).toBe(false);
      expect(cleaned.c[2].d).toBe('test');
    });
  });
});

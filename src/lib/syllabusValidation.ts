import { Syllabus, SyllabusSection, SyllabusResourceGroup, SyllabusResource } from '../types';

/**
 * Validates whether a URL is safe and valid.
 * Allows https://, http://, or internal application paths starting with '/'.
 * Strictly rejects dangerous schemes like 'javascript:', unsafe data URIs, or control characters.
 */
export function isValidUrl(url?: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  // Reject dangerous schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('data:') ||
    lower.includes('\0')
  ) {
    return false;
  }

  // Allow internal application paths
  if (trimmed.startsWith('/')) {
    return true;
  }

  // Check HTTP / HTTPS URLs
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates a complete Syllabus before persistence.
 * Returns an array of Bengali validation error messages.
 */
export function validateSyllabus(syllabus: Partial<Syllabus>): string[] {
  const errors: string[] = [];

  if (!syllabus.title || !syllabus.title.trim()) {
    errors.push('সিলেবাসের শিরোনাম প্রদান করা আবশ্যক।');
  }

  if (!syllabus.categorySlug || !syllabus.categorySlug.trim()) {
    errors.push('সিলেবাসের জন্য একটি ক্যাটাগরি নির্বাচন করা আবশ্যক।');
  }

  if (syllabus.downloadUrl && !isValidUrl(syllabus.downloadUrl)) {
    errors.push('সম্পূর্ণ সিলেবাস ডাউনলোড লিংকটি একটি সঠিক ও নিরাপদ URL (https://) হতে হবে।');
  }

  if (syllabus.bannerUrl && !isValidUrl(syllabus.bannerUrl)) {
    errors.push('ব্যানার ছবির লিংকটি একটি সঠিক URL হতে হবে।');
  }

  if (Array.isArray(syllabus.sections)) {
    syllabus.sections.forEach((section, sIdx) => {
      const sNum = sIdx + 1;
      if (!section.title || !section.title.trim()) {
        errors.push(`সেকশন নং ${sNum}-এর শিরোনাম প্রদান করা আবশ্যক।`);
      }

      if (Array.isArray(section.resourceGroups)) {
        section.resourceGroups.forEach((group, gIdx) => {
          const gNum = gIdx + 1;
          if (!group.title || !group.title.trim()) {
            errors.push(`সেকশন "${section.title || sNum}"-এর রিসোর্স গ্রুপ নং ${gNum}-এর নাম আবশ্যক।`);
          }

          if (Array.isArray(group.items)) {
            group.items.forEach((item, iIdx) => {
              const iNum = iIdx + 1;
              if (!item.title || !item.title.trim()) {
                errors.push(`গ্রুপ "${group.title || gNum}"-এর বই/রিসোর্স নং ${iNum}-এর নাম আবশ্যক।`);
              }
              if (item.externalUrl && !isValidUrl(item.externalUrl)) {
                errors.push(`রিসোর্স "${item.title || iNum}"-এর অনলাইন লিংকটি সঠিক ও নিরাপদ নয়।`);
              }
              if (item.downloadUrl && !isValidUrl(item.downloadUrl)) {
                errors.push(`রিসোর্স "${item.title || iNum}"-এর ডাউনলোড লিংকটি সঠিক নয়।`);
              }
            });
          }
        });
      }
    });
  }

  return errors;
}

/**
 * Deeply removes all `undefined` values from an object or array.
 * Firestore strictly rejects payloads containing `undefined`.
 */
export function sanitizeFirestorePayload<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as any;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeFirestorePayload(item)) as any;
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        sanitized[key] = sanitizeFirestorePayload(value);
      }
    }
    return sanitized as T;
  }

  return obj;
}

/**
 * Prepares a clean Syllabus object for storage.
 * Ensures consistent order numbers, removes undefined fields, and sets timestamps.
 */
export function canonicalizeSyllabus(input: Partial<Syllabus>): Syllabus {
  const now = new Date().toISOString();
  const id = input.id || `syl-${Date.now()}`;
  const slug = input.slug || input.categorySlug || `syllabus-${Date.now()}`;

  const cleanSections: SyllabusSection[] = (input.sections || []).map((sec, sIdx) => {
    const cleanGroups: SyllabusResourceGroup[] = (sec.resourceGroups || []).map((grp, gIdx) => {
      const cleanItems: SyllabusResource[] = (grp.items || []).map((itm, iIdx) => ({
        id: itm.id || `item-${sIdx}-${gIdx}-${iIdx}-${Date.now()}`,
        title: itm.title?.trim() || '',
        author: itm.author?.trim() || undefined,
        publisher: itm.publisher?.trim() || undefined,
        description: itm.description?.trim() || undefined,
        externalUrl: itm.externalUrl?.trim() || undefined,
        internalBookId: itm.internalBookId?.trim() || undefined,
        downloadUrl: itm.downloadUrl?.trim() || undefined,
        coverUrl: itm.coverUrl?.trim() || undefined,
        resourceType: itm.resourceType || 'book',
        order: typeof itm.order === 'number' ? itm.order : iIdx + 1,
      }));

      return {
        id: grp.id || `grp-${sIdx}-${gIdx}-${Date.now()}`,
        title: grp.title?.trim() || '',
        description: grp.description?.trim() || undefined,
        items: cleanItems,
        order: typeof grp.order === 'number' ? grp.order : gIdx + 1,
      };
    });

    const cleanObjectives = (sec.objectives || [])
      .map((o) => (typeof o === 'string' ? o.trim() : ''))
      .filter((o) => o.length > 0);

    return {
      id: sec.id || `sec-${sIdx}-${Date.now()}`,
      title: sec.title?.trim() || '',
      description: sec.description?.trim() || undefined,
      objectives: cleanObjectives,
      studyInstructions: sec.studyInstructions?.trim() || undefined,
      notes: sec.notes?.trim() || undefined,
      resourceGroups: cleanGroups,
      order: typeof sec.order === 'number' ? sec.order : sIdx + 1,
    };
  });

  const syllabus: Syllabus = {
    id,
    title: input.title?.trim() || '',
    slug,
    categorySlug: input.categorySlug?.trim() || '',
    subtitle: input.subtitle?.trim() || undefined,
    description: input.description?.trim() || undefined,
    notice: input.notice?.trim() || undefined,
    bannerUrl: input.bannerUrl?.trim() || undefined,
    downloadUrl: input.downloadUrl?.trim() || undefined,
    lastUpdated: input.lastUpdated || now,
    status: input.status === 'draft' ? 'draft' : 'published',
    sections: cleanSections,
    createdAt: input.createdAt || now,
    updatedAt: now,
    createdBy: input.createdBy,
    updatedBy: input.updatedBy,
    publishedAt: input.status === 'published' ? (input.publishedAt || now) : undefined,
    schemaVersion: 1,
  };

  return sanitizeFirestorePayload(syllabus);
}

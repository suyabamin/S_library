import type { Book } from '../types/index.ts';

/**
 * Diagnostic helper: recursively finds any keys with `undefined` values in an object.
 * Returns an array of dot-notated paths, e.g. ['author', 'metadata.publisher']
 */
export function findUndefinedPaths(obj: any, currentPath = ''): string[] {
  if (obj === undefined) {
    return [currentPath || 'root'];
  }
  if (obj === null || typeof obj !== 'object') {
    return [];
  }
  // Skip Firestore sentinel / special objects
  if (
    obj._methodName ||
    obj.constructor?.name === 'FieldValue' ||
    obj.constructor?.name === 'Timestamp' ||
    typeof obj.toMillis === 'function' ||
    obj.constructor?.name === 'DocumentReference' ||
    obj.constructor?.name === 'GeoPoint'
  ) {
    return [];
  }

  const paths: string[] = [];
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const childPath = currentPath ? `${currentPath}[${index}]` : `[${index}]`;
      if (item === undefined) {
        paths.push(childPath);
      } else if (item !== null && typeof item === 'object') {
        paths.push(...findUndefinedPaths(item, childPath));
      }
    });
  } else {
    for (const [key, value] of Object.entries(obj)) {
      const childPath = currentPath ? `${currentPath}.${key}` : key;
      if (value === undefined) {
        paths.push(childPath);
      } else if (value !== null && typeof value === 'object') {
        paths.push(...findUndefinedPaths(value, childPath));
      }
    }
  }
  return paths;
}

/**
 * Recursively removes all `undefined` fields from an object or array.
 * Safe for Firestore data types (FieldValue, Timestamp, DocumentReference, GeoPoint).
 * Preserves intentional values: 0, false, empty strings, empty arrays, null.
 */
export function sanitizeFirestorePayload<T extends Record<string, any>>(data: T): Record<string, any> {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  // Preserve Firestore sentinel objects
  if (
    data._methodName ||
    data.constructor?.name === 'FieldValue' ||
    data.constructor?.name === 'Timestamp' ||
    typeof data.toMillis === 'function' ||
    data.constructor?.name === 'DocumentReference' ||
    data.constructor?.name === 'GeoPoint'
  ) {
    return data;
  }

  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => (typeof item === 'object' && item !== null ? sanitizeFirestorePayload(item) : item));
  }

  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      // Strictly omit undefined fields so Firestore setDoc / updateDoc never throws
      continue;
    }

    if (value === null) {
      result[key] = null;
    } else if (typeof value === 'object') {
      if (
        value._methodName ||
        value.constructor?.name === 'FieldValue' ||
        value.constructor?.name === 'Timestamp' ||
        typeof value.toMillis === 'function' ||
        value.constructor?.name === 'DocumentReference' ||
        value.constructor?.name === 'GeoPoint'
      ) {
        result[key] = value;
      } else if (Array.isArray(value)) {
        result[key] = value
          .filter((item) => item !== undefined)
          .map((item) => (typeof item === 'object' && item !== null ? sanitizeFirestorePayload(item) : item));
      } else {
        result[key] = sanitizeFirestorePayload(value);
      }
    } else {
      // Primitive values (number, boolean, string)
      result[key] = value;
    }
  }

  return result;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitized: Record<string, any>;
}

/**
 * Validates and canonicalizes book data before persisting to Firestore.
 * Enforces mandatory fields according to library architecture:
 * - title: required, non-empty string
 * - author: required, non-empty string
 * - categoryId: required, non-empty string
 * - pdfUrl: required for digital reading, valid URL
 */
export function validateAndCanonicalizeBook(
  input: Partial<Book>,
  isNew = true
): ValidationResult {
  const errors: string[] = [];

  // 1. Mandatory Title Validation
  const rawTitle = input.title !== undefined ? String(input.title).trim() : '';
  if (isNew && !rawTitle) {
    errors.push('বইয়ের নাম প্রদান করা আবশ্যক।');
  }

  // 2. Mandatory Author Validation (Enforced to prevent "undefined in field author" error)
  const rawAuthor = input.author !== undefined ? String(input.author).trim() : '';
  if (isNew && !rawAuthor) {
    errors.push('লেখকের নাম প্রদান করা আবশ্যক।');
  }

  // 3. Category Validation
  const rawCategory = input.categoryId !== undefined ? String(input.categoryId).trim() : '';
  if (isNew && !rawCategory) {
    errors.push('ক্যাটাগরি নির্বাচন করা আবশ্যক।');
  }

  // 4. PDF URL Validation
  const rawPdfUrl = input.pdfUrl !== undefined ? String(input.pdfUrl).trim() : '';
  if (isNew && !rawPdfUrl) {
    errors.push('পিডিএফ ফাইল বা লিংক প্রদান করা আবশ্যক।');
  } else if (rawPdfUrl.startsWith('blob:') || rawPdfUrl.startsWith('data:')) {
    errors.push('পিডিএফ ফাইলটি এখনও ক্লাউড স্টোরেজে আপলোড সম্পূর্ণ হয়নি। অনুগ্রহ করে অপেক্ষা করুন।');
  }

  // Construct canonical payload
  const canonical: Record<string, any> = {};

  if (rawTitle) canonical.title = rawTitle;
  if (rawAuthor) canonical.author = rawAuthor;
  if (rawCategory) canonical.categoryId = rawCategory;
  if (rawPdfUrl) canonical.pdfUrl = rawPdfUrl;

  // Optional string fields (omit if empty or undefined)
  if (input.categoryName && String(input.categoryName).trim()) {
    canonical.categoryName = String(input.categoryName).trim();
  }
  if (input.description && String(input.description).trim()) {
    canonical.description = String(input.description).trim();
  }
  if (input.publicationInfo && String(input.publicationInfo).trim()) {
    canonical.publicationInfo = String(input.publicationInfo).trim();
  }
  if (input.language && String(input.language).trim()) {
    canonical.language = String(input.language).trim();
  } else if (isNew) {
    canonical.language = 'বাংলা';
  }

  // Cover image / object keys
  if (input.coverImage && String(input.coverImage).trim()) {
    canonical.coverImage = String(input.coverImage).trim();
  }
  if (input.coverObjectKey && String(input.coverObjectKey).trim()) {
    canonical.coverObjectKey = String(input.coverObjectKey).trim();
  }
  if (input.pdfObjectKey && String(input.pdfObjectKey).trim()) {
    canonical.pdfObjectKey = String(input.pdfObjectKey).trim();
  }
  if (input.externalPdfUrl && String(input.externalPdfUrl).trim()) {
    canonical.externalPdfUrl = String(input.externalPdfUrl).trim();
  }

  // Boolean flags (preserve exact boolean value)
  canonical.downloadAllowed = input.downloadAllowed !== undefined ? Boolean(input.downloadAllowed) : true;
  canonical.featured = input.featured !== undefined ? Boolean(input.featured) : false;
  canonical.status = input.status || 'published';

  // Physical inventory
  const totalCopies = typeof input.totalPhysicalCopies === 'number' && !isNaN(input.totalPhysicalCopies)
    ? Math.max(0, input.totalPhysicalCopies)
    : 0;
  const availCopies = typeof input.availablePhysicalCopies === 'number' && !isNaN(input.availablePhysicalCopies)
    ? Math.max(0, input.availablePhysicalCopies)
    : totalCopies;

  canonical.totalPhysicalCopies = totalCopies;
  canonical.availablePhysicalCopies = availCopies;
  canonical.isPhysicalAvailable = input.isPhysicalAvailable !== undefined ? Boolean(input.isPhysicalAvailable) : totalCopies > 0;

  // Numeric stats
  if (typeof input.fileSizeMb === 'number' && !isNaN(input.fileSizeMb) && input.fileSizeMb > 0) {
    canonical.fileSizeMb = Number(input.fileSizeMb.toFixed(2));
  }
  if (typeof input.pageCount === 'number' && !isNaN(input.pageCount) && input.pageCount > 0) {
    canonical.pageCount = Math.round(input.pageCount);
  }

  // Audit / user reference
  if (input.createdBy && String(input.createdBy).trim()) {
    canonical.createdBy = String(input.createdBy).trim();
  }
  if (input.updatedBy && String(input.updatedBy).trim()) {
    canonical.updatedBy = String(input.updatedBy).trim();
  }

  // Run recursive sanitizer to guarantee 0 undefined values
  const sanitized = sanitizeFirestorePayload(canonical);

  // Diagnostic check
  const remainingUndefined = findUndefinedPaths(sanitized);
  if (remainingUndefined.length > 0) {
    errors.push(`ডাটাবেজ অবজেক্টে অনুমোদনহীন মান রয়েছে: ${remainingUndefined.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized,
  };
}

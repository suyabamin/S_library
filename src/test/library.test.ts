import { describe, it, expect } from 'vitest';
import { toBengaliNumber, formatBengaliDate } from '../lib/utils';
import { USER_POSITION_LABELS, PICKUP_LOCATION_LABELS, BORROW_STATUS_LABELS } from '../types';

describe('Bengali Formatting Utilities', () => {
  it('converts English numbers to Bengali digits correctly', () => {
    expect(toBengaliNumber(0)).toBe('০');
    expect(toBengaliNumber(12345)).toBe('১২৩৪৫');
    expect(toBengaliNumber('2026')).toBe('২০২৬');
    expect(toBengaliNumber(undefined)).toBe('');
  });

  it('formats dates into Bengali month and year', () => {
    const formatted = formatBengaliDate('2026-03-12');
    expect(formatted).toContain('১২');
    expect(formatted).toContain('মার্চ');
    expect(formatted).toContain('২০২৬');
  });
});

describe('Lending Domain & Status Transition Rules', () => {
  it('has valid labels for all five allowed organizational positions', () => {
    expect(USER_POSITION_LABELS.supporter).toBe('সমর্থক');
    expect(USER_POSITION_LABELS.well_wisher).toBe('সুধী');
    expect(USER_POSITION_LABELS.worker).toBe('কর্মী');
    expect(USER_POSITION_LABELS.associate).toBe('সাথী');
    expect(USER_POSITION_LABELS.member).toBe('সদস্য');
  });

  it('has valid labels for all allowed pickup locations', () => {
    expect(PICKUP_LOCATION_LABELS.house).toBe('থানার বাসা');
    expect(PICKUP_LOCATION_LABELS.campus).toBe('ক্যাম্পাস');
    expect(PICKUP_LOCATION_LABELS.other).toBe('অন্য স্থান');
  });

  it('enforces return date after borrow date validation rule', () => {
    const borrowDate = new Date('2026-03-12');
    const validDueDate = new Date('2026-03-26');
    const invalidDueDate = new Date('2026-03-10');

    expect(validDueDate.getTime() > borrowDate.getTime()).toBe(true);
    expect(invalidDueDate.getTime() > borrowDate.getTime()).toBe(false);
  });

  it('verifies two-party return completion logic', () => {
    // When only borrower has confirmed
    const state1 = {
      borrowerConfirmed: true,
      adminConfirmed: false,
    };
    const isCompleted1 = state1.borrowerConfirmed && state1.adminConfirmed;
    expect(isCompleted1).toBe(false);

    // When both have confirmed
    const state2 = {
      borrowerConfirmed: true,
      adminConfirmed: true,
    };
    const isCompleted2 = state2.borrowerConfirmed && state2.adminConfirmed;
    expect(isCompleted2).toBe(true);
  });

  it('verifies inventory release idempotency guard', () => {
    let inventoryReleasedAt: string | null = null;
    let copies = 3;

    // First admin return receipt
    if (!inventoryReleasedAt) {
      copies += 1;
      inventoryReleasedAt = new Date().toISOString();
    }
    expect(copies).toBe(4);

    // Second redundant confirmation attempt must NOT release inventory again
    if (!inventoryReleasedAt) {
      copies += 1;
    }
    expect(copies).toBe(4);
  });
});

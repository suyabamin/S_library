import { describe, it, expect } from 'vitest';
import { isUserAdmin } from '../context/AuthContext';

describe('Admin Authorization Security Tests', () => {
  it('should grant admin status when role is "admin"', () => {
    expect(isUserAdmin('user@example.com', 'admin')).toBe(true);
    expect(isUserAdmin(null, 'admin')).toBe(true);
    expect(isUserAdmin('admin')).toBe(true);
  });

  it('should NOT grant admin status to arbitrary emails containing "admin" substring', () => {
    expect(isUserAdmin('myadmin@gmail.com', 'user')).toBe(false);
    expect(isUserAdmin('admin@company.com', 'user')).toBe(false);
    expect(isUserAdmin('fakeadmin@shibir.library', 'user')).toBe(false);
    expect(isUserAdmin('administrator@uiu.ac.bd', 'user')).toBe(false);
    expect(isUserAdmin('system_admin@test.com', 'user')).toBe(false);
  });

  it('should NOT grant admin status to arbitrary emails containing "suyabamin" substring', () => {
    expect(isUserAdmin('notsuyabamins@gmail.com', 'user')).toBe(false);
    expect(isUserAdmin('suyabamin_fake@gmail.com', 'user')).toBe(false);
    expect(isUserAdmin('fake-suyabamin@test.com', 'user')).toBe(false);
  });

  it('should grant admin status to the authorized owner exact email', () => {
    expect(isUserAdmin('suyabamins@gmail.com', 'user')).toBe(true);
    expect(isUserAdmin('Suyabamins@gmail.com', 'user')).toBe(true);
    expect(isUserAdmin(' suyabamins@gmail.com ', 'user')).toBe(true);
  });

  it('should reject null, undefined, or empty values without admin role', () => {
    expect(isUserAdmin(null, 'user')).toBe(false);
    expect(isUserAdmin(undefined, 'user')).toBe(false);
    expect(isUserAdmin('', 'user')).toBe(false);
    expect(isUserAdmin('user@example.com')).toBe(false);
  });
});

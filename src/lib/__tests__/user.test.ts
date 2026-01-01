import { describe, it, expect } from 'vitest';
import { getDisplayName } from '../user';
import type { User } from '@supabase/supabase-js';

describe('getDisplayName', () => {
  it('returns "User" when no user provided', () => {
    expect(getDisplayName(undefined)).toBe('User');
  });

  it('returns full_name from user metadata when present', () => {
    const u = { user_metadata: { full_name: 'Jane Doe' } } as unknown as User;
    expect(getDisplayName(u)).toBe('Jane Doe');
  });

  it('falls back to name then email local-part', () => {
    const u1 = { user_metadata: { name: 'JD' } } as unknown as User;
    expect(getDisplayName(u1)).toBe('JD');

    const u2 = { email: 'john@example.com' } as unknown as User;
    expect(getDisplayName(u2)).toBe('john');
  });
});
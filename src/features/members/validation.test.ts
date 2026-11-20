import { describe, expect, it } from 'vitest';
import {
  memberFilterSchema,
  inviteMemberSchema,
  bulkInviteSchema,
  memberRoleChangeSchema,
  deactivateMemberSchema,
  updateProfileSchema,
} from './validation';

describe('Member Validation Schemas', () => {
  describe('memberFilterSchema', () => {
    it('parses valid filter query parameters', () => {
      const result = memberFilterSchema.safeParse({
        search: 'john',
        status: 'active',
        skill: 'intermediate',
        role: 'admin',
        sortBy: 'rating_points',
        sortOrder: 'desc',
        page: '2',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          search: 'john',
          status: 'active',
          skill: 'intermediate',
          role: 'admin',
          sortBy: 'rating_points',
          sortOrder: 'desc',
          page: 2,
        });
      }
    });

    it('handles default and missing values', () => {
      const result = memberFilterSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
      }
    });
  });

  describe('inviteMemberSchema', () => {
    it('validates correct email and role', () => {
      const result = inviteMemberSchema.safeParse({
        email: 'player@example.com',
        role: 'member',
      });

      expect(result.success).toBe(true);
    });

    it('rejects invalid email address', () => {
      const result = inviteMemberSchema.safeParse({
        email: 'invalid-email',
        role: 'member',
      });

      expect(result.success).toBe(false);
    });

    it('rejects owner role in invitation', () => {
      const result = inviteMemberSchema.safeParse({
        email: 'player@example.com',
        role: 'owner',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('bulkInviteSchema', () => {
    it('parses newline/comma separated emails', () => {
      const result = bulkInviteSchema.safeParse({
        emails: 'one@example.com, two@example.com\nthree@example.com',
        role: 'member',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.emails).toEqual([
          'one@example.com',
          'two@example.com',
          'three@example.com',
        ]);
      }
    });

    it('rejects exceeding 20 emails', () => {
      const emails = Array.from({ length: 21 }, (_, i) => `user${i}@example.com`).join(', ');
      const result = bulkInviteSchema.safeParse({
        emails,
        role: 'member',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('memberRoleChangeSchema', () => {
    it('validates member and admin roles', () => {
      const validAdmin = memberRoleChangeSchema.safeParse({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        newRole: 'admin',
      });
      expect(validAdmin.success).toBe(true);
    });

    it('rejects owner role assignment via role change', () => {
      const result = memberRoleChangeSchema.safeParse({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        newRole: 'owner',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateProfileSchema', () => {
    it('validates skill level and preferred side updates', () => {
      const result = updateProfileSchema.safeParse({
        skill_level: 'advanced',
        preferred_side: 'left',
        bio: 'Avid pickleball enthusiast!',
      });

      expect(result.success).toBe(true);
    });

    it('rejects bio longer than 500 characters', () => {
      const result = updateProfileSchema.safeParse({
        bio: 'a'.repeat(501),
      });

      expect(result.success).toBe(false);
    });
  });
});

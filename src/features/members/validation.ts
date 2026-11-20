import { z } from 'zod';

export const memberFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['active', 'pending', 'inactive']).optional(),
  skill: z.enum(['beginner', 'intermediate', 'advanced', 'pro']).optional(),
  role: z.enum(['owner', 'admin', 'member']).optional(),
  sortBy: z.enum(['display_name', 'rating_points', 'joined_at', 'matches_played']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().optional().default(1),
});

export const updateProfileSchema = z.object({
  skill_level: z.enum(['beginner', 'intermediate', 'advanced', 'pro']).optional(),
  preferred_side: z.enum(['left', 'right', 'both', 'no_preference']).optional(),
  bio: z.string().max(500, 'Bio must be 500 characters or fewer.').optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  role: z.enum(['member', 'admin']).default('member'),
});

export const bulkInviteSchema = z.object({
  emails: z
    .string()
    .transform((val) =>
      val
        .split(/[,\n]/)
        .map((e) => e.trim())
        .filter((e) => e.length > 0)
    )
    .pipe(
      z.array(z.string().email('One or more email addresses are invalid.'))
        .max(20, 'You can invite up to 20 members at a time.')
    ),
  role: z.enum(['member', 'admin']).default('member'),
});

export const memberRoleChangeSchema = z.object({
  userId: z.string().uuid('Invalid user ID.'),
  newRole: z.enum(['member', 'admin']),
  reason: z.string().max(500, 'Reason must be 500 characters or fewer.').optional(),
});

export const deactivateMemberSchema = z.object({
  userId: z.string().uuid('Invalid user ID.'),
  reason: z.string().max(500, 'Reason must be 500 characters or fewer.').optional(),
});

export function getMemberFieldErrors(error: z.ZodError) {
  return z.flattenError(error).fieldErrors;
}

import { z } from 'zod';

const slug = z
  .string()
  .trim()
  .min(2, 'Slug must be at least 2 characters.')
  .max(63, 'Slug must be 63 characters or fewer.')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Use lowercase letters, numbers, and single hyphens only.',
  );

const optionalTrimmedText = (maximum: number, message: string) =>
  z
    .string()
    .trim()
    .max(maximum, message)
    .transform((value) => value || undefined);

const timezone = optionalTrimmedText(100, 'Timezone must be 100 characters or fewer.').refine(
  (value) => {
    if (!value) {
      return true;
    }

    try {
      new Intl.DateTimeFormat('en-US', { timeZone: value }).format();
      return true;
    } catch {
      return false;
    }
  },
  'Enter a valid IANA timezone, such as Asia/Manila.',
);

export const createClubSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Club name must be at least 2 characters.')
    .max(100, 'Club name must be 100 characters or fewer.'),
  location: z
    .string()
    .trim()
    .min(1, 'Enter the club location.')
    .max(160, 'Location must be 160 characters or fewer.'),
  slug,
  joinPolicy: z.enum(['open', 'approval', 'invite_only'], {
    error: 'Choose a valid join policy.',
  }),
  description: optionalTrimmedText(500, 'Description must be 500 characters or fewer.'),
  timezone,
});

export const joinClubSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(slug),
});

export const clubSearchSchema = z.object({
  q: z.string().trim().max(100, 'Search must be 100 characters or fewer.'),
});

export const switchClubSchema = z.object({
  clubId: z.uuid('Choose a valid club.'),
});

export function getClubFieldErrors(error: z.ZodError) {
  return z.flattenError(error).fieldErrors;
}

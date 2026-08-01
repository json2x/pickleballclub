import { z } from 'zod';

const email = z.string().trim().min(1, 'Enter your email address.').email('Enter a valid email address.');
const password = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(72, 'Password must be 72 characters or fewer.');

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password.'),
  next: z.string().optional(),
});

export const signUpSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, 'Display name must be at least 2 characters.')
      .max(80, 'Display name must be 80 characters or fewer.'),
    email,
    password,
    confirmPassword: z.string(),
    next: z.string().optional(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const invitationTokenSchema = z.object({
  token: z.string().min(16, 'This invitation is not valid.').max(512, 'This invitation is not valid.'),
});

export function getFieldErrors(error: z.ZodError) {
  return z.flattenError(error).fieldErrors;
}

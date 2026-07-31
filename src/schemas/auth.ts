import { z } from 'zod';

export const signInSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export const emailSchema = z.object({
  email: z.email('Enter a valid email address.'),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string(),
  })
  .refine(({ confirmPassword, password }) => confirmPassword === password, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type SignInValues = z.infer<typeof signInSchema>;
export type EmailValues = z.infer<typeof emailSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

import { z } from 'zod';

export const emailSchema = z
  .string()
  .trim()
  .min(1, { message: 'Email is required' })
  .email({ message: 'Please enter a valid email address' })
  .max(255, { message: 'Email must be less than 255 characters' });

export const passwordSchema = z
  .string()
  .min(6, { message: 'Password must be at least 6 characters' })
  .max(100, { message: 'Password must be less than 100 characters' });

export const fullNameSchema = z
  .string()
  .trim()
  .min(1, { message: 'Full name is required' })
  .max(100, { message: 'Name must be less than 100 characters' })
  .regex(/^[a-zA-Z\s'-]+$/, { message: 'Name can only contain letters, spaces, hyphens, and apostrophes' });

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: fullNameSchema,
  userType: z.enum(['client', 'technician']),
});

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;

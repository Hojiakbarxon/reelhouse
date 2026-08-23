import { z } from 'zod';

export const accountSchema = z.object({
  username: z.string().min(3, 'At least 3 characters').max(50, 'Too long'),
  email: z.email('Enter a valid email'),
});
export type AccountFormValues = z.infer<typeof accountSchema>;

export const profileSchema = z.object({
  full_name: z.string().max(100, 'Too long').optional().or(z.literal('')),
  phone: z.string().max(20, 'Too long').optional().or(z.literal('')),
  country: z.string().max(50, 'Too long').optional().or(z.literal('')),
});
export type ProfileFormValues = z.infer<typeof profileSchema>;

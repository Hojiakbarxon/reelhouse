import { z } from 'zod';
import { Country } from '@/api/types';

export const accountSchema = z.object({
  username: z.string().min(3, 'At least 3 characters').max(50, 'Too long'),
});
export type AccountFormValues = z.infer<typeof accountSchema>;

export const profileSchema = z.object({
  full_name: z.string().max(100, 'Too long').optional().or(z.literal('')),
  country: z.union([z.enum(Country), z.literal('')]).optional(),
});
export type ProfileFormValues = z.infer<typeof profileSchema>;



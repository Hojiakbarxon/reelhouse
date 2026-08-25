import { z } from 'zod';
import { SubscriptionType } from '@/api/types';

export const movieSchema = z.object({
  title: z.string().min(1, 'Required').max(100, 'Too long'),
  description: z.string().optional().or(z.literal('')),
  release_year: z.number().int('Whole number').min(1888, 'Too early').max(new Date().getFullYear() + 2),
  duration_minutes: z.number().int('Whole number').min(1, 'Must be at least 1 minute'),
  subscription_type: z.enum(SubscriptionType),
  // The movie's own base rating is 0–10 on this backend — distinct from the
  // 0–5 star scale used for user reviews (see CreateReviewDto on the backend).
  rating: z.number().min(0).max(10).optional(),
  category_ids: z.array(z.string()).min(1, 'Pick at least one category'),
});
export type MovieFormValues = z.infer<typeof movieSchema>;

export const categorySchema = z.object({
  name: z.string().min(1, 'Required').max(50, 'Too long'),
  description: z.string().optional().or(z.literal('')),
});
export type CategoryFormValues = z.infer<typeof categorySchema>;

export const createUserSchema = z.object({
  username: z.string().min(3, 'At least 3 characters').max(50, 'Too long'),
  email: z.email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Needs at least one letter and one number'),
});
export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const planSchema = z.object({
  name: z.string().min(1, 'Required').max(50, 'Too long'),
  price: z.number().min(0, 'Must be 0 or more'),
  duration_days: z.number().int('Whole number').min(1, 'Must be at least 1 day'),
  featuresText: z.string().optional().or(z.literal('')),
  is_active: z.boolean(),
});
export type PlanFormValues = z.infer<typeof planSchema>;



import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['student', 'client']),
});

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
  college_name: z.string().optional(),
  location: z.string().optional(),
  hourly_rate: z.coerce.number().min(0).optional(),
  website: z.string().url().optional().or(z.literal('')),
  github: z.string().optional(),
  linkedin: z.string().optional(),
  skills: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
});

export const portfolioSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).optional(),
  project_link: z.string().url().optional().or(z.literal('')),
  video_url: z.string().url().optional().or(z.literal('')),
});

export const projectSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  budget: z.coerce.number().min(0, 'Budget must be positive'),
  skills_required: z.array(z.string()).min(1, 'At least one skill is required'),
  category: z.string().min(1, 'Category is required'),
});

export const hireRequestSchema = z.object({
  message: z.string().min(10, 'Message must be at least 10 characters'),
  budget: z.coerce.number().min(0).optional(),
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, 'Review must be at least 5 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type PortfolioInput = z.infer<typeof portfolioSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type HireRequestInput = z.infer<typeof hireRequestSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;

import { z } from 'zod';

export const CreateSeasonSchema = z.object({
  label: z.string().min(1).max(100),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
}).refine(data => data.startDate <= data.endDate, {
  message: 'End date must be on or after start date',
  path: ['endDate'],
});

export const UpdateSeasonSchema = z.object({
  label: z.string().min(1).max(100).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
});

export type CreateSeasonInput = z.infer<typeof CreateSeasonSchema>;
export type UpdateSeasonInput = z.infer<typeof UpdateSeasonSchema>;

import { z } from 'zod';

const SeasonBaseSchema = z.object({
  label: z.string().min(1).max(100),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export const CreateSeasonSchema = SeasonBaseSchema.refine(
  (data) => data.startDate <= data.endDate,
  {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  }
);

export const UpdateSeasonSchema = SeasonBaseSchema.partial().superRefine(
  (data, ctx) => {
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be on or after start date',
        path: ['endDate'],
      });
    }
  }
);

export type CreateSeasonInput = z.infer<typeof CreateSeasonSchema>;
export type UpdateSeasonInput = z.infer<typeof UpdateSeasonSchema>;

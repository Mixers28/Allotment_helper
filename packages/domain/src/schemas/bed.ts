import { z } from 'zod';

export const CreateBedSchema = z.object({
  name: z.string().min(1).max(100),
  x: z.number().min(0),
  y: z.number().min(0),
  width: z.number().positive().max(100),
  height: z.number().positive().max(100),
  rotationDeg: z.number().min(0).max(360).default(0),
});

export const UpdateBedSchema = CreateBedSchema.partial().extend({
  isLocked: z.boolean().optional(),
});

export type CreateBedInput = z.infer<typeof CreateBedSchema>;
export type UpdateBedInput = z.infer<typeof UpdateBedSchema>;

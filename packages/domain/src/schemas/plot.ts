import { z } from 'zod';

export const CreatePlotSchema = z.object({
  name: z.string().min(1).max(100),
  units: z.enum(['meters']),
  boundary: z.object({
    width: z.number().positive().max(1000),
    height: z.number().positive().max(1000),
  }),
});

export const UpdatePlotSchema = CreatePlotSchema.partial();

export type CreatePlotInput = z.infer<typeof CreatePlotSchema>;
export type UpdatePlotInput = z.infer<typeof UpdatePlotSchema>;

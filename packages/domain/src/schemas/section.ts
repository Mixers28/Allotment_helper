import { z } from 'zod';

export const LengthSplitDefinitionSchema = z.object({
  cuts: z.array(z.number().nonnegative()).refine(
    cuts => {
      if (cuts.length === 0) return true;
      // Check monotonically increasing
      for (let i = 1; i < cuts.length; i++) {
        if (cuts[i]! <= cuts[i - 1]!) return false;
      }
      return true;
    },
    { message: 'Cuts must be monotonically increasing' }
  ),
});

export const CreateBedSectionPlanSchema = z.object({
  bedId: z.string().uuid(),
  mode: z.literal('length_splits'),
  definition: LengthSplitDefinitionSchema,
});

export const UpdateBedSectionPlanSchema = z.object({
  mode: z.literal('length_splits').optional(),
  definition: LengthSplitDefinitionSchema.optional(),
});

export type CreateBedSectionPlanInput = z.infer<typeof CreateBedSectionPlanSchema>;
export type UpdateBedSectionPlanInput = z.infer<typeof UpdateBedSectionPlanSchema>;

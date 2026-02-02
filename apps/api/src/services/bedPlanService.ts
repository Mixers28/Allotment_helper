import { prisma } from '../db.js';
import type { CreateBedSectionPlanInput, UpdateBedSectionPlanInput } from '@allotment/domain';

export async function createBedPlan(seasonId: string, input: CreateBedSectionPlanInput) {
  return prisma.bedSectionPlan.create({
    data: {
      seasonId,
      bedId: input.bedId,
      mode: input.mode,
      definitionJson: input.definition,
    },
  });
}

export async function getBedPlanById(id: string) {
  return prisma.bedSectionPlan.findUnique({
    where: { id },
  });
}

export async function getBedPlansBySeasonId(seasonId: string) {
  return prisma.bedSectionPlan.findMany({
    where: { seasonId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getBedPlanBySeasonAndBed(seasonId: string, bedId: string) {
  return prisma.bedSectionPlan.findUnique({
    where: {
      seasonId_bedId: { seasonId, bedId },
    },
  });
}

export async function updateBedPlan(id: string, input: UpdateBedSectionPlanInput) {
  const data: Record<string, unknown> = {};

  if (input.mode !== undefined) {
    data.mode = input.mode;
  }
  if (input.definition !== undefined) {
    data.definitionJson = input.definition;
  }

  return prisma.bedSectionPlan.update({
    where: { id },
    data,
  });
}

export async function deleteBedPlan(id: string) {
  return prisma.bedSectionPlan.delete({
    where: { id },
  });
}

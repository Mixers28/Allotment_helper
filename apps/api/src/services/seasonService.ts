import { prisma } from '../db.js';
import type { CreateSeasonInput, UpdateSeasonInput } from '@allotment/domain';

export async function createSeason(plotId: string, input: CreateSeasonInput) {
  return prisma.season.create({
    data: {
      plotId,
      label: input.label,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
    },
    include: { bedSectionPlans: true },
  });
}

export async function getSeasonById(id: string) {
  return prisma.season.findUnique({
    where: { id },
    include: { bedSectionPlans: true },
  });
}

export async function getSeasonsByPlotId(plotId: string) {
  return prisma.season.findMany({
    where: { plotId },
    include: { bedSectionPlans: true },
    orderBy: { startDate: 'desc' },
  });
}

export async function updateSeason(id: string, input: UpdateSeasonInput) {
  const data: Record<string, unknown> = {};

  if (input.label !== undefined) {
    data.label = input.label;
  }
  if (input.startDate !== undefined) {
    data.startDate = new Date(input.startDate);
  }
  if (input.endDate !== undefined) {
    data.endDate = new Date(input.endDate);
  }

  return prisma.season.update({
    where: { id },
    data,
    include: { bedSectionPlans: true },
  });
}

export async function deleteSeason(id: string) {
  return prisma.season.delete({
    where: { id },
  });
}

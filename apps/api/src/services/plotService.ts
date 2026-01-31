import { prisma } from '../db.js';
import type { CreatePlotInput, UpdatePlotInput } from '@allotment/domain';

export async function createPlot(input: CreatePlotInput) {
  return prisma.plotBase.create({
    data: {
      name: input.name,
      units: input.units,
      boundaryType: 'rect',
      boundaryJson: input.boundary,
    },
    include: { beds: true },
  });
}

export async function getPlotById(id: string) {
  return prisma.plotBase.findUnique({
    where: { id },
    include: { beds: true },
  });
}

export async function updatePlot(id: string, input: UpdatePlotInput) {
  const data: Record<string, unknown> = {};

  if (input.name !== undefined) {
    data.name = input.name;
  }
  if (input.units !== undefined) {
    data.units = input.units;
  }
  if (input.boundary !== undefined) {
    data.boundaryJson = input.boundary;
  }

  return prisma.plotBase.update({
    where: { id },
    data,
    include: { beds: true },
  });
}

export async function deletePlot(id: string) {
  return prisma.plotBase.delete({
    where: { id },
  });
}

export async function getAllPlots() {
  return prisma.plotBase.findMany({
    include: { beds: true },
    orderBy: { createdAt: 'desc' },
  });
}

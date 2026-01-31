import { prisma } from '../db.js';
import type { CreateBedInput, UpdateBedInput } from '@allotment/domain';

export async function createBed(plotId: string, input: CreateBedInput) {
  return prisma.bedBase.create({
    data: {
      plotId,
      name: input.name,
      x: input.x,
      y: input.y,
      width: input.width,
      height: input.height,
      rotationDeg: input.rotationDeg ?? 0,
    },
  });
}

export async function getBedById(id: string) {
  return prisma.bedBase.findUnique({
    where: { id },
  });
}

export async function updateBed(id: string, input: UpdateBedInput) {
  return prisma.bedBase.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.x !== undefined && { x: input.x }),
      ...(input.y !== undefined && { y: input.y }),
      ...(input.width !== undefined && { width: input.width }),
      ...(input.height !== undefined && { height: input.height }),
      ...(input.rotationDeg !== undefined && { rotationDeg: input.rotationDeg }),
      ...(input.isLocked !== undefined && { isLocked: input.isLocked }),
    },
  });
}

export async function deleteBed(id: string) {
  return prisma.bedBase.delete({
    where: { id },
  });
}

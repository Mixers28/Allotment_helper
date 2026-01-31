import type { FastifyPluginAsync } from 'fastify';
import { CreatePlotSchema, UpdatePlotSchema } from '@allotment/domain';
import * as plotService from '../services/plotService.js';
import * as bedService from '../services/bedService.js';
import { CreateBedSchema } from '@allotment/domain';

interface BoundaryJson {
  width: number;
  height: number;
}

function formatPlotResponse(plot: {
  id: string;
  name: string;
  units: string;
  boundaryType: string;
  boundaryJson: unknown;
  createdAt: Date;
  updatedAt: Date;
  beds: Array<{
    id: string;
    plotId: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotationDeg: number;
    isLocked: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
}) {
  const boundary = plot.boundaryJson as BoundaryJson;
  return {
    id: plot.id,
    name: plot.name,
    units: plot.units,
    boundaryType: plot.boundaryType,
    boundary: {
      width: boundary.width,
      height: boundary.height,
    },
    createdAt: plot.createdAt,
    updatedAt: plot.updatedAt,
    beds: plot.beds,
  };
}

export const plotRoutes: FastifyPluginAsync = async (server) => {
  // GET /plots - List all plots
  server.get('/', async () => {
    const plots = await plotService.getAllPlots();
    return plots.map(formatPlotResponse);
  });

  // POST /plots - Create a new plot
  server.post('/', async (request, reply) => {
    const parsed = CreatePlotSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues });
    }

    const plot = await plotService.createPlot(parsed.data);
    return reply.status(201).send(formatPlotResponse(plot));
  });

  // GET /plots/:id - Get a specific plot with beds
  server.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const plot = await plotService.getPlotById(request.params.id);
    if (!plot) {
      return reply.status(404).send({ error: 'Plot not found' });
    }
    return formatPlotResponse(plot);
  });

  // PUT /plots/:id - Update a plot
  server.put<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const parsed = UpdatePlotSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues });
    }

    try {
      const plot = await plotService.updatePlot(request.params.id, parsed.data);
      return formatPlotResponse(plot);
    } catch {
      return reply.status(404).send({ error: 'Plot not found' });
    }
  });

  // DELETE /plots/:id - Delete a plot
  server.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    try {
      await plotService.deletePlot(request.params.id);
      return reply.status(204).send();
    } catch {
      return reply.status(404).send({ error: 'Plot not found' });
    }
  });

  // POST /plots/:id/beds - Add a bed to a plot
  server.post<{ Params: { id: string } }>(
    '/:id/beds',
    async (request, reply) => {
      const parsed = CreateBedSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.issues });
      }

      // Check if plot exists
      const plot = await plotService.getPlotById(request.params.id);
      if (!plot) {
        return reply.status(404).send({ error: 'Plot not found' });
      }

      const bed = await bedService.createBed(request.params.id, parsed.data);
      return reply.status(201).send(bed);
    }
  );
};

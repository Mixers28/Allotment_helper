import type { FastifyPluginAsync } from 'fastify';
import { CreateSeasonSchema, UpdateSeasonSchema } from '@allotment/domain';
import * as seasonService from '../services/seasonService.js';
import * as plotService from '../services/plotService.js';

interface DefinitionJson {
  cuts: number[];
}

function formatSeasonResponse(season: {
  id: string;
  plotId: string;
  label: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  bedSectionPlans: Array<{
    id: string;
    seasonId: string;
    bedId: string;
    mode: string;
    definitionJson: unknown;
    createdAt: Date;
    updatedAt: Date;
  }>;
}) {
  return {
    id: season.id,
    plotId: season.plotId,
    label: season.label,
    startDate: season.startDate.toISOString().split('T')[0],
    endDate: season.endDate.toISOString().split('T')[0],
    createdAt: season.createdAt,
    updatedAt: season.updatedAt,
    bedSectionPlans: season.bedSectionPlans.map((plan) => ({
      id: plan.id,
      seasonId: plan.seasonId,
      bedId: plan.bedId,
      mode: plan.mode,
      definition: plan.definitionJson as DefinitionJson,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    })),
  };
}

export const seasonRoutes: FastifyPluginAsync = async (server) => {
  // GET /seasons/:id - Get a specific season with bed plans
  server.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const season = await seasonService.getSeasonById(request.params.id);
    if (!season) {
      return reply.status(404).send({ error: 'Season not found' });
    }
    return formatSeasonResponse(season);
  });

  // PUT /seasons/:id - Update a season
  server.put<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const parsed = UpdateSeasonSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues });
    }

    try {
      const season = await seasonService.updateSeason(request.params.id, parsed.data);
      return formatSeasonResponse(season);
    } catch {
      return reply.status(404).send({ error: 'Season not found' });
    }
  });

  // DELETE /seasons/:id - Delete a season
  server.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    try {
      await seasonService.deleteSeason(request.params.id);
      return reply.status(204).send();
    } catch {
      return reply.status(404).send({ error: 'Season not found' });
    }
  });
};

// Routes under /plots/:plotId/seasons
export const plotSeasonRoutes: FastifyPluginAsync = async (server) => {
  // GET /plots/:plotId/seasons - List all seasons for a plot
  server.get<{ Params: { plotId: string } }>('/', async (request, reply) => {
    // Verify plot exists
    const plot = await plotService.getPlotById(request.params.plotId);
    if (!plot) {
      return reply.status(404).send({ error: 'Plot not found' });
    }

    const seasons = await seasonService.getSeasonsByPlotId(request.params.plotId);
    return seasons.map(formatSeasonResponse);
  });

  // POST /plots/:plotId/seasons - Create a new season
  server.post<{ Params: { plotId: string } }>('/', async (request, reply) => {
    const parsed = CreateSeasonSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues });
    }

    // Verify plot exists
    const plot = await plotService.getPlotById(request.params.plotId);
    if (!plot) {
      return reply.status(404).send({ error: 'Plot not found' });
    }

    const season = await seasonService.createSeason(request.params.plotId, parsed.data);
    return reply.status(201).send(formatSeasonResponse(season));
  });
};

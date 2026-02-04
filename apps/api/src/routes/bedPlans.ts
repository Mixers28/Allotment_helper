import type { FastifyPluginAsync } from 'fastify';
import { CreateBedSectionPlanSchema, UpdateBedSectionPlanSchema } from '@allotment/domain';
import * as bedPlanService from '../services/bedPlanService.js';
import * as seasonService from '../services/seasonService.js';
import * as bedService from '../services/bedService.js';

interface DefinitionJson {
  cuts: number[];
}

function formatBedPlanResponse(plan: {
  id: string;
  seasonId: string;
  bedId: string;
  mode: string;
  definitionJson: unknown;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: plan.id,
    seasonId: plan.seasonId,
    bedId: plan.bedId,
    mode: plan.mode,
    definition: plan.definitionJson as DefinitionJson,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
}

export const bedPlanRoutes: FastifyPluginAsync = async (server) => {
  // GET /bed-plans/:id - Get a specific bed plan
  server.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const plan = await bedPlanService.getBedPlanById(request.params.id);
    if (!plan) {
      return reply.status(404).send({ error: 'Bed plan not found' });
    }
    return formatBedPlanResponse(plan);
  });

  // PUT /bed-plans/:id - Update a bed plan
  server.put<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const parsed = UpdateBedSectionPlanSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues });
    }

    try {
      const plan = await bedPlanService.updateBedPlan(request.params.id, parsed.data);
      return formatBedPlanResponse(plan);
    } catch {
      return reply.status(404).send({ error: 'Bed plan not found' });
    }
  });

  // DELETE /bed-plans/:id - Delete a bed plan
  server.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    try {
      await bedPlanService.deleteBedPlan(request.params.id);
      return reply.status(204).send();
    } catch {
      return reply.status(404).send({ error: 'Bed plan not found' });
    }
  });
};

// Routes under /seasons/:seasonId/bed-plans
export const seasonBedPlanRoutes: FastifyPluginAsync = async (server) => {
  // GET /seasons/:seasonId/bed-plans - List all bed plans for a season
  server.get<{ Params: { seasonId: string } }>('/', async (request, reply) => {
    // Verify season exists
    const season = await seasonService.getSeasonById(request.params.seasonId);
    if (!season) {
      return reply.status(404).send({ error: 'Season not found' });
    }

    const plans = await bedPlanService.getBedPlansBySeasonId(request.params.seasonId);
    return plans.map(formatBedPlanResponse);
  });

  // POST /seasons/:seasonId/bed-plans - Create a new bed plan
  server.post<{ Params: { seasonId: string } }>('/', async (request, reply) => {
    const parsed = CreateBedSectionPlanSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues });
    }

    // Verify season exists
    const season = await seasonService.getSeasonById(request.params.seasonId);
    if (!season) {
      return reply.status(404).send({ error: 'Season not found' });
    }

    const bed = await bedService.getBedById(parsed.data.bedId);
    if (!bed) {
      return reply.status(404).send({ error: 'Bed not found' });
    }

    if (bed.plotId !== season.plotId) {
      return reply.status(400).send({ error: 'Bed does not belong to season plot' });
    }

    // Check if plan already exists for this bed in this season
    const existing = await bedPlanService.getBedPlanBySeasonAndBed(
      request.params.seasonId,
      parsed.data.bedId
    );
    if (existing) {
      return reply.status(409).send({ error: 'Bed plan already exists for this bed in this season' });
    }

    const plan = await bedPlanService.createBedPlan(request.params.seasonId, parsed.data);
    return reply.status(201).send(formatBedPlanResponse(plan));
  });
};

import type { FastifyPluginAsync } from 'fastify';
import { UpdateBedSchema } from '@allotment/domain';
import * as bedService from '../services/bedService.js';

export const bedRoutes: FastifyPluginAsync = async (server) => {
  // GET /beds/:id - Get a specific bed
  server.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const bed = await bedService.getBedById(request.params.id);
    if (!bed) {
      return reply.status(404).send({ error: 'Bed not found' });
    }
    return bed;
  });

  // PUT /beds/:id - Update a bed
  server.put<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const parsed = UpdateBedSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues });
    }

    try {
      const bed = await bedService.updateBed(request.params.id, parsed.data);
      return bed;
    } catch {
      return reply.status(404).send({ error: 'Bed not found' });
    }
  });

  // DELETE /beds/:id - Delete a bed
  server.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    try {
      await bedService.deleteBed(request.params.id);
      return reply.status(204).send();
    } catch {
      return reply.status(404).send({ error: 'Bed not found' });
    }
  });
};

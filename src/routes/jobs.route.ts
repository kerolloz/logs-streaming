import z from 'zod';
import type { FastifyZodInstance } from '../lib';
import { triggerBuildJob } from '../queue/queue';

export default (app: FastifyZodInstance) =>
  app.route({
    method: 'POST',
    url: '/deployments',
    schema: {
      body: z.object({
        githubRepoUrl: z.string().url(),
        buildCommand: z.string(),
      }),
      querystring: z.object({
        branch: z.string().optional(),
      }),
      response: {
        200: z.object({
          message: z.string(),
          job: z.object({
            id: z.string(),
          }),
        }),
      },
    },
    handler: async (request, response) => {
      const data = await triggerBuildJob(request.body);
      return response.send({
        message: 'Deployment started',
        job: { id: data.id ?? 'UNKNOWN' },
      });
    },
  });

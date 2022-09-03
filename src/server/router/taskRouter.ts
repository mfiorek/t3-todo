import * as trpc from '@trpc/server';
import { prisma } from '../prisma';
import { z } from 'zod';

export const taskRouter = trpc
  .router()
  // CREATE
  .mutation('create', {
    input: z.object({
      name: z.string(),
    }),
    resolve: async ({ input }) => {
      return await prisma.task.create({
        data: {
          name: input.name,
        },
      });
    },
  })

  // READ
  .query('get-all', {
    resolve: async () => {
      return await prisma.task.findMany();
    },
  })

  // UPDATE
  .mutation('set-isDone', {
    input: z.object({
      id: z.string(),
      isDone: z.boolean(),
    }),
    resolve: async ({ input }) => {
      const { id, isDone } = input;
      return await prisma.task.update({
        where: { id },
        data: { isDone },
      });
    },
  })

  // Delete
  .mutation('delete', {
    input: z.object({
      id: z.string(),
    }),
    resolve: async ({ input }) => {
      const { id } = input;
      return await prisma.task.delete({
        where: { id },
      });
    },
  });

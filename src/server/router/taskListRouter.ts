import { z } from 'zod';
import { createProtectedRouter } from './protected-router';

export const taskListRouter = createProtectedRouter()
  // CREATE
  .mutation('create', {
    input: z.object({
      id: z.string(),
      name: z.string(),
      createdAt: z.date(),
    }),
    resolve: async ({ ctx, input }) => {
      const { id, name, createdAt } = input;
      return await ctx.prisma.taskList.create({
        data: {
          id,
          name,
          createdAt,
          userId: ctx.session.user.id,
        },
      });
    },
  })

  // READ
  .query('get-all', {
    resolve: async ({ ctx }) => {
      return await ctx.prisma.taskList.findMany({
        where: {
          userId: ctx.session.user.id,
        },
      });
    },
  })

  // UPDATE

  // DELETE
  .mutation('delete', {
    input: z.object({
      id: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      const { id } = input;
      const taskListToUpdate = await ctx.prisma.taskList.findFirstOrThrow({ where: { id } });
      if (taskListToUpdate.userId !== ctx.session.user.id) {
        return;
      }
      return await ctx.prisma.taskList.delete({
        where: { id },
      });
    },
  });

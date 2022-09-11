import { z } from 'zod';
import { createProtectedRouter } from './protected-router';

export const taskRouter = createProtectedRouter()
  // CREATE
  .mutation('create', {
    input: z.object({
      id: z.string(),
      name: z.string(),
      createdAt: z.date(),
    }),
    resolve: async ({ ctx, input }) => {
      const { id, name, createdAt } = input;
      return await ctx.prisma.task.create({
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
      return await ctx.prisma.task.findMany({
        where: {
          userId: ctx.session.user.id,
        },
      });
    },
  })

  // UPDATE
  .mutation('set-isDone', {
    input: z.object({
      id: z.string(),
      isDone: z.boolean(),
    }),
    resolve: async ({ ctx, input }) => {
      const { id, isDone } = input;
      const tastToUpdate = await ctx.prisma.task.findFirstOrThrow({ where: { id } });
      if (tastToUpdate.userId !== ctx.session.user.id) {
        return;
      }
      return await ctx.prisma.task.update({
        where: { id },
        data: { isDone },
      });
    },
  })

  // DELETE
  .mutation('delete', {
    input: z.object({
      id: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      const { id } = input;
      const tastToUpdate = await ctx.prisma.task.findFirstOrThrow({ where: { id } });
      if (tastToUpdate.userId !== ctx.session.user.id) {
        return;
      }
      return await ctx.prisma.task.delete({
        where: { id },
      });
    },
  });

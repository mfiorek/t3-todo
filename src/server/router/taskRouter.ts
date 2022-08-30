import * as trpc from '@trpc/server';
import { prisma } from '../prisma';
import { z } from 'zod';

export const taskRouter = trpc
.router()
.query('get-all', {
  resolve: async () => {
    return await prisma.task.findMany();
  },
})
.mutation('set-isDone', {
  input: z.object({
    id: z.string(),
    isDone: z.boolean(),
  }),
  resolve: async ({ input }) => {
    const { id, isDone } = input;
    return await prisma.task.update({
      where: { id },
      data: { isDone }
    })
  }
});
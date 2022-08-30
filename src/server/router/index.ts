import * as trpc from '@trpc/server';
import superjson from 'superjson';
import { taskRouter } from "./taskRouter";

export const appRouter = trpc
    .router()
    .transformer(superjson)
    .merge('task.', taskRouter)
    ;
  
// export type definition of API
export type AppRouter = typeof appRouter;

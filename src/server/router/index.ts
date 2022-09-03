import { createRouter } from "./context";
import superjson from 'superjson';
import { taskRouter } from "./taskRouter";

export const appRouter = createRouter()
    .transformer(superjson)
    .merge('task.', taskRouter);
  
// export type definition of API
export type AppRouter = typeof appRouter;

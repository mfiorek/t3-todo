import { createRouter } from "./context";
import superjson from 'superjson';
import { taskRouter } from "./taskRouter";
import { taskListRouter } from "./taskListRouter";

export const appRouter = createRouter()
    .transformer(superjson)
    .merge('task.', taskRouter)
    .merge('taskList.', taskListRouter);
  
// export type definition of API
export type AppRouter = typeof appRouter;

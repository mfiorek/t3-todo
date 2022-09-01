import React from 'react';
import { task } from '@prisma/client';
import { trpc } from '../utils/trpc';
import classNames from 'classnames';

const Task: React.FC<task> = (task) => {
  const client = trpc.useContext();
  const setIsDone = trpc.useMutation(['task.set-isDone'], {
    onMutate: async ({ id, isDone }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update):
      await client.cancelQuery(['task.get-all']);
      // Snapshot the previous value:
      const previousTasks = client.getQueryData(['task.get-all']);
      // Optimistically update to the new value:
      if (previousTasks) {
        client.setQueryData(
          ['task.get-all'],
          previousTasks.map((task) => (task.id === id ? { ...task, isDone } : task)),
        );
      }
      return { previousTasks };
    },
    // If the mutation fails, use the context returned from onMutate to roll back:
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        client.setQueryData(['task.get-all'], context.previousTasks);
      }
    },
    // Always refetch after error or success:
    onSettled: () => {
      client.invalidateQueries(['task.get-all']);
    },
  });
  const classes = classNames('text-2xl flex items-center', { 'opacity-25 line-through decoration-2 decoration-wavy decoration-red-500': task.isDone })

  return (
    <div className={classes}>
      <input id={task.id} type='checkbox' checked={task.isDone} className='m-3 ' onChange={() => setIsDone.mutate({ id: task.id, isDone: !task.isDone })} />
      <label htmlFor={task.id}>{task.name}</label>
    </div>
  );
};

export default Task;

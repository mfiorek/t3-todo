import React from 'react';
import { Task } from '@prisma/client';
import { trpc } from '../utils/trpc';
import classNames from 'classnames';

interface TaskProperties {
  task: Task;
}

const Task: React.FC<TaskProperties> = ({ task }) => {
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
  });
  const deleteTask = trpc.useMutation(['task.delete'], {
    onMutate: async ({ id }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update):
      await client.cancelQuery(['task.get-all']);
      // Snapshot the previous value:
      const previousTasks = client.getQueryData(['task.get-all']);
      // Optimistically update to the new value:
      if (previousTasks) {
        client.setQueryData(
          ['task.get-all'],
          previousTasks.filter((task) => task.id !== id),
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
  });

  const classes = classNames({ 'opacity-25 line-through decoration-2 decoration-wavy decoration-red-500': task.isDone });

  return (
    <label htmlFor={task.id} className={`${classes} flex items-start justify-between rounded bg-slate-700 text-xl`}>
      <div className='flex items-baseline'>
        <input
          id={task.id}
          type='checkbox'
          checked={task.isDone}
          onChange={() => setIsDone.mutate({ id: task.id, isDone: !task.isDone })}
          className='checked:before:checkmark float-left m-3 grid aspect-square h-6 w-6 cursor-pointer appearance-none place-content-center rounded border border-gray-300 bg-white bg-contain bg-center bg-no-repeat transition duration-200
          before:grid before:h-4 before:w-4 before:origin-center before:scale-0 
          checked:border-lime-600 checked:bg-lime-800 checked:before:scale-100 checked:before:bg-lime-600'
        />
        {task.name}
      </div>
      <button className='m-3 flex aspect-square h-6 w-6 items-center justify-center rounded bg-red-500' onClick={() => deleteTask.mutate({ id: task.id })}>
        <span className='xmark h-4 w-4 bg-red-200'></span>
      </button>
    </label>
  );
};

export default Task;

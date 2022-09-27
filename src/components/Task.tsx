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
  const setIsStarred = trpc.useMutation(['task.set-isStarred'], {
    onMutate: async ({ id, isStarred }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update):
      await client.cancelQuery(['task.get-all']);
      // Snapshot the previous value:
      const previousTasks = client.getQueryData(['task.get-all']);
      // Optimistically update to the new value:
      if (previousTasks) {
        client.setQueryData(
          ['task.get-all'],
          previousTasks.map((task) => (task.id === id ? { ...task, isStarred } : task)),
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
    <li className={`${task.isDone ? 'done' : 'notDone'} w-full lg:w-[28rem]`}>
      <div className={`${classes} flex w-full rounded bg-slate-700`}>
        <label htmlFor={task.id} className='flex w-full cursor-pointer items-start'>
          <div className='flex items-baseline gap-3 pl-3'>
            <input
              id={task.id}
              type='checkbox'
              checked={task.isDone}
              onChange={() => setIsDone.mutate({ id: task.id, isDone: !task.isDone })}
              className='checked:before:checkmark float-left my-3 grid aspect-square h-4 w-4 cursor-pointer appearance-none place-content-center rounded border border-gray-300 bg-white bg-contain bg-center bg-no-repeat transition duration-200
                before:grid before:h-3 before:w-3 before:origin-center before:scale-0 
              checked:border-lime-600 checked:bg-lime-800 checked:before:scale-100 checked:before:bg-lime-600'
            />
            <input
              type='checkbox'
              checked={task.isStarred}
              onChange={() => setIsStarred.mutate({ id: task.id, isStarred: !task.isStarred })}
              className='after:star checked:after:star float-left mr-1 grid aspect-square h-4 w-4 cursor-pointer appearance-none
                after:absolute after:h-5 after:w-5 after:origin-center after:bg-slate-600
                checked:after:h-5 checked:after:w-5 checked:after:bg-amber-300'
            />
            <p className='my-2'>{task.name}</p>
          </div>
        </label>
        <button className='m-3 flex aspect-square h-4 w-4 items-center justify-center rounded bg-red-500' onClick={() => deleteTask.mutate({ id: task.id })}>
          <span className='xmark h-3 w-3 bg-red-200'></span>
        </button>
      </div>
    </li>
  );
};

export default Task;

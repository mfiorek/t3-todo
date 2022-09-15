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
      await client.cancelQuery(['task.get-by-list', { taskListId: task.taskListId }]);
      // Snapshot the previous value:
      const previousTasks = client.getQueryData(['task.get-by-list', { taskListId: task.taskListId }]);
      // Optimistically update to the new value:
      if (previousTasks) {
        client.setQueryData(
          ['task.get-by-list', { taskListId: task.taskListId }],
          previousTasks.map((task) => (task.id === id ? { ...task, isDone } : task)),
        );
      }
      return { previousTasks };
    },
    // If the mutation fails, use the context returned from onMutate to roll back:
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        client.setQueryData(['task.get-by-list', { taskListId: task.taskListId }], context.previousTasks);
      }
    },
  });
  const deleteTask = trpc.useMutation(['task.delete'], {
    onMutate: async ({ id }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update):
      await client.cancelQuery(['task.get-by-list']);
      // Snapshot the previous value:
      const previousTasks = client.getQueryData(['task.get-by-list', { taskListId: task.taskListId }]);
      // Optimistically update to the new value:
      if (previousTasks) {
        client.setQueryData(
          ['task.get-by-list', { taskListId: task.taskListId }],
          previousTasks.filter((task) => task.id !== id),
        );
      }
      return { previousTasks };
    },
    // If the mutation fails, use the context returned from onMutate to roll back:
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        client.setQueryData(['task.get-by-list', { taskListId: task.taskListId }], context.previousTasks);
      }
    },
  });

  const classes = classNames({ 'opacity-25 line-through decoration-2 decoration-wavy decoration-red-500 done': task.isDone, notDone: !task.isDone });

  return (
    <li className={`${classes} w-full lg:w-[28rem]`}>
      <label htmlFor={task.id} className='flex cursor-pointer items-start justify-between rounded bg-slate-700'>
        <div className='flex items-baseline'>
          <input
            id={task.id}
            type='checkbox'
            checked={task.isDone}
            onChange={() => setIsDone.mutate({ id: task.id, isDone: !task.isDone })}
            className='checked:before:checkmark float-left m-3 grid aspect-square h-4 w-4 cursor-pointer appearance-none place-content-center rounded border border-gray-300 bg-white bg-contain bg-center bg-no-repeat transition duration-200
          before:grid before:h-3 before:w-3 before:origin-center before:scale-0 
          checked:border-lime-600 checked:bg-lime-800 checked:before:scale-100 checked:before:bg-lime-600'
          />
          {task.name}
        </div>
        <button className='m-3 flex aspect-square h-4 w-4 items-center justify-center rounded bg-red-500' onClick={() => deleteTask.mutate({ id: task.id })}>
          <span className='xmark h-3 w-3 bg-red-200'></span>
        </button>
      </label>
    </li>
  );
};

export default Task;

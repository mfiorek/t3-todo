import React, { useRef } from 'react';
import { trpc } from '../utils/trpc';
import cuid from 'cuid';

const TaskInput = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const client = trpc.useContext();
  const createMutation = trpc.useMutation(['task.create'], {
    onMutate: async ({ name }) => {
      // Clear input text:
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update):
      await client.cancelQuery(['task.get-all']);
      // Snapshot the previous value:
      const previousTasks = client.getQueryData(['task.get-all']);
      // Optimistically update to the new value:
      if (previousTasks) {
        client.setQueryData(['task.get-all'], [...previousTasks, { id: `tempId_${cuid()}`, createdAt: new Date(), isDone: false, name: name }]);
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputRef.current && inputRef.current.value) {
      createMutation.mutate({ name: inputRef.current.value });
    }
  };

  return (
    <div className='w-full px-8'>
      <form onSubmit={(e) => handleSubmit(e)} className='relative text-3xl'>
        <input
          type='text'
          ref={inputRef}
          placeholder='Add a task'
          className='rounded-full w-full border border-slate-600 bg-transparent py-2 pl-4 pr-20 focus:border-slate-400 focus-visible:outline-none'
        />
        <div className='absolute right-0 top-0 flex h-full justify-end p-1'>
          <button type='submit' className='flex h-full items-center justify-center rounded-full bg-slate-600 px-4'>
            Add
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskInput;

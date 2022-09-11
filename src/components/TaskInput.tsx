import React, { useRef } from 'react';
import { trpc } from '../utils/trpc';
import cuid from 'cuid';
import { useSession } from 'next-auth/react';

const TaskInput = () => {
  const { data: session } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const client = trpc.useContext();
  const createMutation = trpc.useMutation(['task.create'], {
    onMutate: async ({ id, name, createdAt }) => {
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
        client.setQueryData(['task.get-all'], [...previousTasks, { id: id, createdAt: createdAt, isDone: false, name: name, userId: session?.user?.id! }]);
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputRef.current && inputRef.current.value) {
      createMutation.mutate({ id: cuid(), name: inputRef.current.value, createdAt: new Date() });
    }
  };

  return (
    <div className='bg-slate-800 px-6 py-4'>
      <form onSubmit={(e) => handleSubmit(e)} className='relative'>
        <input
          type='text'
          ref={inputRef}
          placeholder='Add a task'
          className='w-full rounded border border-slate-600 bg-transparent py-2 pl-4 pr-20 focus:border-slate-400 focus-visible:outline-none'
        />
        <div className='absolute right-0 top-0 flex h-full justify-end p-1'>
          <button type='submit' className='flex h-full items-center justify-center rounded-sm bg-slate-600 px-4'>
            Add
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskInput;

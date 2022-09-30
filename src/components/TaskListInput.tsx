import cuid from 'cuid';
import { useSession } from 'next-auth/react';
import React, { useRef } from 'react';
import { trpc } from '../utils/trpc';

const TaskListInput = () => {
  const { data: session } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const client = trpc.useContext();
  const createMutation = trpc.useMutation(['taskList.create'], {
    onMutate: async ({ id, name, createdAt }) => {
      // Clear input text:
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update):
      await client.cancelQuery(['taskList.get-all']);
      // Snapshot the previous value:
      const previousTaskLists = client.getQueryData(['taskList.get-all']);
      // Optimistically update to the new value:
      if (previousTaskLists) {
        client.setQueryData(['taskList.get-all'], [...previousTaskLists, { id, createdAt, name, userId: session?.user?.id! }]);
      }
      return { previousTaskLists };
    },
    // If the mutation fails, use the context returned from onMutate to roll back:
    onError: (err, variables, context) => {
      if (context?.previousTaskLists) {
        client.setQueryData(['taskList.get-all'], context.previousTaskLists);
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
    <div className='w-full py-4 lg:w-auto'>
      <div className='w-full bg-slate-800 lg:w-[30rem]'>
        <form onSubmit={(e) => handleSubmit(e)} className='relative'>
          <input
            type='text'
            ref={inputRef}
            placeholder='Add a task list'
            className='w-full rounded border border-slate-600 bg-transparent py-2 pl-4 pr-20 focus:border-slate-400 focus-visible:outline-none'
          />
          <div className='absolute right-0 top-0 flex h-full justify-end p-1'>
            <button type='submit' className='flex h-full items-center justify-center rounded-sm bg-slate-600 px-4'>
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskListInput;

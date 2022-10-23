import React from 'react';
import { useRouter } from 'next/router';
import { trpc } from '../utils/trpc';

interface TaskListTitleProps {
  taskListName: string;
}

const TaskListTitle: React.FC<TaskListTitleProps> = ({ taskListName }) => {
  const router = useRouter();
  const client = trpc.useContext();
  const { isFetching } = trpc.useQuery(['task.get-all']);

  return (
    <div className='mt-4 flex w-full items-center gap-1 rounded bg-slate-700 lg:hidden'>
      <button className='my-2 ml-2 aspect-square rounded bg-slate-400 p-1.5' onClick={() => router.back()}>
        <i className='arrow-left block h-5 w-5 bg-slate-700' />
      </button>
      <p className='grow p-2 text-center text-xl font-bold'>{taskListName}</p>
      <button className='my-2 mr-2 aspect-square rounded bg-slate-400 p-1.5' onClick={() => client.invalidateQueries('task.get-all')}>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className={`h-5 w-5 text-slate-700 ${isFetching && 'animate-spin'}`}
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99'
          />
        </svg>
      </button>
    </div>
  );
};

export default TaskListTitle;

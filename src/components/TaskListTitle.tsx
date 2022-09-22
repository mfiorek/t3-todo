import React from 'react';
import { useSetAtom } from 'jotai';
import { mobileFocusRightAtom } from '../state/atoms';
import { useRouter } from 'next/router';

interface TaskListTitleProps {
  taskListName: string;
}

const TaskListTitle: React.FC<TaskListTitleProps> = ({ taskListName }) => {
  const router = useRouter();
  const setMobileFocusRight = useSetAtom(mobileFocusRightAtom);

  return (
    <div className='mt-4 flex w-full items-center gap-1 rounded bg-slate-700 lg:hidden'>
      <button
        className='my-2 ml-2 aspect-square rounded bg-slate-400 p-1.5'
        onClick={() => {
          setMobileFocusRight(false);
          router.push(router.basePath);
        }}
      >
        <i className='arrow-left block h-5 w-5 bg-slate-700' />
      </button>
      <p className='mr-10 grow p-2 text-center text-xl font-bold'>{taskListName}</p>
    </div>
  );
};

export default TaskListTitle;

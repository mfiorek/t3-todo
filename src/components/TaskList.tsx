import React from 'react';
import { TaskList } from '@prisma/client';
import classNames from 'classnames';
import { useAtom, useSetAtom } from 'jotai';
import { mobileFocusRightAtom, selectedTaskListIdAtom } from '../state/atoms';
import { trpc } from '../utils/trpc';

interface TaskListProperties {
  taskList: TaskList;
}

const TaskList: React.FC<TaskListProperties> = ({ taskList }) => {
  const client = trpc.useContext();
  const [selectedTaskListId, setSelectedTaskListId] = useAtom(selectedTaskListIdAtom);
  const setMobileFocusRight = useSetAtom(mobileFocusRightAtom);
  const isSelected = selectedTaskListId === taskList.id;
  const deleteTaskList = trpc.useMutation(['taskList.delete'], {
    onMutate: async ({ id }) => {
      if (isSelected) {
        setSelectedTaskListId(null);
      }
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update):
      await client.cancelQuery(['taskList.get-all']);
      // Snapshot the previous value:
      const previousTaskLists = client.getQueryData(['taskList.get-all']);
      const previousTasks = client.getQueryData(['task.get-by-list', { taskListId: taskList.id }]);
      // Optimistically update to the new value:
      if (previousTaskLists) {
        client.setQueryData(
          ['taskList.get-all'],
          previousTaskLists.filter((taskList) => taskList.id !== id),
        );
      }
      if (previousTasks) {
        client.setQueryData(['task.get-by-list', { taskListId: taskList.id }], []);
      }
      return { previousTaskLists, previousTasks };
    },
    // If the mutation fails, use the context returned from onMutate to roll back:
    onError: (err, variables, context) => {
      if (context?.previousTaskLists) {
        client.setQueryData(['taskList.get-all'], context.previousTaskLists);
      }
      if (context?.previousTasks) {
        client.setQueryData(['task.get-by-list', { taskListId: taskList.id }], context.previousTasks);
      }
    },
  });

  const classes = classNames({ 'lg:opacity-25': !isSelected, 'lg:border': isSelected });

  return (
    <li className={`${classes} flex w-full justify-between rounded bg-slate-700 lg:w-[28rem]`}>
      <label
        htmlFor={taskList.id}
        className='flex grow cursor-pointer items-center justify-between'
        onClick={() => {
          setSelectedTaskListId(taskList.id);
          setMobileFocusRight(true);
        }}
      >
        <p className='mx-3 my-2'>{taskList.name}</p>
      </label>
      <button className='m-3 flex aspect-square h-4 w-4 items-center justify-center rounded bg-red-500' onClick={() => deleteTaskList.mutate({ id: taskList.id })}>
        <span className='xmark h-3 w-3 bg-red-200'></span>
      </button>
    </li>
  );
};

export default TaskList;

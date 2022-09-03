import { task } from '@prisma/client';
import type { NextPage } from 'next';
import Head from 'next/head';
import Task from '../components/Task';
import TaskInput from '../components/TaskInput';
import { trpc } from '../utils/trpc';
import { useAutoAnimate } from '@formkit/auto-animate/react';

const Home: NextPage = () => {
  const [parentDivRef] = useAutoAnimate<HTMLDivElement>();
  const tasks = trpc.useQuery(['task.get-all']);

  if (tasks.isLoading || !tasks.data) {
    return <div>Loading...</div>;
  }

  return (
    <div className='flex min-h-screen flex-col bg-slate-800'>
      <Head>
        <title>fior-t3-todo</title>
        <meta name='description' content='fior-t3-todo simple todo app made with t3 stack' />
        <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
        <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
        <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
        <link rel='manifest' href='/site.webmanifest' />
        <link rel='mask-icon' href='/safari-pinned-tab.svg' color='#1e293b' />
        <meta name='msapplication-TileColor' content='#1e293b' />
        <meta name='theme-color' content='#1e293b' />
      </Head>

      <h1 className='w-full p-4 text-center text-4xl font-extrabold text-slate-200'>fior-t3-todo</h1>
      <TaskInput />
      <div ref={parentDivRef} className='w-full p-6 flex flex-col gap-2'>
        {tasks.data
          .sort((taskA, taskB) => Number(taskA.isDone) - Number(taskB.isDone) || taskB.createdAt.getTime() - taskA.createdAt.getTime())
          .map((task: task) => (
            <Task key={task.id} id={task.id} createdAt={task.createdAt} name={task.name} isDone={task.isDone} />
          ))}
      </div>
    </div>
  );
};

export default Home;

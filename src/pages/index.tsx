import { Task, TaskList } from '@prisma/client';
import type { NextPage } from 'next';
import Head from 'next/head';
import TaskComponent from '../components/Task';
import TaskInput from '../components/TaskInput';
import { trpc } from '../utils/trpc';
import { useSession, signIn } from 'next-auth/react';
import Image from 'next/image';
import Loader from '../components/Loader';
import Navbar from '../components/Navbar';
import { AutoAnimate } from '../components/AutoAnimate';
import { useEffect, useState } from 'react';
import classNames from 'classnames';
import TaskListInput from '../components/TaskListInput';
import TaskListComponent from '../components/TaskList';

const LoginPage: React.FC = () => {
  const { status } = useSession();

  if (status === 'loading') {
    return (
      <div className='flex h-screen w-full bg-slate-800'>
        <Loader text='Loading auth...' />
      </div>
    );
  }
  return (
    <div className='flex h-screen w-full flex-col items-center justify-center bg-slate-800'>
      <Image src='/logo.svg' alt='logo' className='' width={180} height={180} />
      <h1 className='text-center text-2xl font-extrabold'>Welcome to fior-t3-todo</h1>
      <button onClick={() => signIn('github')} className='m-4 rounded-lg bg-slate-600 py-2 px-4 text-xl hover:bg-slate-500'>
        Log in with GitHub!
      </button>
    </div>
  );
};

const TaskPage: React.FC = () => {
  const client = trpc.useContext();
  const taskLists = trpc.useQuery(['taskList.get-all']);
  const [selectedTaskListId, setSelectedTaskListId] = useState<string | null>(null);
  const tasks = trpc.useQuery(['task.get-by-list', { taskListId: selectedTaskListId }]);

  useEffect(() => {
    if (taskLists.data) {
      taskLists.data.forEach((taskList) => client.prefetchQuery(['task.get-by-list', { taskListId: taskList.id }]));
    }
  }, [client, taskLists.data]);

  const sliderClasses = classNames({ 'translate-x-[-50%] lg:translate-x-0 w-[200vw]': !!selectedTaskListId });

  if (taskLists.isLoading || !taskLists.data) {
    return (
      <div className='flex h-screen w-full bg-slate-800'>
        <Loader text='Loading task lists...' />
      </div>
    );
  }
  return (
    <>
      <div className='sticky top-0 z-50 w-full'>
        <Navbar />
      </div>
      <div className='flex w-full grow flex-col overflow-hidden'>
        <div className={`${sliderClasses} flex justify-center duration-500 lg:w-full`}>
          <div id='left' className='flex w-full flex-col items-center px-6 lg:w-auto'>
            <TaskListInput />
            <AutoAnimate as={'ul'} className='flex w-full grow flex-col items-center gap-2 py-2 lg:w-auto lg:min-w-[28rem]'>
              {taskLists.data
                .sort((taskListA, taskListB) => taskListB.createdAt.getTime() - taskListA.createdAt.getTime())
                .map((taskList: TaskList) => (
                  <TaskListComponent key={taskList.id} taskList={taskList} isSelected={taskList.id === selectedTaskListId} setSelectedListId={setSelectedTaskListId} />
                ))}
            </AutoAnimate>
          </div>
          {selectedTaskListId && (
            <div id='right' className='flex w-full flex-col items-center px-6 lg:w-auto'>
              {tasks.isLoading || !tasks.data ? (
                <div className='flex w-full grow justify-center py-2 lg:w-[28rem]'>
                  <Loader text='Loading tasks...' />
                </div>
              ) : (
                <>
                  <div className='mt-4 flex w-full items-center gap-1 rounded bg-slate-700 lg:hidden'>
                    <button className='m-2 aspect-square rounded bg-slate-400 p-1.5' onClick={() => setSelectedTaskListId(null)}>
                      <i className='arrow-left block h-5 w-5 bg-slate-700' />
                    </button>
                    <p className='py-2 text-xl font-bold'>{taskLists.data.find((tl) => tl.id === selectedTaskListId)?.name}</p>
                  </div>
                  <TaskInput taskListId={selectedTaskListId} />
                  <AutoAnimate as={'ul'} className='flex w-full grow flex-col items-center gap-2 py-2 lg:w-auto lg:min-w-[28rem]'>
                    {tasks.data
                      .sort((taskA, taskB) => Number(taskA.isDone) - Number(taskB.isDone) || taskB.createdAt.getTime() - taskA.createdAt.getTime())
                      .map((task: Task) => (
                        <TaskComponent key={task.id} task={task} />
                      ))}
                  </AutoAnimate>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <div className='mt-4 flex flex-wrap justify-center gap-x-2 bg-slate-700 p-2 text-sm'>
        <p className='text-center'>
          Made for 🤪 by <a href='https://mfiorek.github.io/'>Marcin Fiorek Codes</a> 🥦
        </p>
        <p className='text-center'>
          Source code: <a href='https://github.com/mfiorek/t3-todo'>github</a> ⌨
        </p>
      </div>
    </>
  );
};

const HomeContents: React.FC = () => {
  const { data: session } = useSession();

  return !session ? <LoginPage /> : <TaskPage />;
};

const Home: NextPage = () => {
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
      <HomeContents />
    </div>
  );
};

export default Home;

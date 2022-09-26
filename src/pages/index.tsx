import { Task, TaskList } from '@prisma/client';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import TaskComponent from '../components/Task';
import TaskInput from '../components/TaskInput';
import { trpc } from '../utils/trpc';
import { useSession, signIn } from 'next-auth/react';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import Image from 'next/image';
import Loader from '../components/Loader';
import Navbar from '../components/Navbar';
import { AutoAnimate } from '../components/AutoAnimate';
import classNames from 'classnames';
import TaskListInput from '../components/TaskListInput';
import TaskListComponent from '../components/TaskList';
import { useAtom, useAtomValue } from 'jotai';
import { mobileFocusRightAtom, selectedTaskListIdAtom } from '../state/atoms';
import TaskListTitle from '../components/TaskListTitle';
import { useRouter } from 'next/router';

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
  const router = useRouter();
  const taskLists = trpc.useQuery(['taskList.get-all']);
  const tasks = trpc.useQuery(['task.get-all']);
  const selectedTaskListId = useAtomValue(selectedTaskListIdAtom);
  const [mobileFocusRight, setMobileFocusRight] = useAtom(mobileFocusRightAtom);

  if (typeof window !== 'undefined') {
    router.beforePopState(() => {
      if ((window && window.location.hash) === '') {
        setMobileFocusRight(false);
      }
      return true;
    });
  }

  const sliderClasses = classNames({ 'translate-x-[-50%] lg:translate-x-0': mobileFocusRight, 'w-[200%]': !!selectedTaskListId });

  return (
    <>
      <div className='sticky top-0 z-50 w-full'>
        <Navbar />
      </div>
      <div className='flex w-full grow flex-col overflow-hidden'>
        <div className={`${sliderClasses} flex grow justify-center duration-500 lg:w-full`}>
          <div id='left' className='flex w-full flex-col items-center px-4 lg:w-auto'>
            {taskLists.isLoading || !taskLists.data ? (
              <div className='flex w-full grow justify-center py-2 lg:w-[28rem]'>
                <Loader text='Loading task lists...' />
              </div>
            ) : (
              <>
                <TaskListInput />
                <AutoAnimate as={'ul'} className='flex w-full grow flex-col items-center gap-2 py-2 lg:w-auto lg:min-w-[28rem]'>
                  {taskLists.data
                    .sort((taskListA, taskListB) => taskListB.createdAt.getTime() - taskListA.createdAt.getTime())
                    .map((taskList: TaskList) => (
                      <TaskListComponent key={taskList.id} taskList={taskList} />
                    ))}
                </AutoAnimate>
              </>
            )}
          </div>
          {selectedTaskListId && (
            <div id='right' className='flex w-full flex-col items-center px-4 lg:w-auto'>
              <TaskListTitle taskListName={taskLists.data?.find((tl) => tl.id === selectedTaskListId)?.name || ''} />
              {tasks.isLoading || !tasks.data ? (
                <div className='flex w-full grow justify-center py-2 lg:w-[28rem]'>
                  <Loader text='Loading tasks...' />
                </div>
              ) : (
                <>
                  <TaskInput />
                  <AutoAnimate as={'ul'} className='flex w-full grow flex-col items-center gap-2 py-2 lg:w-auto lg:min-w-[28rem]'>
                    {mobileFocusRight &&
                      tasks.data
                        .filter((task) => task.taskListId === selectedTaskListId)
                        .sort((taskA, taskB) => Number(taskA.isDone) - Number(taskB.isDone) || taskB.createdAt.getTime() - taskA.createdAt.getTime())
                        .map((task: Task) => <TaskComponent key={task.id} task={task} />)}
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

const Home: NextPage = () => {
  const { data: session } = useSession();
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
      {session ? <TaskPage /> : <LoginPage /> }
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(context.req, context.res, authOptions);

  return {
    props: {
      session,
    },
  };
};

export default Home;

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
import Footer from '../components/Footer';

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
    <>
      <div className='flex w-full grow flex-col items-center justify-center gap-8 bg-slate-800 lg:flex-row lg:gap-16'>
        <section className='flex flex-col items-center'>
          <Image src='/logo.svg' alt='logo' className='' width={180} height={180} />
          <h1 className='text-4xl font-bold'>Login to</h1>
          <h1 className='text-5xl font-extrabold'>fior-t3-todo</h1>
        </section>
        <section className='flex w-96 flex-col items-center gap-2 rounded-2xl bg-slate-700 p-6 font-medium shadow-2xl'>
          <p className='text-2xl'>
            Passwords are <strong>bad</strong>
          </p>
          <div className='text-center'>
            <p>People forget passwords.</p>
            <p>People steal passwords.</p>
            <p>People lose passwords.</p>
            <p>People pick bad passwords.</p>
            <p>People reuse passwords.</p>
          </div>
          <div className='text-center text-lg'>
            <p>You don&apos;t want another password.</p>
            <p>Instead:</p>
          </div>
          <button
            onClick={() => signIn('github')}
            className='mt-4 flex w-full justify-center gap-2 rounded-lg bg-slate-300 fill-slate-800 py-2 px-4 text-xl font-semibold text-slate-800 shadow-xl transition-colors duration-300 hover:bg-slate-100'
          >
            <p>Log in with GitHub!</p>
            <svg role='img' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' className='w-6'>
              <title>GitHub</title>
              <path d='M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'></path>
            </svg>
          </button>
        </section>
      </div>
      <Footer />
    </>
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
              <div className='flex w-full grow justify-center py-2 lg:w-[30rem]'>
                <Loader text='Loading task lists...' />
              </div>
            ) : (
              <>
                <TaskListInput />
                <AutoAnimate as={'ul'} className='flex w-full grow flex-col items-center gap-2 py-2 lg:w-auto lg:min-w-[30rem]'>
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
                <div className='flex w-full grow justify-center py-2 lg:w-[30rem]'>
                  <Loader text='Loading tasks...' />
                </div>
              ) : (
                <>
                  <TaskInput />
                  <AutoAnimate as={'ul'} className='flex w-full grow flex-col items-center gap-2 py-2 lg:w-auto lg:min-w-[30rem]'>
                    {mobileFocusRight &&
                      tasks.data
                        .filter((task) => task.taskListId === selectedTaskListId)
                        .sort(
                          (taskA, taskB) =>
                            Number(taskA.isDone) - Number(taskB.isDone) ||
                            Number(taskB.isStarred) - Number(taskA.isStarred) ||
                            taskB.createdAt.getTime() - taskA.createdAt.getTime(),
                        )
                        .map((task: Task) => <TaskComponent key={task.id} task={task} />)}
                  </AutoAnimate>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
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
      {session ? <TaskPage /> : <LoginPage />}
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

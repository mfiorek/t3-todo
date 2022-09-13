import { Task } from '@prisma/client';
import type { NextPage } from 'next';
import Head from 'next/head';
import TaskComponent from '../components/Task';
import TaskInput from '../components/TaskInput';
import { trpc } from '../utils/trpc';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useSession, signIn } from 'next-auth/react';
import Image from 'next/image';
import Loader from '../components/Loader';
import Navbar from '../components/Navbar';

const LoginPage: React.FC = () => {
  const { status } = useSession();

  if (status === 'loading') {
    return (
      <div className='flex h-screen w-full bg-slate-800'>
        <Loader />
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
  const [parentDivRef] = useAutoAnimate<HTMLUListElement>({ disrespectUserMotionPreference: true });
  const tasks = trpc.useQuery(['task.get-all']);

  if (tasks.isLoading || !tasks.data) {
    return (
      <div className='flex h-screen w-full bg-slate-800'>
        <Loader />
      </div>
    );
  }
  return (
    <>
      <div className='sticky top-0 z-50 w-full'>
        <Navbar />
        <TaskInput />
      </div>
      <ul ref={parentDivRef} className='flex w-full grow flex-col items-center gap-2 px-6 py-2'>
        {tasks.data
          .sort((taskA, taskB) => Number(taskA.isDone) - Number(taskB.isDone) || taskB.createdAt.getTime() - taskA.createdAt.getTime())
          .map((task: Task) => (
            <TaskComponent key={task.id} task={task} />
          ))}
      </ul>
      <div className='mt-4 flex justify-center gap-1 bg-slate-700 p-2 text-sm'>
        Made for 🤪 by <a href='https://mfiorek.github.io/'>Marcin Fiorek Codes</a> 🥦 Source code: <a href='https://github.com/mfiorek/t3-todo'>github</a> ⌨
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

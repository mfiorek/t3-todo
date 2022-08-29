import type { NextPage } from 'next';
import Head from 'next/head';

const Home: NextPage = () => {
  return (
    <div className='h-screen'>
      <Head>
        <title>Create Next App</title>
        <meta name='description' content='Generated by create next app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className='p-4 h-full flex flex-col justify-center items-center bg-slate-800'>
        <h1 className='text-6xl font-extrabold text-slate-200'>Welcome to fior-t3-todo</h1>
      </main>
    </div>
  );
};

export default Home;

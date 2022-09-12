import React, { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import classNames from 'classnames';
import Image from 'next/image';

const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const menuClass = classNames({ 'scale-0 opacity-0': !menuOpen, 'scale-100 opacity-100': menuOpen });

  return (
    <div className='w-full bg-slate-700'>
      <div className='mx-auto flex items-center justify-between px-6 py-2 lg:max-w-3xl'>
        <div className='flex items-center gap-2'>
          <div className='relative h-8 w-8'>
            <Image src='/logo.svg' alt='logo' layout='fill' />
          </div>
          <h1 className='text-center text-xl font-extrabold text-slate-200'>fior-t3-todo</h1>
        </div>
        {session?.user && (
          <div className='relative' tabIndex={0} onFocus={() => setMenuOpen(true)} onBlur={() => setMenuOpen(false)}>
            {session.user.image && (
              <div className='relative h-10 w-10'>
                <Image src={session.user.image} alt='user pic' layout='fill' className='rounded-full' />
              </div>
            )}
            <div
              className={`absolute top-full right-0 z-20 mt-1 flex origin-top-right transform flex-col gap-2 rounded bg-slate-600 p-2 transition duration-200 ease-in-out ${menuClass}`}
            >
              <div>
                <h3>{session.user.name}</h3>
                <h4 className='text-sm'>{session.user.email}</h4>
              </div>
              <hr className='border-slate-500' />
              <button
                className='w-full bg-red-500 p-1'
                onFocus={() => {
                  signOut();
                  setMenuOpen(true);
                }}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;

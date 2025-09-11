'use client';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { signOut, signIn, useSession } from 'next-auth/react';
import Image from 'next/image';

interface ProfileProps {
  isGuestMode?: boolean;
}

export default function Profile({ isGuestMode = false }: ProfileProps) {
  const { data: session } = useSession();

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
        {session?.user?.image ? (
          <Image
            src={session.user.image}
            alt="Profile"
            width={28}
            height={28}
            className="rounded-full"
          />
        ) : (
          <UserCircleIcon className="h-7 w-7 text-gray-600 dark:text-gray-300" />
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 dark:divide-gray-700 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {/* User Info Section */}
          {isGuestMode ? (
            <div className="px-4 py-3">
              <p className="text-sm text-gray-900 dark:text-white">
                Guest User
              </p>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Chats won't be saved
              </p>
            </div>
          ) : (
            <div className="px-4 py-3">
              <p className="text-sm text-gray-900 dark:text-white">
                {session?.user?.name}
              </p>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {session?.user?.email}
              </p>
            </div>
          )}

          {/* Actions Section */}
          <div className="py-1">
            {isGuestMode ? (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => {
                      sessionStorage.removeItem('guestMode');
                      signIn('google', { callbackUrl: '/' });
                    }}
                    className={`${
                      active ? 'bg-gray-100 dark:bg-gray-700' : ''
                    } group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                  >
                    Sign in with Google
                  </button>
                )}
              </Menu.Item>
            ) : (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                    className={`${
                      active ? 'bg-gray-100 dark:bg-gray-700' : ''
                    } group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                  >
                    Sign out
                  </button>
                )}
              </Menu.Item>
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

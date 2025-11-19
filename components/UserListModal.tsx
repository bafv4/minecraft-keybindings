'use client';

import { Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: Array<{ mcid: string; uuid: string }>;
}

export function UserListModal({ isOpen, onClose, title, users }: UserListModalProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        </TransitionChild>

        {/* Full-screen container to center the panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="glass-card rounded-lg border border-[rgb(var(--border))]/50 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--border))]">
                <div>
                  <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
                  <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                    プレイヤー: {users.length}人
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-[rgb(var(--muted))] rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {users.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {users.map((user) => (
                      <Link
                        key={user.uuid}
                        href={`/player/${user.mcid}`}
                        className="flex items-center gap-3 p-3 rounded-lg border border-[rgb(var(--border))] hover:border-blue-500 hover:bg-[rgb(var(--muted))] transition-colors"
                        onClick={onClose}
                      >
                        <img
                          src={`/api/avatar?uuid=${user.uuid}&size=32`}
                          alt={user.mcid}
                          className="w-8 h-8 rounded"
                        />
                        <span className="font-medium">{user.mcid}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-[rgb(var(--muted-foreground))]">
                    該当ユーザーがいません
                  </div>
                )}
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}

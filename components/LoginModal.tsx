'use client';

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useLoginModal } from '@/contexts/LoginModalContext';
import { LoginOrRegisterForm } from './LoginOrRegisterForm';

export function LoginModal() {
  const { isOpen, closeLoginModal } = useLoginModal();

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={closeLoginModal}>
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </TransitionChild>

        {/* Modal */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-card border border-border p-6 shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary-light via-secondary to-foreground bg-clip-text text-transparent">
                      登録 / 編集
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      MCIDとパスフレーズを入力してください。
                    </p>
                  </div>
                  <button
                    onClick={closeLoginModal}
                    className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <LoginOrRegisterForm onSuccess={closeLoginModal} />
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

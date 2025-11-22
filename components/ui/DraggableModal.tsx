'use client';

import { Fragment, useEffect, ReactNode } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useDraggable } from '@/hooks/useDraggable';

interface DraggableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  headerContent?: ReactNode;
  panelClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  /** trueの場合、コンテンツのoverflow-y-autoを無効化 */
  noScroll?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
};

export function DraggableModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = '2xl',
  headerContent,
  panelClassName,
  headerClassName,
  contentClassName,
  footerClassName,
  noScroll = false,
}: DraggableModalProps) {
  const { style, headerStyle, handleMouseDown, reset, isDragging } = useDraggable();

  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
        </TransitionChild>

        {/* Full-screen container to center the panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel
              className={panelClassName || `glass-card rounded-xl border border-[rgb(var(--border))]/80 ${maxWidthClasses[maxWidth]} w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl select-none`}
              style={{ ...style, transition: isDragging ? undefined : 'transform 0.15s ease-out' }}
            >
              {/* ヘッダー（ドラッグ可能） */}
              <div
                className={headerClassName || "px-6 py-4 border-b border-[rgb(var(--border))] flex-shrink-0"}
                style={headerStyle}
                onMouseDown={handleMouseDown}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-xl font-bold text-[rgb(var(--foreground))]">
                      {title}
                    </DialogTitle>
                    {subtitle && (
                      <div className="text-sm text-[rgb(var(--muted-foreground))] mt-0.5">
                        {subtitle}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-[rgb(var(--muted))] rounded-lg transition-colors"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <XMarkIcon className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                  </button>
                </div>
                {headerContent}
              </div>

              {/* コンテンツ */}
              <div className={contentClassName || `flex-1 ${noScroll ? '' : 'overflow-y-auto'}`}>
                {children}
              </div>

              {/* フッター */}
              {footer && (
                <div className={footerClassName || "px-6 py-4 border-t border-[rgb(var(--border))] flex-shrink-0"}>
                  {footer}
                </div>
              )}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}

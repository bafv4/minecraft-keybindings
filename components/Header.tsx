'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import {
  PencilSquareIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import type { Session } from 'next-auth';
import { handleSignOut } from '@/app/actions/auth';

interface HeaderProps {
  session: Session | null;
}

export function Header({ session }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-xl shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 md:gap-3 group">
            <div className="w-9 h-9 md:w-12 md:h-12 flex-shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/icon.svg"
                alt="MCSRer Hotkeys"
                width={48}
                height={48}
                className="w-full h-full"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base md:text-xl font-bold bg-gradient-to-r from-primary-light via-secondary to-[#64748b] bg-clip-text text-transparent leading-tight">
                MCSRer Hotkeys
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5 leading-tight hidden md:block">RTA勢の設定はこうなっている！</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/stats"
              className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all duration-200"
            >
              <ChartBarIcon className="w-5 h-5" />
              <span>統計</span>
            </Link>

            {session?.user ? (
              <>
                {/* User Menu */}
                <Menu as="div" className="relative">
                  <MenuButton className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent rounded-xl transition-all duration-200">
                    <UserCircleIcon className="w-5 h-5 text-primary" />
                    <span className="font-medium">{session.user.name}</span>
                  </MenuButton>
                  <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-card border border-border shadow-lg ring-1 ring-black/5 focus:outline-none overflow-hidden">
                    <MenuItem>
                      {({ focus }) => (
                        <Link
                          href={`/player/${session.user.mcid}`}
                          className={`${
                            focus ? 'bg-accent' : ''
                          } flex items-center gap-2 px-4 py-3 text-sm transition-colors`}
                        >
                          <UserCircleIcon className="w-5 h-5 text-muted-foreground" />
                          <span>マイページ</span>
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ focus }) => (
                        <Link
                          href={`/player/${session.user.mcid}/edit`}
                          className={`${
                            focus ? 'bg-accent' : ''
                          } flex items-center gap-2 px-4 py-3 text-sm transition-colors`}
                        >
                          <PencilSquareIcon className="w-5 h-5 text-muted-foreground" />
                          <span>設定を編集</span>
                        </Link>
                      )}
                    </MenuItem>
                    <div className="border-t border-border" />
                    <MenuItem>
                      {({ focus }) => (
                        <form action={handleSignOut}>
                          <button
                            type="submit"
                            className={`${
                              focus ? 'bg-accent' : ''
                            } flex items-center gap-2 px-4 py-3 text-sm w-full text-left transition-colors`}
                          >
                            <ArrowRightOnRectangleIcon className="w-5 h-5 text-muted-foreground" />
                            <span>ログアウト</span>
                          </button>
                        </form>
                      )}
                    </MenuItem>
                  </MenuItems>
                </Menu>

                <Link
                  href={`/player/${session.user.mcid}/edit`}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-white text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <PencilSquareIcon className="w-5 h-5" />
                  <span>設定を編集</span>
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-white text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                <PencilSquareIcon className="w-5 h-5" />
                <span>登録 / 編集</span>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-5 h-5" />
            ) : (
              <Bars3Icon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 py-4 space-y-2 animate-fade-in">
            <Link
              href="/stats"
              className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ChartBarIcon className="w-5 h-5 text-muted-foreground" />
              <span>統計</span>
            </Link>

            {session?.user ? (
              <>
                <div className="px-4 py-2 text-xs text-muted-foreground font-medium">
                  {session.user.name}
                </div>
                <Link
                  href={`/player/${session.user.mcid}`}
                  className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserCircleIcon className="w-5 h-5 text-muted-foreground" />
                  <span>マイページ</span>
                </Link>
                <Link
                  href={`/player/${session.user.mcid}/edit`}
                  className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <PencilSquareIcon className="w-5 h-5 text-muted-foreground" />
                  <span>設定を編集</span>
                </Link>
                <form action={handleSignOut}>
                  <button
                    type="submit"
                    className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent rounded-lg transition-colors w-full text-left"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5 text-muted-foreground" />
                    <span>ログアウト</span>
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-3 px-4 py-3 text-sm bg-gradient-to-r from-primary to-primary-light text-white rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <PencilSquareIcon className="w-5 h-5" />
                <span>登録 / 編集</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

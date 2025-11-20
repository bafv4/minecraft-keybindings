'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from '@headlessui/react';
import {
  PencilSquareIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  ListBulletIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useState, Fragment } from 'react';
import type { Session } from 'next-auth';
import { handleSignOut } from '@/app/actions/auth';

interface HeaderProps {
  session: Session | null;
}

export function Header({ session }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-gradient-to-r from-primary/10 via-secondary/10 to-transparent backdrop-blur-xl shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 md:h-20">
          {/* Spacer for mobile - ダミーの要素で左右対称を保つ */}
          <div className="md:hidden w-8"></div>

          {/* Logo - モバイルでは中央配置 */}
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
            <div className="block">
              <h1 className="text-base md:text-xl font-bold bg-gradient-to-r from-primary-light via-secondary to-[#64748b] bg-clip-text text-transparent leading-tight">
                MCSRer Hotkeys
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5 leading-tight hidden md:block">RTA勢の設定はこうなっている！</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {/* 一覧メニュー */}
            <Menu as="div" className="relative">
              <MenuButton className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all duration-200">
                <ListBulletIcon className="w-5 h-5" />
                <span>一覧</span>
                <ChevronDownIcon className="w-4 h-4" />
              </MenuButton>
              <MenuItems
                transition
                className="absolute left-0 mt-2 w-48 origin-top-left rounded-xl bg-card border border-border shadow-lg ring-1 ring-black/5 focus:outline-none overflow-hidden transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
              >
                <MenuItem>
                  {({ focus }) => (
                    <Link
                      href="/"
                      className={`${
                        focus ? 'bg-accent' : ''
                      } flex items-center gap-2 px-4 py-3 text-sm transition-colors`}
                    >
                      <span>プレイヤー一覧</span>
                    </Link>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ focus }) => (
                    <Link
                      href="/keyboard"
                      className={`${
                        focus ? 'bg-accent' : ''
                      } flex items-center gap-2 px-4 py-3 text-sm transition-colors`}
                    >
                      <span>キーボード一覧</span>
                    </Link>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ focus }) => (
                    <Link
                      href="/mouse"
                      className={`${
                        focus ? 'bg-accent' : ''
                      } flex items-center gap-2 px-4 py-3 text-sm transition-colors`}
                    >
                      <span>マウス一覧</span>
                    </Link>
                  )}
                </MenuItem>
              </MenuItems>
            </Menu>

            {/* 統計メニュー */}
            <Menu as="div" className="relative">
              <MenuButton className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all duration-200">
                <ChartBarIcon className="w-5 h-5" />
                <span>統計</span>
                <ChevronDownIcon className="w-4 h-4" />
              </MenuButton>
              <MenuItems
                transition
                className="absolute left-0 mt-2 w-48 origin-top-left rounded-xl bg-card border border-border shadow-lg ring-1 ring-black/5 focus:outline-none overflow-hidden transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
              >
                <MenuItem>
                  {({ focus }) => (
                    <Link
                      href="/stats"
                      className={`${
                        focus ? 'bg-accent' : ''
                      } flex items-center gap-2 px-4 py-3 text-sm transition-colors`}
                    >
                      <span>統計ダッシュボード</span>
                    </Link>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ focus }) => (
                    <Link
                      href="/stats/keys"
                      className={`${
                        focus ? 'bg-accent' : ''
                      } flex items-center gap-2 px-4 py-3 text-sm transition-colors`}
                    >
                      <span>キーバインド統計</span>
                    </Link>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ focus }) => (
                    <Link
                      href="/stats/actions"
                      className={`${
                        focus ? 'bg-accent' : ''
                      } flex items-center gap-2 px-4 py-3 text-sm transition-colors`}
                    >
                      <span>アクション統計</span>
                    </Link>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ focus }) => (
                    <Link
                      href="/stats/mouse"
                      className={`${
                        focus ? 'bg-accent' : ''
                      } flex items-center gap-2 px-4 py-3 text-sm transition-colors`}
                    >
                      <span>マウス統計</span>
                    </Link>
                  )}
                </MenuItem>
              </MenuItems>
            </Menu>

            {session?.user ? (
              <>
                {/* User Menu */}
                <Menu as="div" className="relative">
                  <MenuButton className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent rounded-xl transition-all duration-200">
                    <UserCircleIcon className="w-5 h-5 text-primary" />
                    <span className="font-medium">{session.user.name}</span>
                  </MenuButton>
                  <MenuItems
                    transition
                    className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-card border border-border shadow-lg ring-1 ring-black/5 focus:outline-none overflow-hidden transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
                  >
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
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-light hover:brightness-110 text-white text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <PencilSquareIcon className="w-5 h-5" />
                  <span>設定を編集</span>
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-light hover:brightness-110 text-white text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
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
        <Transition
          show={mobileMenuOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 -translate-y-2"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 -translate-y-2"
        >
          <div className="md:hidden border-t border-border/50 py-4 space-y-2">
            {/* 一覧メニュー */}
            <div className="space-y-1">
              <div className="px-4 py-2 text-xs text-muted-foreground font-semibold">一覧</div>
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ListBulletIcon className="w-5 h-5 text-muted-foreground" />
                <span>プレイヤー一覧</span>
              </Link>
              <Link
                href="/keyboard"
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="pl-8">キーボード一覧</span>
              </Link>
              <Link
                href="/mouse"
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="pl-8">マウス一覧</span>
              </Link>
            </div>

            {/* 統計メニュー */}
            <div className="space-y-1 pt-2">
              <div className="px-4 py-2 text-xs text-muted-foreground font-semibold">統計</div>
              <Link
                href="/stats"
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ChartBarIcon className="w-5 h-5 text-muted-foreground" />
                <span>統計ダッシュボード</span>
              </Link>
              <Link
                href="/stats/keys"
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="pl-8">キーバインド統計</span>
              </Link>
              <Link
                href="/stats/actions"
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="pl-8">アクション統計</span>
              </Link>
              <Link
                href="/stats/mouse"
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="pl-8">マウス統計</span>
              </Link>
            </div>

            {/* ユーザーメニュー */}
            {session?.user && (
              <div className="border-t border-border/50 pt-2"></div>
            )}
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
                className="flex items-center gap-3 px-4 py-3 mx-4 text-sm bg-gradient-to-r from-primary to-primary-light text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                <PencilSquareIcon className="w-5 h-5" />
                <span>登録 / 編集</span>
              </Link>
            )}
          </div>
        </Transition>
      </div>
    </header>
  );
}

'use client';

import { useState, Fragment, forwardRef } from 'react';
import { Tab, Listbox, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface TabItem {
  name: string;
  label: string;
  content: React.ReactNode;
}

interface TabContainerProps {
  tabs: TabItem[];
  defaultTab?: string;
  height?: string;
}

export const TabContainer = forwardRef<HTMLDivElement, TabContainerProps>(
  function TabContainer({ tabs, defaultTab, height }, ref) {
  const defaultIndex = defaultTab ? tabs.findIndex(t => t.name === defaultTab) : 0;
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex >= 0 ? defaultIndex : 0);

  return (
    <>
      {/* PC版: タブ表示 */}
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <div
          ref={ref}
          className={`hidden md:flex md:flex-col bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent rounded-2xl border border-border shadow-sm ${height && height !== 'auto' ? 'overflow-auto' : ''}`}
          style={height && height !== 'auto' ? { height } : undefined}
        >
          <Tab.List
            className="sticky top-0 z-20 flex gap-2 p-3 bg-card/95 backdrop-blur-sm border-b border-border rounded-t-2xl"
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  `px-4 py-3 text-sm font-medium rounded-lg transition-all focus:outline-none ${
                    selected
                      ? 'bg-primary text-primary-foreground shadow'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  }`
                }
              >
                {tab.label}
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels className="bg-card relative z-10 flex-1 rounded-b-2xl">
            {tabs.map((tab) => (
              <Tab.Panel
                key={tab.name}
                className="focus:outline-none p-6"
              >
                {tab.content}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </div>
      </Tab.Group>

      {/* モバイル版: ドロップダウン表示 */}
      <div
        className={`md:hidden flex flex-col bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent rounded-2xl border border-border shadow-sm ${height && height !== 'auto' ? 'overflow-auto' : ''}`}
        style={height && height !== 'auto' ? { height } : undefined}
      >
        <Listbox value={selectedIndex} onChange={setSelectedIndex}>
          <div
            className="relative sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border rounded-t-2xl"
          >
            <Listbox.Button className="relative w-full cursor-pointer py-4 pl-4 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary">
              <span className="block truncate font-medium">
                {tabs[selectedIndex].label}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ChevronDownIcon
                  className="h-5 w-5 text-muted-foreground"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-background py-1 text-base shadow-lg ring-1 ring-black/5 border border-border focus:outline-none sm:text-sm">
                {tabs.map((tab, idx) => (
                  <Listbox.Option
                    key={tab.name}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-primary/10 text-foreground' : 'text-muted-foreground'
                      }`
                    }
                    value={idx}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? 'font-medium' : 'font-normal'
                          }`}
                        >
                          {tab.label}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>

        {/* モバイル版のコンテンツ表示 */}
        <div className="p-6 bg-card relative z-10 flex-1 rounded-b-2xl">
          {tabs[selectedIndex].content}
        </div>
      </div>
    </>
  );
});

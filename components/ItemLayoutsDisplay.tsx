'use client';

import { Disclosure, Transition, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { HotbarRow } from './HotbarSlot';
import { getSegmentInfo } from '@/lib/segments';
import type { CustomKeyInfo } from '@/lib/utils';

interface ItemLayout {
  segment: string;
  slot1: string[];
  slot2: string[];
  slot3: string[];
  slot4: string[];
  slot5: string[];
  slot6: string[];
  slot7: string[];
  slot8: string[];
  slot9: string[];
  offhand: string[];
  notes?: string | null;
}

interface Keybinds {
  hotbar1?: string | string[];
  hotbar2?: string | string[];
  hotbar3?: string | string[];
  hotbar4?: string | string[];
  hotbar5?: string | string[];
  hotbar6?: string | string[];
  hotbar7?: string | string[];
  hotbar8?: string | string[];
  hotbar9?: string | string[];
  swapHands?: string | string[];
}

interface ItemLayoutsDisplayProps {
  itemLayouts: ItemLayout[];
  keybinds?: Keybinds;
  customKeys?: CustomKeyInfo[];
}

export function ItemLayoutsDisplay({ itemLayouts, keybinds, customKeys }: ItemLayoutsDisplayProps) {
  if (!itemLayouts || itemLayouts.length === 0) {
    return null;
  }

  return (
    <Disclosure defaultOpen>
      {({ open }) => (
        <section className="bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent rounded-xl border border-border shadow-sm">
          <Disclosure.Button className="flex w-full items-center justify-between p-6 text-left hover:bg-[rgb(var(--muted))]/30 transition-colors">
            <div>
              <h2 className="text-xl font-bold">アイテム配置</h2>
              <p className="text-sm text-muted-foreground mt-1">
                セグメントごとのホットバー配置
              </p>
            </div>
            <ChevronDownIcon
              className={`${
                open ? 'rotate-180 transform' : ''
              } h-6 w-6 text-muted-foreground transition-transform duration-200`}
            />
          </Disclosure.Button>
          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Disclosure.Panel className="px-6 pb-6">
              <TabGroup>
                <TabList className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {itemLayouts.map((layout) => {
                    const segmentInfo = getSegmentInfo(layout.segment);
                    return (
                      <Tab
                        key={layout.segment}
                        className={({ selected }) =>
                          `px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                            selected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`
                        }
                      >
                        {segmentInfo?.label || layout.segment}
                      </Tab>
                    );
                  })}
                </TabList>
                <TabPanels className="mt-4">
                  {itemLayouts.map((layout) => {
                    const segmentInfo = getSegmentInfo(layout.segment);
                    const slots = [
                      { items: layout.slot1, num: 1 },
                      { items: layout.slot2, num: 2 },
                      { items: layout.slot3, num: 3 },
                      { items: layout.slot4, num: 4 },
                      { items: layout.slot5, num: 5 },
                      { items: layout.slot6, num: 6 },
                      { items: layout.slot7, num: 7 },
                      { items: layout.slot8, num: 8 },
                      { items: layout.slot9, num: 9 },
                    ];
                    return (
                      <TabPanel key={layout.segment}>
                        {segmentInfo?.description && (
                          <p className="text-sm text-muted-foreground mb-4">
                            {segmentInfo.description}
                          </p>
                        )}
                        <HotbarRow slots={slots} offhand={layout.offhand} keybinds={keybinds} customKeys={customKeys} />
                        {layout.notes && (
                          <div className="mt-4 p-4 bg-muted/50 rounded-xl border border-border">
                            <p className="text-sm">{layout.notes}</p>
                          </div>
                        )}
                      </TabPanel>
                    );
                  })}
                </TabPanels>
              </TabGroup>
            </Disclosure.Panel>
          </Transition>
        </section>
      )}
    </Disclosure>
  );
}

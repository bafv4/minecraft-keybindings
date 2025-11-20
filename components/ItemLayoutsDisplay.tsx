'use client';

import { Disclosure, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { HotbarDisplay } from './HotbarDisplay';
import { getSegmentInfo } from '@/lib/segments';

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

interface ItemLayoutsDisplayProps {
  itemLayouts: ItemLayout[];
}

export function ItemLayoutsDisplay({ itemLayouts }: ItemLayoutsDisplayProps) {
  if (!itemLayouts || itemLayouts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">アイテム配置</h2>
      <div className="space-y-4">
        {itemLayouts.map((layout) => {
          const segmentInfo = getSegmentInfo(layout.segment);
          return (
            <Disclosure key={layout.segment}>
              {({ open }) => (
                <div className="bg-card border border-border rounded-2xl shadow-sm">
                  <Disclosure.Button className="flex w-full items-center justify-between p-6 text-left hover:bg-accent/50 transition-colors rounded-2xl">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {segmentInfo?.label || layout.segment}
                      </h3>
                      {segmentInfo?.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {segmentInfo.description}
                        </p>
                      )}
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
                    <Disclosure.Panel className="px-6 pb-6 space-y-4">
                      <HotbarDisplay
                        slot1={layout.slot1}
                        slot2={layout.slot2}
                        slot3={layout.slot3}
                        slot4={layout.slot4}
                        slot5={layout.slot5}
                        slot6={layout.slot6}
                        slot7={layout.slot7}
                        slot8={layout.slot8}
                        slot9={layout.slot9}
                        offhand={layout.offhand}
                      />
                      {layout.notes && (
                        <div className="p-4 bg-muted/50 rounded-xl border border-border">
                          <p className="text-sm">{layout.notes}</p>
                        </div>
                      )}
                    </Disclosure.Panel>
                  </Transition>
                </div>
              )}
            </Disclosure>
          );
        })}
      </div>
    </div>
  );
}

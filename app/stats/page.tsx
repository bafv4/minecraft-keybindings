import Link from 'next/link';
import type { Metadata } from 'next';
import { Squares2X2Icon, CursorArrowRaysIcon, AdjustmentsHorizontalIcon} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: '統計 | MCSRer Hotkeys',
  description: 'RTA勢のキー設定・マウス設定の統計データ',
  openGraph: {
    title: '統計 | MCSRer Hotkeys',
    description: 'RTA勢のキー設定・マウス設定の統計データ',
  },
  twitter: {
    card: 'summary',
    title: '統計 | MCSRer Hotkeys',
    description: 'RTA勢のキー設定・マウス設定の統計データ',
  },
};

export default function StatsPage() {
  return (
    <div className="pb-6">
      <h1 className="text-2xl font-semibold mb-4">統計</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/stats/keys"
          className="bg-[rgb(var(--card))] p-6 rounded-lg border border-[rgb(var(--border))] hover:border-primary transition-colors group"
        >
          <div className="flex items-center gap-3">
            <Squares2X2Icon className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold group-hover:text-primary transition-colors">キー → 操作</h2>
          </div>
        </Link>

        <Link
          href="/stats/actions"
          className="bg-[rgb(var(--card))] p-6 rounded-lg border border-[rgb(var(--border))] hover:border-primary transition-colors group"
        >
          <div className="flex items-center gap-3">
            <AdjustmentsHorizontalIcon className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold group-hover:text-primary transition-colors">操作 → キー</h2>
          </div>
        </Link>

        <Link
          href="/stats/mouse"
          className="bg-[rgb(var(--card))] p-6 rounded-lg border border-[rgb(var(--border))] hover:border-primary transition-colors group"
        >
          <div className="flex items-center gap-3">
            <CursorArrowRaysIcon className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold group-hover:text-primary transition-colors">マウス設定</h2>
          </div>
        </Link>
      </div>
    </div>
  );
}

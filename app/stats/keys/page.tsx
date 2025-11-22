import { getKeyboardStatsData } from '@/lib/playerData';
import { KeyStatsDisplay } from '@/components/KeyStatsDisplay';
import type { Metadata } from 'next';

// ISR: 10分ごとに再生成
export const revalidate = 600;

export const metadata: Metadata = {
  title: 'キー統計 | MCSRer Hotkeys',
  description: 'キーごとの操作割り当て統計',
  openGraph: {
    title: 'キー統計 | MCSRer Hotkeys',
    description: 'キーごとの操作割り当て統計',
  },
  twitter: {
    card: 'summary',
    title: 'キー統計 | MCSRer Hotkeys',
    description: 'キーごとの操作割り当て統計',
  },
};

export default async function KeyStatsPage() {
  // Fetch all users with their keybindings using centralized utility
  const users = await getKeyboardStatsData();

  // Transform the data for client component
  const allSettings = users
    .filter((user: any) => user.settings) // Only include users with settings
    .map((user: any) => ({
      user: {
        mcid: user.mcid,
        uuid: user.uuid,
      },
      keybindings: user.settings as Record<string, string | string[]>,
    }));

  return (
    <div className="pb-6">
      <KeyStatsDisplay allSettings={allSettings} />
    </div>
  );
}

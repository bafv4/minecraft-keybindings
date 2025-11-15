import { prisma } from '@/lib/db';
import { KeyStatsDisplay } from '@/components/KeyStatsDisplay';
import type { Metadata } from 'next';

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
  // Fetch all user settings with user information
  const settings = await prisma.playerSettings.findMany({
    select: {
      forward: true,
      back: true,
      left: true,
      right: true,
      jump: true,
      sneak: true,
      sprint: true,
      drop: true,
      attack: true,
      use: true,
      pickBlock: true,
      swapHands: true,
      inventory: true,
      chat: true,
      command: true,
      togglePerspective: true,
      fullscreen: true,
      toggleHud: true,
      hotbar1: true,
      hotbar2: true,
      hotbar3: true,
      hotbar4: true,
      hotbar5: true,
      hotbar6: true,
      hotbar7: true,
      hotbar8: true,
      hotbar9: true,
      user: {
        select: {
          mcid: true,
          uuid: true,
        },
      },
    },
  });

  // Transform the data for client component with user information
  const allSettings = settings.map((setting) => ({
    user: {
      mcid: setting.user.mcid,
      uuid: setting.user.uuid,
    },
    keybindings: {
      forward: setting.forward,
      back: setting.back,
      left: setting.left,
      right: setting.right,
      jump: setting.jump,
      sneak: setting.sneak,
      sprint: setting.sprint,
      drop: setting.drop,
      attack: setting.attack,
      use: setting.use,
      pickBlock: setting.pickBlock,
      swapHands: setting.swapHands,
      inventory: setting.inventory,
      chat: setting.chat,
      command: setting.command,
      togglePerspective: setting.togglePerspective,
      fullscreen: setting.fullscreen,
      toggleHud: setting.toggleHud,
      hotbar1: setting.hotbar1,
      hotbar2: setting.hotbar2,
      hotbar3: setting.hotbar3,
      hotbar4: setting.hotbar4,
      hotbar5: setting.hotbar5,
      hotbar6: setting.hotbar6,
      hotbar7: setting.hotbar7,
      hotbar8: setting.hotbar8,
      hotbar9: setting.hotbar9,
    },
  }));

  return (
    <div className="pb-6">
      <KeyStatsDisplay allSettings={allSettings} />
    </div>
  );
}

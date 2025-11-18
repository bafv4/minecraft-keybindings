import { prisma } from '@/lib/db';
import { ActionStatsDisplay } from '@/components/ActionStatsDisplay';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '操作統計 | MCSRer Hotkeys',
  description: '操作ごとのキー割り当て統計',
  openGraph: {
    title: '操作統計 | MCSRer Hotkeys',
    description: '操作ごとのキー割り当て統計',
  },
  twitter: {
    card: 'summary',
    title: '操作統計 | MCSRer Hotkeys',
    description: '操作ごとのキー割り当て統計',
  },
};

export default async function ActionStatsPage() {
  // Fetch all users with their keybindings
  const users = await prisma.user.findMany({
    select: {
      mcid: true,
      uuid: true,
      keybindings: {
        select: {
          action: true,
          keyCode: true,
        },
      },
    },
  });

  // Transform the data for client component
  const allSettings = users.map((user) => {
    // Convert keybindings array to object map
    const keybindingsMap: Record<string, string> = {};
    for (const kb of user.keybindings) {
      keybindingsMap[kb.action] = kb.keyCode;
    }

    return {
      user: {
        mcid: user.mcid,
        uuid: user.uuid,
      },
      keybindings: {
        forward: keybindingsMap.forward || 'KeyW',
        back: keybindingsMap.back || 'KeyS',
        left: keybindingsMap.left || 'KeyA',
        right: keybindingsMap.right || 'KeyD',
        jump: keybindingsMap.jump || 'Space',
        sneak: keybindingsMap.sneak || 'ShiftLeft',
        sprint: keybindingsMap.sprint || 'ControlLeft',
        drop: keybindingsMap.drop || 'KeyQ',
        attack: keybindingsMap.attack || 'Mouse0',
        use: keybindingsMap.use || 'Mouse1',
        pickBlock: keybindingsMap.pickBlock || 'Mouse2',
        swapHands: keybindingsMap.swapHands || 'KeyF',
        inventory: keybindingsMap.inventory || 'KeyE',
        chat: keybindingsMap.chat || 'KeyT',
        command: keybindingsMap.command || 'Slash',
        togglePerspective: keybindingsMap.togglePerspective || 'F5',
        fullscreen: keybindingsMap.fullscreen || 'F11',
        toggleHud: keybindingsMap.toggleHud || 'F1',
        hotbar1: keybindingsMap.hotbar1 || 'Digit1',
        hotbar2: keybindingsMap.hotbar2 || 'Digit2',
        hotbar3: keybindingsMap.hotbar3 || 'Digit3',
        hotbar4: keybindingsMap.hotbar4 || 'Digit4',
        hotbar5: keybindingsMap.hotbar5 || 'Digit5',
        hotbar6: keybindingsMap.hotbar6 || 'Digit6',
        hotbar7: keybindingsMap.hotbar7 || 'Digit7',
        hotbar8: keybindingsMap.hotbar8 || 'Digit8',
        hotbar9: keybindingsMap.hotbar9 || 'Digit9',
      },
    };
  });

  return (
    <div className="pb-6">
      <ActionStatsDisplay allSettings={allSettings} />
    </div>
  );
}

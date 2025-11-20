import { prisma } from '@/lib/db';
import { MouseStatsDisplay } from '@/components/MouseStatsDisplay';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'マウス統計 | MCSRer Hotkeys',
  description: 'マウス設定の分布統計',
  openGraph: {
    title: 'マウス統計 | MCSRer Hotkeys',
    description: 'マウス設定の分布統計',
  },
  twitter: {
    card: 'summary',
    title: 'マウス統計 | MCSRer Hotkeys',
    description: 'マウス設定の分布統計',
  },
};

export default async function MouseStatsPage() {
  // Fetch all user settings with user information
  const settings = await prisma.playerConfig.findMany({
    select: {
      uuid: true,
      mouseDpi: true,
      gameSensitivity: true,
      cm360: true,
      windowsSpeed: true,
      user: {
        select: {
          mcid: true,
          uuid: true,
        },
      },
    },
  });

  // Aggregate statistics with user information
  const dpiMap = new Map<string, number>();
  const dpiUsersMap = new Map<string, Array<{ mcid: string; uuid: string }>>();
  const sensitivityMap = new Map<string, number>();
  const sensitivityUsersMap = new Map<string, Array<{ mcid: string; uuid: string }>>();
  const cm180Map = new Map<string, number>();
  const cm180UsersMap = new Map<string, Array<{ mcid: string; uuid: string }>>();
  const cm180LogMap = new Map<string, number>();
  const cm180LogUsersMap = new Map<string, Array<{ mcid: string; uuid: string }>>();
  const cursorSpeedMap = new Map<string, number>();
  const cursorSpeedUsersMap = new Map<string, Array<{ mcid: string; uuid: string }>>();

  settings.forEach((setting: any) => {
    const userInfo = { mcid: setting.user.mcid, uuid: setting.user.uuid };

    // DPI - group by ranges (細分化: 3200以上を分割)
    if (setting.mouseDpi !== null) {
      const dpi = setting.mouseDpi;
      let dpiRange: string;
      if (dpi < 400) {
        dpiRange = '< 400';
      } else if (dpi < 800) {
        dpiRange = '400-799';
      } else if (dpi < 1200) {
        dpiRange = '800-1199';
      } else if (dpi < 1600) {
        dpiRange = '1200-1599';
      } else if (dpi < 2000) {
        dpiRange = '1600-1999';
      } else if (dpi < 2400) {
        dpiRange = '2000-2399';
      } else if (dpi < 3200) {
        dpiRange = '2400-3199';
      } else if (dpi < 4800) {
        dpiRange = '3200-4799';
      } else if (dpi < 6400) {
        dpiRange = '4800-6399';
      } else if (dpi < 12800) {
        dpiRange = '6400-12799';
      } else {
        dpiRange = '≥ 12800';
      }
      dpiMap.set(dpiRange, (dpiMap.get(dpiRange) || 0) + 1);
      const users = dpiUsersMap.get(dpiRange) || [];
      users.push(userInfo);
      dpiUsersMap.set(dpiRange, users);
    }

    // Sensitivity - group by ranges (細分化: 20%未満を分割)
    if (setting.gameSensitivity !== null) {
      const sensitivity = setting.gameSensitivity * 100;
      let sensitivityRange: string;
      if (sensitivity < 5) {
        sensitivityRange = '< 5%';
      } else if (sensitivity < 10) {
        sensitivityRange = '5-9%';
      } else if (sensitivity < 15) {
        sensitivityRange = '10-14%';
      } else if (sensitivity < 20) {
        sensitivityRange = '15-19%';
      } else if (sensitivity < 40) {
        sensitivityRange = '20-39%';
      } else if (sensitivity < 60) {
        sensitivityRange = '40-59%';
      } else if (sensitivity < 80) {
        sensitivityRange = '60-79%';
      } else if (sensitivity < 100) {
        sensitivityRange = '80-99%';
      } else {
        sensitivityRange = '100%';
      }
      sensitivityMap.set(sensitivityRange, (sensitivityMap.get(sensitivityRange) || 0) + 1);
      const users = sensitivityUsersMap.get(sensitivityRange) || [];
      users.push(userInfo);
      sensitivityUsersMap.set(sensitivityRange, users);
    }

    // cm360 - group by ranges (DBのcm360は実際にはcm/180の値が入っている)
    if (setting.cm360 !== null) {
      const cm180 = setting.cm360; // cm360という名前だが、実際はcm/180の値

      // Linear scale
      let cm180Range: string;
      if (cm180 < 5) {
        cm180Range = '< 5 cm';
      } else if (cm180 < 10) {
        cm180Range = '5-9 cm';
      } else if (cm180 < 15) {
        cm180Range = '10-14 cm';
      } else if (cm180 < 20) {
        cm180Range = '15-19 cm';
      } else if (cm180 < 25) {
        cm180Range = '20-24 cm';
      } else if (cm180 < 30) {
        cm180Range = '25-29 cm';
      } else if (cm180 < 35) {
        cm180Range = '30-34 cm';
      } else if (cm180 < 40) {
        cm180Range = '35-39 cm';
      } else if (cm180 < 45) {
        cm180Range = '40-44 cm';
      } else if (cm180 < 50) {
        cm180Range = '45-49 cm';
      } else if (cm180 < 60) {
        cm180Range = '50-59 cm';
      } else if (cm180 < 70) {
        cm180Range = '60-69 cm';
      } else {
        cm180Range = '≥ 70 cm';
      }
      cm180Map.set(cm180Range, (cm180Map.get(cm180Range) || 0) + 1);
      const cm180Users = cm180UsersMap.get(cm180Range) || [];
      cm180Users.push(userInfo);
      cm180UsersMap.set(cm180Range, cm180Users);

      // Logarithmic scale - 対数スケール
      let cm180LogRange: string;
      if (cm180 < 5) {
        cm180LogRange = '< 5 cm';
      } else if (cm180 < 7.5) {
        cm180LogRange = '5-7.5 cm';
      } else if (cm180 < 10) {
        cm180LogRange = '7.5-10 cm';
      } else if (cm180 < 15) {
        cm180LogRange = '10-15 cm';
      } else if (cm180 < 20) {
        cm180LogRange = '15-20 cm';
      } else if (cm180 < 30) {
        cm180LogRange = '20-30 cm';
      } else if (cm180 < 40) {
        cm180LogRange = '30-40 cm';
      } else if (cm180 < 60) {
        cm180LogRange = '40-60 cm';
      } else if (cm180 < 80) {
        cm180LogRange = '60-80 cm';
      } else if (cm180 < 100) {
        cm180LogRange = '80-100 cm';
      } else {
        cm180LogRange = '≥ 100 cm';
      }
      cm180LogMap.set(cm180LogRange, (cm180LogMap.get(cm180LogRange) || 0) + 1);
      const cm180LogUsers = cm180LogUsersMap.get(cm180LogRange) || [];
      cm180LogUsers.push(userInfo);
      cm180LogUsersMap.set(cm180LogRange, cm180LogUsers);
    }

    // Cursor speed - exact values
    if (setting.windowsSpeed !== null) {
      const speed = setting.windowsSpeed.toString();
      cursorSpeedMap.set(speed, (cursorSpeedMap.get(speed) || 0) + 1);
      const users = cursorSpeedUsersMap.get(speed) || [];
      users.push(userInfo);
      cursorSpeedUsersMap.set(speed, users);
    }
  });

  // 値の順で並べるため、順序を定義
  const dpiOrder = ['< 400', '400-799', '800-1199', '1200-1599', '1600-1999', '2000-2399', '2400-3199', '3200-4799', '4800-6399', '6400-12799', '≥ 12800'];
  const sensitivityOrder = ['< 5%', '5-9%', '10-14%', '15-19%', '20-39%', '40-59%', '60-79%', '80-99%', '100%'];
  const cm180Order = ['< 5 cm', '5-9 cm', '10-14 cm', '15-19 cm', '20-24 cm', '25-29 cm', '30-34 cm', '35-39 cm', '40-44 cm', '45-49 cm', '50-59 cm', '60-69 cm', '≥ 70 cm'];
  const cm180LogOrder = ['< 5 cm', '5-7.5 cm', '7.5-10 cm', '10-15 cm', '15-20 cm', '20-30 cm', '30-40 cm', '40-60 cm', '60-80 cm', '80-100 cm', '≥ 100 cm'];

  // 順序を保持した配列として返す（ユーザー情報も含める）
  const stats = {
    dpi: dpiOrder.map(range => ({
      label: range,
      value: dpiMap.get(range) || 0,
      users: dpiUsersMap.get(range) || []
    })).filter(item => item.value > 0),
    sensitivity: sensitivityOrder.map(range => ({
      label: range,
      value: sensitivityMap.get(range) || 0,
      users: sensitivityUsersMap.get(range) || []
    })).filter(item => item.value > 0),
    cm180: cm180Order.map(range => ({
      label: range,
      value: cm180Map.get(range) || 0,
      users: cm180UsersMap.get(range) || []
    })).filter(item => item.value > 0),
    cm180Log: cm180LogOrder.map(range => ({
      label: range,
      value: cm180LogMap.get(range) || 0,
      users: cm180LogUsersMap.get(range) || []
    })).filter(item => item.value > 0),
    cursorSpeed: Array.from(cursorSpeedMap.entries())
      .map(([label, value]) => ({ label, value: Number(label), users: cursorSpeedUsersMap.get(label) || [] }))
      .sort((a, b) => a.value - b.value)
      .map(item => ({ label: item.label, value: cursorSpeedMap.get(item.label) || 0, users: item.users })),
  };

  return (
    <div className="pb-6">
      <MouseStatsDisplay stats={stats} />
    </div>
  );
}

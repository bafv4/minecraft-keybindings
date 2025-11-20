/**
 * プレイヤーデータの取得と変換ユーティリティ
 * 正規化されたデータベーススキーマから表示用の形式に変換
 */

import { prisma } from './db';
import { normalizeKeyCode } from './keyConversion';
import type { PlayerSettings, CustomKey } from '@/types/player';

/**
 * Keybinding配列をフラットオブジェクトに変換
 */
export function convertKeybindingsToObject(
  keybindings: Array<{ action: string; keyCode: string }>
): Record<string, string> {
  return keybindings.reduce((acc, kb) => {
    acc[kb.action] = kb.keyCode;
    return acc;
  }, {} as Record<string, string>);
}

/**
 * CustomKey配列を表示用形式に変換
 */
export function convertCustomKeys(
  customKeys: Array<{ keyCode: string; keyName: string; category: string }>
): CustomKey[] {
  return customKeys.map(ck => ({
    id: ck.keyCode,
    label: ck.keyName,
    keyCode: ck.keyCode
  }));
}

/**
 * KeyRemap配列をフラットオブジェクトに変換
 * キーコードはWeb標準形式に正規化される
 */
export function convertKeyRemaps(
  keyRemaps: Array<{ sourceKey: string; targetKey: string | null }>
): Record<string, string> {
  return keyRemaps.reduce((acc, remap) => {
    if (remap.targetKey !== null) {
      // キーコードをWeb標準形式に正規化（Minecraft形式の既存データにも対応）
      const normalizedKey = normalizeKeyCode(remap.sourceKey);
      acc[normalizedKey] = remap.targetKey;
    }
    return acc;
  }, {} as Record<string, string>);
}

/**
 * ExternalTool配列をフラットオブジェクトに変換
 * キーコードはWeb標準形式に正規化される
 */
export function convertExternalTools(
  externalTools: Array<{ triggerKey: string; actionName: string }>
): Record<string, string> {
  return externalTools.reduce((acc, tool) => {
    // キーコードをWeb標準形式に正規化（Minecraft形式の既存データにも対応）
    const normalizedKey = normalizeKeyCode(tool.triggerKey);
    acc[normalizedKey] = tool.actionName;
    return acc;
  }, {} as Record<string, string>);
}

/**
 * プレイヤーの完全なデータを取得（正規化スキーマから表示用に変換）
 */
export async function getPlayerData(mcid: string) {
  const user = await prisma.user.findUnique({
    where: { mcid },
    include: {
      config: true,
      keybindings: true,
      customKeys: true,
      keyRemaps: true,
      externalTools: true,
      itemLayouts: {
        orderBy: { segment: 'asc' },
      },
    },
  });

  if (!user || !user.config) {
    return null;
  }

  // Keybindingsを変換してsettingsにマージ
  const keybindingsMap = convertKeybindingsToObject(user.keybindings);
  const mergedSettings = {
    ...user.config,
    ...keybindingsMap
  } as PlayerSettings & Record<string, any>;

  // CustomKeys, KeyRemaps, ExternalToolsを変換
  const customKeysData = convertCustomKeys(user.customKeys);
  const remappingsData = convertKeyRemaps(user.keyRemaps);
  const externalToolsData = convertExternalTools(user.externalTools);

  return {
    user: {
      uuid: user.uuid,
      mcid: user.mcid,
      displayName: user.displayName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    settings: mergedSettings,
    // 変換済みのデータ（APIレスポンス用）
    customKeys: customKeysData,
    remappings: remappingsData,
    externalTools: externalToolsData,
    // 元のデータベースレコード（コンポーネントに渡す用）
    rawKeybindings: user.keybindings,
    rawCustomKeys: user.customKeys,
    rawKeyRemaps: user.keyRemaps,
    rawExternalTools: user.externalTools,
    itemLayouts: user.itemLayouts,
  };
}

/**
 * 全プレイヤーのリストを取得（設定があるユーザーのみ）
 */
export async function getPlayersList() {
  const users = await prisma.user.findMany({
    where: {
      config: { isNot: null },
    },
    select: {
      uuid: true,
      mcid: true,
      displayName: true,
      createdAt: true,
      updatedAt: true,
      config: {
        select: {
          gameSensitivity: true,
          cm360: true,
        },
      },
      keybindings: {
        select: {
          action: true,
          keyCode: true,
        },
      },
    },
  });

  return users.map((user: any) => {
    const keybindingsMap = convertKeybindingsToObject(user.keybindings);
    const settings = user.config ? { ...user.config, ...keybindingsMap } : null;

    return {
      uuid: user.uuid,
      mcid: user.mcid,
      displayName: user.displayName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      settings,
    };
  });
}

/**
 * 統計用のマウス設定データを取得
 */
export async function getMouseStatsData() {
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

  return settings;
}

/**
 * キーボード統計用のデータを取得
 * 少なくとも1つのキーバインドを設定しているユーザーのみを返す
 */
export async function getKeyboardStatsData() {
  const users = await prisma.user.findMany({
    where: {
      config: { isNot: null },
      keybindings: {
        some: {},  // 少なくとも1つのkeybindingレコードが存在する
      },
    },
    select: {
      uuid: true,
      mcid: true,
      displayName: true,
      config: {
        select: {
          keyboardModel: true,
          keyboardLayout: true,
          gameLanguage: true,
        },
      },
      keybindings: {
        select: {
          action: true,
          keyCode: true,
        },
      },
      keyRemaps: {
        select: {
          sourceKey: true,
          targetKey: true,
        },
      },
    },
  });

  return users.map((user: any) => {
    const keybindingsMap = convertKeybindingsToObject(user.keybindings);
    const settings = user.config ? { ...user.config, ...keybindingsMap } : null;

    return {
      uuid: user.uuid,
      mcid: user.mcid,
      displayName: user.displayName,
      settings,
      keyRemaps: user.keyRemaps,
    };
  });
}

/**
 * マウス統計用のデータを取得
 */
export async function getMousePageData() {
  const users = await prisma.user.findMany({
    where: {
      config: { isNot: null },
    },
    select: {
      uuid: true,
      mcid: true,
      displayName: true,
      config: {
        select: {
          mouseModel: true,
          mouseDpi: true,
          gameSensitivity: true,
          cm360: true,
          windowsSpeed: true,
          mouseAcceleration: true,
          rawInput: true,
        },
      },
      keybindings: {
        select: {
          action: true,
          keyCode: true,
        },
      },
    },
  });

  return users.map((user: any) => {
    const keybindingsMap = convertKeybindingsToObject(user.keybindings);
    const settings = user.config ? { ...user.config, ...keybindingsMap } : null;

    return {
      uuid: user.uuid,
      mcid: user.mcid,
      displayName: user.displayName,
      settings,
    };
  });
}

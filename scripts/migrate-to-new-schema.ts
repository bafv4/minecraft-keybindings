/**
 * 旧スキーマ → 新スキーマへのデータ移行スクリプト
 *
 * 使い方:
 * - stg環境テスト: tsx scripts/migrate-to-new-schema.ts --source=$OLD_DB --target=$STG_DB
 * - 本番移行: tsx scripts/migrate-to-new-schema.ts --production
 */

import { PrismaClient } from '@prisma/client';
import { minecraftToWeb } from '../lib/keyConversion';
import { getActionCategory } from '../types/keybinding';

// コマンドライン引数解析
const args = process.argv.slice(2);
const sourceUrl = args.find(arg => arg.startsWith('--source='))?.split('=')[1];
const targetUrl = args.find(arg => arg.startsWith('--target='))?.split('=')[1];
const isProduction = args.includes('--production');
const dryRun = args.includes('--dry-run');

// データベース接続設定
const oldDbUrl = sourceUrl || process.env.OLD_DATABASE_URL || process.env.DATABASE_URL;
const newDbUrl = targetUrl || process.env.NEW_DATABASE_URL || process.env.DATABASE_URL;

if (!oldDbUrl || !newDbUrl) {
  console.error('❌ エラー: データベースURLが指定されていません');
  console.error('使い方: tsx scripts/migrate-to-new-schema.ts --source=OLD_URL --target=NEW_URL');
  process.exit(1);
}

console.log('🔄 データ移行を開始します...\n');
console.log(`📊 モード: ${isProduction ? '本番環境' : 'テスト環境'}`);
console.log(`🔍 ドライラン: ${dryRun ? 'はい（実際の書き込みなし）' : 'いいえ'}`);
console.log(`📥 旧DB: ${oldDbUrl.replace(/\/\/.*@/, '//***@')}`);
console.log(`📤 新DB: ${newDbUrl.replace(/\/\/.*@/, '//***@')}\n`);

// Prismaクライアント初期化
// 注: 旧DBは旧スキーマ形式だが、Prisma Clientは新スキーマの型を持つため、
// 旧DBからのデータ取得時は any 型として扱う
const oldPrisma = new PrismaClient({
  datasources: { db: { url: oldDbUrl } },
});

const newPrisma = new PrismaClient({
  datasources: { db: { url: newDbUrl } },
});

/**
 * 旧スキーマのキーフィールド定義
 */
const KEY_FIELDS = [
  // 移動
  { field: 'forward', action: 'forward' },
  { field: 'back', action: 'back' },
  { field: 'left', action: 'left' },
  { field: 'right', action: 'right' },
  { field: 'jump', action: 'jump' },
  { field: 'sneak', action: 'sneak' },
  { field: 'sprint', action: 'sprint' },
  // 戦闘
  { field: 'attack', action: 'attack' },
  { field: 'use', action: 'use' },
  { field: 'pickBlock', action: 'pickBlock' },
  { field: 'drop', action: 'drop' },
  // インベントリ
  { field: 'inventory', action: 'inventory' },
  { field: 'swapHands', action: 'swapHands' },
  { field: 'hotbar1', action: 'hotbar1' },
  { field: 'hotbar2', action: 'hotbar2' },
  { field: 'hotbar3', action: 'hotbar3' },
  { field: 'hotbar4', action: 'hotbar4' },
  { field: 'hotbar5', action: 'hotbar5' },
  { field: 'hotbar6', action: 'hotbar6' },
  { field: 'hotbar7', action: 'hotbar7' },
  { field: 'hotbar8', action: 'hotbar8' },
  { field: 'hotbar9', action: 'hotbar9' },
  // UI
  { field: 'togglePerspective', action: 'togglePerspective' },
  { field: 'fullscreen', action: 'fullscreen' },
  { field: 'chat', action: 'chat' },
  { field: 'command', action: 'command' },
  { field: 'toggleHud', action: 'toggleHud' },
];

/**
 * 統計情報
 */
interface MigrationStats {
  totalUsers: number;
  migratedUsers: number;
  totalKeybindings: number;
  totalRemaps: number;
  totalExternalTools: number;
  errors: Array<{ uuid: string; error: string }>;
}

const stats: MigrationStats = {
  totalUsers: 0,
  migratedUsers: 0,
  totalKeybindings: 0,
  totalRemaps: 0,
  totalExternalTools: 0,
  errors: [],
};

/**
 * メイン移行処理
 */
async function migrate() {
  try {
    console.log('📦 旧データベースから全ユーザーを取得中...');

    // 旧DBから全ユーザー取得
    const oldUsers = await oldPrisma.user.findMany({
      include: {
        settings: true,
        itemLayouts: true,
      },
    });

    stats.totalUsers = oldUsers.length;
    console.log(`✅ ${stats.totalUsers}人のユーザーを取得しました\n`);

    if (stats.totalUsers === 0) {
      console.log('⚠️  移行するデータがありません');
      return;
    }

    // 確認プロンプト（本番環境の場合）
    if (isProduction && !dryRun) {
      console.log('⚠️  本番環境への移行を実行します。よろしいですか？');
      console.log('   続行するには CTRL+C で中断してください（10秒待機）...\n');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }

    // 各ユーザーのデータを移行
    for (const oldUser of oldUsers) {
      console.log(`\n👤 ユーザー: ${oldUser.mcid} (${oldUser.uuid})`);

      try {
        await migrateUser(oldUser);
        stats.migratedUsers++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`   ❌ エラー: ${errorMsg}`);
        stats.errors.push({ uuid: oldUser.uuid, error: errorMsg });
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 移行完了サマリー');
    console.log('='.repeat(60));
    console.log(`✅ 総ユーザー数: ${stats.totalUsers}`);
    console.log(`✅ 移行成功: ${stats.migratedUsers}`);
    console.log(`✅ キーバインド: ${stats.totalKeybindings}レコード`);
    console.log(`✅ キーリマップ: ${stats.totalRemaps}レコード`);
    console.log(`✅ 外部ツール: ${stats.totalExternalTools}レコード`);

    if (stats.errors.length > 0) {
      console.log(`\n❌ エラー: ${stats.errors.length}件`);
      stats.errors.forEach(({ uuid, error }) => {
        console.log(`   - ${uuid}: ${error}`);
      });
    }

    console.log('\n✨ 移行処理が完了しました！');

  } catch (error) {
    console.error('\n❌ 致命的なエラーが発生しました:', error);
    throw error;
  } finally {
    await oldPrisma.$disconnect();
    await newPrisma.$disconnect();
  }
}

/**
 * 個別ユーザーの移行
 */
async function migrateUser(oldUser: any) {
  if (dryRun) {
    console.log('   [DRY-RUN] 移行処理をシミュレート中...');
  }

  // 1. Userレコード作成
  if (!dryRun) {
    await newPrisma.user.upsert({
      where: { uuid: oldUser.uuid },
      update: {
        mcid: oldUser.mcid,
        passphrase: oldUser.passphrase,
        displayName: oldUser.displayName,
      },
      create: {
        uuid: oldUser.uuid,
        mcid: oldUser.mcid,
        passphrase: oldUser.passphrase,
        displayName: oldUser.displayName,
      },
    });
  }
  console.log('   ✓ Userレコード作成/更新');

  // 2. PlayerSettings作成
  if (oldUser.settings) {
    if (!dryRun) {
      await newPrisma.playerSettings.upsert({
        where: { uuid: oldUser.uuid },
        update: {
          keyboardLayout: oldUser.settings.keyboardLayout,
          mouseDpi: oldUser.settings.mouseDpi,
          gameSensitivity: oldUser.settings.gameSensitivity,
          windowsSpeed: oldUser.settings.windowsSpeed,
          mouseAcceleration: oldUser.settings.mouseAcceleration,
          rawInput: oldUser.settings.rawInput,
          cm360: oldUser.settings.cm360,
          gameLanguage: oldUser.settings.gameLanguage,
          mouseModel: oldUser.settings.mouseModel,
          keyboardModel: oldUser.settings.keyboardModel,
          notes: oldUser.settings.notes,
        },
        create: {
          uuid: oldUser.uuid,
          keyboardLayout: oldUser.settings.keyboardLayout,
          mouseDpi: oldUser.settings.mouseDpi,
          gameSensitivity: oldUser.settings.gameSensitivity,
          windowsSpeed: oldUser.settings.windowsSpeed,
          mouseAcceleration: oldUser.settings.mouseAcceleration,
          rawInput: oldUser.settings.rawInput,
          cm360: oldUser.settings.cm360,
          gameLanguage: oldUser.settings.gameLanguage,
          mouseModel: oldUser.settings.mouseModel,
          keyboardModel: oldUser.settings.keyboardModel,
          notes: oldUser.settings.notes,
        },
      });
    }
    console.log('   ✓ PlayerSettings作成/更新');

    // 3. Keybinding作成（25個のフィールド → レコード）
    const keybindings = [];
    const fingerAssignments = (oldUser.settings.fingerAssignments || {}) as Record<string, string | string[]>;

    for (const { field, action } of KEY_FIELDS) {
      const mcKey = oldUser.settings[field];
      if (!mcKey) continue;

      const webKey = minecraftToWeb(mcKey);
      const category = getActionCategory(action);

      // 指割り当ての取得（旧形式と新形式の両対応）
      let fingers: string[] = [];
      const fingerData = fingerAssignments[mcKey];
      if (fingerData) {
        fingers = Array.isArray(fingerData) ? fingerData : [fingerData];
      }

      keybindings.push({
        uuid: oldUser.uuid,
        action,
        keyCode: webKey,
        category,
        isCustom: false,
        fingers,
      });
    }

    // additionalSettings内のカスタムキーも処理
    const additionalSettings = oldUser.settings.additionalSettings as any;
    if (additionalSettings) {
      // reset, playerList などの追加キー
      if (additionalSettings.reset) {
        keybindings.push({
          uuid: oldUser.uuid,
          action: 'reset',
          keyCode: minecraftToWeb(additionalSettings.reset),
          category: 'custom',
          isCustom: true,
          fingers: [],
        });
      }
      if (additionalSettings.playerList) {
        keybindings.push({
          uuid: oldUser.uuid,
          action: 'playerList',
          keyCode: minecraftToWeb(additionalSettings.playerList),
          category: 'custom',
          isCustom: true,
          fingers: [],
        });
      }

      // customKeys配列の処理
      if (additionalSettings.customKeys?.keys) {
        for (const customKey of additionalSettings.customKeys.keys) {
          keybindings.push({
            uuid: oldUser.uuid,
            action: customKey.id || customKey.label,
            keyCode: minecraftToWeb(customKey.keyCode),
            category: 'custom',
            isCustom: true,
            fingers: [],
          });
        }
      }
    }

    if (!dryRun && keybindings.length > 0) {
      // 既存のキーバインドを削除してから挿入
      await newPrisma.keybinding.deleteMany({ where: { uuid: oldUser.uuid } });
      await newPrisma.keybinding.createMany({ data: keybindings });
    }
    console.log(`   ✓ Keybinding作成: ${keybindings.length}レコード`);
    stats.totalKeybindings += keybindings.length;

    // 4. KeyRemap作成（JSON → レコード）
    const remappings = (oldUser.settings.remappings || {}) as Record<string, string>;
    const remaps = Object.entries(remappings).map(([source, target]) => ({
      uuid: oldUser.uuid,
      sourceKey: minecraftToWeb(source),
      targetKey: minecraftToWeb(target),
    }));

    if (!dryRun && remaps.length > 0) {
      await newPrisma.keyRemap.deleteMany({ where: { uuid: oldUser.uuid } });
      await newPrisma.keyRemap.createMany({ data: remaps });
    }
    console.log(`   ✓ KeyRemap作成: ${remaps.length}レコード`);
    stats.totalRemaps += remaps.length;

    // 5. ExternalTool作成（JSON → レコード）
    const externalTools = [];
    const externalToolsData = oldUser.settings.externalTools as any;

    if (externalToolsData) {
      // 旧形式の解析（複数のパターンに対応）
      for (const [toolName, toolData] of Object.entries(externalToolsData)) {
        if (typeof toolData === 'object' && toolData !== null) {
          const actions = (toolData as any).actions || [];
          for (const actionData of actions) {
            externalTools.push({
              uuid: oldUser.uuid,
              triggerKey: minecraftToWeb(actionData.trigger || actionData.key),
              toolName,
              actionName: actionData.action || actionData.name,
              description: actionData.description || null,
            });
          }
        }
      }
    }

    if (!dryRun && externalTools.length > 0) {
      await newPrisma.externalTool.deleteMany({ where: { uuid: oldUser.uuid } });
      await newPrisma.externalTool.createMany({ data: externalTools });
    }
    console.log(`   ✓ ExternalTool作成: ${externalTools.length}レコード`);
    stats.totalExternalTools += externalTools.length;
  }

  // 6. ItemLayout移行（構造変更なし）
  if (oldUser.itemLayouts && oldUser.itemLayouts.length > 0) {
    if (!dryRun) {
      for (const layout of oldUser.itemLayouts) {
        await newPrisma.itemLayout.upsert({
          where: {
            uuid_segment: {
              uuid: layout.uuid,
              segment: layout.segment,
            },
          },
          update: {
            slot1: layout.slot1,
            slot2: layout.slot2,
            slot3: layout.slot3,
            slot4: layout.slot4,
            slot5: layout.slot5,
            slot6: layout.slot6,
            slot7: layout.slot7,
            slot8: layout.slot8,
            slot9: layout.slot9,
            offhand: layout.offhand,
            notes: layout.notes,
          },
          create: {
            uuid: layout.uuid,
            segment: layout.segment,
            slot1: layout.slot1,
            slot2: layout.slot2,
            slot3: layout.slot3,
            slot4: layout.slot4,
            slot5: layout.slot5,
            slot6: layout.slot6,
            slot7: layout.slot7,
            slot8: layout.slot8,
            slot9: layout.slot9,
            offhand: layout.offhand,
            notes: layout.notes,
          },
        });
      }
    }
    console.log(`   ✓ ItemLayout移行: ${oldUser.itemLayouts.length}レコード`);
  }
}

// 実行
migrate()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 移行に失敗しました:', error);
    process.exit(1);
  });

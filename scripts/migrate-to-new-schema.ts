/**
 * 旧スキーマ → 新スキーマへのデータ移行スクリプト（異なるDB間での移行対応）
 *
 * ⚠️ このスクリプトはSTG環境で実行済みです。本番環境での実行用に使用可能です。
 *
 * PlayerSettings（旧）のデータを以下に振り分けます：
 * - PlayerConfig（新）: マウス・環境設定
 * - Keybinding: キーバインド設定（27個のキーフィールド）
 * - CustomKey: カスタムキー定義（key.custom.* 形式のキー）
 * - KeyRemap: キーリマップ設定（remappings JSON）
 * - ExternalTool: 外部ツール設定（externalTools JSON）
 *
 * 使い方:
 * - 同一DB内での移行:
 *   DATABASE_URL=xxx tsx scripts/migrate-to-new-schema.ts [--dry-run]
 *
 * - 別環境間での移行（退避環境 → 本番環境）:
 *   SOURCE_DATABASE_URL=退避環境のDB接続文字列 \
 *   TARGET_DATABASE_URL=本番環境のDB接続文字列 \
 *   tsx scripts/migrate-to-new-schema.ts [--dry-run]
 */

import { PrismaClient } from '@prisma/client';
import { minecraftToWeb, minecraftToKeyName } from '../lib/keyConversion';
import { getActionCategory } from '../types/keybinding';

/**
 * カスタムキーマッピングを管理するクラス
 */
class CustomKeyMapper {
  private keyMap: Map<string, string> = new Map(); // mcKey → webKeyCode
  private keyCounter = 1;

  /**
   * Minecraftカスタムキーから Web keyCode を取得（存在しなければ作成）
   */
  getOrCreateKeyCode(mcKey: string): { keyCode: string; isNew: boolean } {
    if (this.keyMap.has(mcKey)) {
      return { keyCode: this.keyMap.get(mcKey)!, isNew: false };
    }

    // 新しいカスタムキーコードを生成
    const keyCode = `CustomKey${this.keyCounter}`;
    this.keyCounter++;
    this.keyMap.set(mcKey, keyCode);
    return { keyCode, isNew: true };
  }

  /**
   * カスタムキー名を生成（Minecraftキー名から抽出）
   */
  generateKeyName(mcKey: string): string {
    // key.custom.mouse.button4 → "Mouse Button 4"
    // key.custom.keyboard.g1 → "G1"
    const parts = mcKey.replace('key.custom.', '').split('.');
    if (parts.length === 0) return mcKey;

    const category = parts[0]; // mouse or keyboard
    const keyPart = parts.slice(1).join(' ');

    if (category === 'mouse') {
      return `マウス ${keyPart.toUpperCase()}`;
    } else if (category === 'keyboard') {
      return keyPart.toUpperCase();
    }
    return mcKey;
  }

  /**
   * カスタムキーのカテゴリを判定
   */
  getCategory(mcKey: string): 'mouse' | 'keyboard' {
    if (mcKey.includes('.mouse.')) return 'mouse';
    if (mcKey.includes('.keyboard.')) return 'keyboard';
    return 'keyboard'; // デフォルト
  }

  /**
   * すべてのカスタムキー情報を取得
   */
  getAllCustomKeys(): Array<{
    mcKey: string;
    keyCode: string;
    keyName: string;
    category: 'mouse' | 'keyboard';
  }> {
    return Array.from(this.keyMap.entries()).map(([mcKey, keyCode]) => ({
      mcKey,
      keyCode,
      keyName: this.generateKeyName(mcKey),
      category: this.getCategory(mcKey),
    }));
  }
}

// コマンドライン引数解析
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// 環境変数からDB接続情報を取得
const sourceDbUrl = process.env.SOURCE_DATABASE_URL;
const targetDbUrl = process.env.TARGET_DATABASE_URL;
const singleDbUrl = process.env.DATABASE_URL;

// 接続モードを判定
let isCrossEnvironmentMigration = false;
let sourceUrl: string;
let targetUrl: string;

if (sourceDbUrl && targetDbUrl) {
  // 別環境間での移行モード
  isCrossEnvironmentMigration = true;
  sourceUrl = sourceDbUrl;
  targetUrl = targetDbUrl;
  console.log('🔄 データ移行を開始します（別環境間モード）\n');
  console.log(`📥 ソースDB（退避環境）: ${sourceUrl.replace(/\/\/.*@/, '//***@')}`);
  console.log(`📤 ターゲットDB（本番環境）: ${targetUrl.replace(/\/\/.*@/, '//***@')}\n`);
} else if (singleDbUrl) {
  // 同一DB内での移行モード（後方互換性）
  isCrossEnvironmentMigration = false;
  sourceUrl = singleDbUrl;
  targetUrl = singleDbUrl;
  console.log('🔄 データ移行を開始します（同一DB内モード）\n');
  console.log(`📊 DB: ${singleDbUrl.replace(/\/\/.*@/, '//***@')}\n`);
} else {
  console.error('❌ エラー: データベース接続情報が設定されていません');
  console.error('\n使い方:');
  console.error('  同一DB内: DATABASE_URL=xxx tsx scripts/migrate-to-new-schema.ts');
  console.error('  別環境間: SOURCE_DATABASE_URL=xxx TARGET_DATABASE_URL=yyy tsx scripts/migrate-to-new-schema.ts');
  process.exit(1);
}

console.log(`🔍 ドライラン: ${dryRun ? 'はい（実際の書き込みなし）' : 'いいえ'}\n`);

// Prismaクライアント初期化
const sourcePrisma = new PrismaClient({
  datasources: { db: { url: sourceUrl } },
});

const targetPrisma = isCrossEnvironmentMigration
  ? new PrismaClient({
      datasources: { db: { url: targetUrl } },
    })
  : sourcePrisma; // 同一DB内の場合は同じクライアントを使用

/**
 * 旧スキーマのキーフィールド定義
 */
const KEY_FIELDS = [
  { field: 'forward', action: 'forward' },
  { field: 'back', action: 'back' },
  { field: 'left', action: 'left' },
  { field: 'right', action: 'right' },
  { field: 'jump', action: 'jump' },
  { field: 'sneak', action: 'sneak' },
  { field: 'sprint', action: 'sprint' },
  { field: 'attack', action: 'attack' },
  { field: 'use', action: 'use' },
  { field: 'pickBlock', action: 'pickBlock' },
  { field: 'drop', action: 'drop' },
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
  { field: 'togglePerspective', action: 'togglePerspective' },
  { field: 'fullscreen', action: 'fullscreen' },
  { field: 'chat', action: 'chat' },
  { field: 'command', action: 'command' },
  { field: 'toggleHud', action: 'toggleHud' },
];

/**
 * 標準アクションとして扱う追加のアクション（additionalSettings から移行）
 */
const STANDARD_ADDITIONAL_ACTIONS = ['reset', 'playerList'];

/**
 * メイン移行処理
 */
async function migrate() {
  try {
    console.log('📥 旧スキーマからデータを取得中...\n');

    // PlayerSettings（旧）からすべてのユーザーデータを取得（ソースDBから）
    const oldSettings = await sourcePrisma.playerSettings.findMany({
      include: {
        user: {
          select: {
            uuid: true,
            mcid: true,
            displayName: true,
            passphrase: true, // パスフレーズも取得
          },
        },
      },
    });

    console.log(`✅ ${oldSettings.length} 件のユーザー設定を取得しました\n`);

    if (oldSettings.length === 0) {
      console.log('⚠️  移行対象のデータがありません');
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ uuid: string; error: string }> = [];

    console.log('🔄 データ変換・移行中...\n');

    for (const oldUser of oldSettings) {
      const uuid = oldUser.uuid;
      const mcid = oldUser.user.mcid;

      try {
        console.log(`  処理中: ${mcid} (${uuid})`);

        // カスタムキーマッパーを初期化
        const customKeyMapper = new CustomKeyMapper();

        // 1. PlayerConfig（新）へマウス・環境設定を移行

        // fingerAssignmentsをMinecraft形式からWeb標準形式に変換
        let convertedFingerAssignments: any = undefined;
        if (oldUser.fingerAssignments && typeof oldUser.fingerAssignments === 'object') {
          const oldFingerAssignments = oldUser.fingerAssignments as Record<string, any>;
          const newFingerAssignments: Record<string, string[]> = {};

          for (const [mcKey, fingers] of Object.entries(oldFingerAssignments)) {
            // Minecraft形式からWeb標準形式に変換
            let webKey: string;

            // key.custom.*の場合
            if (mcKey.startsWith('key.custom.')) {
              const { keyCode } = customKeyMapper.getOrCreateKeyCode(mcKey);
              webKey = keyCode;
            } else {
              webKey = minecraftToWeb(mcKey);
            }

            // 指の配列を保持
            newFingerAssignments[webKey] = Array.isArray(fingers) ? fingers : [];
          }

          convertedFingerAssignments = newFingerAssignments;
        }

        const configData = {
          uuid,
          keyboardLayout: oldUser.keyboardLayout,
          mouseDpi: oldUser.mouseDpi,
          gameSensitivity: oldUser.gameSensitivity,
          windowsSpeed: oldUser.windowsSpeed,
          mouseAcceleration: oldUser.mouseAcceleration,
          rawInput: oldUser.rawInput,
          cm360: oldUser.cm360,
          toggleSprint: null, // 手動設定が必要
          toggleSneak: null, // 手動設定が必要
          autoJump: null, // 手動設定が必要
          fingerAssignments: convertedFingerAssignments,
          gameLanguage: oldUser.gameLanguage,
          mouseModel: oldUser.mouseModel,
          keyboardModel: oldUser.keyboardModel,
          notes: oldUser.notes,
        };

        // 2. Keybinding（新）へキーバインド設定を移行
        const keybindings = [];

        // 2-1. 標準キーバインド（27個）
        for (const { field, action } of KEY_FIELDS) {
          const mcKey = (oldUser as any)[field] as string;
          if (mcKey) {
            let webKey: string;

            // key.custom.* の場合は CustomKey として登録
            if (mcKey.startsWith('key.custom.')) {
              const { keyCode } = customKeyMapper.getOrCreateKeyCode(mcKey);
              webKey = keyCode;
            } else {
              webKey = minecraftToWeb(mcKey);
            }

            keybindings.push({
              uuid,
              action,
              keyCode: webKey,
              category: getActionCategory(action),
              fingers: [], // fingerAssignments JSONから取得可能だが、今回は空配列
            });
          }
        }

        // 2-2. カスタムアクション（additionalSettings JSON）
        if (oldUser.additionalSettings && typeof oldUser.additionalSettings === 'object') {
          const additionalSettings = oldUser.additionalSettings as Record<string, string>;
          for (const [action, mcKey] of Object.entries(additionalSettings)) {
            if (mcKey && typeof mcKey === 'string') {
              let webKey: string;

              // key.custom.* の場合は CustomKey として登録
              if (mcKey.startsWith('key.custom.')) {
                const { keyCode } = customKeyMapper.getOrCreateKeyCode(mcKey);
                webKey = keyCode;
              } else {
                webKey = minecraftToWeb(mcKey);
              }

              // reset, playerList は標準アクション（ui カテゴリ）として扱う
              const category = STANDARD_ADDITIONAL_ACTIONS.includes(action)
                ? getActionCategory(action)
                : 'custom';

              keybindings.push({
                uuid,
                action,
                keyCode: webKey,
                category,
                fingers: [],
              });
            }
          }
        }

        // 2-3. CustomKey テーブル用のデータを生成
        const customKeys = customKeyMapper.getAllCustomKeys().map(ck => ({
          uuid,
          keyCode: ck.keyCode,
          keyName: ck.keyName,
          category: ck.category,
        }));

        // 3. KeyRemap（新）へリマップ設定を移行
        const keyRemaps = [];
        if (oldUser.remappings && typeof oldUser.remappings === 'object') {
          const remappings = oldUser.remappings as Record<string, string>;
          for (const [sourceKey, targetKey] of Object.entries(remappings)) {
            // ソースキー: Minecraft形式からWeb形式へ変換
            let webSourceKey: string;

            // ソースキーがkey.custom.*の場合
            if (sourceKey.startsWith('key.custom.')) {
              const { keyCode } = customKeyMapper.getOrCreateKeyCode(sourceKey);
              webSourceKey = keyCode;
            } else {
              webSourceKey = minecraftToWeb(sourceKey);
            }

            // ターゲットキー: キー名（表示名）として保存
            const targetKeyName = minecraftToKeyName(targetKey);

            keyRemaps.push({
              uuid,
              sourceKey: webSourceKey,
              targetKey: targetKeyName,
            });
          }
        }

        // 4. ExternalTool（新）へ外部ツール設定を移行
        const externalTools = [];
        if (oldUser.externalTools && typeof oldUser.externalTools === 'object') {
          const tools = oldUser.externalTools as Record<
            string,
            {
              actions?: Array<{
                trigger?: string;
                action?: string;
                description?: string;
              }>;
            }
          >;

          for (const [toolName, toolConfig] of Object.entries(tools)) {
            if (toolConfig.actions && Array.isArray(toolConfig.actions)) {
              for (const toolAction of toolConfig.actions) {
                if (toolAction.trigger && toolAction.action) {
                  let webTriggerKey: string;

                  // トリガーキーがkey.custom.*の場合
                  if (toolAction.trigger.startsWith('key.custom.')) {
                    const { keyCode } = customKeyMapper.getOrCreateKeyCode(toolAction.trigger);
                    webTriggerKey = keyCode;
                  } else {
                    webTriggerKey = minecraftToWeb(toolAction.trigger);
                  }

                  externalTools.push({
                    uuid,
                    triggerKey: webTriggerKey,
                    toolName,
                    actionName: toolAction.action,
                    description: toolAction.description || null,
                  });
                }
              }
            }
          }
        }

        if (!dryRun) {
          // 別環境間移行の場合、ターゲットDBにUserレコードを作成
          if (isCrossEnvironmentMigration) {
            await targetPrisma.user.upsert({
              where: { uuid },
              create: {
                uuid,
                mcid,
                displayName: oldUser.user.displayName,
                passphrase: oldUser.user.passphrase, // パスフレーズも移行
              },
              update: {
                mcid,
                displayName: oldUser.user.displayName,
                passphrase: oldUser.user.passphrase, // パスフレーズも更新
              },
            });
          }

          // トランザクション内で一括作成（ターゲットDBに書き込み）
          await targetPrisma.$transaction([
            // PlayerConfig を upsert
            targetPrisma.playerConfig.upsert({
              where: { uuid },
              create: configData,
              update: configData,
            }),

            // 既存の Keybinding を削除（重複回避 - 標準＋カスタムすべて）
            targetPrisma.keybinding.deleteMany({
              where: { uuid },
            }),

            // 新しい Keybinding を作成
            ...(keybindings.length > 0
              ? [targetPrisma.keybinding.createMany({ data: keybindings })]
              : []),

            // 既存の CustomKey を削除（重複回避）
            targetPrisma.customKey.deleteMany({
              where: { uuid },
            }),

            // 新しい CustomKey を作成
            ...(customKeys.length > 0
              ? [targetPrisma.customKey.createMany({ data: customKeys })]
              : []),

            // 既存の KeyRemap を削除（重複回避）
            targetPrisma.keyRemap.deleteMany({
              where: { uuid },
            }),

            // 新しい KeyRemap を作成
            ...(keyRemaps.length > 0
              ? [targetPrisma.keyRemap.createMany({ data: keyRemaps })]
              : []),

            // 既存の ExternalTool を削除（重複回避）
            targetPrisma.externalTool.deleteMany({
              where: { uuid },
            }),

            // 新しい ExternalTool を作成
            ...(externalTools.length > 0
              ? [targetPrisma.externalTool.createMany({ data: externalTools })]
              : []),
          ] as any);
        }

        const standardKeybindings = keybindings.filter(kb => kb.category !== 'custom').length;
        const customActions = keybindings.filter(kb => kb.category === 'custom').length;

        console.log(`    ✅ 移行成功`);
        console.log(`       - PlayerConfig: 1件`);
        console.log(`       - Keybinding: ${keybindings.length}件（標準:${standardKeybindings}, カスタムアクション:${customActions}）`);
        console.log(`       - CustomKey: ${customKeys.length}件`);
        console.log(`       - KeyRemap: ${keyRemaps.length}件`);
        console.log(`       - ExternalTool: ${externalTools.length}件`);

        successCount++;
      } catch (error) {
        console.error(`    ❌ エラー: ${error instanceof Error ? error.message : String(error)}`);
        errorCount++;
        errors.push({
          uuid,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 移行結果サマリー');
    console.log('='.repeat(60));
    console.log(`✅ 成功: ${successCount} 件`);
    console.log(`❌ 失敗: ${errorCount} 件`);

    if (errors.length > 0) {
      console.log('\n❌ エラー詳細:');
      for (const err of errors) {
        console.log(`  - UUID: ${err.uuid}`);
        console.log(`    エラー: ${err.error}`);
      }
    }

    if (dryRun) {
      console.log('\n⚠️  ドライランモードのため、データベースへの書き込みは行われませんでした');
    } else {
      console.log('\n✅ 移行が完了しました！');
      console.log('\n次のステップ:');
      console.log('1. DATABASE_URL=xxx tsx scripts/verify-migration.ts で検証を実行');
      console.log('2. 問題がなければ、旧 PlayerSettings テーブルの削除を検討');
    }
  } catch (error) {
    console.error('\n❌ 致命的なエラーが発生しました:');
    console.error(error);
    process.exit(1);
  } finally {
    await sourcePrisma.$disconnect();
    if (isCrossEnvironmentMigration) {
      await targetPrisma.$disconnect();
    }
  }
}

// 実行
migrate();

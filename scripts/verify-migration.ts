/**
 * データ移行検証スクリプト
 *
 * 使い方:
 * - tsx scripts/verify-migration.ts
 * - tsx scripts/verify-migration.ts --production
 */

import { PrismaClient } from '@prisma/client';
import { DEFAULT_KEYBINDINGS } from '../lib/defaultKeybindings';

// コマンドライン引数解析
const args = process.argv.slice(2);
const isProduction = args.includes('--production');

// データベース接続
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ エラー: DATABASE_URLが設定されていません');
  process.exit(1);
}

console.log('🔍 データ移行検証を開始します...\n');
console.log(`📊 モード: ${isProduction ? '本番環境' : 'テスト環境'}`);
console.log(`📤 DB: ${dbUrl.replace(/\/\/.*@/, '//***@')}\n`);

const prisma = new PrismaClient();

/**
 * 検証結果
 */
interface ValidationResult {
  totalUsers: number;
  validUsers: number;
  issues: Array<{
    uuid: string;
    mcid: string;
    type: string;
    message: string;
  }>;
}

const result: ValidationResult = {
  totalUsers: 0,
  validUsers: 0,
  issues: [],
};

/**
 * 必須アクションリスト（デフォルトキーバインド）
 */
const REQUIRED_ACTIONS = DEFAULT_KEYBINDINGS.filter(kb => !kb.isCustom).map(kb => kb.action);

/**
 * メイン検証処理
 */
async function verify() {
  try {
    console.log('📦 データベースから全ユーザーを取得中...');

    const users = await prisma.user.findMany({
      include: {
        settings: true,
        keybindings: true,
        keyRemaps: true,
        externalTools: true,
        itemLayouts: true,
      },
    });

    result.totalUsers = users.length;
    console.log(`✅ ${result.totalUsers}人のユーザーを取得しました\n`);

    if (result.totalUsers === 0) {
      console.log('⚠️  検証するデータがありません');
      return;
    }

    // 各ユーザーのデータを検証
    for (const user of users) {
      console.log(`\n👤 検証中: ${user.mcid} (${user.uuid})`);
      const userValid = await verifyUser(user);

      if (userValid) {
        result.validUsers++;
      }
    }

    // 結果表示
    console.log('\n' + '='.repeat(60));
    console.log('📊 検証結果サマリー');
    console.log('='.repeat(60));
    console.log(`✅ 総ユーザー数: ${result.totalUsers}`);
    console.log(`✅ 検証成功: ${result.validUsers}`);
    console.log(`❌ 問題検出: ${result.issues.length}件\n`);

    if (result.issues.length > 0) {
      console.log('⚠️  検出された問題:\n');
      result.issues.forEach(({ mcid, type, message }) => {
        console.log(`   [${type}] ${mcid}: ${message}`);
      });
      console.log('');
    }

    if (result.validUsers === result.totalUsers) {
      console.log('✨ すべてのデータが正常です！');
    } else {
      console.log('⚠️  一部のユーザーに問題があります。上記の詳細を確認してください。');
    }

  } catch (error) {
    console.error('\n❌ 検証中にエラーが発生しました:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * 個別ユーザーの検証
 */
async function verifyUser(user: any): Promise<boolean> {
  let isValid = true;

  // 1. PlayerSettings存在確認
  if (!user.settings) {
    result.issues.push({
      uuid: user.uuid,
      mcid: user.mcid,
      type: 'PlayerSettings',
      message: 'PlayerSettingsが存在しません',
    });
    isValid = false;
  } else {
    console.log('   ✓ PlayerSettings存在');
  }

  // 2. Keybinding数確認
  const keybindingCount = user.keybindings?.length || 0;
  console.log(`   ✓ Keybinding: ${keybindingCount}レコード`);

  if (keybindingCount === 0) {
    result.issues.push({
      uuid: user.uuid,
      mcid: user.mcid,
      type: 'Keybinding',
      message: 'キーバインドが1つも存在しません',
    });
    isValid = false;
  }

  // 3. 必須アクション存在確認
  const actions = new Set(user.keybindings?.map((kb: any) => kb.action) || []);
  const missingActions = REQUIRED_ACTIONS.filter(action => !actions.has(action));

  if (missingActions.length > 0) {
    result.issues.push({
      uuid: user.uuid,
      mcid: user.mcid,
      type: 'Keybinding',
      message: `必須アクションが不足: ${missingActions.join(', ')}`,
    });
    isValid = false;
  } else {
    console.log('   ✓ 必須アクション完備');
  }

  // 4. キーコード形式確認（Web標準形式か）
  const invalidKeyCodes = user.keybindings?.filter((kb: any) =>
    kb.keyCode.startsWith('key.')
  ) || [];

  if (invalidKeyCodes.length > 0) {
    result.issues.push({
      uuid: user.uuid,
      mcid: user.mcid,
      type: 'Keybinding',
      message: `未変換のMinecraft形式が残っています: ${invalidKeyCodes.length}件`,
    });
    isValid = false;
  } else {
    console.log('   ✓ キーコード形式正常');
  }

  // 5. KeyRemap確認
  const remapCount = user.keyRemaps?.length || 0;
  console.log(`   ✓ KeyRemap: ${remapCount}レコード`);

  const invalidRemaps = user.keyRemaps?.filter((remap: any) =>
    remap.sourceKey.startsWith('key.') || remap.targetKey.startsWith('key.')
  ) || [];

  if (invalidRemaps.length > 0) {
    result.issues.push({
      uuid: user.uuid,
      mcid: user.mcid,
      type: 'KeyRemap',
      message: `未変換のMinecraft形式が残っています: ${invalidRemaps.length}件`,
    });
    isValid = false;
  }

  // 6. ExternalTool確認
  const toolCount = user.externalTools?.length || 0;
  console.log(`   ✓ ExternalTool: ${toolCount}レコード`);

  const invalidTools = user.externalTools?.filter((tool: any) =>
    tool.triggerKey.startsWith('key.')
  ) || [];

  if (invalidTools.length > 0) {
    result.issues.push({
      uuid: user.uuid,
      mcid: user.mcid,
      type: 'ExternalTool',
      message: `未変換のMinecraft形式が残っています: ${invalidTools.length}件`,
    });
    isValid = false;
  }

  // 7. ItemLayout確認
  const layoutCount = user.itemLayouts?.length || 0;
  if (layoutCount > 0) {
    console.log(`   ✓ ItemLayout: ${layoutCount}レコード`);
  }

  // 8. 指割り当て確認
  const keybindingsWithFingers = user.keybindings?.filter((kb: any) =>
    kb.fingers && kb.fingers.length > 0
  ) || [];

  if (keybindingsWithFingers.length > 0) {
    console.log(`   ✓ 指割り当て: ${keybindingsWithFingers.length}キー`);
  }

  return isValid;
}

/**
 * 統計情報表示
 */
async function showStatistics() {
  console.log('\n' + '='.repeat(60));
  console.log('📈 データベース統計');
  console.log('='.repeat(60));

  const userCount = await prisma.user.count();
  const settingsCount = await prisma.playerSettings.count();
  const keybindingCount = await prisma.keybinding.count();
  const remapCount = await prisma.keyRemap.count();
  const toolCount = await prisma.externalTool.count();
  const layoutCount = await prisma.itemLayout.count();

  console.log(`👥 User: ${userCount}レコード`);
  console.log(`⚙️  PlayerSettings: ${settingsCount}レコード`);
  console.log(`🎮 Keybinding: ${keybindingCount}レコード`);
  console.log(`🔄 KeyRemap: ${remapCount}レコード`);
  console.log(`🛠️  ExternalTool: ${toolCount}レコード`);
  console.log(`📦 ItemLayout: ${layoutCount}レコード`);

  // 平均値計算
  if (userCount > 0) {
    console.log(`\n📊 ユーザーあたり平均:`);
    console.log(`   Keybinding: ${(keybindingCount / userCount).toFixed(1)}レコード`);
    console.log(`   KeyRemap: ${(remapCount / userCount).toFixed(1)}レコード`);
    console.log(`   ExternalTool: ${(toolCount / userCount).toFixed(1)}レコード`);
  }
}

// 実行
verify()
  .then(() => showStatistics())
  .then(() => {
    process.exit(result.issues.length === 0 ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ 検証に失敗しました:', error);
    process.exit(1);
  });

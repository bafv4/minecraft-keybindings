// @ts-nocheck - This script is deprecated as migration has been completed
/**
 * データ移行の検証スクリプト
 *
 * ⚠️ このスクリプトは既に実行済みです。PlayerSettings テーブルは削除されました。
 *
 * PlayerSettings（旧）→ 新スキーマへの移行が正しく行われたか確認します：
 * - PlayerConfig: マウス・環境設定
 * - Keybinding: キーバインド設定
 * - KeyRemap: キーリマップ設定
 * - ExternalTool: 外部ツール設定
 *
 * 使い方:
 * DATABASE_URL=xxx tsx scripts/verify-migration.ts
 */

import { PrismaClient } from '@prisma/client';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ エラー: DATABASE_URLが設定されていません');
  console.error('使い方: DATABASE_URL=xxx tsx scripts/verify-migration.ts');
  process.exit(1);
}

console.log('🔍 データ移行の検証を開始します...\n');
console.log(`📊 DB: ${dbUrl.replace(/\/\/.*@/, '//***@')}\n`);

const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } },
});

async function verify() {
  try {
    console.log('='.repeat(60));
    console.log('📊 テーブル件数の確認');
    console.log('='.repeat(60) + '\n');

    // 各テーブルの件数を取得
    const [
      userCount,
      oldSettingsCount,
      newConfigCount,
      keybindingCount,
      customKeyCount,
      keyRemapCount,
      externalToolCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.playerSettings.count(),
      prisma.playerConfig.count(),
      prisma.keybinding.count(),
      prisma.customKey.count(),
      prisma.keyRemap.count(),
      prisma.externalTool.count(),
    ]);

    console.log(`👤 User: ${userCount} 件`);
    console.log(`📦 PlayerSettings (旧): ${oldSettingsCount} 件`);
    console.log(`⚙️  PlayerConfig (新): ${newConfigCount} 件`);
    console.log(`🎮 Keybinding: ${keybindingCount} 件`);
    console.log(`🔑 CustomKey: ${customKeyCount} 件`);
    console.log(`🔄 KeyRemap: ${keyRemapCount} 件`);
    console.log(`🔧 ExternalTool: ${externalToolCount} 件`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ 整合性チェック');
    console.log('='.repeat(60) + '\n');

    const issues: string[] = [];

    // チェック1: PlayerSettings と PlayerConfig の件数が一致するか
    if (oldSettingsCount !== newConfigCount) {
      issues.push(
        `❌ PlayerSettings (${oldSettingsCount}件) と PlayerConfig (${newConfigCount}件) の件数が一致しません`
      );
    } else {
      console.log(
        `✅ PlayerSettings と PlayerConfig の件数が一致しています (${oldSettingsCount}件)`
      );
    }

    // チェック2: Keybinding の件数が妥当か
    if (newConfigCount > 0) {
      const avgKeybindingsPerUser = keybindingCount / newConfigCount;

      // 標準キーとカスタムアクションの内訳を取得
      const standardCount = await prisma.keybinding.count({
        where: { category: { not: 'custom' } },
      });
      const customActionsCount = await prisma.keybinding.count({
        where: { category: 'custom' },
      });
      const avgStandardPerUser = standardCount / newConfigCount;
      const avgCustomPerUser = customActionsCount / newConfigCount;

      if (avgKeybindingsPerUser < 15 || avgKeybindingsPerUser > 50) {
        issues.push(
          `⚠️  1ユーザーあたりの Keybinding 平均件数が異常です: ${avgKeybindingsPerUser.toFixed(1)}件`
        );
      } else {
        console.log(
          `✅ 1ユーザーあたりの Keybinding 平均件数: ${avgKeybindingsPerUser.toFixed(1)}件（標準:${avgStandardPerUser.toFixed(1)}, カスタムアクション:${avgCustomPerUser.toFixed(1)}）`
        );
      }
    }

    // チェック3: すべての PlayerConfig にユーザーが存在するか
    const allConfigs = await prisma.playerConfig.findMany({
      select: {
        uuid: true,
      },
    });

    const allUuids = new Set((await prisma.user.findMany({ select: { uuid: true } })).map(u => u.uuid));
    const configsWithoutUser = allConfigs.filter(config => !allUuids.has(config.uuid));

    if (configsWithoutUser.length > 0) {
      issues.push(
        `❌ ユーザーが存在しない PlayerConfig が ${configsWithoutUser.length}件あります`
      );
    } else {
      console.log('✅ すべての PlayerConfig にユーザーが存在します');
    }

    // チェック4: Keybinding のユニーク制約違反がないか確認
    const duplicateKeybindings = await prisma.$queryRaw<
      Array<{ uuid: string; action: string; count: bigint }>
    >`
      SELECT uuid, action, COUNT(*) as count
      FROM "Keybinding"
      GROUP BY uuid, action
      HAVING COUNT(*) > 1
    `;

    if (duplicateKeybindings.length > 0) {
      issues.push(
        `❌ 重複した Keybinding が ${duplicateKeybindings.length}件あります`
      );
      console.log('   重複詳細:');
      for (const dup of duplicateKeybindings.slice(0, 5)) {
        console.log(`     - UUID: ${dup.uuid}, action: ${dup.action}, 件数: ${dup.count}`);
      }
    } else {
      console.log('✅ Keybinding にユニーク制約違反はありません');
    }

    // チェック5: データサンプル確認
    console.log('\n' + '='.repeat(60));
    console.log('📋 データサンプル確認（最初の3ユーザー）');
    console.log('='.repeat(60) + '\n');

    const sampleUsers = await prisma.user.findMany({
      take: 3,
      include: {
        settingsLegacy: true,
        config: true,
        keybindings: true,
        customKeys: true,
        keyRemaps: true,
        externalTools: true,
      },
    });

    for (const user of sampleUsers) {
      console.log(`\n👤 ${user.mcid} (${user.uuid})`);
      console.log(
        `   - PlayerSettings (旧): ${user.settingsLegacy ? '✅ 存在' : '❌ なし'}`
      );
      console.log(`   - PlayerConfig (新): ${user.config ? '✅ 存在' : '❌ なし'}`);

      const standardKbs = user.keybindings.filter(kb => kb.category !== 'custom');
      const customActionKbs = user.keybindings.filter(kb => kb.category === 'custom');

      console.log(`   - Keybinding: ${user.keybindings.length}件（標準:${standardKbs.length}, カスタムアクション:${customActionKbs.length}）`);

      if (standardKbs.length > 0) {
        console.log(`      標準アクション（最初の3件）:`);
        for (const kb of standardKbs.slice(0, 3)) {
          console.log(`      - ${kb.action}: ${kb.keyCode} (${kb.category})`);
        }
      }

      if (customActionKbs.length > 0) {
        console.log(`      カスタムアクション（すべて）:`);
        for (const kb of customActionKbs) {
          console.log(`      - ${kb.action}: ${kb.keyCode}`);
        }
      }

      console.log(`   - CustomKey: ${user.customKeys.length}件`);
      if (user.customKeys.length > 0) {
        for (const customKey of user.customKeys) {
          console.log(`      - ${customKey.keyCode}: ${customKey.keyName} (${customKey.category})`);
        }
      }

      console.log(`   - KeyRemap: ${user.keyRemaps.length}件`);
      if (user.keyRemaps.length > 0) {
        for (const remap of user.keyRemaps) {
          console.log(`      - ${remap.sourceKey} → ${remap.targetKey}`);
        }
      }

      console.log(`   - ExternalTool: ${user.externalTools.length}件`);
      if (user.externalTools.length > 0) {
        for (const tool of user.externalTools) {
          console.log(
            `      - ${tool.toolName}: ${tool.actionName} (trigger: ${tool.triggerKey})`
          );
        }
      }
    }

    // 最終結果
    console.log('\n' + '='.repeat(60));
    console.log('🎯 検証結果サマリー');
    console.log('='.repeat(60) + '\n');

    if (issues.length === 0) {
      console.log('✅ すべてのチェックをパスしました！');
      console.log('\n移行は正常に完了しています。');
      console.log('\n次のステップ:');
      console.log('1. アプリケーションの動作確認を行う');
      console.log('2. 問題がなければ、旧 PlayerSettings テーブルの削除を検討');
      console.log(
        '   （削除前に必ずバックアップを取得してください）'
      );
    } else {
      console.log('⚠️  以下の問題が検出されました:\n');
      for (const issue of issues) {
        console.log(issue);
      }
      console.log('\n移行スクリプトを再実行するか、データを確認してください。');
    }
  } catch (error) {
    console.error('\n❌ 検証中にエラーが発生しました:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 実行
verify();

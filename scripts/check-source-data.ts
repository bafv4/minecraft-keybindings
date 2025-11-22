/**
 * ソースDBのデータ確認スクリプト
 */

import { PrismaClient } from '@prisma/client';

const sourceDbUrl = process.env.SOURCE_DATABASE_URL || process.env.DATABASE_URL;

if (!sourceDbUrl) {
  console.error('❌ エラー: SOURCE_DATABASE_URL または DATABASE_URL が設定されていません');
  console.error('使い方: SOURCE_DATABASE_URL=xxx pnpm tsx scripts/check-source-data.ts');
  process.exit(1);
}

console.log('🔍 ソースDBのデータを確認中...\n');
console.log(`📊 DB: ${sourceDbUrl.replace(/\/\/.*@/, '//***@')}\n`);

const prisma = new PrismaClient({
  datasources: { db: { url: sourceDbUrl } },
});

async function checkData() {
  try {
    // テーブル一覧を確認
    console.log('📋 PlayerSettings テーブルのレコード数を確認中...\n');

    const playerSettingsCount = await prisma.playerSettings.count();
    console.log(`✅ PlayerSettings: ${playerSettingsCount} 件\n`);

    if (playerSettingsCount === 0) {
      console.log('⚠️  PlayerSettings テーブルにデータが存在しません');
      console.log('   データが別のテーブルに移行済みか、テーブルが空の可能性があります\n');
    } else {
      // 最初の3件を表示
      const sampleData = await prisma.playerSettings.findMany({
        take: 3,
        include: {
          user: {
            select: {
              uuid: true,
              mcid: true,
              displayName: true,
            },
          },
        },
      });

      console.log('📄 サンプルデータ（最初の3件）:\n');
      for (const data of sampleData) {
        console.log(`  - UUID: ${data.uuid}`);
        console.log(`    MCID: ${data.user.mcid}`);
        console.log(`    表示名: ${data.user.displayName || '(なし)'}`);
        console.log(`    キーボードレイアウト: ${data.keyboardLayout}`);
        console.log(`    マウスDPI: ${data.mouseDpi || '(なし)'}`);
        console.log('');
      }
    }

    // 他のテーブルも確認
    console.log('📋 他のテーブルのレコード数:\n');
    const userCount = await prisma.user.count();
    const playerConfigCount = await prisma.playerConfig.count();
    const keybindingCount = await prisma.keybinding.count();

    console.log(`  User: ${userCount} 件`);
    console.log(`  PlayerConfig: ${playerConfigCount} 件`);
    console.log(`  Keybinding: ${keybindingCount} 件\n`);

    if (playerConfigCount > 0) {
      console.log('ℹ️  PlayerConfig テーブルにデータが存在します');
      console.log('   既に新スキーマへの移行が完了している可能性があります\n');
    }
  } catch (error: any) {
    if (error.code === 'P2021') {
      console.error('❌ エラー: PlayerSettings テーブルが存在しません');
      console.error('   スキーマに PlayerSettings モデルが定義されていることを確認してください\n');
    } else {
      console.error('❌ エラーが発生しました:');
      console.error(error);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();

#!/bin/bash
# ========================================
# 同一DB内でのデータ移行スクリプト
# ========================================
#
# 使い方:
#   1. .env.local に DATABASE_URL を設定しておく（推奨）
#   2. このスクリプトを実行
#
# または、環境変数を直接指定:
#   DATABASE_URL=postgresql://user:pass@host/db ./scripts/migrate-same-db.sh
# ========================================

set -e  # エラーが発生したら即座に終了

echo ""
echo "========================================"
echo "同一DB内でのデータ移行"
echo "========================================"
echo ""

# 環境変数のチェック
if [ -z "$DATABASE_URL" ]; then
    echo "[ERROR] DATABASE_URL が設定されていません"
    echo ""
    echo "以下のいずれかの方法で設定してください:"
    echo "  1. .env.local ファイルに記載する"
    echo "  2. 以下のコマンドで実行:"
    echo "     DATABASE_URL=postgresql://user:pass@host/db ./scripts/migrate-same-db.sh"
    echo ""
    exit 1
fi

# ドライランモードの確認
echo "[確認] 以下のモードで実行します:"
echo ""
read -p "ドライランモード（データベースに書き込まない）で実行しますか？ (Y/N): " MODE

if [[ "$MODE" =~ ^[Yy]$ ]]; then
    echo ""
    echo "[INFO] ドライランモードで実行します（実際の書き込みは行われません）"
    echo ""
    pnpm tsx scripts/migrate-to-new-schema.ts --dry-run
else
    echo ""
    echo "[WARNING] 本番モードで実行します！データベースに実際に書き込まれます！"
    echo ""
    read -p "本当に実行しますか？ (YES と入力してください): " CONFIRM

    if [ "$CONFIRM" = "YES" ]; then
        echo ""
        echo "[INFO] 移行を開始します..."
        echo ""
        pnpm tsx scripts/migrate-to-new-schema.ts
    else
        echo ""
        echo "[INFO] キャンセルされました"
        echo ""
        exit 0
    fi
fi

echo ""
echo "[SUCCESS] 移行が完了しました"
echo ""

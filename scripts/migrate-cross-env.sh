#!/bin/bash
# ========================================
# 別環境間でのデータ移行スクリプト
# （退避環境 → 本番環境）
# ========================================
#
# 使い方:
#   1. このスクリプトを編集して以下の環境変数を設定:
#      - SOURCE_DATABASE_URL: 退避環境のDB接続文字列
#      - TARGET_DATABASE_URL: 本番環境のDB接続文字列
#   2. スクリプトを実行
#
# または、コマンドラインから直接指定:
#   SOURCE_DATABASE_URL=postgresql://... \
#   TARGET_DATABASE_URL=postgresql://... \
#   ./scripts/migrate-cross-env.sh
# ========================================

set -e  # エラーが発生したら即座に終了

echo ""
echo "========================================"
echo "別環境間でのデータ移行"
echo "（退避環境 → 本番環境）"
echo "========================================"
echo ""

# ========================================
# 環境変数の設定（必要に応じて編集）
# ========================================

# 退避環境のDB接続文字列（ソース）
# 例: SOURCE_DATABASE_URL="postgresql://user:pass@stg-host.neon.tech/neondb?sslmode=require"
if [ -z "$SOURCE_DATABASE_URL" ]; then
    # ここに退避環境のDB接続文字列を記入してください
    # SOURCE_DATABASE_URL="postgresql://..."
    :
fi

# 本番環境のDB接続文字列（ターゲット）
# 例: TARGET_DATABASE_URL="postgresql://user:pass@prod-host.neon.tech/neondb?sslmode=require"
if [ -z "$TARGET_DATABASE_URL" ]; then
    # ここに本番環境のDB接続文字列を記入してください
    # TARGET_DATABASE_URL="postgresql://..."
    :
fi

# ========================================

# 環境変数のチェック
if [ -z "$SOURCE_DATABASE_URL" ]; then
    echo "[ERROR] SOURCE_DATABASE_URL が設定されていません"
    echo ""
    echo "このスクリプトを編集して、SOURCE_DATABASE_URL を設定してください"
    echo "または、以下のコマンドで実行:"
    echo "  SOURCE_DATABASE_URL=postgresql://... \\"
    echo "  TARGET_DATABASE_URL=postgresql://... \\"
    echo "  ./scripts/migrate-cross-env.sh"
    echo ""
    exit 1
fi

if [ -z "$TARGET_DATABASE_URL" ]; then
    echo "[ERROR] TARGET_DATABASE_URL が設定されていません"
    echo ""
    echo "このスクリプトを編集して、TARGET_DATABASE_URL を設定してください"
    echo "または、以下のコマンドで実行:"
    echo "  SOURCE_DATABASE_URL=postgresql://... \\"
    echo "  TARGET_DATABASE_URL=postgresql://... \\"
    echo "  ./scripts/migrate-cross-env.sh"
    echo ""
    exit 1
fi

# 接続情報の確認表示（パスワード部分はマスク）
echo "[INFO] 移行設定:"
echo "  ソースDB（退避環境）: ${SOURCE_DATABASE_URL//\/\/.*@/\/\/***@}"
echo "  ターゲットDB（本番環境）: ${TARGET_DATABASE_URL//\/\/.*@/\/\/***@}"
echo ""

# ドライランモードの確認
read -p "ドライランモード（データベースに書き込まない）で実行しますか？ (Y/N): " MODE

if [[ "$MODE" =~ ^[Yy]$ ]]; then
    echo ""
    echo "[INFO] ドライランモードで実行します（実際の書き込みは行われません）"
    echo ""
    pnpm tsx scripts/migrate-to-new-schema.ts --dry-run
else
    echo ""
    echo "[WARNING] 本番モードで実行します！"
    echo "[WARNING] 本番環境のデータベースに実際に書き込まれます！"
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

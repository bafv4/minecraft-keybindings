# ========================================
# 別環境間でのデータ移行スクリプト (PowerShell版)
# （退避環境 → 本番環境）
# ========================================

Write-Host ""
Write-Host "========================================"
Write-Host "別環境間でのデータ移行"
Write-Host "（退避環境 → 本番環境）"
Write-Host "========================================"
Write-Host ""

# ========================================
# 環境変数の設定
# ========================================

# 退避環境のDB接続文字列（ソース）
if (-not $env:SOURCE_DATABASE_URL) {
    $env:SOURCE_DATABASE_URL = "postgresql://neondb_owner:npg_yzE3oOLCr5FA@ep-round-fire-a16bdosl-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
}

# 本番環境のDB接続文字列（ターゲット）
if (-not $env:TARGET_DATABASE_URL) {
    $env:TARGET_DATABASE_URL = "postgresql://neondb_owner:npg_kac9E0VxvAbp@ep-lingering-firefly-a1nx9297-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
}

# ========================================

Write-Host "[INFO] 移行設定:"
Write-Host "  ソースDB: ep-spring-waterfall-a1ljmrrz (退避環境)"
Write-Host "  ターゲットDB: ep-round-fire-a16bdosl (本番環境)"
Write-Host ""

# ドライランモードの確認
$mode = Read-Host "ドライランモード（データベースに書き込まない）で実行しますか？ (Y/N)"

if ($mode -eq "Y" -or $mode -eq "y") {
    Write-Host ""
    Write-Host "[INFO] ドライランモードで実行します"
    Write-Host ""
    pnpm tsx scripts/migrate-to-new-schema.ts --dry-run
} else {
    Write-Host ""
    Write-Host "[WARNING] 本番モードで実行します！"
    Write-Host "[WARNING] 本番環境のデータベースに実際に書き込まれます！"
    Write-Host ""
    $confirm = Read-Host "本当に実行しますか？ (YES と入力してください)"

    if ($confirm -eq "YES") {
        Write-Host ""
        Write-Host "[INFO] 移行を開始します..."
        Write-Host ""
        pnpm tsx scripts/migrate-to-new-schema.ts
    } else {
        Write-Host ""
        Write-Host "[INFO] キャンセルされました"
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 0
    }
}

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] 移行に失敗しました"
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[SUCCESS] 移行が完了しました"
Write-Host ""
Read-Host "Press Enter to exit"

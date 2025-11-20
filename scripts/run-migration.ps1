# ========================================
# データ移行実行スクリプト（簡易版）
# ========================================
#
# 使い方:
#   ドライラン: powershell -File scripts/run-migration.ps1 -DryRun
#   本番実行:   powershell -File scripts/run-migration.ps1
# ========================================

param(
    [switch]$DryRun
)

# 環境変数を設定
$env:SOURCE_DATABASE_URL = "postgresql://neondb_owner:npg_yzE3oOLCr5FA@ep-spring-waterfall-a1ljmrrz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
$env:TARGET_DATABASE_URL = "postgresql://neondb_owner:npg_yzE3oOLCr5FA@ep-round-fire-a16bdosl-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

Write-Host ""
Write-Host "========================================"
Write-Host "別環境間でのデータ移行"
Write-Host "========================================"
Write-Host ""
Write-Host "ソースDB: ep-spring-waterfall-a1ljmrrz (退避環境)"
Write-Host "ターゲットDB: ep-round-fire-a16bdosl (本番環境)"
Write-Host ""

if ($DryRun) {
    Write-Host "[INFO] ドライランモードで実行します" -ForegroundColor Cyan
    Write-Host ""
    pnpm tsx scripts/migrate-to-new-schema.ts --dry-run
} else {
    Write-Host "[WARNING] 本番モードで実行します！" -ForegroundColor Yellow
    Write-Host "[WARNING] 本番環境のデータベースに実際に書き込まれます！" -ForegroundColor Yellow
    Write-Host ""

    $confirm = Read-Host "本当に実行しますか？ (YES と入力してください)"

    if ($confirm -eq "YES") {
        Write-Host ""
        Write-Host "[INFO] 移行を開始します..." -ForegroundColor Green
        Write-Host ""
        pnpm tsx scripts/migrate-to-new-schema.ts
    } else {
        Write-Host ""
        Write-Host "[INFO] キャンセルされました" -ForegroundColor Yellow
        exit 0
    }
}

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] 移行に失敗しました" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[SUCCESS] 移行が完了しました" -ForegroundColor Green
Write-Host ""

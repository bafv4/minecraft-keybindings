@echo off
setlocal enabledelayedexpansion

echo ========================================
echo デバッグ: 環境変数の確認
echo ========================================
echo.

REM 環境変数を設定
set "SOURCE_DATABASE_URL=postgresql://neondb_owner:npg_yzE3oOLCr5FA@ep-spring-waterfall-a1ljmrrz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
set "TARGET_DATABASE_URL=postgresql://neondb_owner:npg_yzE3oOLCr5FA@ep-round-fire-a16bdosl-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

echo 1. 環境変数が設定されているか確認:
if defined SOURCE_DATABASE_URL (
    echo    ✓ SOURCE_DATABASE_URL is defined
) else (
    echo    ✗ SOURCE_DATABASE_URL is NOT defined
)

if defined TARGET_DATABASE_URL (
    echo    ✓ TARGET_DATABASE_URL is defined
) else (
    echo    ✗ TARGET_DATABASE_URL is NOT defined
)
echo.

echo 2. 環境変数の内容:
echo    SOURCE_DATABASE_URL=!SOURCE_DATABASE_URL!
echo.
echo    TARGET_DATABASE_URL=!TARGET_DATABASE_URL!
echo.

echo 3. TypeScriptスクリプトを実行してみます（ドライラン）:
echo.
pnpm tsx scripts/migrate-to-new-schema.ts --dry-run

echo.
echo ========================================
echo デバッグ完了
echo ========================================
pause

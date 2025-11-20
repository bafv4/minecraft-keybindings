@echo off
setlocal enabledelayedexpansion
REM ========================================
REM ソースDBのデータ確認スクリプト
REM ========================================

echo.
echo ========================================
echo ソースDBのデータ確認
echo ========================================
echo.

REM 退避環境のDB接続文字列
if not defined SOURCE_DATABASE_URL (
    set "SOURCE_DATABASE_URL=postgresql://neondb_owner:npg_yzE3oOLCr5FA@ep-spring-waterfall-a1ljmrrz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
)

echo [INFO] 接続先: !SOURCE_DATABASE_URL:*@=***@!
echo.

pnpm tsx scripts/check-source-data.ts

echo.
pause

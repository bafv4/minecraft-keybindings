@echo off
setlocal enabledelayedexpansion
REM ========================================
REM 別環境間でのデータ移行スクリプト
REM （退避環境 → 本番環境）
REM ========================================

echo.
echo ========================================
echo 別環境間でのデータ移行
echo （退避環境 → 本番環境）
echo ========================================
echo.

REM ========================================
REM 環境変数の設定
REM 注意: URL内の & は ^& でエスケープする必要があります
REM ========================================

REM 退避環境のDB接続文字列（ソース）
if not defined SOURCE_DATABASE_URL (
    set "SOURCE_DATABASE_URL=postgresql://neondb_owner:npg_yzE3oOLCr5FA@ep-spring-waterfall-a1ljmrrz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
)

REM 本番環境のDB接続文字列（ターゲット）
if not defined TARGET_DATABASE_URL (
    set "TARGET_DATABASE_URL=postgresql://neondb_owner:npg_yzE3oOLCr5FA@ep-round-fire-a16bdosl-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
)

REM ========================================

echo [INFO] 移行設定:
echo   ソースDB: ep-spring-waterfall-a1ljmrrz (退避環境)
echo   ターゲットDB: ep-round-fire-a16bdosl (本番環境)
echo.

REM ドライランモードの確認
set /p MODE="ドライランモード（データベースに書き込まない）で実行しますか？ (Y/N): "

if /i "!MODE!"=="Y" (
    echo.
    echo [INFO] ドライランモードで実行します
    echo.
    pnpm tsx scripts/migrate-to-new-schema.ts --dry-run
) else (
    echo.
    echo [WARNING] 本番モードで実行します！
    echo [WARNING] 本番環境のデータベースに実際に書き込まれます！
    echo.
    set /p CONFIRM="本当に実行しますか？ (YES と入力してください): "

    if /i "!CONFIRM!"=="YES" (
        echo.
        echo [INFO] 移行を開始します...
        echo.
        pnpm tsx scripts/migrate-to-new-schema.ts
    ) else (
        echo.
        echo [INFO] キャンセルされました
        echo.
        pause
        exit /b 0
    )
)

if !ERRORLEVEL! neq 0 (
    echo.
    echo [ERROR] 移行に失敗しました
    echo エラーメッセージを確認してください
    echo.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] 移行が完了しました
echo.
pause

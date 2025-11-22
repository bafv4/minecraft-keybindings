@echo off
setlocal enabledelayedexpansion
REM ========================================
REM 同一DB内でのデータ移行スクリプト
REM ========================================
REM
REM 使い方:
REM   1. .env.local に DATABASE_URL を設定しておく（推奨）
REM   2. このバッチファイルを実行
REM
REM または、環境変数を直接指定:
REM   set DATABASE_URL=postgresql://user:pass@host/db
REM   migrate-same-db.bat
REM ========================================

echo.
echo ========================================
echo 同一DB内でのデータ移行
echo ========================================
echo.

REM 環境変数のチェック
if not defined DATABASE_URL (
    echo [ERROR] DATABASE_URL が設定されていません
    echo.
    echo 以下のいずれかの方法で設定してください:
    echo   1. .env.local ファイルに記載する
    echo   2. 以下のコマンドを実行してから再度このバッチを実行:
    echo      set DATABASE_URL=postgresql://user:pass@host/db
    echo.
    pause
    exit /b 1
)

REM ドライランモードの確認
echo [確認] 以下のモードで実行します:
echo.
set /p MODE="ドライランモード（データベースに書き込まない）で実行しますか？ (Y/N): "

if /i "!MODE!"=="Y" (
    echo.
    echo [INFO] ドライランモードで実行します（実際の書き込みは行われません）
    echo.
    pnpm tsx scripts/migrate-to-new-schema.ts --dry-run
) else (
    echo.
    echo [WARNING] 本番モードで実行します！データベースに実際に書き込まれます！
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
    echo.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] 移行が完了しました
echo.
pause

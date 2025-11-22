@echo off
setlocal enabledelayedexpansion

echo Testing environment variable setting...
echo.

REM Test setting SOURCE_DATABASE_URL
set "SOURCE_DATABASE_URL=postgresql://neondb_owner:npg_yzE3oOLCr5FA@ep-spring-waterfall-a1ljmrrz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

echo SOURCE_DATABASE_URL is set to:
echo !SOURCE_DATABASE_URL!
echo.

REM Test setting TARGET_DATABASE_URL
set "TARGET_DATABASE_URL=postgresql://neondb_owner:npg_yzE3oOLCr5FA@ep-round-fire-a16bdosl-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

echo TARGET_DATABASE_URL is set to:
echo !TARGET_DATABASE_URL!
echo.

echo Test completed successfully!
pause

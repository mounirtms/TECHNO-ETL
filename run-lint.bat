@echo off
title TECHNO-ETL Lint Runner

echo.
echo ********************
echo * TECHNO-ETL Lint  *
echo ********************
echo.

echo Checking for lint issues...
echo ==========================
npm run lint
echo.

echo Attempting to auto-fix lint issues...
echo ====================================
npm run lint:fix
echo.

echo Checking for remaining lint issues...
echo ===================================
npm run lint:check
echo.

echo.
echo Lint process completed!
echo Press any key to exit...
pause >nul
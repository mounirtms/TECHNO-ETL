@echo off
echo Starting TECHNO-ETL Development Server...
echo Current directory: %CD%
echo.

echo Checking Node.js version...
node --version
echo.

echo Checking npm version...
npm --version
echo.

echo Checking if package.json exists...
if exist package.json (
    echo package.json found
) else (
    echo ERROR: package.json not found
    pause
    exit /b 1
)
echo.

echo Checking if src/main.jsx exists...
if exist src\main.jsx (
    echo src/main.jsx found
) else (
    echo ERROR: src/main.jsx not found
    pause
    exit /b 1
)
echo.

echo Starting Vite development server...
npm run dev

pause

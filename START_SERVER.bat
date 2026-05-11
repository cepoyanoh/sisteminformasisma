@echo off
chcp 65001 >nul
cls
echo.
echo ========================================
echo  SISTEMINFORMASI - QUICK START
echo ========================================
echo.

echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js found
echo.

echo [2/4] Installing dependencies...
call npm install --silent
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies ready
echo.

echo [3/4] Initializing database...
node init_all_tables.js
if errorlevel 1 (
    echo [WARNING] Database initialization had issues
)
echo.

echo [4/4] Starting server...
echo.
echo ========================================
echo  Server will start on:
echo  http://localhost:3001
echo.
echo  Press Ctrl+C to stop
echo ========================================
echo.

npm start

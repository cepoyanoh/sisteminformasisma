@echo off
echo ========================================
echo SISTEMINFORMASI - Quick Fix Script
echo ========================================
echo.

echo Step 1: Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    pause
    exit /b 1
)
echo OK: Node.js found
echo.

echo Step 2: Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo OK: Dependencies installed
echo.

echo Step 3: Initializing database...
node init_all_tables.js
if errorlevel 1 (
    echo WARNING: Database initialization may have issues
)
echo.

echo Step 4: Starting server...
echo.
echo Server will start on http://localhost:3001
echo Press Ctrl+C to stop the server
echo.
npm start

pause

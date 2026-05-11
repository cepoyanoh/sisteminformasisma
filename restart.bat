@echo off
echo ========================================
echo Restarting Aplikasi Sistem Informasi
echo ========================================
echo.

echo [1/3] Menghentikan proses Node.js yang berjalan...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo     ✓ Proses Node.js dihentikan
) else (
    echo     ℹ Tidak ada proses Node.js yang berjalan
)
echo.

echo [2/3] Menunggu 2 detik...
timeout /t 2 /nobreak >nul
echo.

echo [3/3] Memulai aplikasi...
echo.
echo ========================================
echo Aplikasi sedang dimulai...
echo Akses di: http://localhost:3000
echo Tekan Ctrl+C untuk menghentikan
echo ========================================
echo.

npm start

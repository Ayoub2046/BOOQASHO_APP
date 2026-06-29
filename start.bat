@echo off
title Booqasho App Launcher
echo ===================================================
echo   BOOQASHO APP - ENTERPRISE LAUNCHER
echo ===================================================
echo.

echo [1/2] Starting Backend Server on http://localhost:5000 ...
start "Booqasho Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"

echo Waiting for backend to initialize (8 seconds)...
timeout /t 8 /nobreak >nul

echo [2/2] Starting Frontend UI on http://localhost:5173 ...
start "Booqasho Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ===================================================
echo   SUCCESS: Both services launched!
echo   Backend: http://localhost:5000
echo   Frontend: http://localhost:5173
echo.
echo   Login credentials:
echo     admin@booqasho.com / admin123
echo     marketing@booqasho.com / marketing123
echo.
echo   Close their windows to stop them.
echo ===================================================

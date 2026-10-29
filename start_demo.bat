@echo off
title Velmora E-Commerce Demo Starter
echo ==============================================================
echo    Starting Velmora E-Commerce Platform with ML Moderation
echo ==============================================================
echo.

echo 1. Starting ML Microservice on port 8001...
start "ML Service (Port 8001)" cmd /k "cd ml_service && python app.py"

timeout /t 2 /nobreak >nul

echo 2. Starting FastAPI Backend on port 8000...
start "FastAPI Backend (Port 8000)" cmd /k "cd backend && python run.py"

timeout /t 2 /nobreak >nul

echo 3. Starting React Vite Frontend on port 5173...
start "React Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo 4. Opening your browser to the storefront...
start http://localhost:5173

echo.
echo ==============================================================
echo Website is now open at http://localhost:5173 !
echo (Keep the 3 terminal windows open while running the demo)
echo ==============================================================
echo.
pause

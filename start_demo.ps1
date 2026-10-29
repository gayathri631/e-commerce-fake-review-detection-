$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "   Starting Velmora E-Commerce Platform with ML Moderation" -ForegroundColor Green
Write-Host "==============================================================" -ForegroundColor Cyan

Write-Host "`n1. Launching ML Microservice (Port 8001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\ml_service'; python app.py" -WorkingDirectory "$root\ml_service"

Start-Sleep -Seconds 2

Write-Host "2. Launching FastAPI Backend (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; python run.py" -WorkingDirectory "$root\backend"

Start-Sleep -Seconds 2

Write-Host "3. Launching React Frontend (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; npm.cmd run dev" -WorkingDirectory "$root\frontend"

Start-Sleep -Seconds 3

Write-Host "4. Opening Storefront in Browser..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"

Write-Host "`n==============================================================" -ForegroundColor Cyan
Write-Host "Velmora is live at http://localhost:5173" -ForegroundColor Green
Write-Host "Admin Portal is at http://localhost:5173/admin" -ForegroundColor Green
Write-Host "==============================================================" -ForegroundColor Cyan

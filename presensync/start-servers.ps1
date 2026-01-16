# PresenSync Server Startup Script
Write-Host "Starting PresenSync servers..." -ForegroundColor Green
Write-Host ""

# Start Backend Server
Write-Host "Starting Backend Server on port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; node src/server.js"

# Wait a bit
Start-Sleep -Seconds 2

# Start Frontend Server  
Write-Host "Starting Frontend Server on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Servers are starting in separate windows" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Check the PowerShell windows for any errors." -ForegroundColor Yellow
Write-Host "Press any key to exit this window (servers will keep running)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")


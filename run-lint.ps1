# TECHNO-ETL Lint Runner Script
Write-Host "********************" -ForegroundColor Green
Write-Host "* TECHNO-ETL Lint  *" -ForegroundColor Green
Write-Host "********************" -ForegroundColor Green
Write-Host ""

Write-Host "Checking for lint issues..." -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
npm run lint
Write-Host ""

Write-Host "Attempting to auto-fix lint issues..." -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
npm run lint:fix
Write-Host ""

Write-Host "Checking for remaining lint issues..." -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
npm run lint:check
Write-Host ""

Write-Host "Lint process completed!" -ForegroundColor Green
Write-Host "Press any key to exit..."
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
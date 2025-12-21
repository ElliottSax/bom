# Book of Mormon Study Tools - Mobile App Setup (Windows)
# Run this from PowerShell on Windows to set up React Native development

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "║     BOM Study Tools - Mobile App Setup (Windows)            ║" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check 1: Node.js
Write-Host "🔍 Checking Node.js..." -NoNewline
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion -match "v(\d+)\.") {
        $majorVersion = [int]$matches[1]
        if ($majorVersion -ge 18) {
            Write-Host " ✅ $nodeVersion" -ForegroundColor Green
        } else {
            Write-Host " ❌ Version $nodeVersion (need v18+)" -ForegroundColor Red
            Write-Host "   Download from https://nodejs.org/" -ForegroundColor Yellow
            $allGood = $false
        }
    }
} catch {
    Write-Host " ❌ Not installed" -ForegroundColor Red
    Write-Host "   Download from https://nodejs.org/" -ForegroundColor Yellow
    $allGood = $false
}

# Check 2: npm
Write-Host "🔍 Checking npm..." -NoNewline
try {
    $npmVersion = npm --version 2>$null
    Write-Host " ✅ v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host " ❌ Not found" -ForegroundColor Red
    $allGood = $false
}

# Check 3: Project directory
Write-Host "🔍 Checking project directory..." -NoNewline
$projectPath = "E:\projects\bom\apps\mobile"
if (Test-Path $projectPath) {
    Write-Host " ✅ Found" -ForegroundColor Green
} else {
    Write-Host " ❌ Not found: $projectPath" -ForegroundColor Red
    Write-Host "   Ensure project is at E:\projects\bom" -ForegroundColor Yellow
    $allGood = $false
}

# Check 4: package.json
Write-Host "🔍 Checking package.json..." -NoNewline
$packageJsonPath = "$projectPath\package.json"
if (Test-Path $packageJsonPath) {
    Write-Host " ✅ Found" -ForegroundColor Green
} else {
    Write-Host " ❌ Not found" -ForegroundColor Red
    $allGood = $false
}

# Check 5: API Server
Write-Host "🔍 Checking API server (WSL2)..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -TimeoutSec 2 -UseBasicParsing 2>$null
    if ($response.Content -match "healthy") {
        Write-Host " ✅ Running" -ForegroundColor Green
    } else {
        Write-Host " ⚠️  Unexpected response" -ForegroundColor Yellow
    }
} catch {
    Write-Host " ❌ Not running" -ForegroundColor Red
    Write-Host "   Start in WSL2: cd /mnt/e/projects/bom/services/api && python3 server-minimal.py" -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

if ($allGood) {
    Write-Host ""
    Write-Host "✅ All prerequisites met!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Install mobile dependencies:" -ForegroundColor White
    Write-Host "   cd $projectPath" -ForegroundColor Gray
    Write-Host "   npm install" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Start Metro bundler:" -ForegroundColor White
    Write-Host "   npm start" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Run on device (in a new terminal):" -ForegroundColor White
    Write-Host "   npm run android  # or npm run ios (macOS only)" -ForegroundColor Gray
    Write-Host ""

    # Offer to install automatically
    Write-Host "Would you like to install dependencies now? (Y/N): " -NoNewline -ForegroundColor Yellow
    $response = Read-Host

    if ($response -eq "Y" -or $response -eq "y") {
        Write-Host ""
        Write-Host "📦 Installing mobile dependencies..." -ForegroundColor Cyan
        Write-Host ""

        Set-Location $projectPath
        npm install

        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
            Write-Host "║                                                              ║" -ForegroundColor Green
            Write-Host "║              ✅ Mobile App Setup Complete!                  ║" -ForegroundColor Green
            Write-Host "║                                                              ║" -ForegroundColor Green
            Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
            Write-Host ""
            Write-Host "To start development:" -ForegroundColor Cyan
            Write-Host "  npm start              # Start Metro bundler" -ForegroundColor White
            Write-Host "  npm run android        # Run on Android (in new terminal)" -ForegroundColor White
            Write-Host "  npm run ios            # Run on iOS - macOS only (in new terminal)" -ForegroundColor White
            Write-Host ""
        } else {
            Write-Host ""
            Write-Host "❌ npm install failed. Check errors above." -ForegroundColor Red
            Write-Host ""
        }
    } else {
        Write-Host ""
        Write-Host "Skipping installation. Run manually when ready:" -ForegroundColor Yellow
        Write-Host "  cd $projectPath" -ForegroundColor Gray
        Write-Host "  npm install" -ForegroundColor Gray
        Write-Host ""
    }

} else {
    Write-Host ""
    Write-Host "❌ Some prerequisites are missing." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the issues above and run this script again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "See MOBILE_DEV_WSL2.md for detailed setup instructions." -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

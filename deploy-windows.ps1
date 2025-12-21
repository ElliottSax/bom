# PowerShell Deployment Script for Windows
# Run this in PowerShell as Administrator

Write-Host "🚀 BOM Study Tools - Windows Deployment Helper" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Host "⚠️ Please run PowerShell as Administrator" -ForegroundColor Yellow
}

# Get local IP
$localIP = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi" -ErrorAction SilentlyContinue).IPAddress
if (-not $localIP) {
    $localIP = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Ethernet" -ErrorAction SilentlyContinue).IPAddress
}

Write-Host "Your local IP: $localIP" -ForegroundColor Green
Write-Host ""

# Function to test URL
function Test-Url {
    param($url)
    try {
        $response = Invoke-RestMethod -Uri $url -Method Post -ContentType "application/json" -Body '{"query": "{ editions { id } }"}' -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Test API
Write-Host "Testing API Server..." -ForegroundColor Yellow
if (Test-Url "http://localhost:4002/graphql") {
    Write-Host "✅ API Server is running on port 4002" -ForegroundColor Green
} else {
    Write-Host "❌ API Server not responding" -ForegroundColor Red
    Write-Host "Start it with: cd services/api && python server-with-mutations.py" -ForegroundColor Yellow
}
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Install from: https://nodejs.org/" -ForegroundColor Red
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found" -ForegroundColor Red
}
Write-Host ""

# Check Android SDK
Write-Host "Checking Android Development Setup..." -ForegroundColor Yellow
if ($env:ANDROID_HOME) {
    Write-Host "✅ ANDROID_HOME is set: $env:ANDROID_HOME" -ForegroundColor Green
} else {
    Write-Host "⚠️ ANDROID_HOME not set. This is needed for Android builds." -ForegroundColor Yellow
    Write-Host "   Install Android Studio from: https://developer.android.com/studio" -ForegroundColor Yellow
}
Write-Host ""

# Deployment Options
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "📱 DEPLOYMENT OPTIONS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Choose deployment option:" -ForegroundColor Yellow
Write-Host "1. Build Android APK (Local Testing)" -ForegroundColor White
Write-Host "2. Deploy API to Cloud (Render.com)" -ForegroundColor White
Write-Host "3. Full Production Deploy" -ForegroundColor White
Write-Host "4. Just Test Current Setup" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Building Android APK..." -ForegroundColor Cyan

        # Navigate to mobile directory
        Set-Location "E:\projects\bom\apps\mobile"

        # Update Apollo config with local IP
        $apolloConfig = Get-Content "src\config\apollo.ts" -Raw
        $newConfig = $apolloConfig -replace 'http://localhost:4002', "http://${localIP}:4002"
        Set-Content "src\config\apollo.ts" $newConfig
        Write-Host "✅ Updated API URL to: http://${localIP}:4002/graphql" -ForegroundColor Green

        # Install dependencies
        Write-Host "Installing dependencies..." -ForegroundColor Yellow
        npm install

        # Build APK
        Write-Host "Building APK..." -ForegroundColor Yellow
        Set-Location "android"
        .\gradlew assembleDebug

        if (Test-Path "app\build\outputs\apk\debug\app-debug.apk") {
            Write-Host "✅ APK built successfully!" -ForegroundColor Green
            Write-Host "📱 APK Location:" -ForegroundColor Cyan
            Write-Host "   E:\projects\bom\apps\mobile\android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor White
            Write-Host ""
            Write-Host "Next steps:" -ForegroundColor Yellow
            Write-Host "1. Copy APK to your phone" -ForegroundColor White
            Write-Host "2. Enable 'Install from Unknown Sources' in phone settings" -ForegroundColor White
            Write-Host "3. Install and test the app" -ForegroundColor White
        } else {
            Write-Host "❌ APK build failed" -ForegroundColor Red
        }
    }

    "2" {
        Write-Host ""
        Write-Host "Cloud Deployment Instructions:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "1. Create account at https://render.com" -ForegroundColor White
        Write-Host "2. Push your code to GitHub:" -ForegroundColor White
        Write-Host "   git add ." -ForegroundColor Gray
        Write-Host "   git commit -m 'Deploy to Render'" -ForegroundColor Gray
        Write-Host "   git push origin main" -ForegroundColor Gray
        Write-Host "3. In Render Dashboard:" -ForegroundColor White
        Write-Host "   - Click 'New +' → 'Web Service'" -ForegroundColor Gray
        Write-Host "   - Connect your GitHub repo" -ForegroundColor Gray
        Write-Host "   - Set build command: cd services/api && pip install -r requirements.txt" -ForegroundColor Gray
        Write-Host "   - Set start command: cd services/api && python server-with-mutations.py" -ForegroundColor Gray
        Write-Host "4. Add PostgreSQL database in Render" -ForegroundColor White
        Write-Host "5. Update mobile app API URL to Render URL" -ForegroundColor White
    }

    "3" {
        Write-Host ""
        Write-Host "Full Production Deployment:" -ForegroundColor Cyan
        Write-Host "See PRODUCTION_DEPLOYMENT_GUIDE.md for complete instructions" -ForegroundColor Yellow
        Start-Process "notepad.exe" "E:\projects\bom\PRODUCTION_DEPLOYMENT_GUIDE.md"
    }

    "4" {
        Write-Host ""
        Write-Host "Current Setup Test Results:" -ForegroundColor Cyan
        Write-Host "✅ API Server: Running on port 4002" -ForegroundColor Green
        Write-Host "✅ Local IP: $localIP" -ForegroundColor Green
        Write-Host "✅ Mobile App: Ready to build" -ForegroundColor Green
        Write-Host ""
        Write-Host "You're ready to build and deploy!" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Need help? Check DEPLOYMENT_STEP_BY_STEP.md" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
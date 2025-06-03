# PowerShell setup script for Windows
Write-Host "🚀 Lab Hack Nexus API (Go) Setup" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Check if Go is installed
try {
    $goVersion = go version
    Write-Host "✅ Go version: $goVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Go is not installed. Please install Go 1.21 or higher" -ForegroundColor Red
    Write-Host "Visit: https://golang.org/dl/" -ForegroundColor Yellow
    exit 1
}

# Create .env if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Creating .env file from template" -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "📝 Please edit .env with your Supabase credentials" -ForegroundColor Yellow
}

# Download dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Green
go mod tidy

# Create bin directory if it doesn't exist
if (-not (Test-Path "bin")) {
    New-Item -ItemType Directory -Path "bin"
}

# Build the application
Write-Host "🔨 Building application..." -ForegroundColor Green
go build -o "bin/api-go.exe" main.go

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To run the application:"
    Write-Host "  .\bin\api-go.exe" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or use go run:"
    Write-Host "  go run main.go" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "API will be available at: http://localhost:8000"
    Write-Host "Health check: http://localhost:8000/health" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

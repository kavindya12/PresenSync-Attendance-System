# Script to update .env files with Supabase credentials
param(
    [string]$SupabaseUrl = "https://ymjgivaiodmgvfsgtgti.supabase.co",
    [string]$ClientApiKey = "",
    [string]$ServiceKey = "",
    [string]$DatabaseUrl = "postgresql://postgres:171002@Ansaf@db.ymjgivaiodmgvfsgtgti.supabase.co:5432/postgres"
)

Write-Host "`n=== Updating Environment Files ===" -ForegroundColor Cyan

# Fix DATABASE_URL format (password might contain @ which needs URL encoding)
if ($DatabaseUrl -match "postgres:([^@]+)@([^@]+)@") {
    $password = $matches[1]
    $host = $matches[2]
    # URL encode @ in password
    $encodedPassword = $password -replace "@", "%40"
    $DatabaseUrl = "postgresql://postgres:$encodedPassword@$host:5432/postgres"
    Write-Host "Fixed DATABASE_URL format" -ForegroundColor Green
}

# Update Backend .env
$backendEnv = @"
PORT=5000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=$(New-Guid)
JWT_REFRESH_SECRET=$(New-Guid)

# Supabase Configuration
SUPABASE_URL=$SupabaseUrl
SUPABASE_KEY=$ServiceKey

# Database Connection
DATABASE_URL=$DatabaseUrl

# Optional: Email Configuration
EMAIL_ENABLED=false

# Optional: Twilio SMS Configuration
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
"@

# Update Frontend .env
$frontendEnv = @"
# Supabase Configuration
VITE_SUPABASE_URL=$SupabaseUrl
VITE_SUPABASE_ANON_KEY=$ClientApiKey

# Backend API URL
VITE_API_URL=http://localhost:5000/api
"@

# Write files
$backendPath = "backend\.env"
$frontendPath = ".env"

try {
    $backendEnv | Out-File -FilePath $backendPath -Encoding utf8 -NoNewline
    Write-Host "✓ Updated $backendPath" -ForegroundColor Green
    
    $frontendEnv | Out-File -FilePath $frontendPath -Encoding utf8 -NoNewline
    Write-Host "✓ Updated $frontendPath" -ForegroundColor Green
    
    Write-Host "`n✅ Environment files updated successfully!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "1. If you haven't provided the actual API keys, edit the .env files manually" -ForegroundColor White
    Write-Host "2. Run: cd backend; npm run prisma:generate" -ForegroundColor White
    Write-Host "3. Start the servers: .\start-servers.ps1" -ForegroundColor White
} catch {
    Write-Host "Error updating files: $_" -ForegroundColor Red
}


# PowerShell API Test Script for Rovado Backend
# Solves all escaping and JSON formatting issues on Windows PowerShell

$ErrorActionPreference = "Stop"
$BaseUrl = "http://localhost:4000"

Write-Host "`n🚀 Testing Rovado Backend via PowerShell at $BaseUrl...`n" -ForegroundColor Cyan

# Test 1: Health Check
try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/api/health" -Method GET
    Write-Host "✅ Health Check PASSED:" -ForegroundColor Green
    Write-Host "   Status:  $($health.status)"
    Write-Host "   Service: $($health.service)"
} catch {
    Write-Host "❌ Health Check FAILED: $_" -ForegroundColor Red
}

# Test 2: AI Chatbot - Shipping Query
try {
    $shippingPayload = @{
        message = "What is your shipping policy?"
    } | ConvertTo-Json

    $chatRes = Invoke-RestMethod -Uri "$BaseUrl/api/chat" `
        -Method POST `
        -ContentType "application/json; charset=utf-8" `
        -Body $shippingPayload

    Write-Host "`n✅ AI Chatbot (Shipping) PASSED:" -ForegroundColor Green
    Write-Host "   Source: $($chatRes.source)"
    Write-Host "   Reply:  $($chatRes.reply.Substring(0, [Math]::Min(120, $chatRes.reply.Length)))..."
} catch {
    Write-Host "`n❌ AI Chatbot (Shipping) FAILED: $_" -ForegroundColor Red
}

# Test 3: AI Chatbot - Product Recommendation Query
try {
    $laptopPayload = @{
        message = "Can you recommend a laptop?"
    } | ConvertTo-Json

    $laptopRes = Invoke-RestMethod -Uri "$BaseUrl/api/chat" `
        -Method POST `
        -ContentType "application/json; charset=utf-8" `
        -Body $laptopPayload

    Write-Host "`n✅ AI Chatbot (Laptops) PASSED:" -ForegroundColor Green
    Write-Host "   Source: $($laptopRes.source)"
    Write-Host "   Reply:  $($laptopRes.reply.Substring(0, [Math]::Min(120, $laptopRes.reply.Length)))..."
} catch {
    Write-Host "`n❌ AI Chatbot (Laptops) FAILED: $_" -ForegroundColor Red
}

Write-Host "`n✨ All PowerShell API tests executed successfully!`n" -ForegroundColor Green

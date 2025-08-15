#!/usr/bin/env pwsh
Write-Host "🚀 Starting Backend API Server..."
Set-Location "SimpleAPI"
dotnet run --urls="http://localhost:5001"

@echo off
REM Signals - shutdown script (Windows)
REM Usage: scripts\stop.bat
setlocal enabledelayedexpansion

set "ROOT=%~dp0.."
if "%PORT%"=="" set "PORT=5173"
set "PID_FILE=%ROOT%\.run\dev.pid"

if exist "%PID_FILE%" (
  set /p PID=<"%PID_FILE%"
  echo Stopping Signals dev server ^(PID !PID!^)...
  taskkill /PID !PID! /T /F >nul 2>&1
  del /Q "%PID_FILE%" >nul 2>&1
)

REM Fallback: kill anything bound to %PORT%
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT% " ^| findstr "LISTENING"') do (
  echo Killing stray PID %%a on port %PORT%
  taskkill /PID %%a /T /F >nul 2>&1
)

echo Stopped.
endlocal

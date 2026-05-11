@echo off
REM Signals - startup script (Windows)
REM Usage: scripts\start.bat
setlocal enabledelayedexpansion

set "ROOT=%~dp0.."
pushd "%ROOT%"

if "%PORT%"=="" set "PORT=5173"
set "RUN_DIR=%ROOT%\.run"
set "PID_FILE=%RUN_DIR%\dev.pid"
set "LOG_FILE=%RUN_DIR%\dev.log"

if not exist "%RUN_DIR%" mkdir "%RUN_DIR%"

REM Prereq: Node
where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js is not installed. Install Node 20+ from https://nodejs.org
  popd & exit /b 1
)

REM Already running?
if exist "%PID_FILE%" (
  set /p EXISTING_PID=<"%PID_FILE%"
  tasklist /FI "PID eq !EXISTING_PID!" 2>nul | find "!EXISTING_PID!" >nul
  if not errorlevel 1 (
    echo Signals dev server is already running ^(PID !EXISTING_PID!^).
    echo Open http://localhost:%PORT%  --  stop it with scripts\stop.bat
    popd & exit /b 2
  )
)

REM Pick package manager
set "PM="
where bun  >nul 2>&1 && set "PM=bun"
if "%PM%"=="" ( where pnpm >nul 2>&1 && set "PM=pnpm" )
if "%PM%"=="" ( where npm  >nul 2>&1 && set "PM=npm"  )
if "%PM%"=="" (
  echo ERROR: no package manager found ^(need bun, pnpm, or npm^).
  popd & exit /b 1
)

REM Install deps if missing
if not exist node_modules (
  echo Installing dependencies with %PM%...
  call %PM% install
)

REM Seed .env from .env.example on first run
if not exist .env if exist .env.example (
  copy /Y .env.example .env >nul
  echo Created .env from .env.example ^(driver=memory^).
)

echo Starting Signals on http://localhost:%PORT% ...
start "signals-dev" /B cmd /c "%PM% run dev > "%LOG_FILE%" 2>&1"

REM Capture PID of the latest node process (best effort)
for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq node.exe" /NH ^| sort /R ^| findstr /R "node.exe"') do (
  echo %%a> "%PID_FILE%"
  goto :pid_done
)
:pid_done

echo Started. Logs: %LOG_FILE%
echo Stop with: scripts\stop.bat
popd
endlocal

@echo off
REM n8n Docker Startup Script for Windows
REM Usage: start.bat

echo Starting Car Wash n8n Setup...
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo WARNING: No .env file found. Creating from .env.example...
    copy .env.example .env >nul
    echo Created .env file. Please update it with your credentials!
    echo.
    echo Edit deployment\.env and set:
    echo    - N8N_USER (default: admin^)
    echo    - N8N_PASSWORD (CHANGE THIS!^)
    echo.
    pause
)

REM Create backup directory if it doesn't exist
if not exist n8n-backups mkdir n8n-backups

echo.
echo Starting n8n container...
docker-compose up -d

echo.
echo Waiting for n8n to be ready...
timeout /t 5 /nobreak >nul

REM Check if container is running
docker ps | findstr car-wash-n8n >nul
if errorlevel 1 (
    echo ERROR: Failed to start n8n. Check logs with: docker-compose logs
    pause
    exit /b 1
)

echo.
echo SUCCESS: n8n is running!
echo.
echo Access n8n at: http://localhost:5678
echo.
echo Login credentials:
echo    Username: admin (check your .env file^)
echo    Password: (check your .env file^)
echo.
echo Useful commands:
echo    View logs:    docker-compose logs -f n8n
echo    Stop n8n:     docker-compose down
echo    Restart:      docker-compose restart
echo.
pause

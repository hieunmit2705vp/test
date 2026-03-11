@echo off
setlocal enabledelayedexpansion

:: ====================================================
:: Script build Docker images và export ra file .tar
:: Chạy: build-and-export.bat
:: ====================================================

echo ============================================
echo   DATN - Build ^& Export Docker Images
echo ============================================
echo.

:: --- Cấu hình ---
:: ⚠️ SỬA IP VPS CỦA BẠN VÀO ĐÂY (bắt buộc trước khi build!)
set VPS_IP=160.250.247.72
set API_URL=http://160.250.247.72:8080
set OUTPUT_DIR=docker-images
set BACKEND_IMAGE=datn_backend:latest
set FRONTEND_IMAGE=datn_frontend:latest

:: Tạo thư mục output
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

echo [1/4] Build Backend image...
docker build -t %BACKEND_IMAGE% ./backend_v1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Build Backend that bai!
    exit /b 1
)
echo [OK] Backend build thanh cong!
echo.

echo [2/4] Build Frontend image (API URL: %API_URL%)...
docker build -t %FRONTEND_IMAGE% ^
  --build-arg VITE_API_BASE_URL=%API_URL% ^
  ./fe_finaltest
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Build Frontend that bai!
    exit /b 1
)
echo [OK] Frontend build thanh cong!
echo.

echo [3/4] Export images ra file .tar...
docker save -o "%OUTPUT_DIR%\datn_backend.tar" %BACKEND_IMAGE%
docker save -o "%OUTPUT_DIR%\datn_frontend.tar" %FRONTEND_IMAGE%
echo [OK] Da xuat ra thu muc: %OUTPUT_DIR%\
echo.

echo [4/4] Copy cac file config vao thu muc output...
copy "docker-compose.prod.yml" "%OUTPUT_DIR%\docker-compose.yml"
copy ".env.vps" "%OUTPUT_DIR%\.env"
copy "load-and-run.sh" "%OUTPUT_DIR%\load-and-run.sh"
echo.

echo ============================================
echo   BUILD XONG! Files can copy len VPS:
echo ============================================
echo   %OUTPUT_DIR%\datn_backend.tar
echo   %OUTPUT_DIR%\datn_frontend.tar
echo   %OUTPUT_DIR%\docker-compose.yml
echo   %OUTPUT_DIR%\.env
echo.
echo   Cach copy len VPS (SCP):
echo   scp -r %OUTPUT_DIR% user@%VPS_IP%:~/datn/
echo.
echo   Roi tren VPS chay:
echo   cd ~/datn/docker-images
echo   ./load-and-run.sh
echo ============================================
pause

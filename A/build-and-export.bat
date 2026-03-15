@echo off
setlocal enabledelayedexpansion

:: ====================================================
:: Script build Docker images và export ra file .tar
:: Chạy: build-and-export.bat
:: ====================================================

echo =============================================
echo   DATN - Build ^& Export Docker Images (VPS)
echo =============================================
echo.

:: --- Cấu hình ---
set VPS_IP=160.250.247.72
set DOMAIN=mrbip.vn
set API_URL=https://api.mrbip.vn
set OUTPUT_DIR=docker-images
set BACKEND_IMAGE=cnpm_backend:latest
set FRONTEND_IMAGE=cnpm_frontend:latest

:: Tạo/chuẩn bị thư mục output
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"
del /q "%OUTPUT_DIR%\*.tar" 2>nul
del /q "%OUTPUT_DIR%\docker-compose.yml" 2>nul
del /q "%OUTPUT_DIR%\.env" 2>nul
del /q "%OUTPUT_DIR%\env.vps" 2>nul
del /q "%OUTPUT_DIR%\load-and-run.sh" 2>nul
del /q "%OUTPUT_DIR%\mrbip.vn.nginx.conf" 2>nul

echo [1/5] Build Backend image...
docker build -t %BACKEND_IMAGE% ./backend_v1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Build Backend that bai!
    exit /b 1
)
echo [OK] Backend build thanh cong!
echo.

echo [2/5] Build Frontend image (API URL: %API_URL%)...
docker build -t %FRONTEND_IMAGE% ^
  --build-arg VITE_API_BASE_URL=%API_URL% ^
  ./fe_finaltest
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Build Frontend that bai!
    exit /b 1
)
echo [OK] Frontend build thanh cong!
echo.

echo [3/5] Export images ra file .tar...
docker save -o "%OUTPUT_DIR%\cnpm_backend.tar" %BACKEND_IMAGE%
if %ERRORLEVEL% neq 0 (
  echo [ERROR] Export backend image that bai!
  exit /b 1
)
docker save -o "%OUTPUT_DIR%\cnpm_frontend.tar" %FRONTEND_IMAGE%
if %ERRORLEVEL% neq 0 (
  echo [ERROR] Export frontend image that bai!
  exit /b 1
)
echo [OK] Da xuat ra thu muc: %OUTPUT_DIR%\
echo.

echo [4/5] Copy compose + script vao thu muc output...
copy /Y "docker-compose.prod.yml" "%OUTPUT_DIR%\docker-compose.yml" >nul
if %ERRORLEVEL% neq 0 (
  echo [ERROR] Khong copy duoc docker-compose.prod.yml
  exit /b 1
)

copy /Y "load-and-run.sh" "%OUTPUT_DIR%\load-and-run.sh" >nul
if %ERRORLEVEL% neq 0 (
  echo [ERROR] Khong copy duoc load-and-run.sh
  exit /b 1
)

if exist ".env.vps" (
  copy /Y ".env.vps" "%OUTPUT_DIR%\.env" >nul
  copy /Y ".env.vps" "%OUTPUT_DIR%\env.vps" >nul
  echo [OK] Da copy .env.vps -> %OUTPUT_DIR%\.env
) else if exist ".env.example" (
  copy /Y ".env.example" "%OUTPUT_DIR%\.env" >nul
  copy /Y ".env.example" "%OUTPUT_DIR%\env.vps" >nul
  echo [WARN] Khong co .env.vps, da copy .env.example -> %OUTPUT_DIR%\.env
) else (
  echo [WARN] Khong tim thay .env.vps/.env.example. Hay tao thu cong file %OUTPUT_DIR%\.env tren VPS.
)

echo [5/5] Copy file nginx domain (neu co)...
if exist "mrbip.vn.nginx.conf" (
  copy /Y "mrbip.vn.nginx.conf" "%OUTPUT_DIR%\mrbip.vn.nginx.conf" >nul
  echo [OK] Da copy mrbip.vn.nginx.conf
) else (
  echo [WARN] Chua co mrbip.vn.nginx.conf o thu muc goc.
)
echo.

echo =============================================
echo   BUILD XONG! Files can copy len VPS:
echo =============================================
echo   %OUTPUT_DIR%\cnpm_backend.tar
echo   %OUTPUT_DIR%\cnpm_frontend.tar
echo   %OUTPUT_DIR%\docker-compose.yml
echo   %OUTPUT_DIR%\.env
echo   %OUTPUT_DIR%\env.vps
echo   %OUTPUT_DIR%\load-and-run.sh
echo   %OUTPUT_DIR%\mrbip.vn.nginx.conf
echo.
echo   Cach copy len VPS (SCP):
echo   scp -r %OUTPUT_DIR% user@%VPS_IP%:~/datn/
echo.
echo   Roi tren VPS chay:
echo   cd ~/datn/docker-images
echo   chmod +x load-and-run.sh
echo   ./load-and-run.sh
echo =============================================
pause

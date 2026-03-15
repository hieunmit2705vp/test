#!/bin/bash
# ====================================================
# Script chạy trên VPS: load Docker images và khởi động
# ====================================================

set -e

COMPOSE_CMD="docker compose"
if ! docker compose version >/dev/null 2>&1; then
	COMPOSE_CMD="docker-compose"
fi

if [ ! -f ".env" ] && [ -f "env.vps" ]; then
	echo "[INFO] Khong tim thay .env, dang tao tu env.vps..."
	cp env.vps .env
fi

echo "============================================"
echo "  DATN - Load Images & Run on VPS"
echo "============================================"

echo "[1/3] Load Backend image..."
docker load -i cnpm_backend.tar
echo "[OK] Backend loaded!"

echo "[2/3] Load Frontend image..."
docker load -i cnpm_frontend.tar
echo "[OK] Frontend loaded!"

echo "[3/3] Khoi dong containers..."
$COMPOSE_CMD up -d

if [ -f "mrbip.vn.nginx.conf" ] && command -v nginx >/dev/null 2>&1; then
	echo "[INFO] Phat hien mrbip.vn.nginx.conf, dang cai reverse proxy Nginx..."
	if command -v sudo >/dev/null 2>&1; then
		SUDO="sudo"
	else
		SUDO=""
	fi

	$SUDO cp -f mrbip.vn.nginx.conf /etc/nginx/sites-available/mrbip.vn
	$SUDO ln -sf /etc/nginx/sites-available/mrbip.vn /etc/nginx/sites-enabled/mrbip.vn
	$SUDO nginx -t
	$SUDO systemctl restart nginx
	echo "[OK] Nginx reverse proxy da duoc cap nhat"
fi

echo ""
echo "============================================"
echo "  HOAN TAT! Services dang chay:"
echo "  Frontend : https://mrbip.vn"
echo "  Backend  : https://api.mrbip.vn"
echo "============================================"

# Hien thi trang thai
$COMPOSE_CMD ps

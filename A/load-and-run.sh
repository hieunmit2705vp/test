#!/bin/bash
# ====================================================
# Script chạy trên VPS: load Docker images và khởi động
# ====================================================

set -e

echo "============================================"
echo "  DATN - Load Images & Run on VPS"
echo "============================================"

echo "[1/3] Load Backend image..."
docker load -i datn_backend.tar
echo "[OK] Backend loaded!"

echo "[2/3] Load Frontend image..."
docker load -i datn_frontend.tar
echo "[OK] Frontend loaded!"

echo "[3/3] Khoi dong containers..."
docker-compose up -d

echo ""
echo "============================================"
echo "  HOAN TAT! Services dang chay:"
echo "  Frontend : http://$(curl -s ifconfig.me)"
echo "  Backend  : http://$(curl -s ifconfig.me):8080"
echo "============================================"

# Hien thi trang thai
docker-compose ps

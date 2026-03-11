# ==============================================
# STAGE 1: Build Frontend với Node.js
# ==============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Nhận URL backend qua build argument
# Truyền khi build: --build-arg VITE_API_BASE_URL=http://your-vps-ip:8080
ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy package files để cache dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy toàn bộ source code
COPY . .

# Build production bundle (Vite sẽ đọc VITE_API_BASE_URL từ ENV)
RUN npm run build

# ==============================================
# STAGE 2: Serve file tĩnh với Nginx
# ==============================================
FROM nginx:1.27-alpine

# Copy output build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy cấu hình Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

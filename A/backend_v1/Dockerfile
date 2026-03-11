# ==============================================
# STAGE 1: Build backend với Maven
# ==============================================
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy pom.xml và tải dependencies trước (cache layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code và build
COPY src ./src
RUN mvn clean package -DskipTests -B

# ==============================================
# STAGE 2: Runtime image nhỏ gọn
# ==============================================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Tạo user không phải root để bảo mật
RUN addgroup -S spring && adduser -S spring -G spring

# Copy file JAR từ stage build
COPY --from=builder /app/target/*.jar app.jar

# Đổi quyền sở hữu
RUN chown spring:spring app.jar

USER spring

EXPOSE 8080

# Chạy với các cờ JVM tối ưu cho container
ENTRYPOINT ["java", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=70.0", \
  "-jar", "app.jar"]

# =========================
# Stage 1 - Build Angular
# =========================
FROM node:20-alpine AS frontend-build

WORKDIR /frontend

COPY view/package*.json ./

RUN npm install

COPY view/ .

RUN npm run build -- --configuration production

# Debug
RUN echo "=== Angular build ===" && \
    find dist -type f | head -50


# =========================
# Stage 2 - Build Spring
# =========================
FROM maven:3.9-eclipse-temurin-21-alpine AS backend-build

WORKDIR /app

COPY pom.xml .
COPY model ./model
COPY controller ./controller

RUN mkdir -p /app/controller/src/main/resources/static

COPY --from=frontend-build \
    /frontend/dist/view/browser/ \
    /app/controller/src/main/resources/static/

RUN set -e; \
    for attempt in 1 2 3; do \
    mvn --batch-mode --no-transfer-progress \
    -Dmaven.wagon.http.retryHandler.count=5 \
    -Djacoco.skip=true \
    -DskipTests \
    clean package && exit 0; \
    echo "Maven falhou na tentativa ${attempt}; nova tentativa em $((attempt * 10))s..."; \
    sleep $((attempt * 10)); \
    done; \
    exit 1

# Debug
RUN echo "=== Conteúdo do JAR ===" && \
    jar tf /app/controller/target/controller-0.0.1-SNAPSHOT.jar | grep static | head -50


# =========================
# Stage 3 - Runtime
# =========================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Download OpenTelemetry Java Agent
ADD https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar /app/opentelemetry-javaagent.jar

COPY --from=backend-build \
    /app/controller/target/controller-0.0.1-SNAPSHOT.jar \
    app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-javaagent:/app/opentelemetry-javaagent.jar", "-jar", "app.jar"]

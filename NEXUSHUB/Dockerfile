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

RUN mvn clean package -DskipTests

# Debug
RUN echo "=== Conteúdo do JAR ===" && \
    jar tf /app/controller/target/controller-0.0.1-SNAPSHOT.jar | grep static | head -50


# =========================
# Stage 3 - Runtime
# =========================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=backend-build \
    /app/controller/target/controller-0.0.1-SNAPSHOT.jar \
    app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

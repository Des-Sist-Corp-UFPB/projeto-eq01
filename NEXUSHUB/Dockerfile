# Stage 1: Build the Maven packages
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copiar arquivos de definição e códigos fonte
COPY pom.xml .
COPY model ./model
COPY controller ./controller

# Compilar e empacotar pulando os testes unitários para maior rapidez no build do container
RUN mvn clean package -DskipTests

# Stage 2: Rodar o jar final
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copiar o jar gerado do Stage 1
COPY --from=build /app/controller/target/controller-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

# ── Etapa 1: build con Gradle + JDK 21 ─────────────────────────────
FROM gradle:8.14-jdk21 AS build
WORKDIR /app

# Copia el proyecto y ejecuta el bootJar
COPY . .
RUN gradle bootJar --no-daemon

# ── Etapa 2: runtime liviano con solo JRE ──────────────────────────
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copia el jar armado en la etapa anterior
COPY --from=build /app/build/libs/*.jar app.jar

# Documentativo; Render igual usa la env var PORT (ya lo tenés parametrizado)
EXPOSE 9001

ENTRYPOINT ["java", "-jar", "app.jar"]
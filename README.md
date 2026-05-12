# TP-Proyecto-Scholarium (o Scholaria? Podemos ver nombres)
Repositorio del trabajo final de la materia Proyecto de Software, último cuatrimestre de la Tecnicatura en Programación Informática en la UNSAM.

## Portal Universitario Colaborativo

Plataforma colaborativa para crear portales de carreras universitarias gestionados por estudiantes. Cada carrera dentro de una universidad tiene un único portal donde se organiza información académica, materias y material de estudio, además de contar con espacios de discusión.

---

## 🛠️ Stack Tecnológico

### Backend
- **Lenguaje:** Kotlin
- **Framework:** Spring Boot 3.x
- **Persistencia:** Spring Data JPA + Hibernate
- **Base de datos:** PostgreSQL
- **Autenticación:** Spring Security + JWT
- **Build tool:** Gradle

### Frontend
- **Framework:** React 18+
- **Lenguaje:** TypeScript
- **Build tool:** Vite
- **Estilos:** Tailwind CSS
- **HTTP Client:** Axios
- **Routing:** React Router v6

### Arquitectura
- **Patrón:** Arquitectura en capas (Controller → Service → Repository)
- **API:** REST
- **Autenticación:** JWT (JSON Web Tokens) stateless

### Storage
- **Archivos:** [AWS S3 / Almacenamiento local]* 
  *(Se definirá en el Sprint 2)*

---

## 📋 Requisitos Previos

### Backend
- JDK 17 o superior
- PostgreSQL 15+
- Gradle 8+ (o usar el wrapper incluido)

### Frontend
- Node.js 18+ 
- npm o yarn

---

## 🚀 Instalación y Ejecución

### Backend

1. Clonar el repositorio:
```bash
git clone https://github.com/[tu-usuario]/[nombre-repo].git
cd [nombre-repo]/backend
```

2. Configurar PostgreSQL:
```sql
CREATE DATABASE portal_universitario;
CREATE USER portal_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE portal_universitario TO portal_user;
```

3. Configurar `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/portal_universitario
spring.datasource.username=portal_user
spring.datasource.password=tu_password
spring.jpa.hibernate.ddl-auto=update
```

4. Ejecutar la aplicación:
```bash
./gradlew bootRun
```

El backend estará disponible en `http://localhost:8080`

---

### Frontend

1. Navegar al directorio del frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno (crear archivo `.env`):

---

```mermaid
erDiagram
    USUARIO ||--o{ MEMBRESIA : tiene
    USUARIO ||--o{ SOLICITUD : crea
    USUARIO ||--o{ MATERIAL : sube
    
    PORTAL ||--o{ MEMBRESIA : tiene
    PORTAL ||--o{ SOLICITUD : recibe
    PORTAL ||--o{ CARPETA : contiene
    PORTAL ||--|| FORO : tiene_foro_general
    
    CARPETA ||--o{ CARPETA : subcarpetas
    CARPETA ||--o{ MATERIA : contiene
    
    MATERIA ||--|| FORO : tiene_foro
    MATERIA ||--o{ MATERIAL : tiene
    
    USUARIO {
        BIGINT id PK
        VARCHAR nombre
        VARCHAR email "unique"
        VARCHAR password
        TIMESTAMP fecha_registro
        BOOLEAN activo
    }
    
    PORTAL {
        BIGINT id PK
        VARCHAR universidad
        VARCHAR carrera
        VARCHAR descripcion
        TIMESTAMP fecha_registro
        BOOLEAN activo
        VARCHAR nota "universidad + carrera unique"
    }
    
    MEMBRESIA {
        BIGINT id PK
        BIGINT usuario_id FK
        BIGINT portal_id FK
        VARCHAR rol "MIEMBRO|ADMIN"
        TIMESTAMP fecha_registro
        BOOLEAN activo
        VARCHAR nota "usuario + portal unique"
    }
    
    SOLICITUD {
        BIGINT id PK
        BIGINT usuario_id FK
        BIGINT portal_id FK
        VARCHAR titulo
        VARCHAR estado "PENDIENTE|ACEPTADA|RECHAZADA"
        TEXT descripcion
        TIMESTAMP fecha_solicitud
    }
    
    CARPETA {
        STRING id PK
        VARCHAR nombre
        BIGINT portal_id FK
        STRING carpeta_padre_id FK "nullable"
        INT orden
        TIMESTAMP created_at
        TIMESTAMP updated_at
        VARCHAR regla "no autoreferencia"
    }
    
    MATERIA {
        STRING id PK
        VARCHAR nombre
        STRING carpeta_id FK
        INT orden
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    
    FORO {
        STRING id PK
        VARCHAR tipo "GENERAL|MATERIA"
        STRING materia_id FK "nullable"
        BIGINT portal_id FK
        TIMESTAMP created_at
        VARCHAR regla "general sin materia / materia con materia_id"
    }
    
    MATERIAL {
        STRING id PK
        VARCHAR nombre
        TEXT descripcion
        STRING materia_id FK
        BIGINT subido_por_id FK
        VARCHAR estado "PENDIENTE|PUBLICADO|RECHAZADO"
        VARCHAR tipo "APUNTE|PARCIAL|FINAL|PRACTICA|OTRO"
        VARCHAR archivo_url
        VARCHAR archivo_nombre
        BIGINT archivo_tamano
        VARCHAR archivo_mime_type
        TEXT motivo_rechazo "nullable"
        TIMESTAMP fecha_subida
        TIMESTAMP fecha_moderacion "nullable"
    }

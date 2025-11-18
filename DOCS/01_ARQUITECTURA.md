# 🏗️ Arquitectura Técnica - Axioma Core

## Visión General

Axioma Core es una arquitectura **monorepo** con separación clara entre backend y frontend, diseñada para escalabilidad y mantenibilidad.

## Stack Tecnológico

### Backend
- **Framework**: NestJS 10.x
- **Lenguaje**: TypeScript 5.x
- **Base de Datos**: PostgreSQL 15
- **ORM**: TypeORM 0.3.x
- **Autenticación**: JWT (Passport.js)
- **Autorización**: CASL (attribute-based)
- **Validación**: class-validator + class-transformer
- **Seguridad**: bcrypt para passwords

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript 5.x
- **Estilos**: Tailwind CSS 3.x
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

### Base de Datos
- **Motor**: PostgreSQL 15+
- **Features**: UUID, JSONB, Triggers, Soft Deletes
- **Indexación**: Optimizada para queries multi-tenant

## Estructura de Carpetas

```
axioma-core/
├── backend/                   # API NestJS
│   ├── src/
│   │   ├── auth/             # Autenticación JWT
│   │   │   ├── entities/     # RefreshToken
│   │   │   ├── strategies/   # JWT, Local
│   │   │   ├── guards/       # JwtAuthGuard
│   │   │   ├── decorators/   # @CurrentUser, @Public
│   │   │   ├── dto/          # RegisterDto, LoginDto
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.module.ts
│   │   ├── users/            # Gestión de usuarios
│   │   │   ├── entities/     # User entity
│   │   │   ├── dto/          # CreateUserDto, UpdateUserDto
│   │   │   ├── users.service.ts
│   │   │   ├── users.controller.ts
│   │   │   └── users.module.ts
│   │   ├── tenants/          # Gestión de tenants
│   │   │   ├── entities/     # Tenant entity
│   │   │   ├── dto/
│   │   │   ├── tenants.service.ts
│   │   │   ├── tenants.controller.ts
│   │   │   └── tenants.module.ts
│   │   ├── roles/            # Gestión de roles
│   │   │   ├── entities/     # Role entity
│   │   │   ├── dto/
│   │   │   ├── roles.service.ts
│   │   │   ├── roles.controller.ts
│   │   │   └── roles.module.ts
│   │   ├── permissions/      # Gestión de permisos
│   │   │   ├── entities/     # Permission entity
│   │   │   ├── dto/
│   │   │   ├── casl/         # CASL factory
│   │   │   ├── guards/       # PermissionsGuard
│   │   │   ├── decorators/   # @RequirePermission
│   │   │   ├── permissions.service.ts
│   │   │   ├── permissions.controller.ts
│   │   │   └── permissions.module.ts
│   │   ├── app.module.ts     # Módulo principal
│   │   └── main.ts           # Entry point
│   ├── .env                  # Variables de entorno
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                  # Next.js App
│   ├── src/
│   │   ├── app/              # App Router
│   │   │   ├── globals.css   # Estilos globales
│   │   │   ├── layout.tsx    # Layout raíz
│   │   │   └── page.tsx      # Home page
│   │   ├── components/       # Componentes React (TODO)
│   │   │   ├── ui/          # Componentes base
│   │   │   ├── forms/       # Formularios
│   │   │   └── layout/      # Layout components
│   │   ├── lib/             # Utilidades
│   │   │   ├── api.ts       # Cliente API Axios
│   │   │   └── utils.ts     # Helpers
│   │   └── types/           # TypeScript types (TODO)
│   ├── tailwind.config.ts   # Configuración Tailwind
│   ├── .env.local           # Variables de entorno
│   ├── package.json
│   └── tsconfig.json
│
├── database/                  # Scripts DB
│   └── schema.sql            # Schema PostgreSQL inicial
│
├── DOCS/                      # Documentación
│   ├── 00_INICIO_RAPIDO.md
│   ├── 01_ARQUITECTURA.md    # Este archivo
│   ├── 02_ROADMAP.md
│   ├── 03_API_REFERENCE.md
│   └── 04_CONTEXTO_SESION.md
│
├── package.json              # Root (concurrently)
├── README.md                 # Documentación principal
└── SETUP.md                  # Guía de instalación
```

## Modelo de Datos

### Diagrama ER

```
┌─────────────┐
│   TENANTS   │
│ id (PK)     │─┐
│ name        │ │
│ slug (UQ)   │ │
│ settings    │ │
│ is_active   │ │
└─────────────┘ │
                │
                │ 1:N
                │
        ┌───────┴──────────┐
        │                  │
        ▼                  ▼
┌─────────────┐    ┌─────────────┐
│    USERS    │    │    ROLES    │
│ id (PK)     │    │ id (PK)     │
│ tenant_id   │    │ tenant_id   │
│ email       │    │ name        │
│ password_   │    │ description │
│ first_name  │    │ is_system   │
│ last_name   │    └─────────────┘
│ is_active   │            │
│ email_      │            │
│  verified   │            │
└─────────────┘            │
        │                  │
        │   M:N           M:N
        │ (user_roles)    │
        └──────┬───────────┘
               │
               │
        ┌──────▼──────┐
        │ PERMISSIONS │
        │ id (PK)     │
        │ tenant_id   │
        │ resource    │
        │ action      │
        │ conditions  │
        └─────────────┘
```

### Relaciones Clave

1. **Tenant → Users** (1:N)
   - Un tenant tiene muchos usuarios
   - Cada usuario pertenece a un solo tenant

2. **Tenant → Roles** (1:N)
   - Un tenant tiene muchos roles
   - Roles pueden ser globales (tenant_id NULL)

3. **Tenant → Permissions** (1:N)
   - Un tenant tiene muchos permisos
   - Permisos pueden ser globales

4. **Users ↔ Roles** (M:N via user_roles)
   - Un usuario puede tener múltiples roles
   - Un rol puede ser asignado a múltiples usuarios

5. **Roles ↔ Permissions** (M:N via role_permissions)
   - Un rol puede tener múltiples permisos
   - Un permiso puede pertenecer a múltiples roles

## Flujos Principales

### 1. Autenticación

```
Usuario → Frontend
  ↓
  POST /auth/login { tenantSlug, email, password }
  ↓
Backend: AuthService
  ↓
  1. Buscar tenant por slug
  2. Buscar usuario por email + tenantId
  3. Validar password (bcrypt.compare)
  4. Generar JWT payload con roles y permisos
  5. Crear access token (15 min)
  6. Crear refresh token (7 días)
  7. Guardar refresh token en DB
  ↓
Respuesta: { accessToken, refreshToken, user }
  ↓
Frontend: Guardar en localStorage
```

### 2. Autorización (Request con Token)

```
Frontend → Axios Interceptor
  ↓
  Authorization: Bearer <accessToken>
  ↓
Backend: JwtAuthGuard
  ↓
  1. Extraer token del header
  2. Verificar firma JWT
  3. Decodificar payload
  4. Inyectar user en request
  ↓
Backend: PermissionsGuard (opcional)
  ↓
  1. Obtener permiso requerido del decorator
  2. Crear CASL ability para el user
  3. Verificar si puede realizar la acción
  ↓
Controller: Ejecutar lógica de negocio
```

### 3. Refresh Token

```
Frontend: Access token expiró (401)
  ↓
Axios Interceptor detecta 401
  ↓
  POST /auth/refresh { refreshToken }
  ↓
Backend: AuthService
  ↓
  1. Buscar refresh token en DB
  2. Verificar que no esté revocado
  3. Verificar que no esté expirado
  4. Revocar token viejo
  5. Generar nuevos access + refresh tokens
  ↓
Respuesta: { accessToken, refreshToken }
  ↓
Frontend: Actualizar localStorage y reintentar request original
```

## Seguridad

### Passwords
- Hasheados con **bcrypt** (10 rounds por defecto)
- Nunca se envían en responses (decorador `@Exclude`)
- Validación de fuerza en DTOs (min 8 caracteres)

### Tokens JWT
- **Access Token**: 15 minutos de vida
  - Contiene: userId, email, tenantId, roles, permissions
  - Firmado con JWT_SECRET
- **Refresh Token**: 7 días de vida
  - Almacenado en DB con metadatos (IP, user agent)
  - UUIDv4
  - Puede ser revocado

### Multi-tenancy
- **Aislamiento por tenant_id** en todas las queries
- Usuarios solo pueden acceder a datos de su tenant
- Validación automática en services

### CORS
- Configurado en `main.ts`
- Origenes permitidos desde `.env`
- Credenciales habilitadas

### Validación de Inputs
- `class-validator` en todos los DTOs
- `whitelist: true` elimina propiedades no definidas
- `forbidNonWhitelisted: true` rechaza propiedades extra
- Transform automático de tipos

## Performance

### Database
- **Índices** en columnas frecuentemente consultadas:
  - `users.tenant_id`
  - `users.email`
  - `tenants.slug`
  - `refresh_tokens.token`
- **JSONB** para datos flexibles (settings, conditions)
- **UUID** para evitar predicción de IDs

### Caching
- Preparado para Redis (opcional)
- Cache de permisos del usuario en JWT
- Refresh token solo se consulta cuando es necesario

### Queries
- **Eager loading** de relaciones con `relations: []`
- **Paginación** preparada (TODO)
- **Soft deletes** para mantener integridad

## Escalabilidad

### Horizontal
- Backend stateless (JWT en lugar de sesiones)
- Puede correr múltiples instancias detrás de load balancer
- Refresh tokens en DB compartida

### Vertical
- PostgreSQL puede escalar hasta TB de datos
- Índices optimizados
- Prepared statements via TypeORM

### Microservicios (Futura)
- Arquitectura modular permite separación:
  - Auth Service
  - Users Service
  - Permissions Service
  - Cada uno con su DB

## Decisiones de Diseño

### ¿Por qué NestJS?
- Arquitectura modular y escalable
- TypeScript nativo
- Decoradores para guards, validators
- Ecosystem maduro (Passport, TypeORM, etc)
- Fácil testing

### ¿Por qué Next.js?
- SSR/SSG para mejor SEO
- App Router moderno
- TypeScript nativo
- Rutas automáticas
- Optimización de imágenes

### ¿Por qué PostgreSQL?
- Relacional (importante para integridad)
- JSONB para flexibilidad
- Rendimiento excelente
- Open source
- Extensiones (UUID, pgcrypto)

### ¿Por qué CASL?
- Permisos attribute-based (no solo roles)
- Flexible (condiciones complejas)
- Type-safe con TypeScript
- Isomórfico (mismo código en backend y frontend)

### ¿Por qué Soft Deletes?
- Auditoría completa
- Recuperación de datos
- Cumplimiento regulatorio
- No rompe relaciones existentes

---

**Próximo**: [Roadmap del Proyecto](02_ROADMAP.md)

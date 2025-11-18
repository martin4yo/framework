# Axioma Core

**Sistema de autenticación y autorización multi-tenant con permisos granulares**

Axioma Core es una plataforma completa que proporciona gestión centralizada de tenants, usuarios y permisos, permitiendo acceder a múltiples aplicaciones frontend y backend con un sistema unificado de autenticación.

## ⚡ Inicio Rápido

```bash
# 1. Crear base de datos
psql -U postgres -c "CREATE DATABASE core_db;"
psql -U postgres -d core_db -f database/schema.sql

# 2. Instalar dependencias
npm run install:all

# 3. Ejecutar todo
npm run dev
```

**Listo!** Backend en http://localhost:3000/api/v1 | Frontend en http://localhost:3000

## 📋 Tabla de Contenidos

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Uso](#uso)
- [API Endpoints](#api-endpoints)
- [Variables de Entorno](#variables-de-entorno)
- [Documentación](#documentación)

## ✨ Características

- 🏢 **Multi-tenancy**: Gestión completa de múltiples organizaciones
- 👥 **Gestión de Usuarios**: Registro, autenticación y perfiles
- 🔐 **Sistema JWT**: Access tokens y refresh tokens
- 🛡️ **RBAC + Permisos Granulares**: Control de acceso basado en roles y recursos
- 🎯 **CASL Integration**: Políticas de permisos flexibles
- 📊 **Audit Logs**: Registro de todas las acciones
- 🔄 **Soft Deletes**: Eliminación lógica de registros
- 🚀 **NestJS + TypeScript**: Backend robusto y type-safe
- ⚛️ **React Frontend**: (En desarrollo)
- 🗄️ **PostgreSQL**: Base de datos relacional
- 💾 **Redis**: Cache y sesiones (opcional)

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────┐
│       Frontend Apps (React/Next.js)     │
│   - Admin Dashboard                     │
│   - User Portal                         │
└──────────────┬──────────────────────────┘
               │ JWT Tokens
               ▼
┌─────────────────────────────────────────┐
│      Backend API (NestJS)               │
│  - Auth Service                         │
│  - Users, Tenants, Roles, Permissions   │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
┌─────────────┐  ┌─────────────┐
│ PostgreSQL  │  │   Redis     │
│ (core_db)   │  │  (cache)    │
└─────────────┘  └─────────────┘
```

## 📦 Requisitos

- **Node.js** >= 18.x
- **PostgreSQL** >= 14.x
- **Redis** >= 7.x (opcional pero recomendado)
- **npm** o **yarn**

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd axioma-core
```

### 2. Configurar la base de datos

Asegúrate de tener PostgreSQL instalado y **creada la base de datos `core_db`**.

Ejecuta el schema inicial:

```bash
psql -U postgres -d core_db -f database/schema.sql
```

Si usas las credenciales del ejemplo:
- **Host**: localhost
- **Puerto**: 5432
- **Usuario**: postgres
- **Password**: Q27G4B98
- **Database**: core_db

### 3. Configurar Backend

```bash
cd backend
npm install
```

El archivo `.env` ya está configurado con tus credenciales. Si necesitas cambiarlas, edita `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=Q27G4B98
DB_DATABASE=core_db
```

### 4. Iniciar Backend

```bash
# Desarrollo (recomendado)
npm run start:dev

# Producción
npm run build
npm run start:prod
```

El backend estará disponible en: `http://localhost:3000/api/v1`

### 5. Configurar Frontend

```bash
cd ../frontend
npm install

# Copiar variables de entorno
cp .env.local.example .env.local
```

### 6. Iniciar Frontend

```bash
# Desarrollo
npm run dev
```

El frontend estará disponible en: `http://localhost:3000`

## 📁 Estructura del Proyecto

```
axioma-core/
├── backend/                    # NestJS Backend API
│   ├── src/
│   │   ├── auth/              # Módulo de autenticación
│   │   │   ├── entities/      # RefreshToken entity
│   │   │   ├── strategies/    # JWT strategies
│   │   │   ├── guards/        # Auth guards
│   │   │   └── decorators/    # Custom decorators
│   │   ├── users/             # Módulo de usuarios
│   │   ├── tenants/           # Módulo de tenants
│   │   ├── roles/             # Módulo de roles
│   │   ├── permissions/       # Módulo de permisos
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env
│   └── package.json
├── frontend/                   # React Frontend (próximamente)
├── database/
│   └── schema.sql             # Schema inicial de PostgreSQL
├── docker-compose.yml         # Opcional: Docker setup
└── README.md
```

## 🔑 API Endpoints

### Authentication

```http
POST   /api/v1/auth/register        # Registrar nuevo usuario
POST   /api/v1/auth/login           # Login
POST   /api/v1/auth/refresh         # Refresh access token
POST   /api/v1/auth/logout          # Logout
GET    /api/v1/auth/me              # Usuario actual
```

### Tenants

```http
POST   /api/v1/tenants              # Crear tenant
GET    /api/v1/tenants              # Listar tenants
GET    /api/v1/tenants/:id          # Obtener tenant
PATCH  /api/v1/tenants/:id          # Actualizar tenant
DELETE /api/v1/tenants/:id          # Eliminar tenant
```

### Users

```http
POST   /api/v1/users                # Crear usuario
GET    /api/v1/users                # Listar usuarios
GET    /api/v1/users/:id            # Obtener usuario
PATCH  /api/v1/users/:id            # Actualizar usuario
DELETE /api/v1/users/:id            # Eliminar usuario
POST   /api/v1/users/:id/roles      # Asignar roles
```

### Roles

```http
POST   /api/v1/roles                # Crear rol
GET    /api/v1/roles                # Listar roles
GET    /api/v1/roles/:id            # Obtener rol
PATCH  /api/v1/roles/:id            # Actualizar rol
DELETE /api/v1/roles/:id            # Eliminar rol
POST   /api/v1/roles/:id/permissions # Asignar permisos
```

### Permissions

```http
POST   /api/v1/permissions          # Crear permiso
GET    /api/v1/permissions          # Listar permisos
GET    /api/v1/permissions/:id      # Obtener permiso
PATCH  /api/v1/permissions/:id      # Actualizar permiso
DELETE /api/v1/permissions/:id      # Eliminar permiso
```

## 🔐 Sistema de Permisos

### Estructura de Permisos

```typescript
{
  resource: 'users',        // Recurso: users, roles, tenants, etc.
  action: 'create',         // Acción: create, read, update, delete, list
  conditions: {             // Condiciones opcionales
    own: true,              // Solo propios registros
    department: 'sales'     // Filtros adicionales
  }
}
```

### Ejemplo de Uso

```typescript
// En tu controlador
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission('users', 'create')
@Post()
createUser(@Body() dto: CreateUserDto) {
  // Solo usuarios con permiso 'users:create' pueden acceder
}
```

## 🛠️ Variables de Entorno

Ver archivo `.env.example` en el directorio `backend/` para todas las variables disponibles.

## 📝 Notas de Desarrollo

### Migraciones de Base de Datos

```bash
cd backend

# Generar migración
npm run migration:generate -- src/database/migrations/MigrationName

# Ejecutar migraciones
npm run migration:run

# Revertir última migración
npm run migration:revert
```

### Testing

```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📚 Documentación

### Guías Principales
- **[DOCS/INICIO.md](DOCS/INICIO.md)** - Inicio ultra rápido
- **[DOCS/SETUP.md](DOCS/SETUP.md)** - Instalación paso a paso
- **[DOCS/00_INICIO_RAPIDO.md](DOCS/00_INICIO_RAPIDO.md)** - Guía de inicio
- **[DOCS/04_CONTEXTO_SESION.md](DOCS/04_CONTEXTO_SESION.md)** ⭐ - Para retomar trabajo

### Documentación Técnica
- **[DOCS/01_ARQUITECTURA.md](DOCS/01_ARQUITECTURA.md)** - Arquitectura y stack
- **[DOCS/02_ROADMAP.md](DOCS/02_ROADMAP.md)** - Roadmap y fases
- **[DOCS/03_API_REFERENCE.md](DOCS/03_API_REFERENCE.md)** - Referencia API completa

### Autenticación
- **[DOCS/README_LOGIN.md](DOCS/README_LOGIN.md)** - Sistema de login completo
- **[DOCS/SETUP_GOOGLE_OAUTH.md](DOCS/SETUP_GOOGLE_OAUTH.md)** - Configuración de Google OAuth
- **[DOCS/PROXIMA_SESION.md](DOCS/PROXIMA_SESION.md)** - Checklist de próximas tareas

### Por Módulo
- **[backend/README.md](backend/README.md)** - Backend (NestJS)
- **[frontend/README.md](frontend/README.md)** - Frontend (Next.js)

## 📊 Estado del Proyecto

```
Backend:        ████████████████████ 100% ✅
Frontend Auth:  ██████████████████░░  95% ✅
Frontend Base:  ████████████░░░░░░░░  60% 🟡
Dashboard:      ░░░░░░░░░░░░░░░░░░░░   0% ⚪
Global:         ████████████░░░░░░░░  65%
```

**Fase Actual**: Autenticación UI completada ✅
**Siguiente**: Dashboard principal con navegación

## 📄 Licencia

MIT License - ver el archivo LICENSE para más detalles.

## 👥 Autores

- Tu Nombre - Desarrollador Principal

---

**Axioma Core** - Sistema de autenticación multi-tenant de nivel empresarial 🚀

**Última actualización**: 17 Nov 2024

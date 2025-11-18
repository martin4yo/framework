# 🚀 Inicio Rápido - Axioma Core

## ¿Qué es Axioma Core?

Axioma Core es un **sistema completo de autenticación y autorización multi-tenant** que te permite gestionar múltiples organizaciones (tenants), usuarios, roles y permisos desde un único lugar centralizado.

## 🎯 Para qué sirve

- **Gestionar múltiples organizaciones** (tenants) en una sola plataforma
- **Autenticación segura** con JWT (access + refresh tokens)
- **Permisos granulares** por usuario, rol y recurso
- **Backend API REST** para conectar con cualquier frontend
- **Dashboard web** para administración

## 🏗️ Arquitectura

```
┌─────────────────────────────────┐
│   Frontend (Next.js)            │
│   - Dashboard Admin             │
│   - Login/Register              │
│   - Gestión Tenants/Users       │
└──────────────┬──────────────────┘
               │ HTTP/REST
               ▼
┌─────────────────────────────────┐
│   Backend API (NestJS)          │
│   - Auth (JWT)                  │
│   - Tenants, Users, Roles       │
│   - Permissions (CASL)          │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│   PostgreSQL Database           │
│   - core_db                     │
└─────────────────────────────────┘
```

## ⚡ Ejecución en 3 pasos

### 1. Configurar Base de Datos

```bash
# Crear base de datos
psql -U postgres
CREATE DATABASE core_db;
\q

# Cargar schema
psql -U postgres -d core_db -f database/schema.sql
```

### 2. Instalar Dependencias

```bash
# En la raíz del proyecto
npm run install:all
```

Esto instalará dependencias en:
- Raíz (concurrently)
- Backend (NestJS)
- Frontend (Next.js)

### 3. Ejecutar Todo

```bash
# Un solo comando ejecuta backend + frontend
npm run dev
```

✅ **Backend**: http://localhost:3000/api/v1
✅ **Frontend**: http://localhost:3000

## 📝 Credenciales por Defecto

### PostgreSQL
- Host: `localhost`
- Puerto: `5432`
- Usuario: `postgres`
- Password: `Q27G4B98`
- Database: `core_db`

### Primer Usuario (crear manualmente)
1. Crear un tenant primero (ver ejemplos abajo)
2. Registrar usuario con ese tenant

## 🧪 Prueba Rápida con curl

### 1. Crear Tenant
```bash
curl -X POST http://localhost:3000/api/v1/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Empresa",
    "slug": "mi-empresa"
  }'
```

### 2. Registrar Usuario
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "tenantSlug": "mi-empresa",
    "email": "admin@mi-empresa.com",
    "password": "password123",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "tenantSlug": "mi-empresa",
    "email": "admin@mi-empresa.com",
    "password": "password123"
  }'
```

Recibirás:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "uuid...",
  "user": { ... }
}
```

## 📚 Siguiente Paso

Lee la documentación completa en:
- `DOCS/01_ARQUITECTURA.md` - Arquitectura técnica
- `DOCS/02_ROADMAP.md` - Plan de desarrollo
- `DOCS/03_API_REFERENCE.md` - Referencia API completa
- `DOCS/04_CONTEXTO_SESION.md` - Contexto de desarrollo

## 🆘 Problemas Comunes

### "Cannot connect to database"
- Verifica que PostgreSQL esté corriendo
- Verifica credenciales en `backend/.env`
- Verifica que existe la DB `core_db`

### "Port 3000 already in use"
- Cambia puerto en `backend/.env`: `PORT=3001`
- Actualiza `frontend/.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1`

### Frontend no carga
- Asegúrate que el backend esté corriendo primero
- Verifica `NEXT_PUBLIC_API_URL` en `frontend/.env.local`

## 📞 Scripts Útiles

```bash
# Desarrollo (backend + frontend simultáneo)
npm run dev

# Solo backend
npm run dev:backend

# Solo frontend
npm run dev:frontend

# Build producción
npm run build:all

# Linting
npm run lint:backend
npm run lint:frontend
```

---

**¡Listo para comenzar!** 🎉

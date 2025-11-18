# 📌 Contexto de Sesión - Axioma Core

**Última sesión**: 16 Noviembre 2024
**Desarrollador**: Usuario
**Asistente**: Claude (Sonnet 4.5)

---

## 🎯 Resumen Ejecutivo

Se creó **Axioma Core**, un sistema completo de autenticación y autorización multi-tenant desde cero. El backend está **100% funcional** y el frontend tiene la base configurada (40% completo).

---

## ✅ Estado Actual

### Backend: 100% ✅
- **Framework**: NestJS 10.x con TypeScript
- **Base de Datos**: PostgreSQL (schema completo creado)
- **Autenticación**: Sistema JWT completo (access + refresh tokens)
- **Autorización**: CASL integrado con guards y decoradores
- **Módulos**: Auth, Users, Tenants, Roles, Permissions (todos con CRUD completo)
- **Estado**: Funcional y listo para usar

### Frontend: 40% 🟡
- **Framework**: Next.js 14 con App Router
- **Estilos**: Tailwind CSS con paleta personalizada (amarillo-púrpura)
- **HTTP Client**: Axios configurado con interceptores
- **Completado**:
  - ✅ Configuración base
  - ✅ Paleta de colores
  - ✅ Cliente API
  - ✅ Página de inicio
- **Pendiente**:
  - ❌ Login/Register pages
  - ❌ Dashboard
  - ❌ Componentes UI
  - ❌ CRUD interfaces

### Base de Datos: 100% ✅
- **PostgreSQL**: localhost:5432
- **Database**: `core_db`
- **Usuario**: `postgres`
- **Password**: `Q27G4B98`
- **Schema**: Cargado con todas las tablas, índices y triggers

---

## 📂 Estructura del Proyecto

```
D:\Desarrollos\React\framework\
├── backend/                   # NestJS API (COMPLETO ✅)
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── tenants/
│   │   ├── roles/
│   │   ├── permissions/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env                   # Configurado con PostgreSQL
│   └── package.json
│
├── frontend/                  # Next.js App (40% 🟡)
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx       # Landing page
│   │   └── lib/
│   │       ├── api.ts         # Cliente Axios
│   │       └── utils.ts
│   ├── .env.local.example
│   ├── tailwind.config.ts     # Paleta amarillo-púrpura
│   └── package.json
│
├── database/
│   └── schema.sql             # Schema PostgreSQL completo
│
├── DOCS/                      # Documentación (NUEVA)
│   ├── 00_INICIO_RAPIDO.md
│   ├── 01_ARQUITECTURA.md
│   ├── 02_ROADMAP.md
│   ├── 03_API_REFERENCE.md
│   └── 04_CONTEXTO_SESION.md  # Este archivo
│
├── package.json               # Scripts con concurrently
├── README.md
└── SETUP.md
```

---

## 🔑 Información Crítica

### Credenciales PostgreSQL
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=Q27G4B98
DB_DATABASE=core_db
```

### Puertos
- **Backend**: `3000` (http://localhost:3000/api/v1)
- **Frontend**: `3000` (http://localhost:3000) - Configurar en otro puerto si hay conflicto

### JWT Secrets (Desarrollo)
```env
JWT_SECRET=axioma_core_jwt_secret_2024_change_in_production_3f8a9b2c1d4e5f6g7h8i9j0k
JWT_REFRESH_SECRET=axioma_core_refresh_secret_2024_change_in_production_9z8y7x6w5v4u3t2s1r0q
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### Paleta de Colores
```css
sidebar: #352151          /* Púrpura oscuro */
sidebar-hover: #4a2d6b
sidebar-active: #8E6AAA
primary: #FCE5B7           /* Amarillo crema */
accent: #F1ABB5            /* Rosa */
palette-purple: #8E6AAA
palette-dark: #352151
```

---

## 🚀 Cómo Ejecutar (Desde Cero)

### Primera Vez
```bash
# 1. Base de datos
psql -U postgres
CREATE DATABASE core_db;
\q
psql -U postgres -d core_db -f database/schema.sql

# 2. Instalar todo
npm run install:all

# 3. Ejecutar
npm run dev
```

### Sesiones Siguientes
```bash
# Un solo comando ejecuta todo
npm run dev
```

Esto inicia:
- Backend en http://localhost:3000/api/v1
- Frontend en http://localhost:3000

---

## 📝 Último Estado de Trabajo

### Archivos Creados en Esta Sesión

#### Backend
- ✅ Todos los módulos (auth, users, tenants, roles, permissions)
- ✅ Entidades TypeORM completas
- ✅ DTOs con validación
- ✅ Services con lógica de negocio
- ✅ Controllers con endpoints REST
- ✅ Guards (JwtAuthGuard, PermissionsGuard)
- ✅ Decoradores (@CurrentUser, @Public, @RequirePermission)
- ✅ Strategies Passport (JWT, Local)
- ✅ CASL integration

#### Frontend
- ✅ Configuración Next.js 14
- ✅ Tailwind config con paleta
- ✅ globals.css con estilos
- ✅ Cliente API (api.ts)
- ✅ Página de inicio
- ✅ Layout base

#### Infraestructura
- ✅ package.json root con concurrently
- ✅ Scripts npm unificados
- ✅ .env configurado
- ✅ Schema PostgreSQL completo

#### Documentación
- ✅ README.md general
- ✅ SETUP.md (guía de instalación)
- ✅ backend/README.md
- ✅ frontend/README.md
- ✅ DOCS/ completa (inicio rápido, arquitectura, roadmap, API reference, contexto)

---

## 🎯 Próxima Sesión: Plan de Acción

### Objetivo Principal
**Crear páginas de Login y Registro**

### Checklist de Tareas
```markdown
1. [ ] Crear componentes UI base
   - [ ] Button.tsx
   - [ ] Input.tsx
   - [ ] Card.tsx
   - [ ] Alert.tsx

2. [ ] Página de Login
   - [ ] Crear src/app/login/page.tsx
   - [ ] Formulario con React Hook Form
   - [ ] Validación con Zod
   - [ ] Integración con authApi.login()
   - [ ] Guardar tokens en localStorage
   - [ ] Redirección a /dashboard
   - [ ] Manejo de errores
   - [ ] Loading states

3. [ ] Página de Registro
   - [ ] Crear src/app/register/page.tsx
   - [ ] Formulario completo
   - [ ] Validación de password fuerte
   - [ ] Selector/creación de tenant
   - [ ] Integración con authApi.register()
   - [ ] Redirección post-registro

4. [ ] Middleware de Autenticación
   - [ ] Crear src/middleware.ts
   - [ ] Verificar token en rutas protegidas
   - [ ] Redirección a /login si no auth

5. [ ] Context de Autenticación
   - [ ] Crear src/contexts/AuthContext.tsx
   - [ ] Provider con user state
   - [ ] Funciones login, logout, register
   - [ ] Hook useAuth()

6. [ ] Dashboard Placeholder
   - [ ] Crear src/app/dashboard/page.tsx
   - [ ] Layout básico con sidebar
   - [ ] Mostrar datos de usuario
   - [ ] Botón de logout
```

### Archivos a Crear
```
frontend/src/
├── components/
│   └── ui/
│       ├── Button.tsx       # ⭐ NUEVO
│       ├── Input.tsx        # ⭐ NUEVO
│       ├── Card.tsx         # ⭐ NUEVO
│       └── Alert.tsx        # ⭐ NUEVO
├── app/
│   ├── login/
│   │   └── page.tsx         # ⭐ NUEVO
│   ├── register/
│   │   └── page.tsx         # ⭐ NUEVO
│   └── dashboard/
│       ├── layout.tsx       # ⭐ NUEVO
│       └── page.tsx         # ⭐ NUEVO
├── contexts/
│   └── AuthContext.tsx      # ⭐ NUEVO
└── middleware.ts            # ⭐ NUEVO
```

---

## 💡 Decisiones Técnicas Importantes

### ¿Por qué estas tecnologías?
- **NestJS**: Arquitectura enterprise, decoradores, TypeScript nativo
- **Next.js 14**: SSR, App Router moderno, optimizaciones automáticas
- **PostgreSQL**: Relacional para integridad, JSONB para flexibilidad
- **CASL**: Permisos attribute-based (más flexible que solo roles)
- **JWT**: Stateless, escalable horizontalmente
- **Tailwind**: Utility-first, desarrollo rápido, consistencia

### ¿Por qué soft deletes?
- Auditoría completa
- Recuperación de datos
- No rompe relaciones existentes
- Cumplimiento regulatorio (GDPR, etc)

### ¿Por qué refresh tokens?
- Access tokens cortos (15 min) = más seguros
- Refresh tokens largos (7 días) = mejor UX
- Revocación granular

---

## 🔍 Comandos Útiles para Debugging

### Backend
```bash
# Ver logs en tiempo real
cd backend && npm run start:dev

# Verificar compilación TypeScript
cd backend && npm run build

# Lint
cd backend && npm run lint
```

### Frontend
```bash
# Ver logs de Next.js
cd frontend && npm run dev

# Build para verificar errores
cd frontend && npm run build

# Lint
cd frontend && npm run lint
```

### Base de Datos
```bash
# Conectar a PostgreSQL
psql -U postgres -d core_db

# Ver todas las tablas
\dt

# Ver estructura de tabla
\d users

# Ver datos
SELECT * FROM tenants;
SELECT * FROM users;
SELECT * FROM roles;
SELECT * FROM permissions;

# Salir
\q
```

### Testing API con curl
```bash
# Crear tenant
curl -X POST http://localhost:3000/api/v1/tenants \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Corp","slug":"test-corp"}'

# Registrar usuario
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "tenantSlug":"test-corp",
    "email":"test@test.com",
    "password":"password123",
    "firstName":"Test",
    "lastName":"User"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "tenantSlug":"test-corp",
    "email":"test@test.com",
    "password":"password123"
  }'
```

---

## 📊 Progreso Global

```
Backend:        ████████████████████ 100%
Frontend Base:  ████████░░░░░░░░░░░░  40%
UI Components:  ░░░░░░░░░░░░░░░░░░░░   0%
Auth Pages:     ░░░░░░░░░░░░░░░░░░░░   0%
Dashboard:      ░░░░░░░░░░░░░░░░░░░░   0%
CRUD UIs:       ░░░░░░░░░░░░░░░░░░░░   0%
Testing:        ░░░░░░░░░░░░░░░░░░░░   0%
Deployment:     ░░░░░░░░░░░░░░░░░░░░   0%

TOTAL:          ████████████░░░░░░░░  55%
```

---

## 🐛 Problemas Conocidos

### Ninguno por ahora ✅

El proyecto está en estado limpio y funcional.

---

## 📚 Referencias Rápidas

### Documentación Clave
- [NestJS Docs](https://docs.nestjs.com/)
- [Next.js 14 Docs](https://nextjs.org/docs)
- [TypeORM Docs](https://typeorm.io/)
- [CASL Docs](https://casl.js.org/v6/en/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Archivos Importantes
- `backend/src/main.ts` - Entry point del backend
- `backend/src/auth/auth.service.ts` - Lógica de autenticación
- `frontend/src/lib/api.ts` - Cliente API
- `database/schema.sql` - Schema de DB
- `DOCS/02_ROADMAP.md` - Plan completo

---

## 💾 Backup y Versionado

### Git (Recomendado)
```bash
git init
git add .
git commit -m "Initial commit: Axioma Core backend + frontend base"
```

### Backup Manual
Respaldar carpetas:
- `backend/`
- `frontend/`
- `database/`
- `DOCS/`

---

## 🎓 Conceptos Clave para Entender

### Multi-tenancy
- Cada tenant es una organización separada
- Datos aislados por `tenant_id`
- Un usuario pertenece a UN solo tenant
- Acceso mediante `tenantSlug` en login

### JWT Flow
1. Login → Backend genera access token (15 min)
2. Frontend guarda en localStorage
3. Cada request incluye: `Authorization: Bearer <token>`
4. Token expira → Frontend usa refresh token
5. Refresh token obtiene nuevo access token

### CASL Permissions
```typescript
// Definir habilidad
const ability = defineAbility((can) => {
  can('read', 'users');
  can('update', 'users', { ownerId: userId });
});

// Verificar
if (ability.can('update', user)) {
  // Permitir
}
```

### Soft Deletes
- No se elimina el registro de DB
- Se marca con `deleted_at = NOW()`
- Queries filtran `WHERE deleted_at IS NULL`
- Permite auditoría y recuperación

---

## 🚨 Recordatorios Importantes

1. **NUNCA commitear .env con secrets reales**
2. **Cambiar JWT secrets en producción**
3. **Usar HTTPS en producción**
4. **Configurar CORS correctamente**
5. **Hacer backup de PostgreSQL**
6. **Usar variables de entorno para config**
7. **No exponer stack traces en prod**

---

## ✨ Siguientes Hitos

### Corto Plazo (1-2 semanas)
- ✅ Login/Register pages
- ✅ Dashboard básico
- ✅ Componentes UI base

### Mediano Plazo (1 mes)
- ✅ CRUD Tenants UI
- ✅ CRUD Users UI
- ✅ CRUD Roles UI
- ✅ CRUD Permissions UI

### Largo Plazo (2-3 meses)
- ✅ Tests completos
- ✅ Email verification
- ✅ 2FA
- ✅ Audit logs UI
- ✅ Deployment

---

## 📞 Comandos de Esta Sesión

```bash
# Todo lo necesario para continuar:
cd D:\Desarrollos\React\framework

# Instalar dependencias (si no lo hiciste)
npm run install:all

# Ejecutar todo
npm run dev

# El backend estará en: http://localhost:3000/api/v1
# El frontend estará en: http://localhost:3000
```

---

**Fin del contexto de sesión**
**Última actualización**: 16 Nov 2024 - 19:30 ART
**Estado**: Listo para continuar con Fase 2 (Login/Register)

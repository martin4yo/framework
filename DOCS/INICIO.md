# ⚡ INICIO RÁPIDO - Axioma Core

## 🚀 Ejecutar el Proyecto (3 comandos)

```bash
# 1. Base de datos (solo primera vez)
psql -U postgres -c "CREATE DATABASE core_db;"
psql -U postgres -d core_db -f database/schema.sql

# 2. Instalar dependencias (solo primera vez)
npm run install:all

# 3. Ejecutar backend + frontend
npm run dev
```

✅ **Backend**: http://localhost:3000/api/v1
✅ **Frontend**: http://localhost:3000

---

## 📚 Documentación Completa

### Guías Principales
- **[INICIO_RAPIDO.md](DOCS/00_INICIO_RAPIDO.md)** ← Empieza aquí
- **[SETUP.md](SETUP.md)** - Instalación paso a paso
- **[README.md](README.md)** - Descripción general del proyecto

### Documentación Técnica
- **[ARQUITECTURA.md](DOCS/01_ARQUITECTURA.md)** - Stack técnico y decisiones de diseño
- **[ROADMAP.md](DOCS/02_ROADMAP.md)** - Plan de desarrollo y fases
- **[API_REFERENCE.md](DOCS/03_API_REFERENCE.md)** - Referencia completa de endpoints
- **[CONTEXTO_SESION.md](DOCS/04_CONTEXTO_SESION.md)** ⭐ - Para retomar trabajo

### Por Módulo
- **[backend/README.md](backend/README.md)** - Documentación del backend
- **[frontend/README.md](frontend/README.md)** - Documentación del frontend

---

## 🎯 ¿Qué es esto?

**Axioma Core** es un sistema completo de autenticación y autorización multi-tenant que incluye:

- 🏢 **Multi-tenancy**: Gestión de múltiples organizaciones
- 🔐 **Autenticación JWT**: Access + refresh tokens
- 👥 **Gestión de Usuarios**: CRUD completo
- 🎭 **Roles y Permisos**: Sistema RBAC con CASL
- 🎨 **Dashboard Web**: Next.js con Tailwind CSS
- 📡 **API REST**: Backend NestJS completo

---

## 📊 Estado Actual

```
Backend:    ████████████████████ 100% ✅ COMPLETO
Frontend:   ████████░░░░░░░░░░░░  40% 🟡 EN PROGRESO
Global:     ████████████░░░░░░░░  55%
```

**Completado:**
- ✅ Backend API funcional
- ✅ Base de datos PostgreSQL
- ✅ Sistema de autenticación JWT
- ✅ Permisos con CASL
- ✅ Frontend base configurado
- ✅ Documentación completa

**Pendiente:**
- ❌ Páginas de Login/Register
- ❌ Dashboard con UI
- ❌ CRUD interfaces

---

## 🧪 Prueba Rápida

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
    "email":"admin@test.com",
    "password":"password123",
    "firstName":"Admin"
  }'
```

---

## 🔧 Comandos Disponibles

```bash
npm run dev              # Ejecutar backend + frontend
npm run dev:backend      # Solo backend
npm run dev:frontend     # Solo frontend
npm run install:all      # Instalar todas las dependencias
npm run build:all        # Build de producción
```

---

## 📞 ¿Problemas?

1. **No conecta a DB** → Verifica que PostgreSQL esté corriendo
2. **Puerto ocupado** → Cambia `PORT` en `backend/.env`
3. **Módulos faltantes** → Ejecuta `npm run install:all`

Ver más en [SETUP.md](SETUP.md)

---

## 🎓 Próximos Pasos

1. Lee **[CONTEXTO_SESION.md](DOCS/04_CONTEXTO_SESION.md)** para entender el estado actual
2. Revisa el **[ROADMAP.md](DOCS/02_ROADMAP.md)** para ver el plan
3. Empieza con **Fase 2**: Crear páginas de Login y Registro

---

## 📂 Estructura

```
axioma-core/
├── backend/         # NestJS API (COMPLETO ✅)
├── frontend/        # Next.js App (40% 🟡)
├── database/        # PostgreSQL schemas
├── DOCS/            # Documentación completa
│   ├── 00_INICIO_RAPIDO.md
│   ├── 01_ARQUITECTURA.md
│   ├── 02_ROADMAP.md
│   ├── 03_API_REFERENCE.md
│   └── 04_CONTEXTO_SESION.md ⭐
├── package.json     # Scripts root
├── INICIO.md        # Este archivo
├── README.md        # Descripción general
└── SETUP.md         # Guía de instalación
```

---

## 🚀 Stack Tecnológico

- **Backend**: NestJS + TypeScript + PostgreSQL + TypeORM
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Auth**: JWT (Passport.js)
- **Permissions**: CASL
- **Database**: PostgreSQL 15+

---

**¡Listo para empezar!** 🎉

Lee [DOCS/04_CONTEXTO_SESION.md](DOCS/04_CONTEXTO_SESION.md) para retomar desde donde se dejó.

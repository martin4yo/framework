# 🚀 Guía de Instalación Rápida - Axioma Core

## Resumen

Axioma Core es un sistema completo de autenticación y autorización multi-tenant que incluye:
- **Backend**: NestJS + TypeScript + PostgreSQL
- **Frontend**: Next.js + TypeScript + Tailwind CSS

---

## Prerequisitos

Antes de comenzar, asegúrate de tener instalado:

- ✅ **Node.js** >= 18.x
- ✅ **PostgreSQL** >= 14.x (ya instalado en tu máquina)
- ✅ **npm** (viene con Node.js)

---

## Paso 1: Configurar la Base de Datos

### Ya tienes PostgreSQL instalado, así que solo necesitas:

1. **Crear la base de datos**:

```bash
psql -U postgres
```

Luego en el prompt de PostgreSQL:

```sql
CREATE DATABASE core_db;
\q
```

2. **Ejecutar el schema**:

```bash
psql -U postgres -d core_db -f database/schema.sql
```

Esto creará todas las tablas, índices, triggers y datos iniciales.

---

## Paso 2: Configurar y Ejecutar el Backend

```bash
# 1. Ir a la carpeta del backend
cd backend

# 2. Instalar dependencias
npm install

# 3. El archivo .env ya está configurado con tus credenciales
# Si quieres verificar, ábrelo y verás:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=Q27G4B98
# DB_DATABASE=core_db

# 4. Iniciar el servidor en modo desarrollo
npm run start:dev
```

**Resultado esperado**:
```
╔═══════════════════════════════════════════════╗
║                                               ║
║         🚀 AXIOMA CORE is running!           ║
║                                               ║
║   📡 API: http://localhost:3000/api/v1       ║
║   🌍 Environment: development                ║
║   📊 Database: core_db                       ║
║                                               ║
╚═══════════════════════════════════════════════╝
```

**El backend estará disponible en**: http://localhost:3000/api/v1

---

## Paso 3: Configurar y Ejecutar el Frontend

Abre una **nueva terminal** (deja el backend corriendo):

```bash
# 1. Ir a la carpeta del frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Copiar variables de entorno
cp .env.local.example .env.local

# 4. (Opcional) Editar .env.local si el backend no está en localhost:3000
# Por defecto ya está configurado correctamente

# 5. Iniciar el servidor de desarrollo
npm run dev
```

**El frontend estará disponible en**: http://localhost:3000

---

## Verificar que Todo Funciona

### 1. Backend API Health Check

Abre tu navegador o usa curl:

```bash
curl http://localhost:3000/api/v1/tenants
```

Deberías ver un array vacío `[]` o los tenants existentes.

### 2. Frontend

Abre http://localhost:3000 en tu navegador.

Deberías ver la página de inicio de Axioma Core con:
- Logo y descripción
- 4 tarjetas de características
- Botones de "Iniciar Sesión" y "Registrarse"

---

## Endpoints API Disponibles

Una vez que el backend esté corriendo, puedes acceder a:

### Autenticación
- `POST /api/v1/auth/register` - Registrar usuario
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Usuario actual

### Tenants
- `GET /api/v1/tenants` - Listar tenants
- `POST /api/v1/tenants` - Crear tenant
- `GET /api/v1/tenants/:id` - Obtener tenant
- `PATCH /api/v1/tenants/:id` - Actualizar tenant
- `DELETE /api/v1/tenants/:id` - Eliminar tenant

### Users
- `GET /api/v1/users` - Listar usuarios
- `POST /api/v1/users` - Crear usuario
- `GET /api/v1/users/:id` - Obtener usuario
- `PATCH /api/v1/users/:id` - Actualizar usuario
- `DELETE /api/v1/users/:id` - Eliminar usuario

### Roles
- `GET /api/v1/roles` - Listar roles
- `POST /api/v1/roles` - Crear rol
- `GET /api/v1/roles/:id` - Obtener rol
- `PATCH /api/v1/roles/:id` - Actualizar rol
- `DELETE /api/v1/roles/:id` - Eliminar rol

### Permissions
- `GET /api/v1/permissions` - Listar permisos
- `POST /api/v1/permissions` - Crear permiso
- `GET /api/v1/permissions/:id` - Obtener permiso
- `PATCH /api/v1/permissions/:id` - Actualizar permiso
- `DELETE /api/v1/permissions/:id` - Eliminar permiso

---

## Ejemplo de Uso con curl

### 1. Crear un tenant:

```bash
curl -X POST http://localhost:3000/api/v1/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Empresa",
    "slug": "mi-empresa"
  }'
```

### 2. Registrar un usuario:

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

### 3. Login:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "tenantSlug": "mi-empresa",
    "email": "admin@mi-empresa.com",
    "password": "password123"
  }'
```

Respuesta:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "uuid-here",
  "user": {
    "id": "uuid",
    "email": "admin@mi-empresa.com",
    "firstName": "Admin",
    "lastName": "User",
    "tenantId": "uuid",
    "roles": []
  }
}
```

---

## Troubleshooting

### Error: "Cannot connect to database"
- Verifica que PostgreSQL esté corriendo
- Verifica las credenciales en `backend/.env`
- Verifica que la base de datos `core_db` existe

### Error: "Port 3000 already in use"
- Cambia el puerto en `backend/.env`: `PORT=3001`
- O mata el proceso que usa el puerto 3000

### Frontend no carga
- Verifica que el backend esté corriendo
- Verifica que `NEXT_PUBLIC_API_URL` en `frontend/.env.local` apunte al backend correcto

---

## Próximos Pasos

1. ✅ **Backend y Frontend funcionando**
2. 🔜 Crear página de Login en el frontend
3. 🔜 Crear página de Registro
4. 🔜 Crear Dashboard con sidebar
5. 🔜 Implementar páginas de gestión de Tenants, Users, Roles, Permissions

---

## Estructura del Proyecto

```
axioma-core/
├── backend/               # NestJS API
│   ├── src/
│   │   ├── auth/         # Autenticación
│   │   ├── users/        # Usuarios
│   │   ├── tenants/      # Tenants
│   │   ├── roles/        # Roles
│   │   ├── permissions/  # Permisos
│   │   └── main.ts
│   ├── .env             # Configuración (ya listo)
│   └── package.json
├── frontend/             # Next.js App
│   ├── src/
│   │   ├── app/         # Páginas
│   │   ├── components/  # Componentes
│   │   └── lib/         # API client
│   ├── .env.local       # Configuración
│   └── package.json
├── database/
│   └── schema.sql       # Schema PostgreSQL
└── README.md

```

---

## Soporte

Si tienes problemas, revisa:
1. Los logs del backend (terminal donde corre `npm run start:dev`)
2. Los logs del frontend (terminal donde corre `npm run dev`)
3. La consola del navegador (F12)

**¡Listo para usar Axioma Core!** 🚀

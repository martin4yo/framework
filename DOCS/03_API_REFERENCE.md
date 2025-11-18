# 📡 API Reference - Axioma Core

**Base URL**: `http://localhost:3000/api/v1`

**Autenticación**: JWT Bearer Token (excepto endpoints públicos)

## Formato de Respuestas

### Success
```json
{
  "id": "uuid",
  "name": "Example",
  ...
}
```

### Error
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

---

## 🔐 Authentication

### POST /auth/register
Registrar un nuevo usuario en un tenant.

**Público**: ✅ Sí

**Request Body**:
```json
{
  "tenantSlug": "mi-empresa",
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response**: `201 Created`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "tenantId": "tenant-uuid",
    "roles": []
  }
}
```

**Errores**:
- `404` - Tenant not found
- `409` - User already exists
- `400` - Validation error

---

### POST /auth/login
Iniciar sesión con credenciales.

**Público**: ✅ Sí

**Request Body**:
```json
{
  "tenantSlug": "mi-empresa",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**: `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "tenantId": "tenant-uuid",
    "roles": ["admin", "user"]
  }
}
```

**Errores**:
- `401` - Invalid credentials
- `401` - Tenant not active
- `401` - User not active

---

### POST /auth/refresh
Refrescar el access token usando refresh token.

**Público**: ✅ Sí

**Request Body**:
```json
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response**: `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "new-uuid-here",
  "user": { ... }
}
```

**Errores**:
- `401` - Invalid or expired refresh token

---

### POST /auth/logout
Cerrar sesión y revocar refresh token.

**Autenticación**: 🔒 Requerida

**Request Body**:
```json
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response**: `204 No Content`

---

### GET /auth/me
Obtener información del usuario actual.

**Autenticación**: 🔒 Requerida

**Response**: `200 OK`
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "tenantId": "tenant-uuid",
  "tenantSlug": "mi-empresa",
  "roles": ["admin"],
  "permissions": [
    {
      "resource": "users",
      "actions": ["create", "read", "update", "delete"]
    }
  ]
}
```

---

## 🏢 Tenants

### GET /tenants
Listar todos los tenants.

**Autenticación**: 🔒 Requerida

**Response**: `200 OK`
```json
[
  {
    "id": "tenant-uuid",
    "name": "Mi Empresa S.A.",
    "slug": "mi-empresa",
    "settings": {},
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### GET /tenants/:id
Obtener un tenant por ID.

**Autenticación**: 🔒 Requerida

**Parámetros URL**:
- `id` - UUID del tenant

**Response**: `200 OK`
```json
{
  "id": "tenant-uuid",
  "name": "Mi Empresa S.A.",
  "slug": "mi-empresa",
  "settings": {},
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errores**:
- `404` - Tenant not found

---

### POST /tenants
Crear un nuevo tenant.

**Autenticación**: 🔒 Requerida

**Request Body**:
```json
{
  "name": "Nueva Empresa",
  "slug": "nueva-empresa",
  "settings": {
    "timezone": "America/Argentina/Buenos_Aires",
    "currency": "ARS"
  }
}
```

**Response**: `201 Created`
```json
{
  "id": "new-tenant-uuid",
  "name": "Nueva Empresa",
  "slug": "nueva-empresa",
  "settings": { ... },
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errores**:
- `409` - Slug already exists
- `400` - Validation error

---

### PATCH /tenants/:id
Actualizar un tenant.

**Autenticación**: 🔒 Requerida

**Request Body** (todos opcionales):
```json
{
  "name": "Nombre Actualizado",
  "settings": { ... },
  "isActive": false
}
```

**Response**: `200 OK`
```json
{
  "id": "tenant-uuid",
  "name": "Nombre Actualizado",
  ...
}
```

---

### DELETE /tenants/:id
Eliminar un tenant (soft delete).

**Autenticación**: 🔒 Requerida

**Response**: `204 No Content`

---

## 👤 Users

### GET /users
Listar usuarios.

**Autenticación**: 🔒 Requerida

**Query Parameters**:
- `tenantId` (opcional) - Filtrar por tenant

**Response**: `200 OK`
```json
[
  {
    "id": "user-uuid",
    "tenantId": "tenant-uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true,
    "emailVerified": false,
    "lastLoginAt": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "tenant": { ... },
    "roles": [...]
  }
]
```

---

### GET /users/:id
Obtener un usuario por ID.

**Autenticación**: 🔒 Requerida

**Response**: `200 OK`
```json
{
  "id": "user-uuid",
  "tenantId": "tenant-uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "isActive": true,
  "emailVerified": false,
  "lastLoginAt": "2024-01-01T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "tenant": { ... },
  "roles": [
    {
      "id": "role-uuid",
      "name": "admin",
      "permissions": [...]
    }
  ]
}
```

---

### POST /users
Crear un nuevo usuario.

**Autenticación**: 🔒 Requerida

**Request Body**:
```json
{
  "tenantId": "tenant-uuid",
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Response**: `201 Created`
```json
{
  "id": "new-user-uuid",
  "tenantId": "tenant-uuid",
  "email": "newuser@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "isActive": true,
  "emailVerified": false,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### PATCH /users/:id
Actualizar un usuario.

**Autenticación**: 🔒 Requerida

**Request Body** (todos opcionales):
```json
{
  "firstName": "Updated Name",
  "lastName": "Updated Last",
  "isActive": false
}
```

**Response**: `200 OK`

---

### DELETE /users/:id
Eliminar un usuario (soft delete).

**Autenticación**: 🔒 Requerida

**Response**: `204 No Content`

---

## 🎭 Roles

### GET /roles
Listar roles.

**Autenticación**: 🔒 Requerida

**Query Parameters**:
- `tenantId` (opcional) - Filtrar por tenant

**Response**: `200 OK`
```json
[
  {
    "id": "role-uuid",
    "tenantId": "tenant-uuid",
    "name": "admin",
    "description": "Administrator role",
    "isSystem": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "permissions": [...]
  }
]
```

---

### POST /roles
Crear un nuevo rol.

**Autenticación**: 🔒 Requerida

**Request Body**:
```json
{
  "tenantId": "tenant-uuid",
  "name": "editor",
  "description": "Content editor role"
}
```

**Response**: `201 Created`

---

### PATCH /roles/:id
Actualizar un rol.

**Autenticación**: 🔒 Requerida

**Response**: `200 OK`

---

### DELETE /roles/:id
Eliminar un rol (soft delete).

**Autenticación**: 🔒 Requerida

**Nota**: No se pueden eliminar roles de sistema.

**Response**: `204 No Content`

---

## 🔑 Permissions

### GET /permissions
Listar permisos.

**Autenticación**: 🔒 Requerida

**Query Parameters**:
- `tenantId` (opcional) - Filtrar por tenant

**Response**: `200 OK`
```json
[
  {
    "id": "permission-uuid",
    "tenantId": "tenant-uuid",
    "resource": "users",
    "action": "create",
    "conditions": {},
    "description": "Create new users",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### POST /permissions
Crear un nuevo permiso.

**Autenticación**: 🔒 Requerida

**Request Body**:
```json
{
  "tenantId": "tenant-uuid",
  "resource": "invoices",
  "action": "read",
  "conditions": {
    "own": true
  },
  "description": "Read own invoices"
}
```

**Response**: `201 Created`

---

### PATCH /permissions/:id
Actualizar un permiso.

**Autenticación**: 🔒 Requerida

**Response**: `200 OK`

---

### DELETE /permissions/:id
Eliminar un permiso (soft delete).

**Autenticación**: 🔒 Requerida

**Response**: `204 No Content`

---

## 📝 Ejemplos de Uso

### Flujo Completo: Crear Tenant y Usuario

```bash
# 1. Crear tenant
curl -X POST http://localhost:3000/api/v1/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corp",
    "slug": "acme"
  }'

# 2. Registrar usuario admin
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "tenantSlug": "acme",
    "email": "admin@acme.com",
    "password": "SecurePass123!",
    "firstName": "Admin",
    "lastName": "User"
  }'

# Guardar el accessToken de la respuesta

# 3. Crear un rol
curl -X POST http://localhost:3000/api/v1/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "tenantId": "TENANT_UUID",
    "name": "manager",
    "description": "Manager role"
  }'

# 4. Crear permiso
curl -X POST http://localhost:3000/api/v1/permissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "tenantId": "TENANT_UUID",
    "resource": "reports",
    "action": "read",
    "description": "Read reports"
  }'
```

---

## 🔐 Headers Requeridos

### Para endpoints protegidos:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Para endpoints públicos:
```
Content-Type: application/json
```

---

## ⚠️ Códigos de Error

| Código | Significado |
|--------|-------------|
| 200 | OK - Request exitoso |
| 201 | Created - Recurso creado |
| 204 | No Content - Eliminación exitosa |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - No autenticado o token inválido |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Duplicado (ej: email ya existe) |
| 500 | Internal Server Error - Error del servidor |

---

## 🧪 Testing con Postman/Insomnia

Importa esta colección básica:

```json
{
  "name": "Axioma Core API",
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/auth/register",
            "body": { ... }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/auth/login",
            "body": { ... }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000/api/v1"
    }
  ]
}
```

---

**Última actualización**: 16 Nov 2024

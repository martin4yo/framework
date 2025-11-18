# Axioma Core - Backend

Backend API de Axioma Core construido con NestJS, TypeScript y PostgreSQL.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run start:dev

# Build para producción
npm run build
npm run start:prod
```

## 📋 Prerequisitos

- Node.js >= 18.x
- PostgreSQL >= 14.x
- Base de datos `core_db` creada

## 🔧 Configuración

El archivo `.env` ya está configurado con las credenciales de PostgreSQL locales.

### Variables de Entorno Importantes

```env
# Application
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=Q27G4B98
DB_DATABASE=core_db

# JWT
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d
```

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Registrar usuario
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Usuario actual (requiere autenticación)

### Tenants
- `GET /api/v1/tenants` - Listar todos los tenants
- `GET /api/v1/tenants/:id` - Obtener un tenant
- `POST /api/v1/tenants` - Crear tenant
- `PATCH /api/v1/tenants/:id` - Actualizar tenant
- `DELETE /api/v1/tenants/:id` - Eliminar tenant (soft delete)

### Users
- `GET /api/v1/users` - Listar usuarios (query: ?tenantId=uuid)
- `GET /api/v1/users/:id` - Obtener un usuario
- `POST /api/v1/users` - Crear usuario
- `PATCH /api/v1/users/:id` - Actualizar usuario
- `DELETE /api/v1/users/:id` - Eliminar usuario (soft delete)

### Roles
- `GET /api/v1/roles` - Listar roles (query: ?tenantId=uuid)
- `GET /api/v1/roles/:id` - Obtener un rol
- `POST /api/v1/roles` - Crear rol
- `PATCH /api/v1/roles/:id` - Actualizar rol
- `DELETE /api/v1/roles/:id` - Eliminar rol (soft delete)

### Permissions
- `GET /api/v1/permissions` - Listar permisos (query: ?tenantId=uuid)
- `GET /api/v1/permissions/:id` - Obtener un permiso
- `POST /api/v1/permissions` - Crear permiso
- `PATCH /api/v1/permissions/:id` - Actualizar permiso
- `DELETE /api/v1/permissions/:id` - Eliminar permiso (soft delete)

## 🔐 Autenticación

### Flujo de Autenticación

1. **Registro**: `POST /auth/register`
   ```json
   {
     "tenantSlug": "mi-empresa",
     "email": "user@example.com",
     "password": "password123",
     "firstName": "John",
     "lastName": "Doe"
   }
   ```

2. **Login**: `POST /auth/login`
   ```json
   {
     "tenantSlug": "mi-empresa",
     "email": "user@example.com",
     "password": "password123"
   }
   ```

   Respuesta:
   ```json
   {
     "accessToken": "eyJhbGc...",
     "refreshToken": "uuid-v4-token",
     "user": {
       "id": "uuid",
       "email": "user@example.com",
       "firstName": "John",
       "lastName": "Doe",
       "tenantId": "uuid",
       "roles": ["user"]
     }
   }
   ```

3. **Uso del Access Token**:
   ```
   Authorization: Bearer eyJhbGc...
   ```

4. **Refresh Token**: `POST /auth/refresh`
   ```json
   {
     "refreshToken": "uuid-v4-token"
   }
   ```

### Permisos

El sistema usa CASL para control de acceso granular:

```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission('users', 'create')
@Post()
createUser() {
  // Solo usuarios con permiso 'users:create'
}
```

## 🗄️ Base de Datos

### Migrar Schema

```bash
psql -U postgres -d core_db -f ../database/schema.sql
```

### Estructura

- **tenants**: Organizaciones
- **users**: Usuarios de cada tenant
- **roles**: Roles asignables a usuarios
- **permissions**: Permisos granulares
- **user_roles**: Relación usuarios-roles (M:N)
- **role_permissions**: Relación roles-permisos (M:N)
- **refresh_tokens**: Tokens de refresco
- **audit_logs**: Logs de auditoría

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📦 Módulos

### Auth Module
- Registro y login
- JWT strategy (access + refresh tokens)
- Guards y decoradores

### Users Module
- CRUD de usuarios
- Validación de passwords con bcrypt
- Relación con tenants y roles

### Tenants Module
- CRUD de tenants
- Multi-tenancy por slug

### Roles Module
- CRUD de roles
- Roles de sistema vs tenant-específicos
- Relación con permisos

### Permissions Module
- CRUD de permisos
- CASL ability factory
- Guards de permisos

## 🔒 Seguridad

- ✅ Passwords hasheados con bcrypt
- ✅ JWT con expiración corta (15 min)
- ✅ Refresh tokens con expiración larga (7 días)
- ✅ Soft deletes para auditoría
- ✅ Validación de inputs con class-validator
- ✅ CORS configurado
- ✅ Helmet (recomendado para producción)

## 📝 Scripts Disponibles

```bash
npm run start          # Iniciar en producción
npm run start:dev      # Iniciar en desarrollo (watch mode)
npm run start:debug    # Iniciar en modo debug
npm run build          # Build para producción
npm run lint           # Linter
npm run format         # Formatear código
npm run test           # Tests unitarios
npm run test:e2e       # Tests E2E
```

## 🌐 CORS

Por defecto permite:
- http://localhost:3000
- http://localhost:5173
- http://localhost:4200

Configurable en `.env`:
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

## 📄 Licencia

MIT

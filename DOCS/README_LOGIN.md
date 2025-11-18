# Sistema de Login con Google OAuth

Este documento describe el sistema de autenticación implementado en Axioma Framework.

## Características

- ✅ Login con Email/Password
- ✅ Registro de usuarios
- ✅ Login con Google OAuth 2.0
- ✅ Seed automático de usuario administrador
- ✅ Tokens JWT con refresh tokens
- ✅ Multi-tenant authentication
- ✅ Verificación de email
- ✅ Splash screen de bienvenida

## Archivos Creados/Modificados

### Frontend

```
frontend/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── login/page.tsx              # Página de login
│   │   │   ├── register/page.tsx           # Página de registro
│   │   │   └── google/callback/page.tsx    # Callback de Google OAuth
│   │   └── layout.tsx                      # Layout con AuthProvider
│   ├── components/ui/
│   │   ├── Button.tsx                      # Componente de botón
│   │   ├── Input.tsx                       # Componente de input
│   │   └── Card.tsx                        # Componente de card
│   └── contexts/
│       └── AuthContext.tsx                 # Contexto de autenticación
└── .env.example                            # Variables de entorno ejemplo
```

### Backend

```
backend/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts              # Endpoints de auth + Google
│   │   ├── auth.service.ts                 # Lógica de auth + Google
│   │   ├── auth.module.ts                  # Módulo con GoogleStrategy
│   │   ├── strategies/
│   │   │   └── google.strategy.ts          # Estrategia de Google OAuth
│   │   └── guards/
│   │       └── google-auth.guard.ts        # Guard de Google
│   └── database/
│       └── seeds/
│           ├── initial-admin.seed.ts       # Seed de admin
│           └── seed.ts                     # Runner de seeds
├── package.json                            # Script "seed" agregado
└── .env.example                            # Variables de entorno ejemplo
```

### Documentación

```
├── SETUP_GOOGLE_OAUTH.md                   # Guía de configuración
└── README_LOGIN.md                         # Este archivo
```

## Instalación y Configuración

### 1. Instalar Dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configurar Variables de Entorno

Copia los archivos `.env.example` a `.env` y configura:

**Backend (.env):**
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=axioma_core

# JWT
JWT_SECRET=tu-clave-secreta-super-segura
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5100/api/auth/google/callback

# URLs
FRONTEND_URL=http://localhost:3050

# Admin inicial
ADMIN_EMAIL=admin@axioma.com
ADMIN_PASSWORD=Admin123!
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=System

# Tenant por defecto
DEFAULT_TENANT_NAME=Axioma Core
DEFAULT_TENANT_SLUG=axioma-core
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5100/api
```

### 3. Configurar Google OAuth

Sigue la guía en `SETUP_GOOGLE_OAUTH.md` para:
1. Crear un proyecto en Google Cloud Console
2. Configurar la pantalla de consentimiento OAuth
3. Crear credenciales OAuth 2.0
4. Obtener Client ID y Client Secret

### 4. Crear Base de Datos y Ejecutar Migraciones

```bash
cd backend
# Crear base de datos (si no existe)
createdb axioma_core

# Ejecutar migraciones
npm run migration:run
```

### 5. Ejecutar Seed del Usuario Admin

```bash
cd backend
npm run seed
```

Esto creará:
- Tenant por defecto: "Axioma Core" (slug: axioma-core)
- Rol de administrador
- Usuario admin con las credenciales del .env

**Output esperado:**
```
✓ Created default tenant: Axioma Core
✓ Created admin role
✓ Initial admin user created successfully
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ADMIN CREDENTIALS (CHANGE IMMEDIATELY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Email: admin@axioma.com
  Password: Admin123!
  Tenant: axioma-core
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 6. Iniciar la Aplicación

```bash
# Backend
cd backend
npm run start:dev

# Frontend (en otra terminal)
cd frontend
npm run dev
```

## Uso

### Login con Email/Password

1. Ve a http://localhost:3050/auth/login
2. Ingresa las credenciales del admin:
   - Email: admin@axioma.com
   - Password: Admin123!
3. Haz clic en "Iniciar Sesión"

### Login con Google

1. Ve a http://localhost:3050/auth/login
2. Haz clic en "Continuar con Google"
3. Selecciona tu cuenta de Google
4. Autoriza la aplicación

### Registro de Nuevo Usuario

1. Ve a http://localhost:3050/auth/register
2. Completa el formulario
3. Revisa tu email para verificar la cuenta
4. Inicia sesión

## API Endpoints

### Autenticación

```
POST   /api/auth/register           # Registrar nuevo usuario
POST   /api/auth/login              # Login con email/password
POST   /api/auth/refresh            # Refrescar access token
POST   /api/auth/logout             # Cerrar sesión
POST   /api/auth/verify-token       # Verificar token JWT
GET    /api/auth/me                 # Obtener usuario actual
```

### Google OAuth

```
GET    /api/auth/google             # Iniciar flujo OAuth
GET    /api/auth/google/callback    # Callback de Google
```

## Flujo de Autenticación

### Email/Password

```
1. Usuario ingresa email/password
2. Frontend envía POST /api/auth/login
3. Backend valida credenciales
4. Backend genera JWT + Refresh Token
5. Frontend guarda token en localStorage
6. Frontend redirige a /dashboard
```

### Google OAuth

```
1. Usuario hace clic en "Continuar con Google"
2. Frontend redirige a /api/auth/google
3. Backend redirige a Google OAuth
4. Usuario autoriza en Google
5. Google redirige a /api/auth/google/callback
6. Backend crea/busca usuario
7. Backend genera JWT
8. Backend redirige a /auth/google/callback?token=xxx
9. Frontend guarda token
10. Frontend redirige a /dashboard
```

## Seguridad

### Usuario Admin Inicial

- **IMPORTANTE**: Cambia la contraseña del admin inmediatamente después del primer login
- La contraseña por defecto es solo para desarrollo
- En producción, usa variables de entorno seguras

### Mejores Prácticas

1. **JWT_SECRET**: Usa una clave aleatoria y segura (mínimo 32 caracteres)
2. **Passwords**: Usa contraseñas fuertes con mínimo 12 caracteres
3. **HTTPS**: En producción, siempre usa HTTPS
4. **Variables de Entorno**: Nunca commitees el archivo .env
5. **Administrador de Secretos**: Usa AWS Secrets Manager, Azure Key Vault, etc.

## Personalización

### Cambiar el Logo

Reemplaza el logo en la página de login editando:
```tsx
// frontend/src/app/auth/login/page.tsx
// Línea ~173: Cambiar el ícono Shield por tu logo
```

### Cambiar Colores del Gradiente

```tsx
// frontend/src/app/auth/login/page.tsx
// Línea ~99: Modificar el gradiente de fondo
style={{
  background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
}}
```

### Tenant por Defecto para Google Login

Modifica la lógica en:
```typescript
// backend/src/auth/auth.service.ts
// Método: googleLogin()
// Personaliza cómo se asigna el tenant a nuevos usuarios de Google
```

## Troubleshooting

### Error: "No default tenant configured"

**Solución**: Ejecuta el seed para crear el tenant por defecto:
```bash
cd backend
npm run seed
```

### Error: "Invalid credentials" en Google Login

**Solución**: Verifica:
1. GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET están correctos
2. La URL de callback está registrada en Google Cloud Console
3. El proyecto de Google Cloud tiene habilitado Google+ API

### Error: "Cannot find module"

**Solución**: Reinstala las dependencias:
```bash
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

## Próximos Pasos

- [ ] Implementar verificación de email
- [ ] Agregar recuperación de contraseña
- [ ] Implementar 2FA (autenticación de dos factores)
- [ ] Agregar más proveedores OAuth (Facebook, GitHub, etc.)
- [ ] Implementar rate limiting en endpoints de auth
- [ ] Agregar logs de auditoría de login

## Soporte

Para más información, consulta:
- `SETUP_GOOGLE_OAUTH.md` - Configuración detallada de Google OAuth
- `DOCS/` - Documentación completa del framework

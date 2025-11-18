# Configuración de Google OAuth

Este documento explica cómo configurar Google OAuth para tu aplicación.

## 1. Crear un Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. En el menú lateral, ve a **APIs & Services** > **Credentials**

## 2. Configurar la Pantalla de Consentimiento OAuth

1. Ve a **OAuth consent screen**
2. Selecciona **External** (o Internal si es para una organización)
3. Completa la información requerida:
   - **App name**: Axioma Framework
   - **User support email**: Tu email
   - **Developer contact information**: Tu email
4. Guarda y continúa
5. En **Scopes**, no necesitas agregar ninguno adicional (los básicos son suficientes)
6. Guarda y continúa

## 3. Crear Credenciales OAuth 2.0

1. Ve a **Credentials** > **Create Credentials** > **OAuth client ID**
2. Selecciona **Web application**
3. Configura:
   - **Name**: Axioma Framework Web Client
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3050
     http://localhost:5100
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:5100/api/auth/google/callback
     ```
4. Haz clic en **Create**
5. Copia el **Client ID** y **Client Secret**

## 4. Configurar Variables de Entorno

### Backend (.env)

```env
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5100/api/auth/google/callback
FRONTEND_URL=http://localhost:3050
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5100/api
```

## 5. Ejecutar el Seed del Usuario Admin

Para crear el usuario administrador inicial:

```bash
cd backend
npm run seed
```

Esto creará:
- Un tenant por defecto
- Un rol de administrador
- Un usuario admin con las credenciales configuradas en el .env

**IMPORTANTE**: Cambia la contraseña del admin inmediatamente después del primer login.

## 6. Probar el Login

1. Inicia el backend:
   ```bash
   cd backend
   npm run start:dev
   ```

2. Inicia el frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Ve a http://localhost:3050/auth/login
4. Prueba el login con email/password o con Google

## Notas de Producción

Para producción, actualiza:

1. **Authorized JavaScript origins** y **Authorized redirect URIs** con tus URLs de producción
2. Actualiza las variables de entorno con las URLs correctas:
   ```env
   GOOGLE_CALLBACK_URL=https://tu-dominio.com/api/auth/google/callback
   FRONTEND_URL=https://tu-dominio.com
   ```
3. Cambia `JWT_SECRET` a un valor seguro y aleatorio
4. Usa contraseñas seguras para el admin inicial
5. Considera usar un administrador de secretos (AWS Secrets Manager, Azure Key Vault, etc.)

## Estructura de Usuarios con Google OAuth

Cuando un usuario hace login con Google:

1. El sistema busca si el email ya existe en la base de datos
2. Si existe, autentica al usuario
3. Si no existe, crea un nuevo usuario con:
   - Email de Google
   - Nombre y apellido de Google
   - Sin contraseña (password = null)
   - Email verificado automáticamente
   - Asignado al tenant por defecto

## Flujo de Autenticación

```
Usuario → Botón "Google" → /api/auth/google
                              ↓
                         Google OAuth
                              ↓
                  /api/auth/google/callback
                              ↓
                    Crear/Buscar Usuario
                              ↓
                       Generar JWT Token
                              ↓
              Redirect → /auth/google/callback?token=xxx
                              ↓
                  Frontend guarda token
                              ↓
                     Redirect a /dashboard
```

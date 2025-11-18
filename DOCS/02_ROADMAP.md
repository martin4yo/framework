# 🗺️ Roadmap - Axioma Core

## Estado Actual del Proyecto

### ✅ COMPLETADO (Sesión 1 - 16 Nov 2024)

#### Backend (100%)
- [x] Estructura base de NestJS
- [x] Configuración TypeScript, ESLint, Prettier
- [x] Schema completo de PostgreSQL
- [x] Entidades TypeORM (User, Tenant, Role, Permission, RefreshToken)
- [x] Módulo de Autenticación completo
  - [x] Registro de usuarios
  - [x] Login con JWT
  - [x] Refresh tokens
  - [x] Logout
  - [x] Estrategias Passport (JWT, Local)
  - [x] Guards (JwtAuthGuard, PermissionsGuard)
  - [x] Decoradores (@CurrentUser, @Public, @RequirePermission)
- [x] Módulo de Tenants (CRUD completo)
- [x] Módulo de Users (CRUD completo)
- [x] Módulo de Roles (CRUD completo)
- [x] Módulo de Permissions (CRUD completo)
- [x] Sistema de permisos con CASL
- [x] Validación de DTOs
- [x] Soft deletes
- [x] Variables de entorno configuradas

#### Frontend (40%)
- [x] Estructura base de Next.js 14
- [x] Configuración TypeScript
- [x] Tailwind CSS con paleta de colores
- [x] Cliente API Axios con interceptores
- [x] Refresh automático de tokens
- [x] Página de inicio (landing)
- [x] Estilos base (botones, inputs, cards)
- [ ] Páginas de autenticación (Login, Register)
- [ ] Dashboard principal
- [ ] Componentes UI reutilizables
- [ ] Gestión de Tenants (UI)
- [ ] Gestión de Users (UI)
- [ ] Gestión de Roles (UI)
- [ ] Gestión de Permissions (UI)
- [ ] Middleware de autenticación
- [ ] Protección de rutas

#### Infraestructura (80%)
- [x] Schema de base de datos PostgreSQL
- [x] Docker Compose (opcional)
- [x] Concurrently para dev
- [x] Scripts npm unificados
- [x] Variables de entorno
- [x] Documentación completa
- [ ] Tests unitarios
- [ ] Tests E2E
- [ ] CI/CD

---

## Fases del Proyecto

### 📍 FASE 1: Fundación (COMPLETADA ✅)

**Objetivo**: Crear la base técnica completa del sistema

**Duración estimada**: 1 sesión (completada)

**Entregables**:
- ✅ Backend API funcional
- ✅ Frontend base con Next.js
- ✅ Base de datos con schema completo
- ✅ Sistema de autenticación JWT
- ✅ Sistema de permisos CASL
- ✅ Documentación inicial

---

### 📍 FASE 2: Autenticación UI (SIGUIENTE)

**Objetivo**: Crear las interfaces de login y registro

**Duración estimada**: 1-2 sesiones

**Tareas**:
1. **Página de Login** (4-6 horas)
   - [ ] Diseño responsive con Tailwind
   - [ ] Formulario con React Hook Form
   - [ ] Validación con Zod
   - [ ] Integración con API
   - [ ] Manejo de errores
   - [ ] Loading states
   - [ ] Redirección post-login

2. **Página de Registro** (4-6 horas)
   - [ ] Formulario de registro
   - [ ] Validación de password
   - [ ] Selector de tenant (o creación)
   - [ ] Integración con API
   - [ ] Confirmación de email (opcional)

3. **Componentes Compartidos** (2-3 horas)
   - [ ] Button component
   - [ ] Input component
   - [ ] Card component
   - [ ] Alert/Toast notifications
   - [ ] Loading spinners

4. **Middleware de Auth** (2-3 horas)
   - [ ] Protección de rutas
   - [ ] Redirección a login si no autenticado
   - [ ] Verificación de token
   - [ ] Manejo de expiración

**Entregables**:
- Usuarios pueden registrarse
- Usuarios pueden hacer login
- Token guardado en localStorage
- Rutas protegidas funcionando

---

### 📍 FASE 3: Dashboard Principal (ESTIMADO)

**Objetivo**: Crear el dashboard principal con navegación

**Duración estimada**: 2-3 sesiones

**Tareas**:
1. **Layout del Dashboard** (6-8 horas)
   - [ ] Sidebar con navegación
   - [ ] Header con usuario y logout
   - [ ] Contenido principal responsive
   - [ ] Menu móvil (hamburger)
   - [ ] Breadcrumbs

2. **Página Home/Stats** (4-6 horas)
   - [ ] Cards con estadísticas
   - [ ] Gráficos (opcional)
   - [ ] Lista de actividad reciente
   - [ ] Quick actions

3. **Navegación** (2-3 horas)
   - [ ] Links a todas las secciones
   - [ ] Highlight de sección activa
   - [ ] Iconos con Lucide
   - [ ] Tooltips

**Entregables**:
- Dashboard funcional con navegación
- Usuario puede navegar entre secciones
- Logout funciona
- UI consistente

---

### 📍 FASE 4: Gestión de Tenants (ESTIMADO)

**Objetivo**: CRUD completo de tenants desde UI

**Duración estimada**: 1-2 sesiones

**Tareas**:
1. **Lista de Tenants** (3-4 horas)
   - [ ] Tabla con todos los tenants
   - [ ] Búsqueda/filtrado
   - [ ] Paginación
   - [ ] Botón crear nuevo
   - [ ] Acciones (editar, eliminar)

2. **Crear/Editar Tenant** (4-5 horas)
   - [ ] Modal o página de formulario
   - [ ] Validación
   - [ ] Integración con API
   - [ ] Success/error feedback

3. **Ver Detalles Tenant** (2-3 horas)
   - [ ] Página de detalles
   - [ ] Usuarios del tenant
   - [ ] Configuración
   - [ ] Estadísticas

**Entregables**:
- CRUD completo de tenants
- Admin puede gestionar tenants desde UI
- Validaciones funcionando

---

### 📍 FASE 5: Gestión de Usuarios (ESTIMADO)

**Objetivo**: CRUD completo de usuarios desde UI

**Duración estimada**: 2-3 sesiones

**Tareas**:
1. **Lista de Usuarios** (4-5 horas)
   - [ ] Tabla con usuarios
   - [ ] Filtros (por tenant, rol, estado)
   - [ ] Búsqueda
   - [ ] Paginación
   - [ ] Badges de roles

2. **Crear/Editar Usuario** (5-6 horas)
   - [ ] Formulario completo
   - [ ] Asignación de roles
   - [ ] Cambio de password
   - [ ] Activar/desactivar usuario

3. **Perfil de Usuario** (3-4 horas)
   - [ ] Página de perfil
   - [ ] Editar datos personales
   - [ ] Cambiar password
   - [ ] Ver permisos

**Entregables**:
- CRUD completo de usuarios
- Asignación de roles
- Gestión de perfiles

---

### 📍 FASE 6: Gestión de Roles y Permisos (ESTIMADO)

**Objetivo**: UI para gestionar roles y permisos

**Duración estimada**: 2-3 sesiones

**Tareas**:
1. **Gestión de Roles** (5-6 horas)
   - [ ] Lista de roles
   - [ ] Crear/editar rol
   - [ ] Asignar permisos a rol
   - [ ] UI de matrix de permisos
   - [ ] Roles de sistema (readonly)

2. **Gestión de Permisos** (4-5 horas)
   - [ ] Lista de permisos
   - [ ] Crear permiso custom
   - [ ] Condiciones avanzadas
   - [ ] Visualización de recursos

3. **Asignación** (3-4 horas)
   - [ ] Asignar roles a usuarios
   - [ ] Asignar permisos a roles
   - [ ] Bulk operations

**Entregables**:
- CRUD de roles
- CRUD de permisos
- Sistema de asignación funcional

---

### 📍 FASE 7: Features Avanzadas (FUTURO)

**Objetivo**: Funcionalidades enterprise

**Duración estimada**: 4-6 sesiones

**Tareas**:
1. **Audit Logs** (6-8 horas)
   - [ ] Registro automático de acciones
   - [ ] UI para ver logs
   - [ ] Filtros y búsqueda
   - [ ] Export de logs

2. **Email Verification** (4-6 horas)
   - [ ] Envío de email de verificación
   - [ ] Link de confirmación
   - [ ] Reenvío de email
   - [ ] Templates

3. **Password Reset** (4-5 horas)
   - [ ] Flow completo de reset
   - [ ] Email con link
   - [ ] Página de reset
   - [ ] Validación de token

4. **2FA (Autenticación 2 Factores)** (8-10 horas)
   - [ ] Setup de 2FA
   - [ ] QR Code con secret
   - [ ] Validación de código
   - [ ] Backup codes

5. **API Keys** (5-6 horas)
   - [ ] Generación de API keys
   - [ ] Gestión de keys
   - [ ] Rate limiting
   - [ ] Revocación

6. **Webhooks** (6-8 horas)
   - [ ] Configuración de webhooks
   - [ ] Eventos disponibles
   - [ ] Retry logic
   - [ ] Logs de webhooks

7. **Multi-idioma** (4-5 horas)
   - [ ] i18n en frontend
   - [ ] Selector de idioma
   - [ ] Traducción de emails
   - [ ] Español + Inglés

**Entregables**:
- Sistema completo nivel enterprise
- Auditoría completa
- Seguridad avanzada

---

### 📍 FASE 8: Testing y Deployment (FUTURO)

**Objetivo**: Preparar para producción

**Duración estimada**: 3-4 sesiones

**Tareas**:
1. **Testing Backend** (8-10 horas)
   - [ ] Tests unitarios de services
   - [ ] Tests de controllers
   - [ ] Tests de guards
   - [ ] Tests E2E de API
   - [ ] Coverage > 80%

2. **Testing Frontend** (6-8 horas)
   - [ ] Tests de componentes
   - [ ] Tests de integración
   - [ ] Tests E2E con Playwright
   - [ ] Visual regression tests

3. **CI/CD** (6-8 horas)
   - [ ] GitHub Actions
   - [ ] Lint automático
   - [ ] Tests automáticos
   - [ ] Build automático
   - [ ] Deploy automático

4. **Deployment** (8-10 horas)
   - [ ] Docker production
   - [ ] Nginx reverse proxy
   - [ ] SSL certificates
   - [ ] Environment configs
   - [ ] Monitoring
   - [ ] Backups

**Entregables**:
- Tests completos
- CI/CD configurado
- App deployada en producción

---

## Prioridades por Tipo de Usuario

### Si eres un desarrollador individual
**Prioridad**: Fases 2, 3, 4, 5
- Necesitas la UI funcional rápido
- Features avanzadas pueden esperar

### Si eres una empresa
**Prioridad**: Todas las fases en orden
- Necesitas features enterprise
- Testing y deployment críticos

### Si quieres una demo rápida
**Prioridad**: Fase 2 (Login) + Backend existente
- Con Postman puedes probar todo el backend
- Login permite mostrar el concepto

---

## Métricas de Completitud

### Global: **55%**

| Componente | Completitud | Estado |
|------------|-------------|---------|
| Backend API | 100% | ✅ Completo |
| Base de Datos | 100% | ✅ Completo |
| Autenticación | 100% | ✅ Completo |
| Frontend Base | 40% | 🟡 En progreso |
| UI Auth | 0% | ⚪ Pendiente |
| UI Dashboard | 0% | ⚪ Pendiente |
| UI CRUD | 0% | ⚪ Pendiente |
| Testing | 0% | ⚪ Pendiente |
| Deployment | 0% | ⚪ Pendiente |

---

## Siguiente Sesión: Plan de Acción

### 🎯 Objetivo Principal
Completar las páginas de Login y Registro

### ✅ Checklist de Tareas
1. [ ] Crear componente Button reutilizable
2. [ ] Crear componente Input reutilizable
3. [ ] Crear página `/login`
4. [ ] Crear página `/register`
5. [ ] Implementar formulario de login con validación
6. [ ] Implementar formulario de registro
7. [ ] Integrar con API backend
8. [ ] Crear middleware de autenticación
9. [ ] Probar flujo completo

### 📦 Entregables
- Usuario puede hacer login
- Usuario puede registrarse
- Tokens guardados en localStorage
- Redirección a dashboard (placeholder)

---

**Última actualización**: 16 Nov 2024
**Próxima revisión**: Inicio de sesión siguiente

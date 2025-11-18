# 📋 Checklist para la Próxima Sesión

**Objetivo**: Implementar Login y Register

**Duración estimada**: 4-6 horas

---

## ✅ Pre-requisitos (Verificar antes de empezar)

- [ ] PostgreSQL corriendo
- [ ] Base de datos `core_db` creada
- [ ] Schema cargado (`psql -U postgres -d core_db -f database/schema.sql`)
- [ ] Dependencias instaladas (`npm run install:all`)
- [ ] Backend funciona (`npm run dev:backend`)
- [ ] Frontend funciona (`npm run dev:frontend`)

---

## 🎯 Tareas Principales

### 1. Componentes UI Base (1-2 horas)

#### Button Component
- [ ] Crear `frontend/src/components/ui/Button.tsx`
- [ ] Props: `variant`, `size`, `disabled`, `loading`, `onClick`, `children`
- [ ] Variantes: `primary`, `secondary`, `outline`, `danger`
- [ ] Estados: normal, hover, active, disabled, loading
- [ ] Usar clases de Tailwind del globals.css

**Código inicial**:
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({ variant = 'primary', ... }: ButtonProps) {
  // Implementation
}
```

#### Input Component
- [ ] Crear `frontend/src/components/ui/Input.tsx`
- [ ] Props: `type`, `label`, `error`, `placeholder`, `value`, `onChange`
- [ ] Tipos: text, email, password, number
- [ ] Mostrar mensaje de error si existe
- [ ] Usar clase `input-base` de globals.css

**Código inicial**:
```tsx
interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  error?: string;
  placeholder?: string;
  name: string;
  // ... react-hook-form props
}
```

#### Alert Component
- [ ] Crear `frontend/src/components/ui/Alert.tsx`
- [ ] Props: `type`, `message`, `onClose`
- [ ] Tipos: success, error, warning, info
- [ ] Con ícono y botón de cerrar
- [ ] Animación fade in/out

---

### 2. Context de Autenticación (1 hora)

- [ ] Crear `frontend/src/contexts/AuthContext.tsx`
- [ ] State: `user`, `loading`, `isAuthenticated`
- [ ] Funciones: `login()`, `logout()`, `register()`
- [ ] Hook personalizado: `useAuth()`
- [ ] Guardar/recuperar tokens de localStorage
- [ ] Verificar token al montar

**Código inicial**:
```tsx
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
  register: (data: RegisterDto) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

- [ ] Envolver app en `AuthProvider` (en `app/layout.tsx`)

---

### 3. Página de Login (1.5 horas)

- [ ] Crear `frontend/src/app/login/page.tsx`
- [ ] Formulario con React Hook Form
- [ ] Schema de validación con Zod
- [ ] Campos: tenantSlug, email, password
- [ ] Botón submit con loading state
- [ ] Link a registro
- [ ] Manejo de errores con Alert
- [ ] Redirección a /dashboard después de login

**Schema Zod**:
```tsx
const loginSchema = z.object({
  tenantSlug: z.string().min(2, 'Tenant requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});
```

**Integración**:
```tsx
const { login } = useAuth();

const onSubmit = async (data: LoginFormData) => {
  try {
    await login(data);
    router.push('/dashboard');
  } catch (error) {
    setError('Credenciales inválidas');
  }
};
```

---

### 4. Página de Registro (1.5 horas)

- [ ] Crear `frontend/src/app/register/page.tsx`
- [ ] Formulario completo con React Hook Form
- [ ] Schema de validación con Zod
- [ ] Campos: tenantSlug, email, password, confirmPassword, firstName, lastName
- [ ] Validación de password match
- [ ] Validación de password fuerte
- [ ] Link a login
- [ ] Redirección después de registro

**Schema Zod**:
```tsx
const registerSchema = z.object({
  tenantSlug: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/, 'Debe tener mayúscula')
    .regex(/[0-9]/, 'Debe tener número'),
  confirmPassword: z.string(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});
```

---

### 5. Middleware de Autenticación (30 min)

- [ ] Crear `frontend/src/middleware.ts`
- [ ] Verificar token en rutas protegidas
- [ ] Redireccionar a /login si no autenticado
- [ ] Permitir rutas públicas: /, /login, /register

**Código**:
```tsx
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const isAuthPage = ['/login', '/register'].includes(request.nextUrl.pathname);

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
```

---

### 6. Dashboard Placeholder (1 hora)

- [ ] Crear `frontend/src/app/dashboard/layout.tsx` con sidebar
- [ ] Crear `frontend/src/app/dashboard/page.tsx`
- [ ] Mostrar datos del usuario
- [ ] Botón de logout
- [ ] Navegación básica (sidebar)

**Layout básico**:
```tsx
export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-text-white">
        <nav>...</nav>
        <button onClick={logout}>Logout</button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

---

## 🧪 Testing Manual

### Flujo Completo a Probar

1. **Registro**:
   - [ ] Ir a http://localhost:3000/register
   - [ ] Llenar formulario con datos válidos
   - [ ] Click en "Registrarse"
   - [ ] Verificar redirección a /dashboard
   - [ ] Verificar que aparece nombre del usuario

2. **Logout**:
   - [ ] Click en botón "Logout"
   - [ ] Verificar redirección a /login
   - [ ] Verificar que tokens fueron eliminados

3. **Login**:
   - [ ] Ir a http://localhost:3000/login
   - [ ] Ingresar credenciales del usuario creado
   - [ ] Click en "Iniciar Sesión"
   - [ ] Verificar redirección a /dashboard
   - [ ] Verificar que aparece nombre del usuario

4. **Protección de Rutas**:
   - [ ] Sin estar logueado, ir a http://localhost:3000/dashboard
   - [ ] Verificar redirección a /login
   - [ ] Loguearse
   - [ ] Intentar ir a http://localhost:3000/login
   - [ ] Verificar redirección a /dashboard

5. **Validaciones**:
   - [ ] Probar login con email inválido
   - [ ] Probar login con password corto
   - [ ] Probar registro con passwords que no coinciden
   - [ ] Probar registro con email duplicado

---

## 📦 Archivos a Crear

```
frontend/src/
├── components/
│   └── ui/
│       ├── Button.tsx       ⭐ NUEVO
│       ├── Input.tsx        ⭐ NUEVO
│       └── Alert.tsx        ⭐ NUEVO
├── contexts/
│   └── AuthContext.tsx      ⭐ NUEVO
├── app/
│   ├── login/
│   │   └── page.tsx         ⭐ NUEVO
│   ├── register/
│   │   └── page.tsx         ⭐ NUEVO
│   ├── dashboard/
│   │   ├── layout.tsx       ⭐ NUEVO
│   │   └── page.tsx         ⭐ NUEVO
│   └── layout.tsx           📝 MODIFICAR (agregar AuthProvider)
└── middleware.ts            ⭐ NUEVO
```

**Total**: 9 archivos nuevos, 1 modificado

---

## 🎨 Referencias de Diseño

Usar la paleta de colores ya definida en `tailwind.config.ts`:

- **Botón Primary**: `bg-palette-dark text-primary hover:bg-palette-purple`
- **Botón Secondary**: `bg-secondary hover:bg-secondary-hover`
- **Input**: Clase `input-base` ya definida
- **Sidebar**: `bg-sidebar text-text-white`
- **Errores**: Color `danger` (#ef4444)

---

## 💡 Tips

1. **Usar React Hook Form**:
```tsx
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(loginSchema),
});
```

2. **Loading States**:
```tsx
const [loading, setLoading] = useState(false);
// En submit:
setLoading(true);
try { ... } finally { setLoading(false); }
```

3. **Error Handling**:
```tsx
try {
  await authApi.login(data);
} catch (error: any) {
  const message = error.response?.data?.message || 'Error desconocido';
  setError(message);
}
```

---

## 📊 Criterios de Éxito

Al finalizar esta sesión, deberás tener:

- ✅ Usuario puede registrarse
- ✅ Usuario puede hacer login
- ✅ Tokens guardados correctamente
- ✅ Dashboard muestra datos del usuario
- ✅ Logout funciona
- ✅ Rutas protegidas funcionan
- ✅ Validaciones de formularios funcionan
- ✅ Manejo de errores funcional
- ✅ UI consistente con paleta de colores

---

## 🔍 Comandos para Debugging

```bash
# Ver logs del backend
cd backend && npm run start:dev

# Ver logs del frontend
cd frontend && npm run dev

# Ver estado de localStorage (en DevTools Console)
localStorage.getItem('accessToken')
localStorage.getItem('refreshToken')

# Limpiar localStorage
localStorage.clear()

# Ver datos en PostgreSQL
psql -U postgres -d core_db
SELECT * FROM users;
SELECT * FROM tenants;
\q
```

---

## 📚 Documentación de Referencia

- React Hook Form: https://react-hook-form.com/
- Zod: https://zod.dev/
- Next.js Middleware: https://nextjs.org/docs/app/building-your-application/routing/middleware
- Tailwind CSS: https://tailwindcss.com/docs

---

## ✅ Al Terminar

- [ ] Hacer commit de cambios
- [ ] Actualizar `DOCS/04_CONTEXTO_SESION.md` con nuevo progreso
- [ ] Actualizar `DOCS/02_ROADMAP.md` (marcar Fase 2 como completada)
- [ ] Documentar cualquier problema encontrado
- [ ] Preparar lista de tareas para Fase 3 (Dashboard completo)

---

**Tiempo total estimado**: 4-6 horas
**Dificultad**: Media
**Prioridad**: Alta (bloqueante para siguientes fases)

**¡Buena suerte!** 🚀

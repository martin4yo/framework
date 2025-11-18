# Axioma Core - Frontend

Frontend de Axioma Core construido con Next.js 14, TypeScript y Tailwind CSS.

## Características

- **Next.js 14** con App Router
- **TypeScript** para type safety
- **Tailwind CSS** con paleta de colores personalizada
- **Axios** para llamadas API con interceptores
- **React Hook Form** + **Zod** para validación de formularios
- **Lucide Icons** para iconografía consistente

## Paleta de Colores

La aplicación utiliza una paleta de colores **amarillo-púrpura** consistente:

- **Palette Dark**: `#352151` - Púrpura oscuro para sidebar y textos principales
- **Palette Purple**: `#8E6AAA` - Púrpura medio para botones secundarios
- **Palette Yellow/Cream**: `#FCE5B7` - Amarillo crema para botones primarios
- **Palette Pink**: `#F1ABB5` - Rosa para acentos

## Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.local.example .env.local

# Configurar la URL del backend en .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3001`

## Build para Producción

```bash
# Crear build
npm run build

# Iniciar en producción
npm start
```

## Estructura de Carpetas

```
src/
├── app/                    # App Router
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página de inicio
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes UI base
│   └── forms/            # Componentes de formularios
├── lib/                  # Utilidades
│   ├── api.ts            # Cliente API con Axios
│   └── utils.ts          # Funciones utilitarias
└── types/                # Tipos TypeScript
```

## Integración con Backend

El frontend se comunica con el backend de Axioma Core vía REST API. Todos los endpoints están configurados en `src/lib/api.ts`.

### Autenticación

- Los tokens JWT se almacenan en `localStorage`
- El refresh token se utiliza automáticamente cuando el access token expira
- Los interceptores de Axios manejan la autenticación automáticamente

### Endpoints Disponibles

- `/auth/login` - Login
- `/auth/register` - Registro
- `/auth/me` - Usuario actual
- `/tenants` - Gestión de tenants
- `/users` - Gestión de usuarios
- `/roles` - Gestión de roles
- `/permissions` - Gestión de permisos

## Próximos Pasos

- [ ] Crear página de login
- [ ] Crear página de registro
- [ ] Crear dashboard principal
- [ ] Implementar gestión de tenants
- [ ] Implementar gestión de usuarios
- [ ] Implementar gestión de roles y permisos
- [ ] Agregar middleware de autenticación
- [ ] Agregar protección de rutas

## Licencia

MIT

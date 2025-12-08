# Countdown Generator (Next.js 14, TS, SQLite)

Aplicación para crear y compartir contadores.

Tecnologías: Next.js (App Router), TypeScript, Prisma + SQLite, NextAuth v5 (Credentials), Zustand, date-fns(-tz), SCSS Modules.

## Configuración

1. Clonar e instalar dependencias

```bash
npm install
```

2. Variables de entorno

Copiar `.env.example` a `.env` y ajustar `NEXTAUTH_SECRET`.

3. Base de datos

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Levantar

```bash
npm run dev
```

## Flujo

- Ir a `/login` e ingresar correo y contraseña. Si el correo no existe, se crea automáticamente.
- Ir a `/admin/dashboard` para crear contadores (título, descripción, imagen, fecha local). El timezone se toma del navegador.
- Cada contador queda disponible en `/{slug}` con imagen de fondo, título/descripcion y contador grande. Abajo se muestra la zona horaria detectada y se puede cambiar manualmente.

## Notas

- `targetDate` se guarda en UTC usando `date-fns-tz` a partir de la fecha local y timezone del usuario.
- El slug se deduce del título y se hace único automáticamente.
- La sección admin está protegida en `app/admin/layout.tsx` verificando sesión con `auth()`.


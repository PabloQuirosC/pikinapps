# src/routes

Archivos de ruta de TanStack Router. Cada archivo define una URL mediante
`createFileRoute("/ruta")` y se registra solo: el árbol (`routeTree.gen.ts`)
se regenera automáticamente, nunca se edita a mano.

- `__root.tsx` — envolvente global: fuentes, tema, sistema de modales.
- `index.tsx` — sitio público ("/").
- `login.tsx` — inicio de sesión ("/login"), credenciales simuladas.
- `admin.tsx` — panel privado ("/admin"), protegido por sesión.

# PodoConsulta - App de Historias Clínicas

## Cómo deployar en Vercel

### Opción A — GitHub + Vercel (recomendada)

1. Crear cuenta en github.com
2. Crear repositorio nuevo llamado `podologia-app`
3. Subir todos estos archivos al repositorio
4. Ir a vercel.com → "Add New Project"
5. Conectar con GitHub y seleccionar el repositorio
6. Clic en "Deploy"
7. ¡Listo! Vercel te da una URL pública

### Opción B — Vercel CLI (desde la computadora)

```bash
npm install -g vercel
cd podologia-app
npm install
vercel
```

## Estructura del proyecto

```
podologia-app/
├── src/
│   ├── lib/
│   │   └── supabase.js       ← credenciales de Supabase
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Home.jsx
│   │   ├── NuevoPaciente.jsx
│   │   ├── Paciente.jsx
│   │   └── NuevaConsulta.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

## Próximos pasos sugeridos
- Configurar RLS (Row Level Security) en Supabase
- Agregar búsqueda de consultas por fecha
- Exportar historial a PDF

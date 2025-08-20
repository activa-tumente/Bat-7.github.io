# Sistema de Gestión Psicológica - BAT-7

Sistema web para la gestión de evaluaciones psicológicas utilizando la batería de aptitudes BAT-7.

## 🚀 Despliegue

La aplicación está desplegada en GitHub Pages y se puede acceder a través de la siguiente URL:

[https://activa-tumente.github.io/Bat-7.github.io/](https://activa-tumente.github.io/Bat-7.github.io/)

### Despliegue Manual

Para desplegar una nueva versión de la aplicación, simplemente ejecuta el siguiente script:

```bash
./deploy-manual.bat
```

Este script se encargará de compilar el proyecto, crear una nueva rama `gh-pages` y subir los archivos necesarios para el despliegue.

## 🛠️ Desarrollo Local

Si quieres ejecutar el proyecto en tu entorno local, sigue estos pasos:

```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar en modo desarrollo
npm run dev
```

## 📁 Estructura del Proyecto

```
src/
├── api/           # Conexión y configuración de Supabase
├── components/    # Componentes de React reutilizables
├── hooks/         # Custom hooks para la lógica de negocio
├── pages/         # Páginas principales de la aplicación
├── store/         # Configuración de Redux Toolkit
├── styles/        # Estilos globales y de componentes
└── utils/         # Funciones de utilidad
```

## ✨ Características

*   **Gestión de pacientes:** Alta, baja y modificación de pacientes.
*   **Realización de tests:** Interfaz para que los pacientes realicen los tests del BAT-7.
*   **Generación de informes:** Creación de informes detallados con los resultados de las evaluaciones.
*   **Dashboard de administrador:** Panel de control para la gestión de usuarios y tests.

## 🔧 Tecnologías

*   **React 18:** Biblioteca para construir interfaces de usuario.
*   **Vite:** Herramienta de compilación y servidor de desarrollo.
*   **React Router:** Para la gestión de rutas en la aplicación.
*   **Tailwind CSS:** Framework de CSS para un diseño rápido y moderno.
*   **Redux Toolkit:** Para la gestión del estado de la aplicación.
*   **Supabase:** Como backend y base de datos PostgreSQL.

## 📄 Licencia

Este proyecto está bajo la licencia MIT.
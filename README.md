# Digital Inventory Management System

Sistema de Administracion de Inventarios

### Prerrequisitos

Asegúrate de tener instalados los siguientes programas en tu entorno:

* **Node.js** v20+ 
* **pnpm** puedes instalarlo globalmente si no lo tienes:
```bash
npm install -g pnpm
```

### Instalación y Configuración

Sigue estos pasos para levantar el proyecto:

1.  **Clonar el repositorio via SSH:**
    ```bash
    git clone git@github.com:almircoo/digitalims.git 
    cd digitalims
    ```
    Nota: Cambia el url del repo si se clona via http a: `https://github.com/almircoo/digitalims.git`

2.  **Instalar dependencias:**
    Utilizamos `pnpm` para la instalación de paquetes, lo que garantiza una gestión de dependencias rápida y eficiente.
    ```bash
    pnpm install
    ```

3.  **Configurar Variables de Entorno :**
    Si el proyecto requiere variables de entorno (como URLs de API o claves), duplica el archivo de ejemplo y edítalo:
    ```bash
    cp .env
    # Edita el archivo .env.example con tus valores locales
    ```
    *Nota: Las variables en Vite deben comenzar con el prefijo `VITE_`.*

### Ejecutar el Proyecto

Una vez instaladas las dependencias, puedes iniciar el servidor de desarrollo de Vite:

```bash
pnpm run dev

```

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

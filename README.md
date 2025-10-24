# Gestor de Cabaña - Proyecto Full-Stack

Este proyecto está organizado en dos directorios principales: `frontend` y `backend`.

## Descripción

-   **`frontend/`**: Contiene la aplicación de cliente construida con React y TypeScript. Se encarga de toda la interfaz de usuario.
-   **`backend/`**: Contiene el servidor de Node.js y Express, que gestiona la API, la conexión a la base de datos MariaDB, la autenticación y la lógica de negocio.

## Cómo Ejecutar el Proyecto

Debes iniciar ambos, el backend y el frontend, en terminales separadas.

### 1. Iniciar el Backend

Primero, configura e inicia el servidor.

```bash
# Navega al directorio del backend
cd backend

# Instala las dependencias (solo la primera vez)
npm install

# Inicia el servidor (revisa backend/README.md para configurar .env)
npm start
```

El servidor se ejecutará en `http://localhost:4000`.

### 2. Iniciar el Frontend

Abre una **nueva terminal** y sigue estos pasos. La forma más fácil de servir el frontend es usando una herramienta simple como `serve`.

```bash
# Instala 'serve' globalmente (si no lo tienes)
npm install -g serve

# Desde la raíz del proyecto, navega al directorio del frontend
cd frontend

# Sirve los archivos del frontend
serve -s .
```

La aplicación frontend estará disponible generalmente en `http://localhost:3000`. ¡Abre esa URL en tu navegador!
## Frontend Version 2.0

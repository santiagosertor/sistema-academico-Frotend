# Sistema Académico - Frontend

Interfaz de usuario moderna para el Sistema Académico, desarrollada como una **Single Page Application (SPA)** enfocada en la velocidad y modularidad.

---

## Tecnologías Utilizadas

*   **Bundler:** [Vite](https://vitejs.dev) (Entorno de desarrollo ultra rápido).
*   **Lenguaje:** JavaScript (ES Modules).
*   **Estilos:** HTML5 & CSS3 (Diseño responsivo).
*   **Componentes Visuales:** SweetAlert2 (Alertas interactivas).

---

## Estructura del Proyecto

```text
frontend/
├── Frotend/            # Vistas HTML (Módulos de la interfaz)
├── css/                # Hojas de estilo globales y modulares
├── src/                # Lógica principal de la aplicación
│   └── main.js         # Punto de entrada de JavaScript
├── index.html          # Archivo raíz
├── package.json        # Dependencias y scripts de Vite
└── vite.config.js      # Configuración del entorno
```



Instalación y Configuración
Sigue estos pasos para ejecutar el proyecto en tu máquina local:

1. Clonar el repositorio:

git clone https://github.com

cd sistema-academico-Frotend


3. Instalar dependencias:
npm install


4. Configurar Variables de Entorno (Opcional):
Crea un archivo .env en la raíz si necesitas conectar con el backend:
env
VITE_API_URL=http://localhost:3000


5. Iniciar Servidor de Desarrollo:
npm run dev

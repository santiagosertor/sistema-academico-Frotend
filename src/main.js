// ===============================
// IMPORTACIÓN DE ESTILOS GLOBALES
// ===============================
import "../src/css/global.css";
import "../src/css/menu.css";
import "../src/css/login.css";
import "../src/css/panel.css";
import "../src/css/admin.css";
import "../src/css/docente.css";
import "../src/css/estudiante.css";


// Contenedor principal
const app = document.getElementById('app');

// Ruta inicial (relativa al index.html)
const MENU_PATH = './login/menu.html';

// ===============================
// CARGAR VISTA
// ===============================
async function cargarVista(rutaHtml) {
  try {
    const resp = await fetch(rutaHtml);

    if (!resp.ok) {
      console.error('❌ No se pudo cargar la vista:', rutaHtml);
      return fallbackMenu();
    }

    const html = await resp.text();
    app.innerHTML = html;

    // ===== LOGIN =====
    if (rutaHtml.includes('login.html')) {
      const modulo = await import('../login/login.js');
      modulo.initLogin();
    }

    // ===== REGISTRO =====
    else if (rutaHtml.includes('registrar.html')) {
      const modulo = await import('../login/registro.js');
      modulo.initRegistro();
    }

    // ===== ESTUDIANTE =====
    else if (rutaHtml.includes('estudiante.html')) {
      const modulo = await import('../Estudiante/estudiante.js');
      modulo.initEstudiante();
    }

    // ===== ADMIN =====
    else if (rutaHtml.includes('admin.html')) {
      const modulo = await import('../Admin/admin.js');
      modulo.initAdmin();
    }

    // ===== DOCENTE =====
    else if (rutaHtml.includes('docente.html')) {
      const modulo = await import('../Docentes/docente.js');
      modulo.initDocente();
    }

  } catch (error) {
    console.error('❌ Error general cargando vista:', error);
    fallbackMenu();
  }
}

// ===============================
// FALLBACK
// ===============================
function fallbackMenu() {
  console.warn('Redirigiendo al menú...');
  cargarVista(MENU_PATH);
}

// ===============================
// NAVEGACIÓN GLOBAL
// ===============================
window.navegar = (ruta) => {
  cargarVista(ruta);
};

// ===============================
// INICIO SPA
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  cargarVista(MENU_PATH);
});

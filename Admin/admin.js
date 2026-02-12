/**
 * Inicializa el panel de administración.
 * - Verifica la existencia del contenedor principal.
 * - Configura navegación lateral para cargar sub-vistas.
 * - Activa botón de cerrar sesión.
 * - Carga por defecto la vista de dashboard.
 *
 * Decisión técnica:
 * Se encapsula en `initAdmin` para que solo se ejecute cuando
 * la vista de administración esté activa en la SPA.
 */
export function initAdmin() {
  console.log('🟡 initAdmin ejecutado');

  const cont = document.getElementById('admin-contenido');
  if (!cont) {
    console.error('❌ admin-contenido NO existe');
    return;
  }
  console.log('✅ admin-contenido encontrado');

  // Configuración de navegación lateral:
  // Cada botón con atributo data-vista carga la subvista correspondiente.
  document.querySelectorAll('.sidebar button[data-vista]').forEach(btn => {
    btn.addEventListener('click', () => cargarSubVista(btn.dataset.vista));
  });

  // Botón de cerrar sesión
  document.getElementById('btnCerrarSesion')
    .addEventListener('click', cerrarSesion);

}

/**
 * Carga dinámicamente una subvista del panel de administración.
 * - Obtiene fragmento HTML desde el servidor.
 * - Inyecta contenido en el contenedor principal.
 * - Importa módulo JS correspondiente y ejecuta su función init.
 *
 * Decisión técnica:
 * Se usa `import()` dinámico para cargar solo el código necesario,
 * optimizando rendimiento y manteniendo modularidad.
 *
 * Validación crítica:
 * Se verifica respuesta OK antes de renderizar contenido.
 */
async function cargarSubVista(vista) {
  const cont = document.getElementById('admin-contenido');
  if (!cont) return;

  // Normalizar nombres para que coincidan con archivos
  if (vista === 'cursos') vista = 'cursos';

  try {
    // HTML fragment
    const resp = await fetch(`Admin/${vista}.html`);
    if (!resp.ok) {
      cont.innerHTML = `<h2>Error cargando ${vista}</h2>`;
      return;
    }
    const html = await resp.text();
    cont.innerHTML = html;

    // JS module dinámico
    const modulo = await import(`/Admin/${vista}.js`);
    const initFn = `init${vista.charAt(0).toUpperCase() + vista.slice(1)}`;
    if (modulo[initFn]) {
      modulo[initFn]();
    }
  } catch (err) {
    console.error('Error cargando subvista:', err);
    cont.innerHTML = `<h2>Error inesperado</h2>`;
  }
}

/**
 * Cierra la sesión del administrador.
 * - Limpia localStorage para eliminar tokens y datos sensibles.
 * - Redirige al menú de login.
 *
 * Decisión técnica:
 * Se usa `window.navegar` para mantener consistencia con la SPA.
 */
function cerrarSesion() {
  localStorage.clear();
  window.navegar('/login/menu.html');
}
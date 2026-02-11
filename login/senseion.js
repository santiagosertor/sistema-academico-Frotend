// Importación de la librería SweetAlert2.
// Se utiliza para mostrar alertas modales más amigables que los diálogos nativos.
import Swal from 'sweetalert2';

// Tiempo máximo de vida del token en milisegundos.
// Decisión técnica: se define en 10 minutos para balancear seguridad y usabilidad.
const TOKEN_TIME = 10 * 60 * 1000;     // 10 minutos

// Tiempo de advertencia antes de la expiración.
// Se fija en 8 minutos (2 minutos antes de expirar) para dar margen al usuario.
const WARNING_TIME = 2 * 60 * 1000;    // Avisar a los 8 min

// Flag que evita mostrar múltiples veces la misma alerta de advertencia.
let warningShown = false;

/**
 * Inicia el observador de sesión.
 * - Configura un intervalo que ejecuta `checkSession` cada 30 segundos.
 * - Decisión técnica: se usa `setInterval` en lugar de eventos push
 *   porque el control de expiración depende del tiempo local.
 */
export function startSessionWatcher() {
  setInterval(checkSession, 30000); // cada 30s
}

/**
 * Verifica el estado de la sesión en base al tiempo del token.
 * - Calcula el tiempo transcurrido desde que se guardó el token.
 * - Determina si debe mostrar advertencia o cerrar sesión.
 *
 * Validaciones críticas:
 * - Si no existe `tokenTime` en localStorage, no se hace nada (previene errores).
 * - Se controla que la alerta de advertencia se muestre solo una vez.
 */
async function checkSession() {
  const tokenTime = Number(localStorage.getItem('tokenTime'));
  if (!tokenTime) return;

  const elapsed = Date.now() - tokenTime;
  const remaining = TOKEN_TIME - elapsed;

  // ⏰ Mostrar alerta SOLO una vez
  if (remaining <= WARNING_TIME && remaining > 0 && !warningShown) {
    warningShown = true;

    // Relación entre módulos:
    // Se usa SweetAlert2 para interactuar con el usuario y decidir
    // si renovar o cerrar sesión.
    const result = await Swal.fire({
      title: 'Sesión por expirar',
      text: 'Tu sesión está por terminar ¿Deseas renovarla?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Renovar',
      cancelButtonText: 'Cerrar sesión',
      allowOutsideClick: false
    });

    if (result.isConfirmed) {
      await renovarSesion();
      warningShown = false; // reset para futuras advertencias
    } else {
      cerrarSesion();
    }
  }

  // ❌ Expirada
  // Validación crítica: si el tiempo restante es <= 0,
  // se considera la sesión expirada y se obliga al usuario a iniciar nuevamente.
  if (remaining <= 0) {
    Swal.fire(
      'Sesión expirada',
      'Debes iniciar sesión nuevamente',
      'info'
    );
    cerrarSesion();
  }
}

/////////////////////////////////////

/**
 * Renueva la sesión utilizando el refresh token.
 * - Envía una petición POST al endpoint de refresh.
 * - Si la respuesta es válida, actualiza el accessToken y el tiempo.
 *
 * Decisión técnica:
 * - Se guarda el nuevo `tokenTime` en localStorage para reiniciar el contador.
 * - Se muestra alerta de éxito para confirmar al usuario.
 *
 * Validación crítica:
 * - Si la respuesta no es OK, se fuerza el cierre de sesión para evitar
 *   inconsistencias de seguridad.
 */
async function renovarSesion() {
  const refreshToken = localStorage.getItem('refreshToken');

  const res = await fetch('http://localhost:3000/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  if (!res.ok) {
    cerrarSesion();
    return;
  }

  const data = await res.json();

  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('tokenTime', Date.now());

  Swal.fire('Renovada', 'Sesión extendida correctamente', 'success');
}

/**
 * Cierra la sesión del usuario.
 * - Limpia todo el localStorage para eliminar tokens y datos sensibles.
 * - Redirige al login para forzar nueva autenticación.
 *
 * Decisión técnica:
 * - Se usa `window.location.href` para asegurar que la SPA reinicie
 *   desde la pantalla de login.
 */
function cerrarSesion() {
  localStorage.clear();
  window.location.href = '/login.html';
}
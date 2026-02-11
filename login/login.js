// Importación del módulo de alertas.
// Relación entre módulos: se centraliza la lógica de mostrar mensajes al usuario
// para mantener consistencia en la interfaz.
import { alerta } from '../js/alertas.js';

/**
 * Inicializa la lógica de inicio de sesión.
 * - Localiza el formulario de login en el DOM.
 * - Configura validaciones básicas de campos.
 * - Envía credenciales al backend para autenticar al usuario.
 *
 * Decisión técnica:
 * Se encapsula en `initLogin` para que solo se ejecute cuando la vista
 * de login esté activa en la SPA.
 */
export function initLogin() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  /**
   * Listener del evento submit del formulario.
   * - Previene la recarga de página.
   * - Obtiene valores de usuario y contraseña.
   * - Aplica validaciones críticas antes de enviar al backend.
   */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre_usuario = document.getElementById('usuario')?.value.trim();
    const contrasena = document.getElementById('password')?.value.trim();

    // Validación crítica:
    // Se asegura que ambos campos estén completos antes de enviar.
    if (!nombre_usuario || !contrasena) {
      alerta('Completa todos los campos');
      return;
    }

    try {
      // Relación entre módulos:
      // Se envían las credenciales al backend mediante fetch.
      const resp = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_usuario, contrasena })
      });

      const data = await resp.json();
      console.log('Respuesta backend:', data);

      // Validación crítica:
      // Si la respuesta no es OK, se muestra el mensaje de error del backend.
      if (!resp.ok) {
        alerta(data.message || 'Error al iniciar sesión');
        return;
      }

      // ===============================
      // Tokens
      // ===============================
      // Se guardan los tokens en localStorage para mantener sesión activa.
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      // ===============================
      // IDs
      // ===============================
      // Se almacenan los IDs según el rol del usuario.
      // Decisión técnica: se guarda en localStorage para que otros módulos
      // puedan acceder a esta información sin necesidad de múltiples llamadas.
      if (data.usuario?.id_usuario) {
        localStorage.setItem('id_usuario', data.usuario.id_usuario);
      }
      if (data.docente?.id_docente) {
        localStorage.setItem('id_docente', data.docente.id_docente);
      }
      if (data.estudiante?.id_estudiante) {
        localStorage.setItem('id_estudiante', data.estudiante.id_estudiante);
      }

      // ===============================
      // Rol y navegación
      // ===============================
      // Se determina el rol del usuario y se redirige a la vista correspondiente.
      // Relación entre módulos: cada rol tiene su propia vista y lógica.
      const rol = (data.usuario?.roles?.[0] || '').toLowerCase();

      const rutasPorRol = {
        administrador: '../Admin/admin.html',
        admin: '../Admin/admin.html',
        docente: '../Docentes/docente.html',
        estudiante: '../Estudiante/estudiante.html'
      };

      const ruta = rutasPorRol[rol];
      if (!ruta) {
        alerta('Rol no reconocido');
        console.error('Rol no mapeado:', rol);
        return;
      }

      // Confirmación al usuario:
      // Se muestra mensaje de bienvenida y se navega a la vista correspondiente.
      alerta('Bienvenido', 'ok');
      window.navegar(ruta);

    } catch (error) {
      // Manejo de errores globales:
      // Si ocurre un fallo en la conexión, se informa al usuario y se loguea en consola.
      console.error(error);
      alerta('No se pudo conectar con el servidor');
    }
  });
}
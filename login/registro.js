import { alerta } from "../js/alertas.js";

/**
 * Inicializa la lógica de registro de usuarios.
 * - Localiza el formulario de registro en el DOM.
 * - Configura validaciones básicas de campos.
 * - Envía los datos al backend para crear un nuevo usuario.
 *
 * Decisión técnica:
 * Se encapsula en una función `initRegistro` para que solo se ejecute
 * cuando la vista de registro esté activa en la SPA.
 */
export function initRegistro() {
  const form = document.querySelector('.auth-card');

  // Validación crítica:
  // Si el formulario no existe en el DOM, se evita configurar eventos
  // y se muestra advertencia en consola.
  if (!form) {
    console.warn('Formulario de registro no encontrado');
    return;
  }

  console.log('Registro ACTIVADO');

  /**
   * Listener del evento submit del formulario.
   * - Previene el comportamiento por defecto (recarga de página).
   * - Obtiene valores de los campos y aplica validaciones.
   * - Envía la petición al backend para registrar al usuario.
   */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Obtención de valores de los campos del formulario.
    // Se usa optional chaining (?.) para evitar errores si el campo no existe.
    const nombre_usuario = document.getElementById('nombre_usuario')?.value.trim();
    const correo = document.getElementById('correo')?.value.trim();
    const contrasena = document.getElementById('contrasena')?.value.trim();
    const confirmar = document.getElementById('confirmar')?.value.trim(); // 👈 corregido

    // Validación crítica:
    // Se asegura que todos los campos requeridos estén completos.
    if (!nombre_usuario || !correo || !contrasena || !confirmar) {
      alerta('Completa todos los campos');
      return;
    }

    // Validación crítica:
    // Se comprueba que las contraseñas coincidan antes de enviar al backend.
    if (contrasena !== confirmar) {
      alerta('Las contraseñas no coinciden');
      return;
    }

    try {
      // Relación entre módulos:
      // Se envía la información al backend mediante fetch.
      // El rol se fija como "Estudiante" para mantener consistencia en la lógica de negocio.
      const resp = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_usuario,
          correo,
          contrasena,
          rol: 'Estudiante'   // 👈 se guarda como estudiante
        })
      });

      const data = await resp.json();

      // Validación crítica:
      // Si la respuesta no es OK, se muestra el mensaje de error del backend.
      if (!resp.ok) {
        alerta(data.message || 'Error al registrar');
        return;
      }

      // Confirmación al usuario:
      // Se muestra el mensaje de éxito retornado por el backend.
      alerta(data.message, "ok");

      // Relación entre módulos:
      // Tras un registro exitoso, se redirige al login para que el usuario
      // pueda autenticarse inmediatamente.
      window.navegar('/login/login.html');

    } catch (err) {
      // Manejo de errores globales:
      // Si ocurre un fallo en la petición, se informa al usuario y se loguea en consola.
      console.error(err);
      alerta('Error al registrar');
    }
  });
}
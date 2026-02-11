/**
 * Función genérica para mostrar alertas al usuario.
 * - Centraliza la lógica de notificación en la aplicación.
 * - Utiliza SweetAlert2 para una interfaz más amigable que los diálogos nativos.
 *
 * Parámetros:
 * @param {string} mensaje - Texto a mostrar en la alerta.
 * @param {string} tipo - Tipo de alerta ('ok' para éxito, 'error' por defecto).
 *
 * Decisión técnica:
 * Se encapsula en una sola función para evitar duplicación de código
 * y mantener consistencia en la forma de notificar al usuario.
 */
export function alerta(mensaje, tipo = 'error') {
  if (tipo === 'ok') {
    // Caso de éxito:
    // Se muestra un mensaje breve con ícono de éxito.
    // Validación crítica: se configura un timer para cerrar automáticamente
    // la alerta y no interrumpir el flujo del usuario.
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: mensaje,
      timer: 1500,
      showConfirmButton: false
    });
  } else {
    // Caso de error:
    // Se muestra un mensaje con ícono de error.
    // Importancia: notificar al usuario de fallos en validaciones o procesos.
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: mensaje
    });
  }
}
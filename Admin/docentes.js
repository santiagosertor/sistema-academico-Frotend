/**
 * Inicializa la lógica de gestión de docentes.
 * - Configura el formulario para crear nuevos docentes.
 * - Renderiza la lista de docentes en la interfaz.
 *
 * Decisión técnica:
 * Se encapsula en `initDocentes` para que solo se ejecute cuando
 * la vista de administración de docentes esté activa en la SPA.
 */
export function initDocentes() {
  console.log('Docentes inicializado');

  const form = document.getElementById('formDocente');
  const lista = document.getElementById('listaDocentes');

  /**
   * Listener del evento submit del formulario.
   * - Previene la recarga de página.
   * - Obtiene valores de los campos y aplica validaciones.
   * - Envía datos al backend para registrar un nuevo docente.
   */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Obtención de valores desde el formulario
    const nombre_usuario = document.getElementById('docente-usuario').value.trim();
    const contrasena = document.getElementById('docente-pass').value.trim();
    const nombre = document.getElementById('docente-nombre').value.trim();
    const apellido = document.getElementById('docente-apellido').value.trim();
    const documento = document.getElementById('docente-documento').value.trim();
    const correo = document.getElementById('docente-correo').value.trim();

    // Validación crítica:
    // Se asegura que todos los campos obligatorios estén completos.
    if (!nombre_usuario || !contrasena || !nombre || !apellido || !documento) {
      alert('Completa todos los campos obligatorios');
      return;
    }

    try {
      // Relación entre módulos:
      // Se envía la información al backend mediante fetch.
      const resp = await fetch('http://localhost:3000/api/admin/docentes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ nombre_usuario, contrasena, correo, nombre, apellido, documento })
      });

      const data = await resp.json();

      // Validación crítica:
      // Si la respuesta no es OK, se muestra el mensaje de error del backend.
      if (!resp.ok) {
        alert(data.message || 'Error creando docente');
        return;
      }

      // Renderizado dinámico:
      // Se agrega el nuevo docente a la lista visual sin recargar la página.
      const li = document.createElement('li');
      li.textContent = `${nombre_usuario} - ${nombre} ${apellido} - ${documento} - ${correo}`;
      lista.appendChild(li);

      // Reset del formulario para permitir nuevas entradas.
      form.reset();

    } catch (err) {
      // Manejo de errores globales:
      // Si ocurre un fallo en la conexión, se informa al usuario y se loguea en consola.
      console.error(err);
      alert('Error de conexión con el servidor');
    }
  });
}
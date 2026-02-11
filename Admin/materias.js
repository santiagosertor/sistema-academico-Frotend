/**
 * Inicializa la lógica de gestión de materias.
 * - Configura el formulario para crear nuevas materias.
 * - Renderiza la lista de materias en la interfaz.
 *
 * Decisión técnica:
 * Se encapsula en `initMaterias` para que solo se ejecute cuando
 * la vista de administración de materias esté activa en la SPA.
 */
export function initMaterias() {
  const form = document.getElementById('formMateria');
  const lista = document.getElementById('listaMaterias');

  /**
   * Listener del evento submit del formulario.
   * - Previene la recarga de página.
   * - Obtiene valores de los campos y aplica validaciones.
   * - Envía datos al backend para crear una nueva materia.
   */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre_materia = document.getElementById('materia-nombre').value.trim();
    const descripcion = document.getElementById('materia-descripcion').value.trim();

    // Validación crítica:
    // El nombre de la materia es obligatorio para evitar registros incompletos.
    if (!nombre_materia) {
      alert('El nombre de la materia es obligatorio');
      return;
    }

    try {
      // Relación entre módulos:
      // Se envía la información al backend mediante fetch.
      const resp = await fetch('http://localhost:3000/api/admin/materias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ nombre_materia, descripcion })
      });

      const data = await resp.json();

      // Validación crítica:
      // Si la respuesta no es OK, se muestra el mensaje de error del backend.
      if (!resp.ok) {
        alert(data.message || 'Error creando materia');
        return;
      }

      // Renderizado dinámico:
      // Se agrega la nueva materia a la lista visual sin recargar la página.
      const li = document.createElement('li');
      li.textContent = `${data.nombre_materia} - ${data.descripcion || ''}`;
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
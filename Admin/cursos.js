/**
 * Carga las opciones disponibles para crear un curso.
 * - Obtiene lista de docentes y materias desde el backend.
 * - Rellena los selects correspondientes en el formulario.
 *
 * Decisión técnica:
 * Se usa `await fetch` para garantizar que los datos se carguen antes de
 * que el usuario interactúe con el formulario.
 *
 * Validación crítica:
 * Se asegura que los selects se limpien antes de llenarse para evitar duplicados.
 */
export async function cargarOpcionesCurso() {
  const docenteSelect = document.getElementById('curso-docente');
  const materiaSelect = document.getElementById('curso-materia');

  try {
    // Traer docentes
    const respDocentes = await fetch('http://localhost:3000/api/admin/docentes', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
    });
    const docentes = await respDocentes.json();

    docenteSelect.innerHTML = '';
    docentes.forEach(d => {
      const option = document.createElement('option');
      option.value = d.id_docente;
      option.textContent = `${d.nombre} ${d.apellido}`;
      docenteSelect.appendChild(option);
    });

    // Traer materias
    const respMaterias = await fetch('http://localhost:3000/api/admin/materias', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
    });
    const materias = await respMaterias.json();

    materiaSelect.innerHTML = '';
    materias.forEach(m => {
      const option = document.createElement('option');
      option.value = m.id_materia;
      option.textContent = m.nombre_materia;
      materiaSelect.appendChild(option);
    });

  } catch (err) {
    console.error(err);
    alert('Error cargando opciones de curso');
  }
}

/**
 * Carga la lista de cursos existentes.
 * - Consulta al backend todos los cursos registrados.
 * - Renderiza la lista en la interfaz administrativa.
 *
 * Validación crítica:
 * Se limpia la lista antes de renderizar para evitar duplicados.
 */
export async function cargarCursos() {
  const lista = document.getElementById('listaCursos');

  try {
    const resp = await fetch('http://localhost:3000/api/admin/cursos', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
    });
    const cursos = await resp.json();

    lista.innerHTML = '';
    cursos.forEach(c => {
      const li = document.createElement('li');
      li.textContent = `Curso ${c.id_curso}: ${c.nombre_materia} - ${c.nombre_docente} ${c.apellido_docente} (${c.periodo})`;
      lista.appendChild(li);
    });

  } catch (err) {
    console.error(err);
    alert('Error cargando cursos');
  }
}

/**
 * Inicializa la gestión de cursos.
 * - Configura el formulario para crear nuevos cursos.
 * - Carga opciones de docentes y materias.
 * - Renderiza lista de cursos existentes.
 *
 * Decisión técnica:
 * Se encapsula en `initCursos` para que solo se ejecute cuando
 * la vista de cursos esté activa en la SPA.
 */
export function initCursos() {
  const form = document.getElementById('formCurso');
  const lista = document.getElementById('listaCursos');

  // 🔴 Llenar selects y lista al inicio
  cargarOpcionesCurso();
  cargarCursos();

  /**
   * Listener del evento submit del formulario.
   * - Previene la recarga de página.
   * - Obtiene valores de los campos y aplica validaciones.
   * - Envía datos al backend para crear un nuevo curso.
   */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id_docente = document.getElementById('curso-docente').value;
    const id_materia = document.getElementById('curso-materia').value;
    const periodo = document.getElementById('curso-periodo').value.trim();

    // Validación crítica:
    // Todos los campos son obligatorios para crear un curso válido.
    if (!id_docente || !id_materia || !periodo) {
      alert('Todos los campos son obligatorios');
      return;
    }

    try {
      // Relación entre módulos:
      // Se envía la información al backend mediante fetch.
      const resp = await fetch('http://localhost:3000/api/admin/cursos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ id_docente, id_materia, periodo })
      });

      const data = await resp.json();

      // Validación crítica:
      // Si la respuesta no es OK, se muestra el mensaje de error del backend.
      if (!resp.ok) {
        alert(data.message || 'Error creando curso');
        return;
      }

      // 🔴 Actualizar lista después de crear
      cargarCursos();
      form.reset();

    } catch (err) {
      // Manejo de errores globales:
      // Si ocurre un fallo en la conexión, se informa al usuario y se loguea en consola.
      console.error(err);
      alert('Error de conexión con el servidor');
    }
  });
}
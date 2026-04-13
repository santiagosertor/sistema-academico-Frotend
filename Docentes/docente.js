// ===============================
// helper fetch JSON
// ===============================
import { alerta } from "../js/alertas.js";

/**
 * Función auxiliar para realizar peticiones fetch y devolver JSON.
 * - Agrega automáticamente cabeceras de autorización y tipo de contenido.
 * - Intenta parsear la respuesta como JSON, lanzando error si no es válido.
 *
 * Validación crítica:
 * Se asegura que todas las peticiones incluyan el accessToken para seguridad.
 */
async function fetchJSON(url, options = {}) {
  const resp = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      ...(options.headers || {})
    }
  });

  const text = await resp.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Respuesta no es JSON: ' + text);
  }
}

// ===============================
// cargar cursos del docente
// ===============================

/**
 * Inicializa la vista del docente.
 * - Obtiene cursos asignados desde el backend.
 * - Renderiza lista de cursos en la interfaz.
 * - Configura navegación hacia estudiantes y notas.
 *
 * Validación crítica:
 * Si no existe id_docente en sesión, se alerta y se detiene el flujo.
 */
export async function initDocente() {
  const idDocente = localStorage.getItem('id_docente');

  if (!idDocente) {
    alerta('No hay docente en sesión');
    return;
  }

  try {
    const cursos = await fetchJSON(
      `http://localhost:3000/api/docente/${idDocente}/cursos`
    );

    const ul = document.getElementById('listaCursosDocente');
    ul.innerHTML = '';

    if (cursos.length === 0) {
      ul.innerHTML = '<li>No tienes cursos asignados</li>';
      return;
    }

    cursos.forEach(c => {
      const li = document.createElement('li');
      li.textContent = `${c.nombre_materia} (${c.periodo})`;
      li.onclick = () => cargarEstudiantes(c.id_curso);
      ul.appendChild(li);
    });

    // 👇 Llamar aquí para llenar el select apenas cargue el panel
    cargarEstudiantesDisponibles();

  } catch (err) {
    console.error(err);
    alerta('Error cargando cursos');
  }
}

// ===============================
// cargar estudiantes del curso
// ===============================

/**
 * Carga estudiantes inscritos en un curso específico.
 * - Actualiza lista visual de estudiantes.
 * - Configura select para asignar notas.
 *
 * Validación crítica:
 * Se guarda curso activo en variable global para mantener contexto.
 */
async function cargarEstudiantes(idCurso) {
  window.cursoSeleccionado = idCurso; // ✅ guardar curso activo
  try {
    const data = await fetchJSON(
      `http://localhost:3000/api/docente/cursos/${idCurso}/estudiantes`
    );

    const ul = document.getElementById('listaEstudiantesCurso');
    ul.innerHTML = '';

    // Mostrar alerta si existe
    if (data.alerta) {
      alerta(data.alerta);
    }

    // Recorrer solo los estudiantes completos
    data.estudiantes.forEach(e => {
      const li = document.createElement('li');
      li.textContent = `${e.nombre} ${e.apellido}`;
      ul.appendChild(li);
    });

    // 👇 cargar disponibles para inscribir
    cargarEstudiantesDisponibles();

    // 👇 llenar select de notas con los inscritos
    const selectNota = document.getElementById('selectEstudianteNota');
    selectNota.innerHTML = '';
    data.estudiantes.forEach(e => {
      const opt = document.createElement('option');
      opt.value = e.id_estudiante;
      opt.textContent = `${e.nombre} ${e.apellido}`;
      selectNota.appendChild(opt);
    });

  } catch (err) {
    console.error(err);
    alerta('Error cargando estudiantes');
  }
}

// ===============================
// inscribir estudiante
// ===============================

/**
 * Inscribe un estudiante en el curso seleccionado.
 * - Envía petición POST al backend.
 * - Refresca lista de estudiantes tras éxito.
 *
 * Validación crítica:
 * Se comprueba que curso y estudiante estén seleccionados antes de enviar.
 */
async function inscribirEstudiante() {
  const idCurso = window.cursoSeleccionado; // curso actual
  const idEstudiante = document.getElementById('selectEstudiante').value;

  if (!idCurso || !idEstudiante) {
    alerta('Selecciona un curso y un estudiante');
    return;
  }

  try {
    const resp = await fetchJSON(
      `http://localhost:3000/api/docente/cursos/${idCurso}/estudiantes/${idEstudiante}`,
      { method: 'POST' }
    );

    alerta(resp.message || 'Estudiante inscrito correctamente', 'ok');
    cargarEstudiantes(idCurso); // refrescar lista del curso
  } catch (err) {
    console.error(err);
    alerta('Error inscribiendo estudiante');
  }
}

// ===============================
// cargar estudiantes disponibles
// ===============================

/**
 * Carga estudiantes disponibles para inscripción.
 * - Rellena select con opciones dinámicas.
 *
 * Validación crítica:
 * Se muestra mensaje si no hay estudiantes disponibles.
 */
async function cargarEstudiantesDisponibles() {
  try {
    const estudiantes = await fetchJSON(
      'http://localhost:3000/api/docente/estudiantes/disponibles'
    );

    const select = document.getElementById('selectEstudiante');
    select.innerHTML = ''; // limpiar antes

    if (estudiantes.length === 0) {
      const opt = document.createElement('option');
      opt.textContent = 'No hay estudiantes disponibles';
      opt.disabled = true;
      select.appendChild(opt);
      return;
    }

    estudiantes.forEach(e => {
      const opt = document.createElement('option');
      opt.value = e.id_estudiante; // lo que se envía al backend
      opt.textContent = `${e.nombre} ${e.apellido}`; // lo que ve el docente
      select.appendChild(opt);
    });
  } catch (err) {
    console.error(err);
    alerta('Error cargando estudiantes disponibles');
  }
}

// ===============================
// guardar nota 
// ===============================

/**
 * Guarda notas de un estudiante en un curso y bloque específico.
 * - Envía datos al backend mediante POST.
 * - Actualiza promedio y estado en la interfaz.
 *
 * Validación crítica:
 * Se comprueba que curso, estudiante y bloque estén seleccionados.
 */
async function guardarNota() {
  const idCurso = window.cursoSeleccionado;
  const idEstudiante = document.getElementById('selectEstudianteNota').value;
  const idBloque = document.getElementById('selectBloque').value;

  const notaQuiz = parseFloat(document.getElementById('notaQuiz').value);
  const notaParcial = parseFloat(document.getElementById('notaParcial').value);
  const notaTrabajo = parseFloat(document.getElementById('notaTrabajo').value);

  if (!idCurso || !idEstudiante || !idBloque) {
    alerta('Selecciona curso, estudiante y bloque');
    return;
  }

  try {
    const resp = await fetchJSON(
      `http://localhost:3000/api/docente/cursos/${idCurso}/notas`,
      {
        method: 'POST',
        body: JSON.stringify({
          id_estudiante: idEstudiante,
          id_bloque: idBloque,
          notaQuiz,
          notaParcial,
          notaTrabajo
        })
      }
    );

    document.getElementById('promedioBloque').textContent = resp.promedio_bloque;
    document.getElementById('estadoNota').textContent = resp.estado;
    alerta('Nota guardada correctamente', 'ok');
  } catch (err) {
    console.error(err);
    alerta('Error guardando nota'); 
  }
}

// ===============================
// cerrar sesión
// ===============================

/**
 * Configura botón de cerrar sesión.
 * - Elimina tokens y datos del docente.
 * - Redirige al inicio.
 */
const btnCerrarSesion = document.getElementById('btnCerrarSesion');
if (btnCerrarSesion) {
  btnCerrarSesion.addEventListener('click', () => {
    localStorage.removeItem('accessToken'); // consistente
    localStorage.removeItem('id_docente');  // borrar id_docente también
    sessionStorage.clear();

    window.location.href = '/index.html';
  });
}

// ===============================
// cambiar vista
// ===============================

/**
 * Cambia entre vistas del panel docente.
 * - Oculta todas y muestra solo la seleccionada.
 */
function cargarVista(idVista) {
  const vistas = document.querySelectorAll('#docente-panel, #notas-panel');

  vistas.forEach(v => v.style.display = 'none');

  const vista = document.getElementById(idVista);
  if (vista) {
    vista.style.display = 'block';
  }
}
// ===============================
// Exponer funciones globales
// ===============================
window.cargarVista = cargarVista;
window.inscribirEstudiante = inscribirEstudiante; // para que funcione el botón en HTML
window.guardarNota = guardarNota; //  para la funcione el botón Guardar Nota
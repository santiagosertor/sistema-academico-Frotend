// Importación del módulo de alertas.
// Relación entre módulos: se centraliza la lógica de notificación para mantener consistencia.
import { alerta } from '../js/alertas.js';

/**
 * Inicializa la vista del estudiante.
 * - Configura navegación lateral.
 * - Activa botón de cerrar sesión.
 * - Carga el dashboard inicial.
 * - Configura el formulario de perfil.
 *
 * Decisión técnica:
 * Se encapsula en `initEstudiante` para que solo se ejecute cuando
 * la vista del estudiante esté activa en la SPA.
 */
export function initEstudiante() {
  console.log('Estudiante inicializado');

  // Sidebar navegación
  // Relación entre módulos: cada botón de la barra lateral navega a una sección distinta.
  document.querySelectorAll('.sidebar button').forEach(btn => {
    btn.addEventListener('click', () => {
      const seccion = btn.getAttribute('data-seccion');
      navegar(seccion);
    });
  });

  // Botón cerrar sesión
  const btnSalir = document.querySelector('.btn-salir');
  if (btnSalir) {
    btnSalir.addEventListener('click', cerrarSesion);
  }

  // Cargar dashboard al inicio
  navegar('dashboard');
  cargarDashboard();

  // Perfil: manejar submit
  const formPerfil = document.getElementById('formPerfil');
  if (formPerfil) {
    formPerfil.addEventListener('submit', e => {
      e.preventDefault();
      guardarPerfil();
    });
  }
}

/**
 * Función de navegación interna.
 * - Oculta todas las secciones y muestra solo la seleccionada.
 * - Carga datos dinámicos según la sección activa.
 *
 * Validación crítica:
 * Se verifica que el target exista antes de mostrarlo.
 */
function navegar(seccion) {
  document.querySelectorAll('.contenido section').forEach(sec => {
    sec.style.display = 'none';
  });

  const target = document.getElementById(seccion);
  if (target) {
    target.style.display = 'block';
    if (seccion === 'perfil') cargarPerfil();
    if (seccion === 'dashboard') cargarDashboard();
    if (seccion === 'cursos') cargarCursosEstudiante();
    if (seccion === 'notas') cargarNotasEstudiante();
    if (seccion === 'historial') cargarHistorialEstudiante();
  }
}

// ===== Dashboard =====
/**
 * Carga el dashboard del estudiante.
 * - Obtiene datos del perfil básico desde el backend.
 * - Muestra saludo personalizado.
 * - Actualiza ID global del estudiante para otras consultas.
 *
 * Validación crítica:
 * Se verifica que la respuesta sea OK antes de procesar datos.
 */
function cargarDashboard() {
  const saludo = document.getElementById('saludo');
  fetch('http://localhost:3000/api/estudiante/me', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
  })
    .then(resp => {
      if (!resp.ok) throw new Error(`Error ${resp.status}`);
      return resp.json();
    })
    .then(data => {
      saludo.textContent = `Bienvenido, ${(data.nombre || '')} ${(data.apellido || '')}`;
      window.estudianteId = data.id_estudiante;
      console.log('ID estudiante:', data.id_estudiante);

      // Si ya estás en otra sección, recarga sus datos
      const visible = document.querySelector('.contenido section[style*="block"]');
      if (visible) {
        if (visible.id === 'cursos') cargarCursosEstudiante();
        if (visible.id === 'notas') cargarNotasEstudiante();
        if (visible.id === 'historial') cargarHistorialEstudiante();
      }
    })
    .catch(err => {
      console.error(err);
      saludo.textContent = 'Completa tu perfil para ver el saludo';
    });
}

// ===== Perfil =====
/**
 * Carga los datos del perfil del estudiante desde el backend.
 * - Rellena los campos del formulario con la información existente.
 *
 * Validación crítica:
 * Se verifica respuesta OK antes de asignar valores.
 */
function cargarPerfil() {
  fetch('http://localhost:3000/api/estudiante/perfil', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
  })
    .then(resp => {
      if (!resp.ok) throw new Error(`Error ${resp.status}`);
      return resp.json();
    })
    .then(data => {
      document.getElementById('nombre').value = data.nombre || '';
      document.getElementById('apellido').value = data.apellido || '';
      document.getElementById('documento').value = data.documento || '';
      document.getElementById('correo').value = data.correo || '';
    })
    .catch(err => {
      console.error(err);
      alerta('No se pudo cargar el perfil, completa tus datos');
    });
}

/**
 * Guarda los cambios en el perfil del estudiante.
 * - Envía datos al backend mediante PUT.
 * - Actualiza dashboard tras éxito.
 *
 * Validación crítica:
 * Se envía token en headers para garantizar seguridad.
 */
function guardarPerfil() {
  const payload = {
    nombre: document.getElementById('nombre').value,
    apellido: document.getElementById('apellido').value,
    documento: document.getElementById('documento').value,
    correo: document.getElementById('correo').value
  };

  fetch('http://localhost:3000/api/estudiante/perfil', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify(payload)
  })
    .then(resp => resp.json())
    .then(data => {
      alerta(data.message || 'Perfil actualizado correctamente');
      cargarDashboard();
    })
    .catch(err => {
      console.error(err);
      alerta('Error al actualizar perfil');
    });
}

// ===== Cursos =====
/**
 * Carga los cursos del estudiante.
 * - Consulta al backend usando el ID global.
 * - Renderiza tabla de cursos en la vista.
 */
async function cargarCursosEstudiante() {
  const idEstudiante = window.estudianteId;
  if (!idEstudiante) return;

  const res = await fetch(`http://localhost:3000/api/estudiante/${idEstudiante}/cursos`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
  });
  const cursos = await res.json();

  const tbody = document.getElementById('tablaCursos');
  tbody.innerHTML = cursos.map(c =>
    `<tr><td>${c.nombre_materia}</td><td>${c.periodo}</td></tr>`
  ).join('');
}

// ===== Notas =====
/**
 * Carga las notas del estudiante.
 * - Consulta al backend usando el ID global.
 * - Renderiza tabla de notas con detalle por materia y bloque.
 *
 * Decisión técnica:
 * Se usa template string para construir filas dinámicamente.
 */
async function cargarNotasEstudiante() {
  const idEstudiante = window.estudianteId;
  if (!idEstudiante) return;

  const res = await fetch(`http://localhost:3000/api/estudiante/${idEstudiante}/notas`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
  });
  const notas = await res.json();

  const tbody = document.getElementById('tablaNotas');
  tbody.innerHTML = notas.map(n =>
    `<tr>
     <td>${n.nombre_materia}</td>
     <td>${n.nombre_bloque}</td>
     <td>${n.nota_quiz}</td>
     <td>${n.nota_parcial}</td>
     <td>${n.nota_trabajo}</td>
     <td>${n.promedio_bloque}</td>
     <td class="${(n.estado || '').toLowerCase()}">${n.estado || ''}</td>
   </tr>`
  ).join('');
}

// ===== Historial =====
/**
 * Carga el historial académico del estudiante.
 * - Consulta al backend usando el ID global.
 * - Renderiza tabla con promedio final y estado.
 *
 * Validación crítica:
 * Se fuerza formato numérico con `toFixed(2)` para consistencia visual.
 */
async function cargarHistorialEstudiante() {
  const idEstudiante = window.estudianteId;
  if (!idEstudiante) return;

  const res = await fetch(`http://localhost:3000/api/estudiante/${idEstudiante}/historial`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
  });
  const historial = await res.json();

  const tbody = document.getElementById('tablaHistorial');
  tbody.innerHTML = historial.map(h =>
    `<tr>
       <td>${h.nombre_materia}</td>
       <td>${h.periodo}</td>
       <td>${Number(h.promedio_final || 0).toFixed(2)}</td>
       <td class="${(h.estado || '').toLowerCase()}">${h.estado || 'Sin estado'}</td>
     </tr>`
  ).join('');
}

// ===== Cerrar sesión =====
/**
 * Cierra la sesión del estudiante.
 * - Elimina el accessToken de localStorage.
 * - Notifica al usuario.
 * - Redirige al login para forzar nueva autenticación.
 */
function cerrarSesion() {
  localStorage.removeItem('accessToken');
  alerta('Sesión cerrada correctamente');
  window.location.href = '/login.html'; // redirige al login
}
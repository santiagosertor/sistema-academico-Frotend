// Importación del módulo de alertas.
// Relación entre módulos: se centraliza la lógica de notificación para mantener consistencia.
// Importación del módulo de alertas.
import { alerta } from '../js/alertas.js';

/**
 * Inicializa la vista del estudiante.
 */
export function initEstudiante() {
  console.log('Estudiante inicializado');

  // Sidebar navegación
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

  // --- CONFIGURACIÓN DE LÍMITES FÍSICOS (Evita desbordamientos) ---
  const inputNombre = document.getElementById('nombre');
  const inputApellido = document.getElementById('apellido');
  const inputDoc = document.getElementById('documento');

  if (inputNombre) inputNombre.maxLength = 40;
  if (inputApellido) inputApellido.maxLength = 40;
  if (inputDoc) inputDoc.maxLength = 15; // Límite para un documento estándar

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
      alerta('No se pudo cargar el perfil');
    });
}

/**
 * Guarda los cambios en el perfil del estudiante.
 * Se añadieron validaciones críticas de datos personales.
 */
function guardarPerfil() {
  const nombre = document.getElementById('nombre').value.trim();
  const apellido = document.getElementById('apellido').value.trim();
  const documento = document.getElementById('documento').value.trim();
  const correo = document.getElementById('correo').value.trim();

  // --- VALIDACIÓN CRÍTICA: Datos obligatorios ---
  if (!nombre || !apellido || !documento) {
    return alerta('Nombre, Apellido y Documento son requeridos', 'warning');
  }

  // --- VALIDACIÓN CRÍTICA: Longitud de documento ---
  if (documento.length < 5) {
    return alerta('El número de documento no es válido', 'warning');
  }

  const payload = { nombre, apellido, documento, correo };

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
      alerta(data.message || 'Perfil actualizado correctamente', 'ok');
      cargarDashboard();
    })
    .catch(err => {
      console.error(err);
      alerta('Error al actualizar perfil');
    });
}

// ===== Cursos =====
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
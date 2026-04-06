import { alerta } from "../js/alertas.js";

/**
 * Inicializa la lógica de gestión de docentes.
 */
export function initDocentes() {
  console.log('Gestión de Docentes: ACTIVADA');

  const form = document.getElementById('formDocente');
  const lista = document.getElementById('listaDocentes');

  if (!form) return;

  // --- CONFIGURACIÓN DE LÍMITES (Evita textos infinitos) ---
  const inputs = {
    usuario: document.getElementById('docente-usuario'),
    pass: document.getElementById('docente-pass'),
    doc: document.getElementById('docente-documento'),
    correo: document.getElementById('docente-correo')
  };

  if (inputs.usuario) inputs.usuario.maxLength = 20;
  if (inputs.pass) inputs.pass.maxLength = 16;
  if (inputs.doc) inputs.doc.maxLength = 10; 

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Obtención de valores
    const nombre_usuario = inputs.usuario.value.trim();
    const contrasena = inputs.pass.value.trim();
    const nombre = document.getElementById('docente-nombre').value.trim();
    const apellido = document.getElementById('docente-apellido').value.trim();
    const documento = inputs.doc.value.trim();
    const correo = inputs.correo.value.trim();

    // --- 1. VALIDACIÓN: CAMPOS VACÍOS ---
    if (!nombre_usuario || !contrasena || !nombre || !apellido || !documento || !correo) {
      alerta('Todos los campos son obligatorios', 'warning');
      return;
    }

    // --- 2. VALIDACIÓN: FORMATO DE EMAIL ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      alerta('El formato del correo no es válido', 'error');
      inputs.correo.focus();
      return;
    }

    // --- 3. VALIDACIÓN: FORTALEZA DE CLAVE (Mínimo 8 caracteres, letra y número) ---
    const passRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passRegex.test(contrasena)) {
      alerta('La clave debe tener al menos 8 caracteres, incluyendo letras y números', 'warning');
      inputs.pass.focus();
      return;
    }

    try {
      // Petición al backend con Token de Seguridad
      const resp = await fetch('http://localhost:3000/api/admin/docentes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ nombre_usuario, contrasena, correo, nombre, apellido, documento })
      });

      const data = await resp.json();

      if (!resp.ok) {
        alerta(data.message || 'Error creando docente', 'error');
        return;
      }

      // --- RENDERIZADO DINÁMICO (Estilo Elite Glass) ---
      // Creamos la estructura que combine con tu CSS de filas de cristal
      const li = document.createElement('li');
      li.innerHTML = `
        <span><strong>${nombre_usuario}</strong> - ${nombre} ${apellido}</span>
        <div class="info-secundaria">${documento} | ${correo}</div>
      `;
      
      lista.appendChild(li);

      alerta('Docente creado correctamente', 'ok');
      form.reset();

    } catch (err) {
      console.error(err);
      alerta('Fallo de conexión con el servidor', 'error');
    }
  });
}
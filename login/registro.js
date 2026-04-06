/**
 * Inicializa la lógica de registro de usuarios.
 * - Localiza el formulario de registro en el DOM.
 * - Configura límites de caracteres y validaciones de formato (Email/Password).
 * - Envía los datos al backend real (localhost:3000).
 */
import { alerta } from "../js/alertas.js";

/**
 * Inicializa la lógica de registro de usuarios.
 */
export function initRegistro() {
  const form = document.querySelector('.auth-card');
  const btnRegistro = form?.querySelector('button[type="submit"]');

  if (!form) {
    console.warn('Formulario de registro no encontrado');
    return;
  }

  console.log('Registro ACTIVADO (Modo Real)');

  // --- LIMITACIÓN FÍSICA DE CARACTERES ---
  const inputNombre = document.getElementById('nombre_usuario');
  const inputEmail = document.getElementById('correo');
  const inputPass = document.getElementById('contrasena');
  const inputConfirmar = document.getElementById('confirmar');

  if (inputNombre) inputNombre.maxLength = 30;
  if (inputPass) inputPass.maxLength = 20;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Obtención de valores
    const nombre_usuario = inputNombre?.value.trim();
    const correo = inputEmail?.value.trim();
    const contrasena = inputPass?.value.trim();
    const confirmar = inputConfirmar?.value.trim();

    // --- 1. VALIDACIÓN DETALLADA (MARCA EL CAMPO ESPECÍFICO) ---
    if (!nombre_usuario) {
      alerta('Ingresa un nombre de usuario', 'warning');
      inputNombre.focus();
      return;
    }

    if (!correo) {
      alerta('El correo es obligatorio', 'warning');
      inputEmail.focus();
      return;
    }

    // --- 2. VALIDACIÓN: FORMATO DE EMAIL ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      alerta('Ingresa un correo electrónico válido', 'error');
      inputEmail.focus();
      return;
    }

    if (!contrasena) {
      alerta('Debes asignar una contraseña', 'warning');
      inputPass.focus();
      return;
    }

    // --- 3. VALIDACIÓN: FORTALEZA DE CONTRASEÑA ---
    const passRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passRegex.test(contrasena)) {
      alerta('Mínimo 8 caracteres, con letras y números', 'warning');
      inputPass.focus();
      return;
    }

    // --- 4. VALIDACIÓN: COINCIDENCIA ---
    if (contrasena !== confirmar) {
      alerta('Las contraseñas no coinciden', 'error');
      inputConfirmar.focus();
      return;
    }

    try {
      if (btnRegistro) {
        btnRegistro.disabled = true;
        btnRegistro.textContent = "Procesando...";
      }

      const resp = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_usuario,
          correo,
          contrasena,
          rol: 'Estudiante'
        })
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.message || 'Error al registrar');
      }

      alerta(data.message || "¡Registro exitoso!", "ok");

      setTimeout(() => {
        window.navegar('/login/login.html');
      }, 2000);

    } catch (err) {
      console.error("Error en registro:", err);
      alerta(err.message, 'error');

      if (btnRegistro) {
        btnRegistro.disabled = false;
        btnRegistro.textContent = "Registrarme";
      }
    }
  });
}
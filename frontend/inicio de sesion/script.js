"use strict";

// Los nombres no llevan espacios: "botón iniciar" se escribe botonIniciar.
const formularioAcceso = document.getElementById("formularioAcceso");
const campoUsuario = document.getElementById("campoUsuario");
const campoContrasena = document.getElementById("campoContrasena");
const botonIniciar = document.getElementById("botonIniciar");
const botonCancelar = document.getElementById("botonCancelar");
const mensajeEstado = document.getElementById("mensajeEstado");

function mostrarMensaje(texto, esError = false) {
  mensajeEstado.textContent = texto;
  mensajeEstado.classList.toggle("error", esError);
}

function limpiarValidacion() {
  campoUsuario.removeAttribute("aria-invalid");
  campoContrasena.removeAttribute("aria-invalid");
  mostrarMensaje("");
}

function iniciarSesion(evento) {
  evento.preventDefault(); // Evita recargar la página al enviar el formulario.
  limpiarValidacion();
  const usuario = campoUsuario.value.trim();
  // No se recortan espacios de contraseñas: pueden ser parte de ellas.
  const contrasena = campoContrasena.value;

  if (!usuario || !contrasena) {
    campoUsuario.setAttribute("aria-invalid", String(!usuario));
    campoContrasena.setAttribute("aria-invalid", String(!contrasena));
    mostrarMensaje("Escribe tu usuario y contraseña para continuar.", true);
    (!usuario ? campoUsuario : campoContrasena).focus();
    return;
  }

  // Maqueta: aquí se conectaría una API que valide las credenciales en el servidor.
  // No guardar contraseñas en el código, localStorage ni la consola.
  mostrarMensaje("Campos completos. Esta demostración aún no está conectada al sistema de acceso.");
}

function cancelarAcceso() {
  formularioAcceso.reset();
  limpiarValidacion();
  campoUsuario.focus();
}

// submit funciona tanto con el botón Iniciar como con la tecla Enter.
botonIniciar.form.addEventListener("submit", iniciarSesion);
botonCancelar.addEventListener("click", cancelarAcceso);
campoUsuario.addEventListener("input", limpiarValidacion);
campoContrasena.addEventListener("input", limpiarValidacion);

"use strict";
const formularioAcceso = document.getElementById("formularioAcceso");
const campoUsuario = document.getElementById("campoUsuario");
const campoContrasena = document.getElementById("campoContrasena");
const botonIniciar = document.getElementById("botonIniciar");
const botonCancelar = document.getElementById("botonCancelar");
const mensajeEstado = document.getElementById("mensajeEstado");

// Usuarios temporales administrados desde Perfiles.
formularioAcceso.addEventListener("submit", evento => {
  evento.preventDefault();
  try {
    const cuenta=usuariosImperio.autenticar(campoUsuario.value,campoContrasena.value);
    sesionImperio.guardar({usuarioId:cuenta.id,usuario:cuenta.usuario,rol:cuenta.rol});
    window.location.href="../gestion de inventario/index.html";
  } catch(error) {
    mensajeEstado.textContent=error.message;
    mensajeEstado.classList.add("error");
  }
});
botonCancelar.addEventListener("click", () => {
  formularioAcceso.reset();
  mensajeEstado.textContent = "";
  campoUsuario.focus();
});

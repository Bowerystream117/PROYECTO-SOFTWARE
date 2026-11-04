"use strict";
const formularioAcceso = document.getElementById("formularioAcceso");
const campoUsuario = document.getElementById("campoUsuario");
const campoContrasena = document.getElementById("campoContrasena");
const botonIniciar = document.getElementById("botonIniciar");
const botonCancelar = document.getElementById("botonCancelar");
const mensajeEstado = document.getElementById("mensajeEstado");

// Cuentas públicas de prueba; nunca colocar cuentas reales en el frontend.
const cuentasDemo = [
  { usuario: "duena", correo: "duena@imperio.demo", contrasena: "Duena123!", rol: "duena" },
  { usuario: "empleado", correo: "empleado@imperio.demo", contrasena: "Empleado123!", rol: "empleado" }
];
formularioAcceso.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const identificador = campoUsuario.value.trim().toLowerCase();
  const cuenta = cuentasDemo.find(cuenta =>
    (cuenta.usuario === identificador || cuenta.correo === identificador)
    && cuenta.contrasena === campoContrasena.value);
  if (!cuenta) {
    mensajeEstado.textContent = "Usuario, correo o contraseña incorrectos.";
    mensajeEstado.classList.add("error");
    return;
  }
  try {
    sesionImperio.guardar({ usuario: cuenta.usuario, rol: cuenta.rol });
    window.location.href = "../gestion de inventario/index.html";
  } catch {
    mensajeEstado.textContent = "Permite el almacenamiento del navegador para iniciar la demostración.";
  }
});
botonCancelar.addEventListener("click", () => {
  formularioAcceso.reset();
  mensajeEstado.textContent = "";
  campoUsuario.focus();
});

"use strict";
const formularioAcceso = document.getElementById("formularioAcceso");
const campoUsuario = document.getElementById("campoUsuario");
const campoContrasena = document.getElementById("campoContrasena");
const botonIniciar = document.getElementById("botonIniciar");
const botonCancelar = document.getElementById("botonCancelar");
const mensajeEstado = document.getElementById("mensajeEstado");

// Acceso mediante los usuarios registrados en MySQL.
formularioAcceso.addEventListener("submit", async evento => {
  evento.preventDefault();
  botonIniciar.disabled = true;
  mensajeEstado.textContent = "";
  try {
    const respuesta = await fetch("/api/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo: campoUsuario.value, contrasena: campoContrasena.value })
    });
    if (!respuesta.headers.get("content-type")?.includes("application/json")) {
      throw new Error("Abre el proyecto desde http://localhost:3000.");
    }
    const cuenta = await respuesta.json();
    if (!respuesta.ok) throw new Error(cuenta.mensaje || "No se pudo iniciar sesión.");
    sesionImperio.guardar({token:cuenta.token,usuarioId:cuenta.id,usuario:cuenta.usuario,rol:cuenta.rol,origen:"mysql"});
    window.location.href="../gestion de inventario/index.html";
  } catch(error) {
    mensajeEstado.textContent=error instanceof TypeError ? "No se pudo conectar al servidor. Abre http://localhost:3000." : error.message;
    mensajeEstado.classList.add("error");
  } finally {
    botonIniciar.disabled = false;
  }
});
botonCancelar.addEventListener("click", () => {
  formularioAcceso.reset();
  mensajeEstado.textContent = "";
  campoUsuario.focus();
});

"use strict";
window.servicioPerfiles = {
  async solicitar(ruta, opciones = {}) {
    const respuesta = await fetch("/api/usuarios" + ruta, {
      ...opciones,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + (sesionImperio.leer()?.token || "")
      }
    });
    if (!respuesta.headers.get("content-type")?.includes("application/json")) {
      throw new Error("Abre Perfiles desde la dirección de Imperio.");
    }
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.mensaje || "No se pudo completar la operación.");
    return datos;
  },
  listar() { return this.solicitar(""); },
  cambiarContrasena(id, contrasena) {
    return this.solicitar("/" + encodeURIComponent(id) + "/contrasena", {
      method: "PATCH",
      body: JSON.stringify({ contrasena })
    });
  },
  guardar(datos, id) {
    return this.solicitar(id ? "/" + encodeURIComponent(id) : "", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(datos)
    });
  }
};

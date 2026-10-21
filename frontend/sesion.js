"use strict";
// DEMOSTRACIÓN LOCAL. En producción el servidor determina el rol.
window.sesionImperio = {
  leer() {
    try {
      const sesion = JSON.parse(sessionStorage.getItem("imperioSesion"));
      return sesion && ["duena", "empleado"].includes(sesion.rol) ? sesion : null;
    } catch { return null; }
  },
  guardar(sesion) { sessionStorage.setItem("imperioSesion", JSON.stringify(sesion)); },
  cerrar() { sessionStorage.removeItem("imperioSesion"); }
};

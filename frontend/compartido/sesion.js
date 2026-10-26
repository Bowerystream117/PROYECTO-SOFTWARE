"use strict";
window.sesionImperio = {
  leer() {
    try {
      const sesion = JSON.parse(sessionStorage.getItem("imperioSesion"));
      if (!sesion || !["duena","empleado"].includes(sesion.rol)) return null;
      if (!sesion.turnoId) { sesion.turnoId=crypto.randomUUID(); this.guardar(sesion); }
      return sesion;
    } catch { return null; }
  },
  guardar(sesion) {
    sessionStorage.setItem("imperioSesion",JSON.stringify({...sesion,turnoId:sesion.turnoId||crypto.randomUUID()}));
    sessionStorage.removeItem("imperioVistaEmpleado");
  },
  cerrar() { sessionStorage.removeItem("imperioSesion"); sessionStorage.removeItem("imperioVistaEmpleado"); }
};

"use strict";
window.sesionImperio = {
  leer() {
    try {
      const sesion=JSON.parse(sessionStorage.getItem("imperioSesion"));
      if (!sesion || !["duena","empleado"].includes(sesion.rol)) return null;
      if (!sesion.turnoId || !sesion.inicioTurno) {
        sesion.turnoId=sesion.turnoId || crypto.randomUUID();
        sesion.inicioTurno=sesion.inicioTurno || new Date().toISOString();
        this.guardar(sesion);
      }
      return sesion;
    } catch { return null; }
  },
  guardar(sesion) {
    const nueva={...sesion,turnoId:sesion.turnoId || crypto.randomUUID(),inicioTurno:sesion.inicioTurno || new Date().toISOString()};
    const turnos=JSON.parse(localStorage.getItem("imperioTurnosDemoV1") || "[]");
    if (!Array.isArray(turnos)) throw new Error("Datos de turnos inválidos.");
    if (!turnos.some(t=>t.id===nueva.turnoId)) {
      turnos.push({id:nueva.turnoId,usuario:nueva.usuario,rol:nueva.rol,inicio:nueva.inicioTurno,estado:"abierto"});
      localStorage.setItem("imperioTurnosDemoV1",JSON.stringify(turnos));
    }
    sessionStorage.setItem("imperioSesion",JSON.stringify(nueva));
    sessionStorage.removeItem("imperioVistaEmpleado");
  },
  cerrar() {
    // En la demo el turno equivale a una sesión; cerrar sesión termina ese turno.
    try {
      const sesion=this.leer();
      const turnos=JSON.parse(localStorage.getItem("imperioTurnosDemoV1") || "[]");
      const turno=turnos.find(t=>t.id===sesion?.turnoId);
      if (turno) { turno.estado="cerrado";turno.fin=new Date().toISOString();localStorage.setItem("imperioTurnosDemoV1",JSON.stringify(turnos)); }
    } finally {
      sessionStorage.removeItem("imperioSesion");sessionStorage.removeItem("imperioVistaEmpleado");
    }
  }
};

"use strict";
window.sesionImperio = {
  leer() {
    try {
      const sesion=JSON.parse(sessionStorage.getItem("imperioSesion"));
      if (!sesion || !["duena","empleado"].includes(sesion.rol)) return null;
      if (window.usuariosImperio && sesion.origen !== "mysql") {
        const cuenta=usuariosImperio.leer().find(u=>sesion.usuarioId?u.id===sesion.usuarioId:u.usuario===sesion.usuario);
        if (!cuenta || cuenta.estado!=="activo") { sessionStorage.removeItem("imperioSesion");return null; }
        sesion.usuarioId=cuenta.id;sesion.usuario=cuenta.usuario;sesion.rol=cuenta.rol;
        sessionStorage.setItem("imperioSesion",JSON.stringify(sesion));
      }
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

(() => {
  const solicitar = window.fetch.bind(window);
  let aviso;

  function pedirAcceso() {
    if (aviso) return;
    aviso = document.createElement("dialog");
    aviso.className = "avisoSesion";
    aviso.setAttribute("aria-labelledby", "tituloSesionVencida");
    const titulo = document.createElement("h2");
    titulo.id = "tituloSesionVencida";
    titulo.textContent = "Tu sesión expiró";
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "primario";
    boton.textContent = "Iniciar sesión";
    boton.addEventListener("click", () => {
      try { sesionImperio.cerrar(); }
      finally { location.replace("../inicio de sesion/index.html"); }
    });
    aviso.append(titulo, boton);
    aviso.addEventListener("cancel", evento => evento.preventDefault());
    document.body.append(aviso);
    aviso.showModal();
    boton.focus();
  }

  window.fetch = async (recurso, opciones) => {
    const respuesta = await solicitar(recurso, opciones);
    const direccion = new URL(recurso instanceof Request ? recurso.url : recurso, location.href);
    const cabeceras = new Headers(opciones?.headers ?? (recurso instanceof Request ? recurso.headers : undefined));
    if (respuesta.status === 401 && direccion.origin === location.origin &&
        direccion.pathname.startsWith("/api/") && cabeceras.has("Authorization")) {
      pedirAcceso();
    }
    return respuesta;
  };
})();

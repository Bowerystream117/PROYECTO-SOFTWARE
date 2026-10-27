"use strict";
(() => {
  const sesion=sesionImperio.leer();
  if (!sesion) return;
  const elemento=id=>document.getElementById(id);
  const selectorEmpleado=elemento("selectorEmpleado");
  const botonGenerarResumen=elemento("botonGenerarResumen");
  const dialogoResumen=elemento("dialogoResumen");
  const mensajeEstado=elemento("mensajeEstado");
  const moneda=new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"});
  const fechaHora=valor=>new Date(valor).toLocaleString("es-MX",{dateStyle:"short",timeStyle:"short"});
  const esDuena=servicioCaja.esDuena();
  let turnoSeleccionado=null;
  let ultimoResumen=null;
  let numeroSolicitud=0;
  function mostrarMensaje(texto,error=false) { mensajeEstado.textContent=texto;mensajeEstado.classList.toggle("error",error); }
  function notaPendientes(resumen) {
    return resumen.pendientes?.length
      ? "Datos de prueba: "+resumen.pendientes.join(", ")+" muestran cero porque sus módulos todavía no están conectados."
      : "";
  }
  function mostrarIndicadores(resumen) {
    if (!resumen.turno || ![resumen.entradas,resumen.salidas,resumen.mermas,resumen.ventas,resumen.efectivo].every(Number.isFinite)) {
      throw new Error("El resumen recibido no tiene el formato esperado.");
    }
    elemento("inicioTurno").textContent="Inicio del turno: "+fechaHora(resumen.turno.inicio);
    elemento("estadoTurno").textContent=resumen.turno.estado==="abierto"?"Turno abierto":"Turno cerrado";
    elemento("estadoTurno").classList.toggle("cerrado",resumen.turno.estado!=="abierto");
    elemento("totalEntradas").textContent=resumen.entradas;
    elemento("totalSalidas").textContent=resumen.salidas;
    elemento("totalMermas").textContent=resumen.mermas;
    elemento("totalVentas").textContent=moneda.format(resumen.ventas);
    elemento("totalEfectivo").textContent=moneda.format(resumen.efectivo);
    elemento("notaDatos").textContent=notaPendientes(resumen);
  }
  async function cargarResumen() {
    const solicitud=++numeroSolicitud;
    botonGenerarResumen.disabled=true;
    mostrarMensaje("");
    try {
      const resumen=await servicioCaja.obtenerResumen(turnoSeleccionado);
      if (solicitud!==numeroSolicitud) return;
      mostrarIndicadores(resumen);
      botonGenerarResumen.disabled=false;
    } catch(error) {
      if (solicitud!==numeroSolicitud) return;
      mostrarMensaje(error.message,true);
      ["totalEntradas","totalSalidas","totalMermas","totalVentas","totalEfectivo"].forEach(id=>elemento(id).textContent="—");
      elemento("estadoTurno").textContent="No disponible";
      elemento("inicioTurno").textContent="Inicio del turno: —";
    }
  }
  async function cargarCortes() {
    if (!esDuena) return;
    const cortes=await servicioCaja.listarCortes();
    const cuerpo=elemento("cuerpoCortes");cuerpo.replaceChildren();
    cortes.slice(0,10).forEach(corte=>{
      const fila=document.createElement("tr");
      [fechaHora(corte.generadoEn),corte.turno.usuario,moneda.format(corte.ventas),corte.mermas].forEach(valor=>{
        const celda=document.createElement("td");celda.textContent=valor;fila.append(celda);
      });
      cuerpo.append(fila);
    });
    if (!cortes.length) {
      const fila=document.createElement("tr"),celda=document.createElement("td");
      celda.colSpan=4;celda.textContent="Todavía no hay resúmenes de turno registrados.";fila.append(celda);cuerpo.append(fila);
    }
  }
  function abrirResumen(resumen) {
    ultimoResumen=resumen;
    elemento("detalleTurno").textContent=resumen.turno.usuario+" · Inicio: "+fechaHora(resumen.turno.inicio);
    const lista=elemento("detalleResumen");lista.replaceChildren();
    [["Entradas",resumen.entradas],["Salidas",resumen.salidas],["Mermas",resumen.mermas],
      ["Ventas",moneda.format(resumen.ventas)],["Efectivo en caja",moneda.format(resumen.efectivo)]].forEach(([nombre,valor])=>{
      const termino=document.createElement("dt"),dato=document.createElement("dd");
      termino.textContent=nombre;dato.textContent=valor;lista.append(termino,dato);
    });
    elemento("notaResumen").textContent=notaPendientes(resumen);
    dialogoResumen.showModal();
  }
  selectorEmpleado.addEventListener("change",()=>{turnoSeleccionado=selectorEmpleado.value;cargarResumen();});
  botonGenerarResumen.addEventListener("click",async()=>{
    botonGenerarResumen.disabled=true;selectorEmpleado.disabled=true;
    try {
      const resumen=await servicioCaja.generarResumen(turnoSeleccionado);
      mostrarIndicadores(resumen);abrirResumen(resumen);
      mostrarMensaje("Resumen guardado. El estado del turno no cambió.");
      try { await cargarCortes(); } catch(error) { mostrarMensaje("Resumen guardado; no se pudo actualizar el historial: "+error.message,true); }
    } catch(error) { mostrarMensaje(error.message,true); }
    finally { botonGenerarResumen.disabled=false;selectorEmpleado.disabled=false; }
  });
  elemento("botonCerrarResumen").addEventListener("click",()=>dialogoResumen.close());
  elemento("botonDescargarResumen").addEventListener("click",()=>{
    if (!ultimoResumen) return;
    const archivo=new Blob([JSON.stringify(ultimoResumen,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(archivo),enlace=document.createElement("a");
    enlace.href=url;enlace.download="resumen-turno-"+new Date().toISOString().slice(0,10)+".json";
    enlace.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  async function iniciar() {
    elemento("grupoEmpleado").hidden=!esDuena;
    elemento("seccionCortes").hidden=!esDuena;
    try {
      const turnos=await servicioCaja.listarTurnos();
      selectorEmpleado.replaceChildren();
      turnos.forEach(turno=>selectorEmpleado.add(new Option(turno.usuario+" · "+fechaHora(turno.inicio),turno.id)));
      turnoSeleccionado=turnos.find(t=>t.id===sesion.turnoId)?.id || turnos[0]?.id;
      if (!turnoSeleccionado) { mostrarMensaje("No hay turnos disponibles.");elemento("estadoTurno").textContent="Sin turno";return; }
      selectorEmpleado.value=turnoSeleccionado;
      await cargarResumen();await cargarCortes();
    } catch(error) { mostrarMensaje(error.message,true); }
  }
  iniciar();
})();

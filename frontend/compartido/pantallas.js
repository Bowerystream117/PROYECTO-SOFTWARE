"use strict";
// Utilidades de presentación, sin reglas de inventario ni financieras.
window.uiImperio = (() => {
  const elemento = id => document.getElementById(id);
  const fechaCorta = fecha => fecha.split("-").reverse().join("/");
  const dinero = valor => new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(valor);
  function hoy() {
    const fecha = new Date();
    return [fecha.getFullYear(),String(fecha.getMonth()+1).padStart(2,"0"),String(fecha.getDate()).padStart(2,"0")].join("-");
  }
  function avisar(texto, error = false) {
    elemento("mensajeEstado").textContent = texto;
    elemento("mensajeEstado").className = error ? "error" : "";
  }
  function tabla(encabezados, filas) {
    const tabla = elemento("tabla"); tabla.replaceChildren();
    const cabecera = tabla.createTHead().insertRow();
    encabezados.forEach(texto => {const celda=document.createElement("th");celda.scope="col";celda.textContent=texto;cabecera.append(celda);});
    const cuerpo = tabla.createTBody();
    filas.forEach(valores => {const fila=cuerpo.insertRow();valores.forEach(valor=>{const celda=fila.insertCell();if(valor instanceof Node) celda.append(valor);else celda.textContent=valor ?? "";});});
    if (!filas.length) {const celda=cuerpo.insertRow().insertCell();celda.colSpan=encabezados.length;celda.textContent="No hay registros para estos filtros.";}
  }
  function csv(encabezados, filas) {
    const escapar = valor => '"'+String(valor ?? "").replace(/^[=+@\-\t\r]/,"'$&").replace(/"/g,'""')+'"';
    const contenido = "\uFEFF"+[encabezados,...filas].map(fila=>fila.map(escapar).join(",")).join("\r\n");
    const url=URL.createObjectURL(new Blob([contenido],{type:"text/csv;charset=utf-8"}));
    const enlace=document.createElement("a");enlace.href=url;enlace.download="imperio-"+hoy()+".csv";enlace.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function ejecutar(tarea) {try {await tarea();} catch(error) {avisar(error.message,true);}}
  return {elemento,fechaCorta,dinero,hoy,avisar,tabla,csv,ejecutar};
})();

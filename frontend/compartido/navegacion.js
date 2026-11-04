"use strict";
// Agrega aquí las rutas de nuevos módulos. Todas parten de carpetas hermanas.
window.modulosImperio = [
  {id:"inventario",nombre:"Inventario",carpeta:"gestion de inventario"},
  {id:"movimientos",nombre:"Movimientos",carpeta:"entrada y salida de insumos"},
  {id:"mermas",nombre:"Mermas",carpeta:"productos no aptos"},
  {id:"caja",nombre:"Corte de caja",carpeta:"corte de caja"},
  {id:"reportes",nombre:"Reportes",carpeta:"reporte de insumos, mermas y desperdicios",soloDuena:true},
  {id:"finanzas",nombre:"Finanzas",carpeta:"gestion de cuentas financieras",soloDuena:true},
  {id:"perfiles",nombre:"Perfiles",carpeta:"administracion perfiles",soloDuena:true}
];
(() => {
  const sesion = sesionImperio.leer();
  if (!sesion) { location.replace("../inicio de sesion/index.html"); return; }
  const vistaEmpleado = sesion.rol !== "duena" || sessionStorage.getItem("imperioVistaEmpleado") === "true";
  const actual = document.body.dataset.modulo;
  const modulo = modulosImperio.find(m => m.id === actual);
  if (modulo?.soloDuena && vistaEmpleado) { location.replace("../gestion de inventario/index.html"); return; }
  const barra = document.querySelector(".barraLateral");
  barra.replaceChildren();
  const marca = document.createElement("p"); marca.className="marca"; marca.textContent="IMPERIO";
  const menu = document.createElement("nav"); menu.setAttribute("aria-label","Menú principal");
  modulosImperio.filter(m => !m.soloDuena || !vistaEmpleado).forEach(m => {
    const enlace=document.createElement("a");
    enlace.href="../"+encodeURIComponent(m.carpeta)+"/index.html";
    enlace.className="opcion"+(actual===m.id?" activa":"");
    enlace.textContent=m.nombre;
    if (actual===m.id) enlace.setAttribute("aria-current","page");
    menu.append(enlace);
  });
  const pie = document.createElement("div");pie.className="pieMenu";
  const cambiar=document.createElement("button");cambiar.id="botonCambiarVista";cambiar.className="opcion";
  cambiar.hidden=sesion.rol!=="duena";
  cambiar.textContent=vistaEmpleado?"Volver a Dueña":"Cambiar a Empleado";
  cambiar.addEventListener("click",()=>{
    sessionStorage.setItem("imperioVistaEmpleado", String(!vistaEmpleado));
    location.reload();
  });
  const cerrar=document.createElement("button");cerrar.id="botonCerrarSesion";cerrar.className="opcion";cerrar.textContent="Cerrar sesión";
  cerrar.addEventListener("click",()=>{sesionImperio.cerrar();location.replace("../inicio de sesion/index.html");});
  pie.append(cambiar,cerrar);barra.append(marca,menu,pie);
})();

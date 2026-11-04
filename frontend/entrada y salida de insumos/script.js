"use strict";
(() => {
  const sesion = sesionImperio.leer();
  if (!sesion) return;
  const mensajeEstado=document.getElementById("mensajeEstado");
  const cuerpoHistorial=document.getElementById("cuerpoHistorial");
  const formularios=[document.getElementById("formularioEntrada"),document.getElementById("formularioSalida")];
  const ahora=new Date();
  const fechaHoy=ahora.getFullYear()+"-"+String(ahora.getMonth()+1).padStart(2,"0")+"-"+String(ahora.getDate()).padStart(2,"0");
  function mensaje(texto,error=false) { mensajeEstado.textContent=texto;mensajeEstado.classList.toggle("error",error); }
  function actualizar() {
    try {
      const datos=datosImperio.leer();
      formularios.forEach(formulario=>{
        const seleccion=formulario.elements.producto.value;
        formulario.elements.producto.replaceChildren();
        datos.productos.forEach(p=>formulario.elements.producto.add(new Option(p.nombre,p.id)));
        if (datos.productos.some(p=>p.id===seleccion)) formulario.elements.producto.value=seleccion;
        const elegido=datos.productos.find(p=>p.id===formulario.elements.producto.value);
        formulario.elements.unidad.value=elegido?datosImperio.unidad(elegido):"";
        formulario.querySelector("button").disabled=!elegido;
      });
      cuerpoHistorial.replaceChildren();
      const registros=datos.movimientos.filter(m=>m.turnoId===sesion.turnoId).slice().reverse();
      registros.forEach(m=>{
        const fila=document.createElement("tr");
        const valores=[new Date(m.registradoEn).toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"}),
          m.tipo==="entrada"?"Entrada":"Salida",m.producto,
          m.cantidad.toLocaleString("es-MX")+" "+m.unidad,m.detalle,m.usuario,m.fecha,m.observaciones||"—"];
        valores.forEach(texto=>{const celda=document.createElement("td");celda.textContent=texto;fila.append(celda);});
        cuerpoHistorial.append(fila);
      });
      if (!registros.length) {
        const fila=document.createElement("tr"),celda=document.createElement("td");
        celda.colSpan=8;celda.textContent="Todavía no hay movimientos registrados en este turno.";fila.append(celda);cuerpoHistorial.append(fila);
      }
      if (!datos.productos.length) mensaje("No hay productos. La dueña debe agregarlos desde Inventario.");
    } catch(error) { mensaje(error.message,true);formularios.forEach(f=>f.querySelector("button").disabled=true); }
  }
  formularios.forEach(formulario=>{
    formulario.elements.fecha.value=fechaHoy;
    formulario.elements.fecha.max=fechaHoy;
    formulario.elements.producto.addEventListener("change",actualizar);
    formulario.elements.detalle.addEventListener("input",()=>formulario.elements.detalle.setCustomValidity(""));
    formulario.addEventListener("submit",evento=>{
      evento.preventDefault();
      const campos=formulario.elements;
      campos.detalle.setCustomValidity(campos.detalle.value.trim()?"":"Completa este campo.");
      if (!formulario.reportValidity()) return;
      const botonRegistrar=formulario.querySelector("button");botonRegistrar.disabled=true;
      try {
        if (campos.fecha.value>fechaHoy) throw new Error("No puedes registrar una fecha futura.");
        const registro=datosImperio.registrar({
          tipo:formulario.dataset.tipo,productoId:campos.producto.value,cantidad:Number(campos.cantidad.value),
          detalle:campos.detalle.value.trim(),fecha:campos.fecha.value,observaciones:campos.observaciones.value.trim()
        });
        formulario.reset();campos.fecha.value=fechaHoy;
        mensaje((registro.tipo==="entrada"?"Entrada":"Salida")+" registrada. Inventario actualizado.");
      } catch(error) { mensaje(error.message,true); }
      actualizar();
    });
  });
  window.addEventListener("storage",actualizar);
  actualizar();
})();

"use strict";
(() => {
  const {elemento,avisar,tabla,ejecutar,hoy}=uiImperio;
  const sesion=sesionImperio.leer(); if(!sesion)return;
  const esDuena=sesion.rol==="duena" && sessionStorage.getItem("imperioVistaEmpleado")!=="true";
  const formulario=elemento("formulario"),selector=elemento("producto");
  let productos=[];
  let guardando=false;
  let pendiente;
  document.body.classList.toggle("vistaEmpleado",!esDuena);
  elemento("panelDuena").hidden=!esDuena;
  function disponible(){
    const producto=productos.find(item=>item.id===selector.value);
    const unidad=producto?.unidad || "";
    // Solo la unidad del inventario: cambiar kg a piezas sin conversión dañaría el stock.
    elemento("unidad").replaceChildren(new Option(unidad,unidad));
    elemento("disponible").textContent=producto?`Disponible: ${producto.stock} ${unidad}`:"No hay productos registrados.";
    formulario.querySelector('[type="submit"]').disabled=!producto || guardando;
  }
  function limpiar(){formulario.reset();elemento("fecha").value=hoy();disponible();}
  async function actualizar(){
    const seleccionado=selector.value;
    productos=await operacionesImperio.productos();
    selector.replaceChildren(...productos.map(item=>new Option(item.nombre,item.id)));
    if(productos.some(item=>item.id===seleccionado))selector.value=seleccionado;
    disponible();
    if(!esDuena)return;
    const mermas=await operacionesImperio.mermas();
    const mes=hoy().slice(0,7),mensuales=mermas.filter(item=>item.fecha.startsWith(mes));
    elemento("totalMermas").textContent=mensuales.length;
    elemento("caducidad").textContent=mensuales.filter(item=>item.tipoBaja==="Caducidad").length;
    elemento("dano").textContent=mensuales.filter(item=>item.tipoBaja==="Daño").length;
    elemento("otros").textContent=mensuales.filter(item=>!["Caducidad","Daño"].includes(item.tipoBaja)).length;
    tabla(["Fecha","Producto","Cantidad","Tipo"],mermas.map(item=>[uiImperio.fechaCorta(item.fecha),item.producto,`${item.cantidad} ${item.unidad}`,item.tipoBaja||"Otros"]));
  }
  formulario.onsubmit=evento=>{evento.preventDefault();ejecutar(async()=>{
    if(guardando)return;
    const datos={productoId:selector.value,cantidad:Number(elemento("cantidad").value),
      fecha:elemento("fecha").value,tipoBaja:elemento("tipoBaja").value,descripcion:elemento("descripcion").value.trim()};
    const contenido=JSON.stringify(datos);
    if(pendiente?.contenido!==contenido)pendiente={contenido,solicitud:crypto.randomUUID()};
    guardando=true;
    disponible();
    try{
      await operacionesImperio.registrarMerma({...datos,solicitud:pendiente.solicitud});
      pendiente=null;
      limpiar();
      try { await actualizar();avisar("Merma registrada. Existencias actualizadas."); }
      catch { avisar("Merma registrada. Recarga la página para actualizar las existencias.",true); }
    }finally{guardando=false;disponible();}
  });};
  selector.onchange=disponible;elemento("cancelar").onclick=()=>{limpiar();avisar("");};
  window.addEventListener("focus",()=>{if(!guardando)ejecutar(actualizar);});
  elemento("fecha").value=hoy();disponible();ejecutar(actualizar);
})();
